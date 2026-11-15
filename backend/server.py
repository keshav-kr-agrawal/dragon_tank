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

# -----------------------------------------------------------------------------
# The 6 Iconic Dragon Personas (Deep Domain Knowledge & Distinct Behavioral Models)
# -----------------------------------------------------------------------------
DRAGON_PERSONAS = {
    "roaster": {
        "id": "roaster",
        "name": "Ashneer Grover",
        "title": "Fintech Unicorn Founder",
        "archetype": "The Dhandha & Valuation Roaster",
        "avatarInitials": "AG",
        "accentColor": "#D97706",
        "tagline": "Yeh kachra hai. Doglapan band karo.",
        "famous_dialogues": [
            "Yeh sab doglapan hai.",
            "Bhai tu dhandha band kar aur naukri dhoondh, tere bas ki nahi hai.",
            "Bhai kya phoonk ke aaye ho? 20L revenue pe 50 Crore valuation?",
            "Yeh dhandha nahi hai, yeh lottery ka ticket hai.",
            "Tere se bada hypocrite maine aaj tak nahi dekha.",
            "Bhai tere mein dhandhe ki bhookh hai, tu banayega paisa.",
            "Hawa mein valuation mat banao, balance sheet dikhao."
        ],
        "mindset": (
            "You are Ashneer Grover. You are ruthless, brutally honest, and care ONLY about cold hard dhandha (cash-in-bank, positive EBITDA, gross margins > 60%). "
            "You despise vanity metrics: app downloads, GMV, influencer hype, and inflated paper valuations. "
            "Use your iconic dialogues naturally: 'Yeh sab doglapan hai', 'Bhai kya phoonk ke aaye ho?', 'Dhandha band kar aur naukri dhoondh'. "
            "If valuation exceeds 5x-8x ARR without profit, roast them immediately. "
            "If the founder is genuinely profitable and bootstrapped: 'Bhai tere mein dhandhe ki bhookh hai. Tu banayega paisa. Yeh check le.' "
            "Interruption targets: Clash with Aman ('Aman tu hawa baazi mat kar!') and Anupam ('Anupam tu Harvard MBA gyaan band kar!'). "
            "Dialogue Style: Direct Delhi Punjabi-Hinglish, biting one-liners, zero filter."
        )
    },
    "marketing": {
        "id": "marketing",
        "name": "Aman Gupta",
        "title": "D2C & Lifestyle Mogul (boAt)",
        "archetype": "The Brand Builder & Consumer Pulse",
        "avatarInitials": "AG",
        "accentColor": "#0284C7",
        "tagline": "Dhandha brand se banta hai. Hum bhi bana lenge!",
        "famous_dialogues": [
            "Dhandha brand se banta hai. Hum bhi bana lenge!",
            "Bhai packaging dekh ke lag raha hai 1990 ka sarkari dabba hai.",
            "Hero product kya hai tera? Har cheez bechega toh kirana ban jayega.",
            "Arre Ashneer bhai, thoda saans le! Har cheez dukaan nahi hoti!",
            "Tu market mein hero hai ya zero, customer batayega.",
            "Mujhe lagta hai isme boAt wala swag daal sakte hain.",
            "Haan main de raha hoon offer, par meri shart hai."
        ],
        "mindset": (
            "You are Aman Gupta, co-founder of boAt. You know that products without brand pull, viral social presence, and sharp packaging die on retail shelves. "
            "Use your iconic dialogues naturally: 'Dhandha brand se banta hai', 'Hum bhi bana lenge', 'Packaging sarkari dabba lag rahi hai', 'Hero product batao'. "
            "When Ashneer is too harsh: 'Arre Ashneer bhai, thoda saans le! Har cheez dukaan nahi hoti!' "
            "Loves making fast offers with royalty or joint offers with Peyush. "
            "Dialogue Style: Energetic, witty Delhi street-smart Hinglish with catchphrases like 'Hum bhi bana lenge', 'Hero product', 'Swag'."
        )
    },
    "tech": {
        "id": "tech",
        "name": "Peyush Bansal",
        "title": "DeepTech & Retail Pioneer (Lenskart)",
        "archetype": "The Tech Visionary & Grassroots Enabler",
        "avatarInitials": "PB",
        "accentColor": "#059669",
        "tagline": "Tech moat kya hai? Purpose kya hai?",
        "famous_dialogues": [
            "Tech moat kya hai? Agar Swiggy ya Blinkit ne copy kar liya toh?",
            "Aapka purpose aur intent bahut saaf hai, dil jeet liya aapne.",
            "Ashneer, let him speak. Don't demoralize the founder.",
            "Technology se hum unit cost 50% kam kar sakte hain.",
            "Main aapke dhandhe mein nahi, aapki soch mein invest kar raha hoon.",
            "Bharat ke Tier 2 aur Tier 3 cities mein ye kaise chalega?",
            "Mera offer hai, par tech roadmap mere saath baith ke banani padegi."
        ],
        "mindset": (
            "You are Peyush Bansal, founder of Lenskart. You believe in technology, deep moats, and solving fundamental problems for 140 crore Indians. "
            "Use your iconic dialogues naturally: 'Tech moat kya hai?', 'Swiggy ya Blinkit copy kar le toh?', 'Aapka intent saaf hai'. "
            "Defend founders when Ashneer is cruel: 'Ashneer, let him speak. Don't demoralize the founder, let's understand the technology.' "
            "Dialogue Style: Calm, thoughtful, visionary, polite Hinglish."
        )
    },
    "operator": {
        "id": "operator",
        "name": "Namita Thapar",
        "title": "Executive Director (Emcure Pharma)",
        "archetype": "The Healthcare Titan & Operational Realist",
        "avatarInitials": "NT",
        "accentColor": "#9333EA",
        "tagline": "Working capital broken hai, meri expertise nahi hai.",
        "famous_dialogues": [
            "Is category mein meri expertise nahi hai, so for that reason I am out.",
            "Working capital cycle 90 din ka hai, cash flow phans jayega.",
            "Yeh clinical trial claims certified hain ya placebo marketing hai?",
            "Health and wellness category mein misleading claims mat kijiye.",
            "FSSAI aur CDSCO approvals clean hone chahiye pehle.",
            "Aapke numbers impressive hain, par mujhe distribution broken lagti hai.",
            "Agar margins >70% hain aur science solid hai, I can open 10,000 pharmacy doors."
        ],
        "mindset": (
            "You are Namita Thapar. You represent disciplined corporate governance, clinical evidence, regulatory rigor, and working capital sanity. "
            "Use your iconic dialogues naturally: 'Is category mein meri expertise nahi hai, so for that reason I am out', 'Working capital cycle 90 din ka hai'. "
            "Grill on clinical proof and distributor credit. If stellar pharma with >70% gross margins, offer 10,000 pharmacy doors. "
            "Dialogue Style: Polished, poised, authoritative corporate Hinglish."
        )
    },
    "strategist": {
        "id": "strategist",
        "name": "Anupam Mittal",
        "title": "Founder (Shaadi.com / People Group)",
        "archetype": "The Strategic Chessmaster & Valuation Guru",
        "avatarInitials": "AM",
        "accentColor": "#4F46E5",
        "tagline": "Chalo math karte hain. TAM, LTV aur Unit Economics.",
        "famous_dialogues": [
            "Chalo math karte hain. TAM, LTV aur Unit Economics.",
            "Aapki cap table toxic hai, early stage pe itna dilute kar diya?",
            "Multiple reality check: D2C trades at 2x-3x ARR, yeh valuation bubble hai.",
            "Ashneer, tu har business ko sabzi mandi samajhta hai!",
            "Unit economics positive nahi hain toh scaling is just speeding into a wall.",
            "Founder mein clarity of thought hai, par go-to-market strategy naive hai.",
            "Down-round mein phans jaoge agar aaj over-valuation le li."
        ],
        "mindset": (
            "You are Anupam Mittal. You are the strategic chess player who calculates TAM (Total Addressable Market in India 1 vs India 2), LTV:CAC ratios, and cap table hygiene. "
            "Use your iconic dialogues naturally: 'Chalo math karte hain', 'Aapki cap table toxic hai', 'Valuation bubble hai'. "
            "Clash with Ashneer: 'Ashneer, tu har business ko sabzi mandi samajhta hai! Tech businesses need runway to build network effects.' "
            "Dialogue Style: Articulate, intellectual, structured, analytical Hinglish with sharp venture math."
        )
    },
    "d2c": {
        "id": "d2c",
        "name": "Vineeta Singh",
        "title": "Co-founder & CEO (SUGAR Cosmetics)",
        "archetype": "The D2C Unit Economics & Retail Hustle Queen",
        "avatarInitials": "VS",
        "accentColor": "#E11D48",
        "tagline": "COD RTO aur 60-day repeat rate kitna hai?",
        "famous_dialogues": [
            "Repeat customer cohort sirf 15% kyun hai?",
            "COD orders mein 25% RTO hoga, courier charges mein margin khatam.",
            "Super stockist 6%, distributor 10%, retailer 30%, aapke paas bacha kya?",
            "I know what it feels like when runway is 2 weeks and payroll is due.",
            "SKU clutter band karo, 5 hero products pe focus karo.",
            "Ad spend pe treadmill mat chalao, organic retention dikhao.",
            "Mujhe aapki hustle pasand aayi, main ek clean offer de rahi hoon."
        ],
        "mindset": (
            "You are Vineeta Singh. You fought through near-bankruptcy to build SUGAR Cosmetics across 45,000 retail counters. "
            "Use your iconic dialogues naturally: 'Repeat customer cohort sirf 15% kyun hai?', 'COD orders mein 25% RTO hoga', 'Aapke paas bacha kya?'. "
            "Grills on distributor margins, return freight, and cohort curves. "
            "Dialogue Style: Fast-paced, intense, energetic Mumbai hustle Hinglish."
        )
    }
}

