import os
import json
import asyncio
import logging
import random
import base64
import re
from typing import Dict, Any, List, Optional, Tuple, TypedDict
from dotenv import load_dotenv

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# OpenAI SDK (Multi-LLM Router)
try:
    from openai import OpenAI
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False

# Google GenAI SDK
from google import genai
from google.genai import types as genai_types

# Supabase Client
try:
    from supabase import create_client, Client as SupabaseClient
    HAS_SUPABASE = True
except ImportError:
    HAS_SUPABASE = False

# ElevenLabs SDK
try:
    from elevenlabs.client import ElevenLabs
    HAS_ELEVENLABS = True
except ImportError:
    HAS_ELEVENLABS = False

# Load environment variables (from backend/.env first, then root .env)
env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    load_dotenv(env_path, override=True)
load_dotenv(override=False)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("dragon-tank-engine")

# -----------------------------------------------------------------------------
# Environment & Client Initializations
# -----------------------------------------------------------------------------
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
FALLBACK_MODELS = [GEMINI_MODEL, "gemini-3.5-flash", "gemini-3.1-flash-lite"]

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SECRET_KEY") or os.getenv("SUPABASE_KEY", "")

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")

# 1. OpenAI Client
openai_client = None
if HAS_OPENAI and OPENAI_API_KEY:
    try:
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
        logger.info(f"Initialized OpenAI client with model {OPENAI_MODEL}")
    except Exception as e:
        logger.warning(f"Failed to initialize OpenAI client: {e}")

# 2. Google GenAI Client
gemini_client = None
if GEMINI_API_KEY:
    try:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        logger.info(f"Initialized Google GenAI client with model {GEMINI_MODEL}")
    except Exception as e:
        logger.warning(f"Failed to initialize Google GenAI client: {e}")

# 3. Supabase Client
supabase_client = None
if HAS_SUPABASE and SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Connected to Supabase sessions & pgvector store")
    except Exception as e:
        logger.warning(f"Supabase connection omitted: {e}")

# 4. ElevenLabs Client
eleven_client = None
if HAS_ELEVENLABS and ELEVENLABS_API_KEY:
    try:
        eleven_client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
        logger.info("Initialized ElevenLabs TTS client")
    except Exception as e:
        logger.warning(f"ElevenLabs TTS initialization failed: {e}")

# ElevenLabs Voice IDs tailored for Indian Dragon personas
DRAGON_VOICE_IDS = {
    "roaster": "pNInz6obpgDQGcFmaJgB",     # Adam (Deep, aggressive male) : Ashneer
    "marketing": "ErXwobaYiN019PkySvjV",   # Antoni (Energetic, friendly male) : Aman
    "tech": "JBFqnCBsd6RMkjVDRZzb",        # George (Calm, thoughtful tech male) : Peyush
    "operator": "EXAVITQu4vr4xnSDxMaL",    # Bella (Polite, disciplined female) : Namita
    "strategist": "onwK4e9ZLuTAKqWW03F9",  # Daniel (Articulate, strategic male) : Anupam
    "d2c": "Xb7hH8MSUJpSbSDYk0k2"          # Alice (Sharp, articulate female) : Vineeta
}


# Independent per-Dragon agent pipelines (router + 6 agents + neutral analyst)
try:
    from backend.dragon_agents import DRAGON_PERSONAS, DragonPanel, resolve_dragon_id
except ImportError:  # running from inside backend/
    from dragon_agents import DRAGON_PERSONAS, DragonPanel, resolve_dragon_id

