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
# -----------------------------------------------------------------------------
# The 6 Iconic Dragon Personas (Formal Student Mentors: Feasibility, Viability, Society & Impact)
# -----------------------------------------------------------------------------
DRAGON_PERSONAS = {
    "roaster": {
        "id": "roaster",
        "name": "Ashneer Grover",
        "title": "Fintech Unicorn Founder",
        "archetype": "The Dhandha, Unit Viability & Cost Realist",
        "avatarInitials": "AG",
        "accentColor": "#D97706",
        "tagline": "Dhandha profit aur cash flow se chalta hai, presentation deck se nahi.",
        "famous_dialogues": [
            "Yeh sab doglapan hai.",
            "Dhandha profit aur positive cash flow se banta hai, presentation deck se nahi.",
            "If your cost to serve is higher than what customers will pay, stop coding immediately and fix the business model.",
            "Do not hide behind free user signups. Tell me who has actually paid real money for this.",
            "Bhai tere mein dhandhe ki bhookh hai, par math grounded hona chahiye.",
            "Bhai kya soch ke pricing banayi hai? Free mein baantoge toh dhandha band ho jayega."
        ],
        "mindset": (
            "You are Ashneer Grover. You are a direct, pragmatic, and serious business mentor to student founders. "
            "You care about REAL MONEY MAKING, positive gross margins (>60%), actual server/manufacturing costs, and genuine customer willingness to pay. "
            "You despise vanity student metrics: classroom survey forms, free app downloads without retention, and burning money on unvalidated ideas. "
            "Tone: Formal, direct, no-nonsense boardroom executive. You do not use vulgarity. "
            "Formal Scolding: When students present zero customer discovery, offer everything for free, or dodge pricing questions, give them a firm, formal scolding to wake them up to commercial reality. "
            "Guidance: Give them actionable, grounded advice on unit costs, pricing models, and how to reach their first 50 paying customers."
        )
    },
    "marketing": {
        "id": "marketing",
        "name": "Aman Gupta",
        "title": "D2C & Lifestyle Mogul (boAt)",
        "archetype": "The Customer Need, Benefits & Distribution Mentor",
        "avatarInitials": "AG",
        "accentColor": "#0284C7",
        "tagline": "Customer need aur clear benefits ke bina koi brand nahi banta.",
        "famous_dialogues": [
            "Dhandha brand se banta hai, par pehle customer need honi chahiye.",
            "Why will a busy consumer in society replace their current habit with your product? What is the unmistakable benefit?",
            "Packaging dekh ke lag raha hai college ka laboratory assignment hai. Commercial product banna padega.",
            "Hero product kya hai tera? Har cheez bechega toh kirana ban jayega.",
            "Tu market mein hero hai ya zero, customer batayega."
        ],
        "mindset": (
            "You are Aman Gupta, co-founder of boAt. You evaluate whether society or consumers actually care about the student's solution. "
            "You focus on: Who is the exact end customer? What is the tangible benefit over existing alternatives? How will students distribute this beyond campus? "
            "Tone: Energetic, sharp, professional, street-smart yet formal mentorship. "
            "Formal Scolding: If students build a feature nobody requested or wrap mediocre ideas in corporate jargon, call them out directly on why consumers will ignore it. "
            "Guidance: Guide students on consumer psychology, sharp product positioning, packaging, and viral campus distribution."
        )
    },
    "tech": {
        "id": "tech",
        "name": "Peyush Bansal",
        "title": "DeepTech & Retail Pioneer (Lenskart)",
        "archetype": "The Deep Problem, Tech Feasibility & Societal Purpose Visionary",
        "avatarInitials": "PB",
        "accentColor": "#059669",
        "tagline": "Tech moat kya hai? Purpose kya hai? Society ko kya benefit hai?",
        "famous_dialogues": [
            "Tech moat kya hai? Purpose kya hai?",
            "Is this solving a fundamental problem for common citizens across Bharat, or is it merely an academic prototype?",
            "Technology is only valuable when it makes an essential service 10x more affordable or accessible to society.",
            "Explain your technical architecture: can your student team maintain this backend when 10,000 live users hit your database?",
            "Main aapke software code mein nahi, aapki problem-solving intent mein interested hoon."
        ],
        "mindset": (
            "You are Peyush Bansal, founder of Lenskart. You believe in technology that solves genuine societal pain points for Bharat's 140 crore citizens. "
            "You focus on: Technical feasibility, engineering architecture, proprietary moats (why can't Big Tech duplicate it tomorrow?), and deep human impact. "
            "Tone: Thoughtful, polite, highly intellectual, formal and empathetic mentor. "
            "Formal Scolding: When students present superficial AI wrappers or clone existing apps without any proprietary moat or societal impact, formally critique their lack of engineering depth. "
            "Guidance: Help students architect scalable tech stacks, discover meaningful moats, and solve real grassroots problems."
        )
    },
    "operator": {
        "id": "operator",
        "name": "Namita Thapar",
        "title": "Executive Director (Emcure Pharma)",
        "archetype": "The Operational Feasibility, Compliance & Execution Realist",
        "avatarInitials": "NT",
        "accentColor": "#9333EA",
        "tagline": "Operational feasibility aur compliance ke bina business sustain nahi karega.",
        "famous_dialogues": [
            "Operational feasibility is everything. Writing code is the easiest 10% of building a business.",
            "Have you verified the regulatory approvals, legal compliance, and liability for this in India?",
            "Working capital cycle 90 din ka hai, cash flow phans jayega.",
            "I appreciate student ambition, but if you do not understand the physical supply chain, this venture cannot function.",
            "Is category mein operational hurdles bohot hain, reality check zaroori hai."
        ],
        "mindset": (
            "You are Namita Thapar. You evaluate operational reality, regulatory compliance (FSSAI/CDSCO/IT Act/labor laws), liability, and working capital cycles. "
            "You focus on: Can a student team actually manage operations, logistics, vendor payments, and quality control without failing? "
            "Tone: Polished, corporate, disciplined, formal, and authoritative. "
            "Formal Scolding: Formally scold students who assume operations run on magic, ignore regulatory certifications, or make unsubstantiated health, medical, or safety claims. "
            "Guidance: Provide structured advice on supply chain resilience, legal compliance, operational milestones, and disciplined vendor management."
        )
    },
    "strategist": {
        "id": "strategist",
        "name": "Anupam Mittal",
        "title": "Founder (Shaadi.com / People Group)",
        "archetype": "The Market Sizing, Scalability & Strategic Architecture Mastermind",
        "avatarInitials": "AM",
        "accentColor": "#4F46E5",
        "tagline": "Chalo math karte hain: Societal TAM, customer necessity aur scalability.",
        "famous_dialogues": [
            "Chalo math karte hain: TAM, customer necessity aur scalability.",
            "A niche feature inside a campus is a worthwhile learning project, but it is not a scalable enterprise without retention.",
            "What is your customer acquisition channel when you run out of classmates? Scaling requires positive unit economics.",
            "Founder mein clarity of thought honi chahiye. Don't confuse activity with real progress.",
            "Scaling an unviable business is just speeding into a concrete wall."
        ],
        "mindset": (
            "You are Anupam Mittal. You are the strategic chess player analyzing Total Addressable Market (TAM in India 1 vs India 2), customer acquisition loops, long-term scalability, and structural business viability. "
            "You focus on: Is the market big enough? Can this venture expand beyond a college campus or single city? What are the network effects and retention dynamics? "
            "Tone: Articulate, strategic, analytical, dignified, and formal venture mentor. "
            "Formal Scolding: Formally scold students when they claim 'everyone in India will use this' or present hand-wavy market sizing without understanding customer retention. "
            "Guidance: Teach students how to structure scalable business models, measure true user churn, and expand into broader regional markets."
        )
    },
    "d2c": {
        "id": "d2c",
        "name": "Vineeta Singh",
        "title": "Co-founder & CEO (SUGAR Cosmetics)",
        "archetype": "The Unit Economics, Repeat Cohort & Execution Hustle Queen",
        "avatarInitials": "VS",
        "accentColor": "#E11D48",
        "tagline": "Repeat retention rate aur unit contribution margin kitna hai?",
        "famous_dialogues": [
            "Repeat customer cohort rate kitna hai? Do users come back in month two?",
            "What is your actual cost per delivery, courier return rate (RTO), and customer acquisition cost?",
            "Student founders often underestimate operational burn. Focus on 5 paying repeat customers first.",
            "Hustle is commendable, but discipline in unit contribution margins is what keeps the company alive.",
            "I know what it feels like to balance university deadlines with customer complaints, execution discipline is non-negotiable."
        ],
        "mindset": (
            "You are Vineeta Singh. You fought through near-bankruptcy to build a physical and digital retail empire. "
            "You focus on: Ground-level execution, repeat retention cohorts, actual delivery/server costs, customer support bandwidth, and unit contribution margins. "
            "Tone: Fast-paced, intense, empathetic to student hustle, yet uncompromisingly rigorous and formal. "
            "Formal Scolding: Formally scold student founders who celebrate vanity app installs while 90% of users drop off within 7 days. "
            "Guidance: Give students concrete, practical frameworks on customer retention, unit contribution, and managing founder operational bandwidth."
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
    # Fallback Rule-Based Boardroom Turn (Single Shark, Student-Oriented Real Viability)
    return json.dumps({
        "viability_assessment": {
            "societal_need": "Moderate - Requires Validation",
            "need_summary": "Identifies an interesting student concept, but must demonstrate genuine necessity for everyday citizens or enterprises.",
            "feasibility": "High Feasibility - Prototype Stage",
            "feasibility_summary": "Technically viable for a student development team, but operational deployment and server costs require discipline.",
            "commercial_viability": "Needs Clear Monetization",
            "money_making_summary": "Currently relying on assumptions. Needs direct pricing experiments or pilot agreements with paying users.",
            "scalability": "Campus to Regional Scope",
            "scalability_summary": "Can prove initial adoption on a university campus before investing capital in regional expansion.",
            "societal_impact": "Potential to enhance student productivity and local service access.",
            "key_actionable_guidance": "Conduct 30 in-person customer discovery interviews outside your peer group to validate willingness to pay.",
            "tone_category": "Formal Guidance"
        },
        "turns": [
            {
                "speaker_id": "tech",
                "speaker_name": "Peyush Bansal",
                "action": "guidance",
                "tone_badge": "💡 Strategic Guidance",
                "content": "Founder, let us look past the initial excitement and analyze the real-world viability. Is this a genuine societal pain point, or a solution looking for a problem? Before writing more code, validate customer willingness to pay."
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
# -----------------------------------------------------------------------------
# Multi-Dragon Boardroom Director Engine (Student-Oriented Real Viability & Mentorship)
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
    Orchestrates live, formal, student-oriented venture evaluations.
    CRITICAL RULES:
    - Strictly ONE Shark speaks at a time.
    - Formal tone: provides actionable suggestions, strategic guidance, or constructive scolding.
    - Evaluates real-world fundamentals: Societal Need, Tangible Benefits, Feasibility, Viability, Money Making, Scalability, and Impact.
    - De-emphasizes TV equity/valuation/royalty negotiation.
    """
    recent_dialogue = []
    for msg in chat_history[-6:]:
        recent_dialogue.append(f"{msg.get('speaker', msg.get('role'))}: {msg.get('content')}")
    history_str = "\n".join(recent_dialogue) if recent_dialogue else "The student founder has just entered the boardroom."

    director_system_prompt = (
        "You are the Executive Director of the Dragon Tank Student Mentorship Den, evaluating college innovators, campus builders, hackathon teams, and early-stage startup founders.\n\n"
        "MANDATORY DIRECTIVES:\n"
        "1. FULLY STUDENT-ORIENTED & REALISTIC:\n"
        "   - You evaluate student ventures transitioning from college projects/hackathons to real-world commercial enterprises.\n"
        "   - Ground all feedback in real society, business fundamentals, operational feasibility, and customer adoption.\n"
        "2. REAL-WORLD VIABILITY OVER TV GIMMICKS:\n"
        "   - Do NOT focus on equity bargaining, pre-money valuations, or royalty deal math.\n"
        "   - Focus 100% on real business and societal truth:\n"
        "     * Societal Need & Problem: Does society, human beings, or any industry actually suffer without this? Is it a genuine problem or an academic gimmick?\n"
        "     * Tangible Benefits: Why will a customer switch from their current habit or pay money? What is the unmistakable value proposition?\n"
        "     * Technical & Operational Feasibility: Can a student team realistically engineer, build, deploy, and maintain this? What are the technological and supply chain roadblocks?\n"
        "     * Commercial Viability & Money Making: How will this venture sustainably generate profit? What are actual unit costs vs pricing? Where does cash flow come from?\n"
        "     * Scalability: How does this scale beyond one college campus or city into a viable national/regional organization?\n"
        "     * Societal Impact: What measurable positive benefit, productivity improvement, or social change is created?\n"
        "3. STRICTLY ONE SHARK SPEAKS AT A TIME (NON-NEGOTIABLE):\n"
        "   - In each turn, EXACTLY ONE Shark is chosen to take the floor and deliver a deep, complete, coherent response.\n"
        "   - NEVER include multiple speaking sharks, interruptions, or crosstalk. Only ONE Shark speaks per response.\n"
        "4. TARGETED SHARK SELECTION:\n"
        "   - If the student specified a target shark (`replying_to`), that Shark MUST be the sole speaker.\n"
        "   - If `replying_to` is open, choose the single Shark whose real-world domain is most directly challenged:\n"
        "     * Peyush Bansal: Technical feasibility, engineering stack, software/hardware moats, Bharat societal purpose.\n"
        "     * Ashneer Grover: Dhandha, unit economics, real costs vs pricing, cash flow, money making, and calling out vanity metrics.\n"
        "     * Aman Gupta: Customer adoption, product packaging, branding, student campus distribution, and viral utility.\n"
        "     * Namita Thapar: Operational execution, regulatory compliance (FSSAI/CDSCO/IT), working capital, and supply chain logistics.\n"
        "     * Anupam Mittal: Market sizing (TAM), customer acquisition loops, long-term business model viability, and strategic scalability.\n"
        "     * Vineeta Singh: Repeat retention cohorts, delivery logistics, gross margins, CAC, and operational discipline.\n"
        "5. FORMAL, SERIOUS TONE (GUIDANCE, SUGGESTIONS, OR CONSTRUCTIVE SCOLDING):\n"
        "   - The Shark speaks in a formal, dignified, professional boardroom manner. No crude slang or circus comedy.\n"
        "   - Constructive Scolding: When students present unvalidated assumptions, say 'we have no competitors', or claim millions of users without talking to a single paying customer, the Shark delivers a firm, formal scolding to wake them up to reality.\n"
        "   - Practical Guidance & Suggestions: When students show real hustle or solid feasibility, the Shark delivers clear, actionable next steps.\n"
        "   - Signature catchphrases may be used naturally in authentic phrasing (e.g. Ashneer: 'Yeh sab doglapan hai', Peyush: 'Tech moat aur purpose kya hai?', Aman: 'Customer need se brand banta hai', Namita: 'Operational compliance dekhni hogi', Anupam: 'Chalo fundamental math karte hain', Vineeta: 'Unit economics samajhni padegi'), but the entire evaluation must be in clear, articulate English."
    )

    reply_target_instruction = ""
    if replying_to and replying_to.lower() not in ["all", "all dragons", "all sharks", "open floor", "none", ""]:
        reply_target_instruction = f"""
IMPORTANT TARGET INSTRUCTION:
The student founder specifically directed their reply to: {replying_to}.
{replying_to} MUST BE THE SOLE SPEAKING SHARK in this turn!
"""

    if is_decision_phase:
        user_prompt = f"""
BOARDROOM TRANSCRIPT:
{history_str}

LATEST STUDENT FOUNDER INPUT:
"{latest_user_pitch}"
{reply_target_instruction}

CURRENT VIABILITY EVALUATION:
{json.dumps(current_metrics)}

TASK: FINAL VENTURE VIABILITY VERDICT FOR THIS STUDENT PROJECT.
Choose the single most authoritative Shark (or {replying_to} if specified) to deliver a definitive, formal Boardroom Ruling on whether this venture is:
- A commercially viable startup ready for seed development, OR
- A project requiring fundamental customer validation, pricing redesign, and feasibility rework, OR
- A worthy academic capstone/feature that lacks commercial viability as an independent business.

Return valid JSON format:
{{
  "viability_assessment": {{
     "societal_need": "High Need | Moderate | Unproven | Low Need",
     "need_summary": "Concise analysis of societal need and customer pain point",
     "feasibility": "High Feasibility | Moderate | Complex Execution | High Execution Risk",
     "feasibility_summary": "Analysis of technical and operational feasibility for students",
     "commercial_viability": "Viable Dhandha | Monetization Risk | Cost Exceeds Pricing | Needs Business Model",
     "money_making_summary": "How this venture generates real money and covers costs",
     "scalability": "National TAM | Regional Scale | Campus Level | Niche Feature",
     "scalability_summary": "Assessment of scaling potential beyond campus",
     "societal_impact": "Measurable societal and human benefits",
     "key_actionable_guidance": "Final formal ruling and top recommendation for the student",
     "tone_category": "Formal Verdict"
  }},
  "turns": [
     {{
       "speaker_id": "roaster|marketing|tech|operator|strategist|d2c",
       "speaker_name": "Exact Shark Name",
       "action": "guidance|scolding|validation_critique|praise",
       "tone_badge": "🏛️ Formal Viability Ruling | ⚠️ Constructive Scolding | 💡 Strategic Guidance",
       "content": "Formal, articulate ruling in English under 85 words addressing societal need, feasibility, money making, and next steps.",
       "speaks_to": "founder",
       "is_interruption": false,
       "interrupted_speaker": null
     }}
  ]
}}
"""
    else:
        user_prompt = f"""
BOARDROOM TRANSCRIPT:
{history_str}

LATEST STUDENT FOUNDER STATEMENT:
"{latest_user_pitch}"
{reply_target_instruction}

CURRENT VIABILITY EVALUATION:
{json.dumps(current_metrics)}

TASK:
1. Evaluate the student founder's statement across real-world business & societal pillars:
   - Societal Need & Real Problem
   - Tangible Benefits to Customers
   - Technical & Operational Feasibility
   - Commercial Viability & Money Making (Costs vs Revenue)
   - Scalability (Beyond campus)
   - Measurable Societal Impact
2. Select EXACTLY ONE Shark to speak:
   - If {replying_to} is specified, select {replying_to}.
   - Otherwise, pick the single Shark whose domain directly addresses the student's statement.
3. The selected Shark must deliver a formal, articulate, and direct evaluation under 85 words:
   - Provide concrete suggestions, strategic guidance, OR formal constructive scolding (e.g. calling out unvalidated assumptions, lack of paying users, or building something nobody wants).
   - Only 1 Shark speaks. Zero crosstalk.

Return valid JSON format:
{{
  "viability_assessment": {{
     "societal_need": "High Need | Moderate | Unproven | Low Need",
     "need_summary": "Analysis of societal need and customer pain point",
     "feasibility": "High Feasibility | Moderate | Complex Execution | High Execution Risk",
     "feasibility_summary": "Analysis of technical and operational feasibility for students",
     "commercial_viability": "Viable Dhandha | Monetization Risk | Cost Exceeds Pricing | Needs Business Model",
     "money_making_summary": "How this venture generates real money and covers costs",
     "scalability": "National TAM | Regional Scale | Campus Level | Niche Feature",
     "scalability_summary": "Assessment of scaling potential beyond campus",
     "societal_impact": "Measurable societal and human benefits",
     "key_actionable_guidance": "Immediate concrete next step or formal instruction for student",
     "tone_category": "Formal Guidance | Constructive Scolding | Feasibility Review | Money Making Check | Societal Impact"
  }},
  "turns": [
     {{
       "speaker_id": "roaster|marketing|tech|operator|strategist|d2c",
       "speaker_name": "Exact Shark Name",
       "action": "guidance|scolding|feasibility_critique|money_making_check|praise",
       "tone_badge": "⚠️ Constructive Scolding | 💡 Strategic Guidance | ⚙️ Feasibility Check | 💰 Money Making & Viability | 🌍 Societal Need | 📈 Scalability Roadmap",
       "content": "Articulate, formal dialogue under 85 words addressing the student founder with serious mentorship, suggestions, or scolding.",
       "speaks_to": "founder",
       "is_interruption": false,
       "interrupted_speaker": null
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

        # Ensure turns has at most 1 speaker (Single Shark rule)
        if "turns" in data and len(data["turns"]) > 1:
            data["turns"] = [data["turns"][0]]

        return data, provider_used
    except Exception as e:
        logger.error(f"JSON parse error in director: {e}. Raw: {raw_json[:200]}")
        return {
            "viability_assessment": {
                "societal_need": current_metrics.get("societal_need", "Moderate - Requires Validation"),
                "need_summary": current_metrics.get("need_summary", "Examine who in society directly benefits from your solution."),
                "feasibility": current_metrics.get("feasibility", "High Feasibility - Prototype Stage"),
                "feasibility_summary": current_metrics.get("feasibility_summary", "Can be built by a student engineering team with focused scope."),
                "commercial_viability": current_metrics.get("commercial_viability", "Needs Clear Monetization"),
                "money_making_summary": current_metrics.get("money_making_summary", "Validate customer willingness to pay rather than assuming free usage."),
                "scalability": current_metrics.get("scalability", "Campus to Regional Scope"),
                "scalability_summary": current_metrics.get("scalability_summary", "Focus on campus pilot before scaling to wider markets."),
                "societal_impact": current_metrics.get("societal_impact", "Positive potential to solve local workflow problems."),
                "key_actionable_guidance": "Conduct 25 structured customer interviews to validate paying demand.",
                "tone_category": "Formal Guidance"
            },
            "turns": [
                {
                    "speaker_id": "tech",
                    "speaker_name": "Peyush Bansal",
                    "action": "guidance",
                    "tone_badge": "💡 Strategic Guidance",
                    "content": "Founder, let us look at the fundamental purpose. Is this solving a genuine problem for society, or is it an interesting classroom prototype? Before writing more code, validate customer willingness to pay.",
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
            "content": "Step onto the boardroom floor, Student Founder. The Sharks are seated. Present your project or venture idea. Exactly one Shark will evaluate your pitch live, focusing on Societal Need, Real Benefits, Technical Feasibility, Commercial Viability, Money-Making Model, and Scalability.",
            "timestamp": "Just now"
        }
    ]

    business_metrics: Dict[str, Any] = {
        "societal_need": "Awaiting Student Pitch",
        "need_summary": "State the real problem in society and who suffers without your solution.",
        "feasibility": "Awaiting Student Pitch",
        "feasibility_summary": "Explain your technical architecture and student execution feasibility.",
        "commercial_viability": "Awaiting Student Pitch",
        "money_making_summary": "Explain your unit economics, pricing model, and how you achieve profit.",
        "scalability": "Awaiting Student Pitch",
        "scalability_summary": "Explain how this venture expands beyond your campus or hackathon demo.",
        "societal_impact": "Measurable benefit and positive change created for people or industry.",
        "key_actionable_guidance": "Present your project. Exactly one Shark will evaluate your venture live with formal guidance or scolding.",
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
        "future_valuation_advice": "Focus on real customer validation and unit viability before seeking institutional capital."
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
        "market_benchmark": "Early-stage student ventures must prove societal need, customer willingness to pay, and operational feasibility."
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
                if replying_to and replying_to.lower() in ["all", "all dragons", "all sharks", "open floor", "none"]:
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
                status_text = "The Sharks are evaluating societal need, feasibility & viability..."
                if replying_to:
                    status_text = f"{replying_to} is preparing a formal evaluation..."
                await websocket.send_json({
                    "type": "moderator_evaluating",
                    "status": status_text
                })

                # Check if user specifically requested final decision
                is_decision = any(kw in user_pitch.lower() for kw in [
                    "final decision", "are you in or out", "give me your verdict", "deal or no deal", "final call", "final ruling"
                ])

                # Orchestrate real-time boardroom exchange (Single Shark speaks)
                boardroom_data, llm_provider = await orchestrate_boardroom_exchange(
                    latest_user_pitch=user_pitch,
                    chat_history=chat_history,
                    current_metrics=business_metrics,
                    dragon_statuses=dragon_statuses,
                    is_decision_phase=is_decision,
                    replying_to=replying_to
                )

                # Update business metrics & viability analysis
                if "viability_assessment" in boardroom_data:
                    va = boardroom_data["viability_assessment"]
                    for k, v in va.items():
                        if v:
                            business_metrics[k] = str(v)
                if "financial_analysis" in boardroom_data:
                    fa = boardroom_data["financial_analysis"]
                    for k, v in fa.items():
                        if v:
                            business_metrics[k] = str(v)

                turns = boardroom_data.get("turns", [])
                if not turns:
                    turns = [
                        {
                            "speaker_id": "tech",
                            "speaker_name": "Peyush Bansal",
                            "action": "guidance",
                            "tone_badge": "💡 Strategic Guidance",
                            "content": "Founder, let us look at the fundamental purpose. Is this solving a genuine societal problem, or is it an interesting classroom prototype? Before writing more code, validate customer willingness to pay.",
                            "speaks_to": "founder",
                            "is_interruption": False,
                            "interrupted_speaker": None
                        }
                    ]

                # Stream the single Shark turn with authentic real-time pacing
                for idx, turn in enumerate(turns):
                    speaker_id = turn.get("speaker_id", "tech")
                    dragon_info = DRAGON_PERSONAS.get(speaker_id, DRAGON_PERSONAS["tech"])
                    content = turn.get("content", "").replace("—", " - ").replace("–", " - ").strip()
                    action = turn.get("action", "guidance")
                    tone_badge = turn.get("tone_badge", "💡 Strategic Guidance").replace("—", " · ")

                    # STRICTLY ONE SHARK SPEAKS: Set only the chosen shark to 'speaking', all others to 'listening'
                    for k in dragon_statuses.keys():
                        dragon_statuses[k] = "speaking" if k == speaker_id else "listening"

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
                            "is_interruption": False,
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
                        "is_interruption": False,
                        "interrupted_speaker": None,
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
                        "is_interruption": False,
                        "metrics": business_metrics,
                        "dragon_statuses": dragon_statuses,
                        "offers": offers,
                        "audio_base64": audio_base64,
                        "llm_provider": llm_provider
                    })

                # Persist session to Supabase in background
                asyncio.create_task(save_session_to_supabase(session_id, chat_history, business_metrics))

            # 2. Demand Final Decisions / Viability Ruling
            elif msg_type == "call_for_decisions":
                await websocket.send_json({
                    "type": "moderator_evaluating",
                    "status": "The Sharks are delivering their final formal viability ruling..."
                })

                decision_data, llm_prov = await orchestrate_boardroom_exchange(
                    latest_user_pitch="Sharks, please give me your final formal ruling on whether our venture is viable, needs customer validation, or is an academic project.",
                    chat_history=chat_history,
                    current_metrics=business_metrics,
                    dragon_statuses=dragon_statuses,
                    is_decision_phase=True
                )

                if "viability_assessment" in decision_data:
                    va = decision_data["viability_assessment"]
                    for k, v in va.items():
                        if v:
                            business_metrics[k] = str(v)

                decision_turns = decision_data.get("turns", [])
                for d_turn in decision_turns:
                    s_id = d_turn.get("speaker_id", "tech")
                    s_info = DRAGON_PERSONAS.get(s_id, DRAGON_PERSONAS["tech"])
                    c = d_turn.get("content", "")
                    act = d_turn.get("action", "guidance")
                    tb = d_turn.get("tone_badge", "🏛️ Formal Viability Ruling")

                    for k in dragon_statuses.keys():
                        dragon_statuses[k] = "speaking" if k == s_id else "listening"

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
                        "audio_base64": None,
                        "llm_provider": llm_prov
                    })

            # 3. Reset Session
            elif msg_type == "reset_session":
                chat_history = [
                    {
                        "role": "moderator",
                        "speaker": "The Floor",
                        "content": "The floor has been reset. A fresh student founder steps into the den. Present your project or venture idea.",
                        "timestamp": "Just now"
                    }
                ]
                business_metrics = {
                    "societal_need": "Awaiting Student Pitch",
                    "need_summary": "State the real problem in society and who suffers without your solution.",
                    "feasibility": "Awaiting Student Pitch",
                    "feasibility_summary": "Explain your technical architecture and student execution feasibility.",
                    "commercial_viability": "Awaiting Student Pitch",
                    "money_making_summary": "Explain your unit economics, pricing model, and how you achieve profit.",
                    "scalability": "Awaiting Student Pitch",
                    "scalability_summary": "Explain how this venture expands beyond your campus or hackathon demo.",
                    "societal_impact": "Measurable benefit and positive change created for people or industry.",
                    "key_actionable_guidance": "Present your project. Exactly one Shark will evaluate your venture live with formal guidance or scolding.",
                    "verdict_badge": "Awaiting Pitch",
                    "ask": "Not stated yet",
                    "equity": "Not stated yet",
                    "valuation": "Student Project Stage",
                    "revenue": "Not stated yet",
                    "arr": "Not stated yet",
                    "gross_margin": "Not stated yet"
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
                    "market_benchmark": "Early-stage student ventures must prove societal need, customer willingness to pay, and operational feasibility."
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