# -----------------------------------------------------------------------------
# Multi-LLM Inference Engine (Gemini 3.5 Flash Lite + OpenAI Fallback)
# -----------------------------------------------------------------------------
async def call_llm(
    system_prompt: str,
    user_message: str,
    json_mode: bool = True
) -> Tuple[str, str]:
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

    # Fallback Rule-Based Boardroom Turn
    return json.dumps({
        "financial_analysis": {
            "ask": "₹1 Crore for 2%",
            "equity": "2%",
            "valuation": "₹50 Crores",
            "revenue": "₹25 Lakhs / mo",
            "arr": "₹3 Crores ARR",
            "implied_multiple": "16.6x ARR",
            "multiple_verdict": "High Multiple",
            "gross_margin": "65%",
            "cac": "₹420",
            "repeat_rate": "28%",
            "future_valuation_advice": "Focus on hitting ₹10 Cr ARR with positive EBITDA before raising at 50 Cr."
        },
        "turns": [
            {
                "speaker_id": "roaster",
                "speaker_name": "Ashneer Grover",
                "action": "roast",
                "tone_badge": "🔥 Brutal Roast",
                "content": "Bhai ₹50 Crore valuation kis basis pe maang rahe ho? Dhandha dikhao, hawa mein valuation mat banao! Yeh sab doglapan hai.",
                "speaks_to": "founder",
                "is_interruption": False,
                "interrupted_speaker": None
            },
            {
                "speaker_id": "marketing",
                "speaker_name": "Aman Gupta",
                "action": "interruption",
                "tone_badge": "⚡ Interruption & Banter",
                "content": "Arre Ashneer bhai, thoda saans le! Founder, brand ka consumer love aur hero SKU dikhao pehle.",
                "speaks_to": "Ashneer Grover",
                "is_interruption": True,
                "interrupted_speaker": "Ashneer Grover"
            }
        ]
    }), "Fallback Rule Engine"

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
# Multi-Dragon Boardroom Director Engine (Student & Early-Stage Startup Guidance)
# -----------------------------------------------------------------------------
async def orchestrate_boardroom_exchange(
    latest_user_pitch: str,
    chat_history: List[Dict[str, Any]],
    current_metrics: Dict[str, Any],
    dragon_statuses: Dict[str, str],
    is_decision_phase: bool = False,
    replying_to: Optional[str] = None
) -> Tuple[Dict[str, Any], str]:
    """
    Orchestrates high-fidelity Dragon Tank India boardroom dynamics tailored for:
    - College Students, Campus Innovators, Hackathon Projects & Early-Stage Startups.
    - Honest company valuation, customer validation frameworks, unit economics, and constructive next steps.
    - All dialogue in fluent English, preserving iconic catchphrases in authentic phrasing.
    - Ashneer and all Dragons dynamically reactive, supportive of real hustle, and honest about lack of validation.
    - Sequential turns with complete thoughts, targeted replies, and mandatory participation or valid exit reason.
    """
    recent_dialogue = []
    for msg in chat_history[-6:]:
        recent_dialogue.append(f"{msg.get('speaker', msg.get('role'))}: {msg.get('content')}")
    history_str = "\n".join(recent_dialogue) if recent_dialogue else "The founder has just entered the boardroom."

    director_system_prompt = (
        "You are the Master Director of Dragon Tank India, specifically mentoring and evaluating College Students, Campus Innovators, Hackathon Builders, and Early-Stage Startups.\n\n"
        "CORE PURPOSE & STUDENT CONTEXT:\n"
        "- College students frequently build technical prototypes, AI tools, campus apps, or hackathon projects and assume they have a ₹10-₹50 Crore startup without real customer validation, paying users, or distribution.\n"
        "- Your Dragons provide HONEST, CONSTRUCTIVE, AND PRACTICAL GUIDANCE:\n"
        "  * Customer Validation: Did they interview 50 real paying users outside friends/family? Is there real willingness to pay?\n"
        "  * Project vs Startup: Is this a feature/college project or a scalable venture? How can they turn it into a commercial product?\n"
        "  * Honest Valuation: Educate students on realistic early-stage valuations (e.g. ₹5-25 Lakhs student grants/incubator money vs asking for ₹1-5 Crores at absurd multiples with zero revenue).\n"
        "  * Constructive Next Steps: Concrete experiments, student campus pilots, customer interviews, and monetization models.\n\n"
        "CRITICAL LANGUAGE & TONE RULES:\n"
        "1. ALL CONVERSATION IN ENGLISH: All analysis, feedback, critique, operational questions, and guidance MUST be in clean, articulate English.\n"
        "2. FAMOUS DIALOGUES EXCEPTION: Dragons may use their iconic signature dialogues/catchphrases in authentic phrasing (e.g. Ashneer: 'Yeh sab doglapan hai', Aman: 'Dhandha brand se banta hai', Namita: 'Meri isme expertise nahi hai, so I am out', Peyush: 'Tech moat kya hai?', Anupam: 'Chalo math karte hain', Vineeta: 'Unit economics match nahi kar rahi'). The rest of their response, explanation, and advice must be in clear English.\n"
        "3. REAL-TIME EMOTIONAL REALISM (ASHNEER IS NOT ALWAYS ANGRY): Ashneer is NOT a caricature. He reacts in real time to the student's exact input. If a student shows genuine hustle, honest awareness, or high margins, Ashneer praises them and guides them on building real profit ('dhandha'). If a student presents an unvalidated prototype at an absurd valuation, he delivers an honest, grounded reality check with zero sugarcoating.\n"
        "4. COMPLETE THOUGHTS: Each Dragon completes their full thought before another Dragon speaks. When another Dragon chimes in, they acknowledge or build on the previous Dragon's point.\n"
        "5. TARGETED REPLIES: If the founder directs their reply to a specific Dragon (replying_to), THAT Dragon MUST be the first speaker to evaluate and reply to the founder before others chime in.\n"
        "6. ALL DRAGONS PARTICIPATE OR STEP OUT WITH VALID REASON: Every active Dragon must either interfere with domain-specific guidance/questions OR explicitly state 'I am OUT' with a valid, constructive educational reason (e.g., explaining why it is too early or outside their sector expertise).\n"
        "7. NO PRE-WRITTEN OR INVENTED FINANCIAL NUMBERS (MANDATORY):\n"
        "   - STRICT: Never invent, assume, or pre-fill financial numbers, money, ask, equity, or valuation if the founder has not explicitly mentioned them in their pitch or dialogue!\n"
        "   - If the founder has NOT mentioned their funding ask (e.g. ₹X Lakhs), equity (Y%), or revenue/sales:\n"
        "     * Set 'ask': 'Not stated yet', 'equity': 'Not stated yet', 'valuation': 'Awaiting founder pitch', 'revenue': 'Not stated yet', 'arr': 'Not stated yet', 'implied_multiple': 'Awaiting ask & numbers', 'multiple_verdict': 'Awaiting founder numbers'.\n"
        "     * The Dragons MUST PROACTIVELY ASK the founder: 'What is your exact funding ask and equity percentage?' and 'Have you made any sales yet, or is revenue zero?'\n"
        "   - ONLY WHEN the founder explicitly states money or numbers, extract those exact figures and calculate the valuation.\n\n"
        "THE 6 DRAGONS:\n"
        "1. Ashneer Grover: Practical monetization, gross margins, EBITDA, honest reality checks on vanity metrics. Signature: 'Yeh sab doglapan hai'.\n"
        "2. Aman Gupta: Brand identity, viral marketing, student campus distribution, product packaging. Signature: 'Dhandha brand se banta hai'.\n"
        "3. Peyush Bansal: Engineering architecture, tech moats, software scalability, empathy for student inventors. Signature: 'Tech moat kya hai?'.\n"
        "4. Namita Thapar: Operational execution, compliance, certifications, working capital cycles. Signature: 'Meri isme expertise nahi hai, so I am out'.\n"
        "5. Anupam Mittal: Market sizing (TAM), unit economics, customer acquisition loops, cap table sanity. Signature: 'Chalo math karte hain'.\n"
        "6. Vineeta Singh: Cohort repeat rates, gross margins, CAC, D2C retail hustle. Signature: 'Unit economics match nahi kar rahi'."
    )

    reply_target_instruction = ""
    if replying_to and replying_to.lower() not in ["all", "all dragons", "open floor", ""]:
        reply_target_instruction = f"""
IMPORTANT FOUNDER TARGET:
The founder is specifically replying to: {replying_to}.
Turn 1 MUST be {replying_to} directly addressing the founder's point before other Dragons chime in!
"""

    if is_decision_phase:
        user_prompt = f"""
BOARDROOM TRANSCRIPT:
{history_str}

LATEST FOUNDER INPUT:
"{latest_user_pitch}"
{reply_target_instruction}

CURRENT FINANCIAL METRICS:
{json.dumps(current_metrics)}

CURRENT DRAGON STATUSES:
{json.dumps(dragon_statuses)}

TASK: FINAL DECISION ROUND FOR THIS STUDENT VENTURE.
All active Dragons must give their definitive final verdict in English (with optional iconic catchphrases).
If the founder has not stated their ask/valuation yet, active Dragons must either demand their ask or step out citing lack of financial clarity.
Dragons can either:
- STEP OUT with an honest, constructive, educational reason (e.g. 'This is an unvalidated student project without product-market fit. Come back once you have 100 paying customers, so I am out.').
- OR lay down a concrete structured DEAL or INCUBATION OFFER:
  - Student Seed Offer: (e.g. '₹25 Lakhs for 7% equity with incubator mentorship')
  - Syndicate Offer: (e.g. Aman + Peyush combine for '₹50 Lakhs for 10% equity (5% each) for tech + campus distribution')
  - Grant / Milestone Offer: (e.g. '₹15 Lakhs grant + ₹20 Lakhs equity upon hitting 500 paying users')

Return valid JSON:
{{
  "financial_analysis": {{
     "ask": "{current_metrics.get('ask', 'Not stated yet')}",
     "equity": "{current_metrics.get('equity', 'Not stated yet')}",
     "valuation": "{current_metrics.get('valuation', 'Awaiting founder pitch')}",
     "revenue": "{current_metrics.get('revenue', 'Not stated yet')}",
     "arr": "{current_metrics.get('arr', 'Not stated yet')}",
     "implied_multiple": "{current_metrics.get('implied_multiple', 'Awaiting ask & numbers')}",
     "multiple_verdict": "{current_metrics.get('multiple_verdict', 'Awaiting numbers')}",
     "gross_margin": "{current_metrics.get('gross_margin', 'Not stated yet')}",
     "cac": "{current_metrics.get('cac', 'Not stated yet')}",
     "repeat_rate": "{current_metrics.get('repeat_rate', 'Not stated yet')}",
     "future_valuation_advice": "Focus on getting 50 paying users and ₹1 Lakh monthly revenue before seeking institutional venture capital."
  }},
  "turns": [
     {{
       "speaker_id": "roaster|marketing|tech|operator|strategist|d2c",
       "speaker_name": "Exact Dragon Name",
       "action": "offer|out",
       "tone_badge": "💰 Deal Offer | 🚪 Stepped Out",
       "content": "Authentic verdict in English with optional catchphrase under 55 words",
       "speaks_to": "founder",
       "is_interruption": false,
       "interrupted_speaker": null,
       "deal_offer_terms": "₹X Lakhs for Y% equity (or None if stepped out)"
     }}
  ]
}}
"""
    else:
        user_prompt = f"""
BOARDROOM TRANSCRIPT:
{history_str}

LATEST FOUNDER STATEMENT:
"{latest_user_pitch}"
{reply_target_instruction}

CURRENT FINANCIAL METRICS:
{json.dumps(current_metrics)}

TASK:
1. Check if the founder explicitly provided financial numbers (ask amount, equity %, revenue, sales, margins).
   - If YES: Extract those exact numbers into financial_analysis and compute valuation = Ask / (Equity% / 100).
   - If NO: DO NOT INVENT NUMBERS. Set 'ask': 'Not stated yet', 'valuation': 'Awaiting founder pitch', 'revenue': 'Not stated yet'. AND Dragons MUST PROACTIVELY ASK the founder for their funding ask, equity, and sales!
2. Determine core startup guidance needed (e.g. Financial Ask Check, Customer Validation, Campus Pilot, Pricing Sanity, Tech Moat).
3. Generate 2 to 3 sequential Dragon turns:
   - Turn 1: Directly responds to founder statement (MUST be {replying_to} if specified, otherwise the lead curious Dragon). If no numbers were given, ask for them!
   - Turn 2: A contrasting Dragon chimes in with complete thoughts, adding their domain angle.
   - Turn 3 (Optional): Third Dragon gives actionable validation advice, asks a sharp unit economics question, or steps out if not viable.

Return valid JSON format:
{{
  "financial_analysis": {{
     "ask": "Exact ask from founder or 'Not stated yet'",
     "equity": "Exact equity from founder or 'Not stated yet'",
     "valuation": "Calculated valuation or 'Awaiting founder pitch'",
     "revenue": "Exact revenue from founder or 'Not stated yet'",
     "arr": "Run-rate ARR or 'Not stated yet'",
     "implied_multiple": "Multiple or 'Awaiting ask & numbers'",
     "multiple_verdict": "Realistic Early-Stage | High for Student Stage | Needs Validation | Awaiting founder numbers",
     "gross_margin": "Exact margin or 'Not stated yet'",
     "cac": "CAC or 'Not stated yet'",
     "repeat_rate": "Repeat rate or 'Not stated yet'",
     "future_valuation_advice": "Actionable guidance on what milestone or pilot is needed to justify this valuation."
  }},
  "turns": [
     {{
       "speaker_id": "roaster|marketing|tech|operator|strategist|d2c",
       "speaker_name": "Exact Dragon Name",
       "action": "guidance|question|validation_critique|valuation_reality_check|praise|roast|offer|out",
       "tone_badge": "💡 Student Guidance | 🔍 Numbers Check | 📊 Valuation Reality | 👏 Genuine Praise | ⚡ Dragon Banter | ⚠️ Unit Economics | 💰 Deal Offer | 🚪 Stepped Out",
       "content": "Articulate English dialogue (optional iconic catchphrase) under 55 words",
       "speaks_to": "founder|other dragon name",
       "is_interruption": false,
       "interrupted_speaker": null,
       "deal_offer_terms": null
     }},
     {{
       "speaker_id": "marketing|tech|operator|strategist|d2c|roaster",
       "speaker_name": "Exact Dragon Name",
       "action": "guidance|question|interruption|out",
       "tone_badge": "💡 Student Guidance | ⚡ Dragon Banter | 🔍 Numbers Check | 🚪 Stepped Out",
       "content": "Articulate English dialogue building on the previous dragon or challenging them under 55 words",
       "speaks_to": "Turn 1 Dragon Name or founder",
       "is_interruption": true,
       "interrupted_speaker": "Turn 1 Dragon Name",
       "deal_offer_terms": null
     }}
  ]
}}
"""

    raw_json, provider_used = await call_llm(
        system_prompt=director_system_prompt,
        user_message=user_prompt,
        json_mode=True
    )

    try:
        clean_json = raw_json.strip()
        if clean_json.startswith("```"):
            clean_json = re.sub(r"^```(?:json)?\n", "", clean_json)
            clean_json = re.sub(r"\n```$", "", clean_json)
        data = json.loads(clean_json)
        return data, provider_used
    except Exception as e:
        logger.error(f"JSON parse error in director: {e}. Raw: {raw_json[:200]}")
        return {
            "financial_analysis": {
                "ask": current_metrics.get("ask", "Not stated yet"),
                "equity": current_metrics.get("equity", "Not stated yet"),
                "valuation": current_metrics.get("valuation", "Awaiting founder pitch"),
                "revenue": current_metrics.get("revenue", "Not stated yet"),
                "arr": current_metrics.get("arr", "Not stated yet"),
                "implied_multiple": current_metrics.get("implied_multiple", "Awaiting ask & numbers"),
                "multiple_verdict": current_metrics.get("multiple_verdict", "Awaiting founder numbers"),
                "gross_margin": current_metrics.get("gross_margin", "Not stated yet"),
                "cac": current_metrics.get("cac", "Not stated yet"),
                "repeat_rate": current_metrics.get("repeat_rate", "Not stated yet"),
                "future_valuation_advice": "State your funding ask and revenue in your pitch, or Dragons will ask you directly."
            },
            "turns": [
                {
                    "speaker_id": "roaster",
                    "speaker_name": "Ashneer Grover",
                    "action": "question",
                    "tone_badge": "🔍 Numbers Check",
                    "content": "Bhai, what is your ask? You came to the boardroom without stating how much money you want, for what equity, and what your revenue is. First tell us the math, tab baat aage badhegi!",
                    "speaks_to": "founder",
                    "is_interruption": False,
                    "interrupted_speaker": None
                },
                {
                    "speaker_id": "marketing",
                    "speaker_name": "Aman Gupta",
                    "action": "guidance",
                    "tone_badge": "💡 Student Guidance",
                    "content": "Ashneer is right. In business, numbers matter. Tell us: are you pre-revenue or have you tested this with paying campus students?",
                    "speaks_to": "founder",
                    "is_interruption": False,
                    "interrupted_speaker": None
                }
            ]
        }, provider_used

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