# -----------------------------------------------------------------------------
# Multi-LLM Inference Engine (Gemini 3.5 Flash Lite + OpenAI Fallback)
# -----------------------------------------------------------------------------
async def call_llm(
    system_prompt: str,
    user_message: str,
    json_mode: bool = True
) -> Tuple[Optional[str], str]:
    """
    Direct high-speed LLM inference with automated model fallbacks.
    Prioritizes Gemini for sub-second latency, falling back to OpenAI.
    """
    loop = asyncio.get_running_loop()

    # 1. Try Google Gemini
    if gemini_client:
        for model_name in FALLBACK_MODELS:
            try:
                def _run_gemini(m_name=model_name):
                    config = genai_types.GenerateContentConfig(
                        temperature=0.75,
                        system_instruction=system_prompt,
                    )
                    if json_mode:
                        config.response_mime_type = "application/json"
                    res = gemini_client.models.generate_content(
                        model=m_name,
                        contents=user_message,
                        config=config
                    )
                    if res and res.text:
                        return res.text.strip()
                    return None

                text = await loop.run_in_executor(None, _run_gemini)
                if text:
                    return text, f"Google Gemini ({model_name})"
            except Exception as e:
                logger.warning(f"Gemini model {model_name} error: {e}. Trying next...")

    # 2. Try OpenAI
    if openai_client:
        try:
            def _run_openai():
                kwargs = {
                    "model": OPENAI_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message}
                    ],
                    "temperature": 0.75,
                }
                if json_mode:
                    kwargs["response_format"] = {"type": "json_object"}
                res = openai_client.chat.completions.create(**kwargs)
                return res.choices[0].message.content

            text = await loop.run_in_executor(None, _run_openai)
            if text:
                return text.strip(), f"OpenAI ({OPENAI_MODEL})"
        except Exception as e:
            logger.warning(f"OpenAI error: {e}")

    # No provider available -> each Dragon agent uses its own offline persona engine.
    return None, "offline"


# -----------------------------------------------------------------------------
# ElevenLabs Audio Generation
# -----------------------------------------------------------------------------
async def generate_elevenlabs_audio(text: str, dragon_id: str) -> Optional[str]:
    """Synthesize speech using ElevenLabs and return base64 encoded MP3."""
    if not eleven_client:
        return None
    try:
        voice_id = DRAGON_VOICE_IDS.get(dragon_id, DRAGON_VOICE_IDS["roaster"])
        clean_text = re.sub(r'[*_#`]', '', text)
        loop = asyncio.get_running_loop()

        def _synthesize():
            audio_generator = eleven_client.text_to_speech.convert(
                voice_id=voice_id,
                text=clean_text[:350],
                model_id="eleven_multilingual_v2",
                output_format="mp3_44100_128"
            )
            return b"".join(audio_generator)

        audio_bytes = await loop.run_in_executor(None, _synthesize)
        return base64.b64encode(audio_bytes).decode("utf-8")
    except Exception as e:
        logger.warning(f"ElevenLabs TTS skipped: {e}")
        return None

# -----------------------------------------------------------------------------
# Supabase Persistence
# -----------------------------------------------------------------------------
async def save_session_to_supabase(session_id: str, transcript: List[Dict[str, Any]], metrics: Dict[str, Any]):
    if not supabase_client:
        return
    try:
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(
            None,
            lambda: supabase_client.table("sessions").upsert({
                "session_id": session_id,
                "transcript": transcript,
                "business_metrics": metrics
            }).execute()
        )
    except Exception as e:
        logger.debug(f"Supabase write skipped: {e}")

# -----------------------------------------------------------------------------
# -----------------------------------------------------------------------------
# FastAPI App & WebSocket Gateway
# -----------------------------------------------------------------------------
app = FastAPI(title="Dragon Tank India : Live Multi-Agent Voice & Text Simulator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {
        "status": "online",
        "platform": "Dragon Tank India Multi-Agent Boardroom Engine",
        "openai_ready": bool(openai_client),
        "gemini_ready": bool(gemini_client),
        "elevenlabs_ready": bool(eleven_client),
        "supabase_ready": bool(supabase_client),
        "active_models": FALLBACK_MODELS
    }

PUBLIC_PERSONA_KEYS = ("id", "name", "title", "archetype", "avatarInitials", "accentColor", "tagline", "pillar", "famous_dialogues")
PUBLIC_DRAGONS = [{k: p[k] for k in PUBLIC_PERSONA_KEYS} for p in DRAGON_PERSONAS.values()]
MARKET_BENCHMARK = "Early-stage student ventures must prove societal need, customer willingness to pay, and operational feasibility."


def initial_metrics() -> Dict[str, Any]:
    return {
        "societal_need": "Awaiting Student Pitch",
        "need_summary": "State the real problem in society and who suffers without your solution.",
        "feasibility": "Awaiting Student Pitch",
        "feasibility_summary": "Explain your technical architecture and student execution feasibility.",
        "commercial_viability": "Awaiting Student Pitch",
        "money_making_summary": "Explain your unit economics, pricing model, and how you achieve profit.",
        "scalability": "Awaiting Student Pitch",
        "scalability_summary": "Explain how this venture expands beyond your campus or hackathon demo.",
        "societal_impact": "Measurable benefit and positive change created for people or industry.",
        "key_actionable_guidance": "Present your project. The Dragon whose domain it touches most will evaluate it live.",
        "verdict_badge": "Awaiting Pitch",
        "ask": "Not stated yet",
        "equity": "Not stated yet",
        "valuation": "Student Project Stage",
        "revenue": "Not stated yet",
        "arr": "Not stated yet",
        "gross_margin": "Not stated yet",
        "cac": "Not stated yet",
        "repeat_rate": "Not stated yet",
        "implied_multiple": "Awaiting numbers",
        "multiple_verdict": "Awaiting pitch details",
        "future_valuation_advice": "Focus on real customer validation and unit viability before seeking institutional capital.",
    }


DECISION_KEYWORDS = ["final decision", "are you in or out", "give me your verdict", "deal or no deal", "final call", "final ruling", "final verdict"]