@app.websocket("/ws/pitch")
async def websocket_pitch_endpoint(websocket: WebSocket):
    await websocket.accept()
    session_id = f"dragon_tank_{int(asyncio.get_event_loop().time() * 1000)}"
    logger.info(f"Dragon Tank WebSocket connected: {session_id}")

    # Session State
    chat_history: List[Dict[str, Any]] = [
        {
            "role": "moderator",
            "speaker": "The Floor",
            "content": "Step onto the boardroom floor, Founder. The 6 Dragons are seated. Present your venture and state your funding ask, or the Dragons will ask for them.",
            "timestamp": "Just now"
        }
    ]

    business_metrics: Dict[str, Any] = {
        "ask": "Not stated yet",
        "equity": "Not stated yet",
        "valuation": "Awaiting founder pitch",
        "revenue": "Not stated yet",
        "arr": "Not stated yet",
        "gross_margin": "Not stated yet",
        "cac": "Not stated yet",
        "repeat_rate": "Not stated yet",
        "implied_multiple": "Awaiting ask & numbers",
        "multiple_verdict": "Awaiting founder numbers",
        "future_valuation_advice": "State your funding ask, equity, and sales in your pitch or Dragons will ask you directly."
    }

    dragon_statuses: Dict[str, str] = {
        k: "listening" for k in DRAGON_PERSONAS.keys()
    }

    offers: List[Dict[str, Any]] = []

    # Send initial session payload
    await websocket.send_json({
        "type": "session_init",
        "session_id": session_id,
        "dragons": list(DRAGON_PERSONAS.values()),
        "metrics": business_metrics,
        "dragon_statuses": dragon_statuses,
        "chat_history": chat_history,
        "market_benchmark": "Early-stage student ventures need customer validation and evidence of traction before setting a valuation."
    })

    try:
        while True:
            try:
                message_data = await websocket.receive()
            except RuntimeError:
                break
            if message_data.get("type") == "websocket.disconnect":
                break
            if "text" not in message_data or not message_data["text"]:
                continue

            payload = json.loads(message_data["text"])
            msg_type = payload.get("type", "")

            # Merge any frontend metrics passed with the payload
            if "metrics" in payload and isinstance(payload["metrics"], dict):
                business_metrics.update(payload["metrics"])

            # 1. Pitch / Founder Response / Counter-Offer
            if msg_type in ["pitch_text", "founder_answer", "counter_offer"]:
                user_pitch = payload.get("text", "").strip()
                if not user_pitch:
                    continue

                replying_to = payload.get("replying_to", None)
                if replying_to and replying_to.lower() in ["all", "all dragons", "open floor", "none"]:
                    replying_to = None

                user_msg = {
                    "role": "founder",
                    "speaker": "Founder",
                    "content": user_pitch,
                    "target_dragon": replying_to,
                    "timestamp": "Just now"
                }
                chat_history.append(user_msg)
                await websocket.send_json({"type": "chat_message", "message": user_msg})

                # Visual evaluating indicator
                status_text = "The Dragons are scrutinizing your student venture & unit economics..."
                if replying_to:
                    status_text = f"{replying_to} is analyzing your response..."
                await websocket.send_json({
                    "type": "moderator_evaluating",
                    "status": status_text
                })

                # Check if user specifically requested final decision
                is_decision = any(kw in user_pitch.lower() for kw in [
                    "final decision", "are you in or out", "give me your verdict", "deal or no deal", "final call"
                ])

                # Orchestrate real-time boardroom exchange
                boardroom_data, llm_provider = await orchestrate_boardroom_exchange(
                    latest_user_pitch=user_pitch,
                    chat_history=chat_history,
                    current_metrics=business_metrics,
                    dragon_statuses=dragon_statuses,
                    is_decision_phase=is_decision,
                    replying_to=replying_to
                )

                # Update business metrics & valuation analysis
                if "financial_analysis" in boardroom_data:
                    fa = boardroom_data["financial_analysis"]
                    for k, v in fa.items():
                        if v:
                            business_metrics[k] = str(v)

                turns = boardroom_data.get("turns", [])
                if not turns:
                    turns = [
                        {
                            "speaker_id": "roaster",
                            "speaker_name": "Ashneer Grover",
                            "action": "valuation_reality_check",
                            "tone_badge": "📊 Valuation Reality",
                            "content": "Yeh sab doglapan hai. Asking for high valuations without customer validation makes no sense. Show me 50 paying users first!",
                            "speaks_to": "founder",
                            "is_interruption": False,
                            "interrupted_speaker": None
                        }
                    ]

                # Stream each Dragon turn with authentic real-time pacing
                for idx, turn in enumerate(turns):
                    speaker_id = turn.get("speaker_id", "roaster")
                    dragon_info = DRAGON_PERSONAS.get(speaker_id, DRAGON_PERSONAS["roaster"])
                    content = turn.get("content", "").replace("—", " - ").replace("–", " - ").strip()
                    action = turn.get("action", "guidance")
                    tone_badge = turn.get("tone_badge", "💡 Student Guidance").replace("—", " · ")
                    is_interruption = turn.get("is_interruption", False)
                    interrupted_speaker = turn.get("interrupted_speaker", None)
                    deal_terms = turn.get("deal_offer_terms", None)
                    if isinstance(deal_terms, str):
                        deal_terms = deal_terms.replace("—", " - ")

                    # Update dragon status
                    if action == "out":
                        dragon_statuses[speaker_id] = "out"
                    elif action == "offer":
                        dragon_statuses[speaker_id] = "offer"
                        offers.append({
                            "dragon_id": speaker_id,
                            "dragon_name": dragon_info["name"],
                            "terms": deal_terms or content
                        })
                    else:
                        dragon_statuses[speaker_id] = "speaking"

                    # Interruption / chime-in banner notification
                    if is_interruption and interrupted_speaker:
                        await websocket.send_json({
                            "type": "dragon_interruption_event",
                            "interrupter": dragon_info["name"],
                            "interrupted": interrupted_speaker,
                            "badge": "💡 Dragon Perspective"
                        })
                        await asyncio.sleep(0.3)

                    # Real-time typewriter chunk streaming
                    stream_id = f"stream_{speaker_id}_{int(asyncio.get_event_loop().time() * 1000)}"
                    words = content.split(" ")
                    chunk_size = 2
                    for w_idx in range(0, len(words), chunk_size):
                        chunk = " ".join(words[w_idx:w_idx + chunk_size]) + " "
                        await websocket.send_json({
                            "type": "dragon_stream_chunk",
                            "stream_id": stream_id,
                            "dragon_id": speaker_id,
                            "speaker": dragon_info["name"],
                            "chunk": chunk,
                            "action": action,
                            "tone_badge": tone_badge,
                            "is_interruption": is_interruption,
                            "llm_provider": llm_provider
                        })
                        await asyncio.sleep(0.02)

                    # Voice output disabled as per user instruction
                    audio_base64 = None

                    dragon_msg = {
                        "role": "dragon",
                        "speaker": dragon_info["name"],
                        "dragon_id": speaker_id,
                        "title": dragon_info["title"],
                        "content": content,
                        "action": action,
                        "tone_badge": tone_badge,
                        "is_interruption": is_interruption,
                        "interrupted_speaker": interrupted_speaker,
                        "timestamp": "Just now"
                    }
                    chat_history.append(dragon_msg)

                    # Emit complete turn event
                    await websocket.send_json({
                        "type": "dragon_turn",
                        "dragon": dragon_info,
                        "message": dragon_msg,
                        "action": action,
                        "tone_badge": tone_badge,
                        "is_interruption": is_interruption,
                        "metrics": business_metrics,
                        "dragon_statuses": dragon_statuses,
                        "offers": offers,
                        "audio_base64": audio_base64,
                        "llm_provider": llm_provider
                    })

                    # Natural conversational pause before next Dragon chimes in
                    if idx < len(turns) - 1:
                        await asyncio.sleep(0.65)

                # Persist session to Supabase in background
                asyncio.create_task(save_session_to_supabase(session_id, chat_history, business_metrics))

            # 2. Demand Final Decisions
            elif msg_type == "call_for_decisions":
                await websocket.send_json({
                    "type": "moderator_evaluating",
                    "status": "The 6 Dragons are conferring on their final investment calls..."
                })

                decision_data, llm_prov = await orchestrate_boardroom_exchange(
                    latest_user_pitch="Dragons, please give me your final verdict. Are you in or are you out?",
                    chat_history=chat_history,
                    current_metrics=business_metrics,
                    dragon_statuses=dragon_statuses,
                    is_decision_phase=True
                )

                decision_turns = decision_data.get("turns", [])
                for d_turn in decision_turns:
                    s_id = d_turn.get("speaker_id", "roaster")
                    s_info = DRAGON_PERSONAS.get(s_id, DRAGON_PERSONAS["roaster"])
                    c = d_turn.get("content", "")
                    act = d_turn.get("action", "out")
                    tb = d_turn.get("tone_badge", "🚪 Stepped Out" if act == "out" else "💰 Deal Offer")

                    if act == "out":
                        dragon_statuses[s_id] = "out"
                    else:
                        dragon_statuses[s_id] = "offer"
                        offers.append({
                            "dragon_id": s_id,
                            "dragon_name": s_info["name"],
                            "terms": d_turn.get("deal_offer_terms", c)
                        })

                    # Voice output disabled as per user instruction
                    d_audio = None

                    verdict_msg = {
                        "role": "dragon",
                        "speaker": s_info["name"],
                        "dragon_id": s_id,
                        "title": s_info["title"],
                        "content": c,
                        "action": act,
                        "tone_badge": tb,
                        "timestamp": "Just now"
                    }
                    chat_history.append(verdict_msg)

                    await websocket.send_json({
                        "type": "dragon_turn",
                        "dragon": s_info,
                        "message": verdict_msg,
                        "action": act,
                        "tone_badge": tb,
                        "metrics": business_metrics,
                        "dragon_statuses": dragon_statuses,
                        "offers": offers,
                        "audio_base64": d_audio,
                        "llm_provider": llm_prov
                    })
                    await asyncio.sleep(0.4)

            # 3. Reset Session
            elif msg_type == "reset_session":
                chat_history = [
                    {
                        "role": "moderator",
                        "speaker": "The Floor",
                        "content": "The Tank has been reset. A fresh founder steps onto the boardroom floor. Pitch your venture and state your funding ask, or the Dragons will ask for them.",
                        "timestamp": "Just now"
                    }
                ]
                business_metrics = {
                    "ask": "Not stated yet",
                    "equity": "Not stated yet",
                    "valuation": "Awaiting founder pitch",
                    "revenue": "Not stated yet",
                    "arr": "Not stated yet",
                    "gross_margin": "Not stated yet",
                    "cac": "Not stated yet",
                    "repeat_rate": "Not stated yet",
                    "implied_multiple": "Awaiting ask & numbers",
                    "multiple_verdict": "Awaiting founder numbers",
                    "future_valuation_advice": "State your funding ask, equity, and sales in your pitch or Dragons will ask you directly."
                }
                dragon_statuses = {k: "listening" for k in DRAGON_PERSONAS.keys()}
                offers = []
                await websocket.send_json({
                    "type": "session_init",
                    "session_id": session_id,
                    "dragons": list(DRAGON_PERSONAS.values()),
                    "metrics": business_metrics,
                    "dragon_statuses": dragon_statuses,
                    "chat_history": chat_history,
                    "market_benchmark": "Early-stage student ventures need customer validation and evidence of traction before setting a valuation."
                })

    except WebSocketDisconnect:
        logger.info(f"Client disconnected from Dragon Tank session {session_id}")
    except Exception as exc:
        logger.error(f"Dragon Tank WebSocket error: {exc}", exc_info=True)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("backend.server:app", host=host, port=port, reload=True)