@app.websocket("/ws/pitch")
async def websocket_pitch_endpoint(websocket: WebSocket):
    await websocket.accept()
    session_id = f"dragon_tank_{int(asyncio.get_event_loop().time() * 1000)}"
    logger.info(f"Dragon Tank WebSocket connected: {session_id}")

    panel = DragonPanel(call_llm)  # six independent Dragon pipelines for this session

    def opening_history(text: str) -> List[Dict[str, Any]]:
        return [{"role": "moderator", "speaker": "The Floor", "content": text, "timestamp": "Just now"}]

    chat_history = opening_history(
        "Step onto the boardroom floor, Student Founder. The Dragons are seated. Present your project or venture idea. "
        "The Dragon whose domain your pitch touches most will respond, one at a time, with honest feedback on Societal Need, "
        "Feasibility, Money Making and Scalability."
    )
    business_metrics = initial_metrics()
    dragon_statuses: Dict[str, str] = {k: "listening" for k in DRAGON_PERSONAS}
    offers: List[Dict[str, Any]] = []

    async def send_init():
        await websocket.send_json({
            "type": "session_init",
            "session_id": session_id,
            "dragons": PUBLIC_DRAGONS,
            "metrics": business_metrics,
            "dragon_statuses": dragon_statuses,
            "chat_history": chat_history,
            "market_benchmark": MARKET_BENCHMARK,
        })

    def apply_assessment(assessment: Dict[str, Any]):
        for k, v in (assessment or {}).items():
            if v and not (k in business_metrics and "Not stated" in str(v) and "Not stated" not in str(business_metrics[k])):
                business_metrics[k] = str(v)

    async def stream_turn(turn: Dict[str, Any], provider: str):
        speaker_id = turn["speaker_id"]
        info = DRAGON_PERSONAS[speaker_id]
        content, action, tone_badge = turn["content"], turn["action"], turn["tone_badge"]

        for k in dragon_statuses:
            dragon_statuses[k] = "speaking" if k == speaker_id else "listening"

        stream_id = f"stream_{speaker_id}_{int(asyncio.get_event_loop().time() * 1000)}"
        words = content.split(" ")
        for w_idx in range(0, len(words), 2):
            await websocket.send_json({
                "type": "dragon_stream_chunk",
                "stream_id": stream_id,
                "dragon_id": speaker_id,
                "speaker": info["name"],
                "chunk": " ".join(words[w_idx:w_idx + 2]) + " ",
                "action": action,
                "tone_badge": tone_badge,
                "is_interruption": False,
                "llm_provider": provider,
            })
            await asyncio.sleep(0.02)

        msg = {
            "id": stream_id,
            "role": "dragon",
            "speaker": info["name"],
            "dragon_id": speaker_id,
            "title": info["title"],
            "content": content,
            "action": action,
            "tone_badge": tone_badge,
            "is_interruption": False,
            "interrupted_speaker": None,
            "timestamp": "Just now",
        }
        chat_history.append(msg)
        await websocket.send_json({
            "type": "dragon_turn",
            "dragon": {k: info[k] for k in PUBLIC_PERSONA_KEYS},
            "message": msg,
            "action": action,
            "tone_badge": tone_badge,
            "is_interruption": False,
            "metrics": business_metrics,
            "dragon_statuses": dragon_statuses,
            "offers": offers,
            "audio_base64": None,  # voice output disabled
            "llm_provider": provider,
        })

    async def run_verdicts(prompt: str):
        await websocket.send_json({"type": "moderator_evaluating", "status": "Each Dragon is preparing their own final verdict..."})
        turns, assessment, provider = await panel.verdicts(chat_history, business_metrics, prompt)
        apply_assessment(assessment)
        for t in turns:
            await stream_turn(t, provider)
            await asyncio.sleep(0.4)

    await send_init()

    try:
        while True:
            try:
                message_data = await websocket.receive()
            except RuntimeError:
                break
            if message_data.get("type") == "websocket.disconnect":
                break
            if not message_data.get("text"):
                continue

            try:
                payload = json.loads(message_data["text"])
            except json.JSONDecodeError:
                continue
            msg_type = payload.get("type", "")

            if isinstance(payload.get("metrics"), dict):
                business_metrics.update(payload["metrics"])

            # 1. Pitch / founder answer / counter-offer -> exactly ONE Dragon responds
            if msg_type in ("pitch_text", "founder_answer", "counter_offer"):
                user_pitch = (payload.get("text") or "").strip()
                if not user_pitch:
                    continue

                target_id = resolve_dragon_id(payload.get("replying_to"))
                target_name = DRAGON_PERSONAS[target_id]["name"] if target_id else None

                user_msg = {"role": "founder", "speaker": "Founder", "content": user_pitch,
                            "target_dragon": target_name, "timestamp": "Just now"}
                chat_history.append(user_msg)
                await websocket.send_json({"type": "chat_message", "message": user_msg})

                if any(kw in user_pitch.lower() for kw in DECISION_KEYWORDS):
                    await run_verdicts(user_pitch)
                else:
                    await websocket.send_json({
                        "type": "moderator_evaluating",
                        "status": f"{target_name} is preparing feedback..." if target_name
                        else "The Dragons are reviewing your statement...",
                    })
                    turn, assessment, provider = await panel.live_turn(
                        user_pitch, chat_history[:-1], business_metrics, replying_to=target_id
                    )
                    apply_assessment(assessment)
                    await stream_turn(turn, provider)

                asyncio.create_task(save_session_to_supabase(session_id, chat_history, business_metrics))

            # 2. Final verdicts: every Dragon rules independently, one after another
            elif msg_type == "call_for_decisions":
                await run_verdicts("Dragons, please give me your final verdict on our venture.")
                asyncio.create_task(save_session_to_supabase(session_id, chat_history, business_metrics))

            # 3. Reset
            elif msg_type == "reset_session":
                panel.reset()
                chat_history = opening_history(
                    "The floor has been reset. A fresh student founder steps into the den. Present your project or venture idea."
                )
                business_metrics = initial_metrics()
                dragon_statuses = {k: "listening" for k in DRAGON_PERSONAS}
                offers = []
                await send_init()

    except WebSocketDisconnect:
        logger.info(f"Client disconnected from Dragon Tank session {session_id}")
    except Exception as exc:
        logger.error(f"Dragon Tank WebSocket error: {exc}", exc_info=True)


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("backend.server:app", host=host, port=port, reload=True)
