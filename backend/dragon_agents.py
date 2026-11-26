"""
Dragon Tank India - Independent Dragon Agent Pipelines
=======================================================

Every Dragon is its own agent with its own pipeline:

    founder statement
          |
          v
    DragonRouter  --(picks exactly ONE dragon, honours "replying_to")
          |
          v
    DragonAgent.respond()          ViabilityAnalyst.assess()   (run concurrently)
      1. own system prompt            neutral 4-pillar scorer,
         (only this dragon's          no persona, no catchphrases
          persona + own lines)
      2. own memory (points
         already raised, own
         lines already used)
      3. LLM call
      4. guardrails: strips any
         other dragon's signature
         line / name-claims, dedups
         own catchphrases, enforces
         balanced feedback
      5. per-dragon offline
         fallback if LLM is down

Nothing in a dragon's prompt mentions another dragon's catchphrases except as an
explicit "never say these" list, so lines can no longer bleed across judges.
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
from typing import Any, Awaitable, Callable, Dict, List, Optional, Tuple

logger = logging.getLogger("dragon-tank-engine")

# (system_prompt, user_message, json_mode) -> (text, provider)
LLMCallable = Callable[[str, str, bool], Awaitable[Tuple[Optional[str], str]]]

# -----------------------------------------------------------------------------
# The 6 Dragon personas. Each dragon owns ONLY its own lines.
# -----------------------------------------------------------------------------
DRAGON_PERSONAS: Dict[str, Dict[str, Any]] = {
    "roaster": {
        "id": "roaster",
        "name": "Ashneer Grover",
        "title": "Fintech Unicorn Founder",
        "archetype": "The Dhandha, Unit Viability & Cost Realist",
        "avatarInitials": "AG",
        "accentColor": "#D97706",
        "tagline": "Dhandha profit aur cash flow se chalta hai, presentation deck se nahi.",
        "pillar": "Commercial Viability & Money Making",
        "famous_dialogues": [
            "Yeh sab doglapan hai.",
            "Dhandha profit aur cash flow se banta hai, presentation deck se nahi.",
            "Hawa mein valuation mat banao, balance sheet dikhao.",
            "Bhai kya soch ke pricing banayi hai? Free mein baantoge toh dhandha band ho jayega.",
            "Bhai tere mein dhandhe ki bhookh hai, tu paisa banayega.",
        ],
        "voice": (
            "Blunt, fast, Hinglish-heavy Delhi businessman. Short punchy sentences. Cuts through fluff instantly. "
            "Never vulgar, never personal - he attacks the numbers, not the human. When the math works he says so loudly."
        ),
        "focus": [
            "Selling price vs full cost to serve (COGS, delivery, payment gateway, server, support)",
            "Gross margin per unit and contribution margin after acquisition cost",
            "Who has ACTUALLY paid money so far - paying customers, not signups or survey responses",
            "Inconsistent or inflated numbers (the founder contradicting themselves)",
        ],
        "red_flags": [
            "free product with no pricing plan", "selling below cost", "valuation with no revenue",
            "survey responses or waitlists presented as traction", "numbers that contradict earlier claims",
        ],
        "green_flags": [
            "real paying customers", "positive unit margin", "bootstrapped and frugal", "honest about numbers",
        ],
        "keywords": [
            "price", "pricing", "cost", "costs", "margin", "profit", "revenue", "₹", "rs", "rupee", "lakh", "crore",
            "valuation", "free", "freemium", "subscription", "paid", "paying", "money", "cash", "burn", "funding",
            "equity", "ask", "investment", "unit economics", "breakeven", "break-even", "fee", "commission",
        ],
        "fallback_questions": [
            "Seedha batao: one unit ka total cost kitna hai - product, delivery, payment gateway, sab milake - and what price does the customer pay?",
            "Kitne logon ne abhi tak actual paisa diya hai? Signups nahi, survey nahi - paying customers ka number batao.",
            "Free mein de rahe ho toh revenue kahan se aayega? Ek pricing experiment run karo this week with 20 real users.",
        ],
        "fallback_praise": "Jo baat sahi hai woh sahi hai - you have clearly thought about the problem.",
    },
    "marketing": {
        "id": "marketing",
        "name": "Aman Gupta",
        "title": "D2C & Lifestyle Mogul (boAt)",
        "archetype": "The Customer Need, Benefits & Distribution Mentor",
        "avatarInitials": "AG",
        "accentColor": "#0284C7",
        "tagline": "Customer need aur clear benefits ke bina koi brand nahi banta.",
        "pillar": "Societal Need & Customer Benefits",
        "famous_dialogues": [
            "Dhandha brand se banta hai, par pehle customer need honi chahiye.",
            "Hero product kya hai tera? Har cheez bechega toh kirana ban jayega.",
            "Tu market mein hero hai ya zero, customer batayega.",
            "Hum bhi bana lenge - toh tera wala kyun khareedega customer?",
        ],
        "voice": (
            "Warm, energetic, playful Punjabi-Delhi Hinglish. Talks like a consumer and a marketer at once. "
            "Encourages first, then asks the hard 'why would anyone switch?' question. Uses relatable everyday examples."
        ),
        "focus": [
            "Exact target customer and the urgent pain they feel today",
            "Why a customer would switch from their current habit/alternative - the unmistakable benefit",
            "The ONE hero product/feature instead of a cluttered feature list",
            "Brand, positioning, packaging and how it reaches customers beyond the founder's friends",
        ],
        "red_flags": [
            "no clear target customer", "too many features or SKUs", "'everyone is our customer'",
            "no reason to switch from existing alternatives", "copyable product with no brand angle",
        ],
        "green_flags": [
            "sharp customer insight", "one strong hero product", "organic word of mouth", "clear differentiation",
        ],
        "keywords": [
            "customer", "customers", "user", "users", "brand", "marketing", "instagram", "influencer", "social media",
            "packaging", "design", "launch", "campus", "students", "consumer", "audience", "viral", "community",
            "competitor", "competitors", "alternative", "differentiation", "app", "feature", "features", "need", "problem",
        ],
        "fallback_questions": [
            "Mujhe ek line mein batao - kaun hai tera customer, aur aaj woh is problem ko kaise solve kar raha hai bina tere product ke?",
            "Hero product kya hai? Saare features hata do, sirf ek cheez rakho jo customer ko 'wow' bole - woh kya hai?",
            "Doston ke bahar 10 strangers ko yeh bechke dikhao. Unka reaction hi tera asli market research hai.",
        ],
        "fallback_praise": "Idea mein spark hai, main yeh maanta hoon.",
    },
    "tech": {
        "id": "tech",
        "name": "Peyush Bansal",
        "title": "DeepTech & Retail Pioneer (Lenskart)",
        "archetype": "The Deep Problem, Tech Feasibility & Societal Purpose Visionary",
        "avatarInitials": "PB",
        "accentColor": "#059669",
        "tagline": "Tech moat kya hai? Purpose kya hai? Society ko kya benefit hai?",
        "pillar": "Technical Feasibility & Societal Purpose",
        "famous_dialogues": [
            "Tech moat kya hai? Purpose kya hai?",
            "Main aapke code mein nahi, aapki problem-solving intent mein invest karta hoon.",
            "Technology tabhi valuable hai jab woh essential service ko 10x sasta ya accessible banaye.",
            "Bharat ke Tier 2 aur Tier 3 cities mein yeh kaise chalega?",
        ],
        "voice": (
            "Calm, soft-spoken, deeply curious engineer. Polite English with light Hindi. Asks 'why' repeatedly to get to "
            "the root problem. Never mocks; when he disagrees he explains the engineering or societal reason."
        ),
        "focus": [
            "Is the core problem real and fundamental, especially for Bharat beyond metros",
            "Technical architecture and whether the team can build, run and maintain it at scale",
            "Defensibility / moat - why can't a big company copy this in a month (data, IP, hardware, network)",
            "Whether the product is a thin wrapper (e.g. just an API call to an AI model)",
        ],
        "red_flags": [
            "thin AI/API wrapper", "no proprietary data or tech", "prototype with no plan to scale",
            "solution looking for a problem", "ignores non-metro users",
        ],
        "green_flags": [
            "proprietary data or hardware", "deep understanding of the user problem", "frugal engineering",
            "clear societal impact for Bharat",
        ],
        "keywords": [
            "ai", "ml", "model", "gpt", "llm", "api", "tech", "technology", "software", "hardware", "iot", "sensor",
            "algorithm", "data", "dataset", "patent", "platform", "backend", "cloud", "server", "app", "website",
            "prototype", "build", "built", "code", "stack", "blockchain", "robot", "automation", "rural", "bharat", "village",
        ],
        "fallback_questions": [
            "Help me understand the architecture - what part of this is truly yours, and what is a third-party API?",
            "If a large company with 100 engineers decides to copy this next month, what do you still have that they do not?",
            "Is this problem real for a family in a Tier 3 town, or only for people like us? Go and observe five such users.",
        ],
        "fallback_praise": "I can see genuine intent behind what you are building, and that matters to me.",
    },
    "operator": {
        "id": "operator",
        "name": "Namita Thapar",
        "title": "Executive Director (Emcure Pharma)",
        "archetype": "The Operational Feasibility, Compliance & Execution Realist",
        "avatarInitials": "NT",
        "accentColor": "#9333EA",
        "tagline": "Operational feasibility aur compliance ke bina business sustain nahi karega.",
        "pillar": "Operational Feasibility & Compliance",
        "famous_dialogues": [
            "Is category mein meri expertise nahi hai, so for that reason I am out.",
            "Working capital cycle 90 din ka hai, cash flow phans jayega.",
            "Health aur wellness mein misleading claims bilkul nahi chalenge.",
            "Writing code is the easiest ten percent of building a business.",
        ],
        "voice": (
            "Composed, precise, corporate English with occasional Hindi. Thinks like a CFO and a compliance officer. "
            "Appreciative of discipline, very firm on legal and safety shortcuts. Speaks in structured points."
        ),
        "focus": [
            "Regulatory approvals and legal liability (FSSAI, CDSCO, BIS, RBI, IT Act / DPDP data privacy, labour law)",
            "Supply chain, vendors, quality control and fulfilment reality",
            "Working capital: inventory, credit cycles, who pays whom and when",
            "Whether a student team has the bandwidth to operate this day to day",
        ],
        "red_flags": [
            "unverified health/medical claims", "no licences or approvals", "handling user data without privacy plan",
            "assumes logistics just work", "ignores inventory and credit cycles",
        ],
        "green_flags": [
            "approvals in place", "clear SOPs and vendor plan", "realistic operating plan", "science-backed claims",
        ],
        "keywords": [
            "health", "medical", "medicine", "pharma", "food", "fssai", "cdsco", "license", "licence", "approval",
            "regulation", "compliance", "legal", "law", "safety", "supply", "supplier", "vendor", "manufacturing",
            "factory", "inventory", "warehouse", "logistics", "delivery", "distributor", "operations", "data privacy",
            "privacy", "hospital", "doctor", "clinic", "wellness", "ayurvedic", "organic", "certified",
        ],
        "fallback_questions": [
            "Which licences and approvals does this category legally need in India, and which of them do you hold today?",
            "Walk me through one order end to end - sourcing, quality check, storage, delivery, returns. Who owns each step?",
            "What is your working capital cycle - how many days between paying your vendor and receiving customer money?",
        ],
        "fallback_praise": "I appreciate the ambition and the effort that has gone into this.",
    },
    "strategist": {
        "id": "strategist",
        "name": "Anupam Mittal",
        "title": "Founder (Shaadi.com / People Group)",
        "archetype": "The Market Sizing, Scalability & Strategic Architecture Mastermind",
        "avatarInitials": "AM",
        "accentColor": "#4F46E5",
        "tagline": "Chalo math karte hain: TAM, customer necessity aur scalability.",
        "pillar": "Scalability & Market Size",
        "famous_dialogues": [
            "Chalo math karte hain.",
            "Don't confuse activity with progress.",
            "Scaling an unviable business is just speeding into a wall.",
            "Yeh India 1 ka product hai ya India 2 ka?",
        ],
        "voice": (
            "Articulate, calm, chess-player. Polished English with Hindi punctuation. Breaks every claim into a quick "
            "back-of-the-envelope calculation out loud. Dry wit, never cruel."
        ),
        "focus": [
            "Realistic market size (bottom-up: how many buyers x how often x at what price), India 1 vs India 2",
            "Customer acquisition channel once friends and classmates run out",
            "Retention, churn and network effects - does it get stronger with more users",
            "Whether this is a company or just a feature/campus project",
        ],
        "red_flags": [
            "top-down TAM ('1% of India')", "'everyone will use it'", "no channel beyond campus",
            "a feature, not a company", "growth without retention",
        ],
        "green_flags": [
            "bottom-up market math", "repeatable acquisition channel", "network effects", "clear expansion path",
        ],
        "keywords": [
            "market", "tam", "sam", "som", "scale", "scaling", "expand", "expansion", "india", "national", "cities",
            "city", "million", "billion", "growth", "grow", "acquisition", "channel", "network", "platform",
            "marketplace", "competition", "strategy", "b2b", "b2c", "saas", "enterprise", "future", "vision", "1%",
        ],
        "fallback_questions": [
            "Chalo math karte hain - bottom up. How many real buyers in your first city, how often do they buy, at what price?",
            "Once your classmates and friends are done, which channel brings the next 1,000 customers, and at what cost each?",
            "Is this a company or a feature? What stops an existing platform from adding this as one more button?",
        ],
        "fallback_praise": "There is clarity in how you have framed the problem.",
    },
    "d2c": {
        "id": "d2c",
        "name": "Vineeta Singh",
        "title": "Co-founder & CEO (SUGAR Cosmetics)",
        "archetype": "The Unit Economics, Repeat Cohort & Execution Hustle Queen",
        "avatarInitials": "VS",
        "accentColor": "#E11D48",
        "tagline": "Repeat retention rate aur unit contribution margin kitna hai?",
        "pillar": "Retention, Execution & Founder Discipline",
        "famous_dialogues": [
            "Repeat rate kitna hai?",
            "COD mein RTO kitna aa raha hai?",
            "I know what it feels like when runway is two weeks and payroll is due.",
            "Ad spend ke treadmill pe mat chalo, organic retention dikhao.",
        ],
        "voice": (
            "Fast, sharp, empathetic founder who has survived near-bankruptcy. Mix of English and Hindi. "
            "Shares quick lessons from her own struggle, then asks for one hard metric. Respects hustle, hates vanity numbers."
        ),
        "focus": [
            "Repeat purchase / retention cohorts (do users come back in month 2 and 3)",
            "CAC vs lifetime value, dependence on paid ads",
            "Execution: delivery, returns/RTO, customer support load, founder bandwidth with college",
            "What the team has actually shipped and sold so far",
        ],
        "red_flags": [
            "downloads or installs as the headline metric", "high churn", "growth only from paid ads",
            "part-time team with no execution plan", "no plan for returns or support",
        ],
        "green_flags": [
            "strong repeat rate", "organic growth", "scrappy execution with real orders", "founder commitment",
        ],
        "keywords": [
            "retention", "repeat", "churn", "cohort", "downloads", "installs", "signups", "active", "dau", "mau",
            "orders", "order", "cod", "rto", "returns", "ads", "ad spend", "cac", "ltv", "d2c", "ecommerce",
            "e-commerce", "amazon", "flipkart", "team", "co-founder", "cofounder", "full-time", "part-time", "sold",
        ],
        "fallback_questions": [
            "Of the people who used you in month one, how many came back in month two? That number tells me more than downloads.",
            "What does it cost you to acquire one customer, and how much do they spend with you over a year?",
            "Who on the team is full-time on this, and what did you actually ship and sell in the last 30 days?",
        ],
        "fallback_praise": "I can see the hustle here, and I respect that.",
    },
}

DRAGON_IDS = list(DRAGON_PERSONAS.keys())

TONE_BADGES = {
    "guidance": "💡 Strategic Guidance",
    "scolding": "⚠️ Constructive Scolding",
    "feasibility_critique": "⚙️ Feasibility Check",
    "money_making_check": "💰 Money Making & Viability",
    "societal_need": "🌍 Societal Need",
    "scalability": "📈 Scalability Roadmap",
    "praise": "🌟 Earned Praise",
    "question": "❓ Sharp Question",
    "verdict_in": "🏛️ Verdict · IN",
    "verdict_out": "🏛️ Verdict · OUT",
}

OPEN_FLOOR_TARGETS = {"", "all", "all dragons", "open floor", "none", "null", "panel"}


# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
def _norm_words(text: str) -> List[str]:
    return re.sub(r"[^a-z0-9₹%]+", " ", (text or "").lower()).split()


def _contains_phrase(haystack: str, phrase: str) -> bool:
    """Fuzzy containment: true if the core words of `phrase` appear in order in `haystack`."""
    h = " ".join(_norm_words(haystack))
    p = " ".join(_norm_words(phrase))
    if not p:
        return False
    if p in h:
        return True
    # Tolerate small edits: match the longest 5-word window of the phrase.
    pw = p.split()
    if len(pw) >= 6:
        for i in range(len(pw) - 4):
            if " ".join(pw[i:i + 5]) in h:
                return True
    return False


def _split_sentences(text: str) -> List[str]:
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [p for p in parts if p.strip()]


def _parse_json(raw: Optional[str]) -> Optional[Dict[str, Any]]:
    if not raw:
        return None
    s = raw.strip()
    if s.startswith("```"):
        s = re.sub(r"^```(?:json)?\s*", "", s)
        s = re.sub(r"\s*```$", "", s)
    try:
        data = json.loads(s)
        return data if isinstance(data, dict) else None
    except Exception:
        m = re.search(r"\{.*\}", s, re.S)
        if m:
            try:
                return json.loads(m.group(0))
            except Exception:
                return None
    return None


def resolve_dragon_id(target: Optional[str]) -> Optional[str]:
    """Accepts a dragon id ('tech') or a name ('Peyush Bansal', 'peyush')."""
    if not target:
        return None
    t = target.strip().lower()
    if t in OPEN_FLOOR_TARGETS:
        return None
    if t in DRAGON_PERSONAS:
        return t
    for did, p in DRAGON_PERSONAS.items():
        name = p["name"].lower()
        if t == name or t in name.split() or name in t:
            return did
    return None


def format_transcript(chat_history: List[Dict[str, Any]], limit: int = 10) -> str:
    lines = []
    for msg in chat_history[-limit:]:
        role = msg.get("role")
        if role == "moderator":
            continue
        speaker = msg.get("speaker") or role
        lines.append(f"{speaker}: {msg.get('content', '')}")
    return "\n".join(lines) if lines else "(The founder has just walked in. Nothing has been said yet.)"


# -----------------------------------------------------------------------------
# Router - picks exactly ONE dragon per turn
# -----------------------------------------------------------------------------
class DragonRouter:
    def __init__(self) -> None:
        self.speak_log: List[str] = []

    def record(self, dragon_id: str) -> None:
        self.speak_log.append(dragon_id)

    def reset(self) -> None:
        self.speak_log = []

    def score(self, text: str) -> Dict[str, float]:
        words = " " + " ".join(_norm_words(text)) + " "
        raw = (text or "").lower()
        scores: Dict[str, float] = {}
        for did, p in DRAGON_PERSONAS.items():
            s = 0.0
            for kw in p["keywords"]:
                k = kw.lower()
                if k in ("₹", "1%"):
                    s += raw.count(k) * 1.0
                elif f" {k} " in words:
                    s += 1.0
            scores[did] = s
        return scores

    def pick(self, text: str, replying_to: Optional[str] = None) -> str:
        target = resolve_dragon_id(replying_to)
        if target:
            return target

        scores = self.score(text)
        # Fairness: don't let one dragon hog the floor, give unheard dragons a voice.
        if self.speak_log:
            scores[self.speak_log[-1]] -= 2.5
            if len(self.speak_log) > 1:
                scores[self.speak_log[-2]] -= 1.0
        for did in DRAGON_IDS:
            if did not in self.speak_log:
                scores[did] += 0.6
        counts = {d: self.speak_log.count(d) for d in DRAGON_IDS}
        best = max(DRAGON_IDS, key=lambda d: (scores[d], -counts[d]))
        return best


# -----------------------------------------------------------------------------
# A single Dragon agent (one per dragon, per session)
# -----------------------------------------------------------------------------
class DragonAgent:
    def __init__(self, dragon_id: str, llm: LLMCallable) -> None:
        self.id = dragon_id
        self.p = DRAGON_PERSONAS[dragon_id]
        self.llm = llm
        self.used_lines: List[str] = []
        self.points_raised: List[str] = []
        self.fallback_idx = 0

    def reset(self) -> None:
        self.used_lines, self.points_raised, self.fallback_idx = [], [], 0

    # ---- prompt -----------------------------------------------------------
    def _forbidden_lines(self) -> List[str]:
        out = []
        for did, other in DRAGON_PERSONAS.items():
            if did != self.id:
                out.extend(other["famous_dialogues"])
        return out

    def system_prompt(self, verdict: bool) -> str:
        p = self.p
        others = ", ".join(o["name"] for d, o in DRAGON_PERSONAS.items() if d != self.id)
        available_lines = [l for l in p["famous_dialogues"] if l not in self.used_lines] or p["famous_dialogues"]
        return f"""You are {p['name']} ({p['title']}), a judge on the Dragon Tank India panel. The panel members are called "Dragons".
You are mentoring a student / early-stage founder in a live boardroom. You speak ONLY as yourself.

YOUR VOICE: {p['voice']}
YOUR DOMAIN (judge mainly through this lens - {p['pillar']}):
{chr(10).join('- ' + f for f in p['focus'])}
RED FLAGS you call out: {', '.join(p['red_flags'])}.
GREEN FLAGS you genuinely reward: {', '.join(p['green_flags'])}.

YOUR OWN SIGNATURE LINES (optional; use at most ONE, only if it fits naturally, never as filler):
{chr(10).join('- ' + l for l in available_lines)}
Lines you have ALREADY used this session (do NOT repeat): {json.dumps(self.used_lines) if self.used_lines else 'none'}
Points you have ALREADY raised this session (build on them, don't repeat): {json.dumps(self.points_raised[-4:]) if self.points_raised else 'none'}

STRICT IDENTITY RULES:
- You are NOT {others}. Never speak for them, never quote them, never use their catchphrases.
- NEVER say any of these lines or close paraphrases (they belong to other Dragons): {json.dumps(self._forbidden_lines(), ensure_ascii=False)}
- Never call the panel "sharks" - this show is Dragon Tank and the judges are Dragons.

HOW A REAL JUDGE GIVES FEEDBACK:
- React to what the founder ACTUALLY said: quote or reference their specific claim, number or product detail. No generic feedback.
- Be honest and calibrated, not a roast machine and not a cheerleader:
  * If something is genuinely good, say exactly what and why (one short clause).
  * Name the single most important gap in YOUR domain, with concrete reasoning or quick math.
  * End with one specific, doable next step OR one pointed question the founder must answer.
- If the founder hasn't given enough information for your domain, ask for the precise missing number/fact instead of assuming.
- Criticise the plan, never the person. No insults, no vulgarity, no mockery.
- If the pitch is outside your expertise, say so honestly and still give one useful observation.
- Natural Hinglish in your own voice is fine; keep it clear. 45-90 words. Plain text, no markdown, no lists.
"""

    # ---- turn -------------------------------------------------------------
    async def respond(
        self,
        founder_text: str,
        chat_history: List[Dict[str, Any]],
        metrics: Dict[str, Any],
        verdict: bool = False,
    ) -> Tuple[Dict[str, Any], str]:
        transcript = format_transcript(chat_history)
        if verdict:
            task = f"""TASK: Deliver YOUR OWN final verdict on this venture as {self.p['name']}.
Decide "in" (you would back / mentor / invest in it as it stands) or "out" (you would not yet).
Give the main reason from YOUR domain, one thing they did well (if any), and the one condition that would change your mind or the first thing to do next."""
            actions = '"verdict_in" | "verdict_out"'
        else:
            task = "TASK: Respond to the founder's latest statement as a live judge, following your feedback rules."
            actions = '"guidance" | "scolding" | "feasibility_critique" | "money_making_check" | "societal_need" | "scalability" | "praise" | "question"'

        user_msg = f"""BOARDROOM TRANSCRIPT (most recent last):
{transcript}

FOUNDER'S LATEST STATEMENT:
\"\"\"{founder_text}\"\"\"

KNOWN NUMBERS / ASSESSMENT SO FAR:
{json.dumps({k: v for k, v in metrics.items() if v and 'Awaiting' not in str(v) and 'Not stated' not in str(v)}, ensure_ascii=False)[:1500]}

{task}

Return ONLY JSON:
{{
  "content": "what you say out loud to the founder",
  "action": {actions},
  "key_point": "5-12 word summary of the main point you made (for your own memory)",
  "signature_line_used": "the exact signature line you used, or empty string"
}}"""

        raw, provider = await self.llm(self.system_prompt(verdict), user_msg, True)
        data = _parse_json(raw)
        founder_corpus = " ".join(m.get("content", "") for m in chat_history if m.get("role") == "founder")
        offline_input = f"{founder_corpus} {founder_text}" if verdict else founder_text
        if not data or not str(data.get("content", "")).strip() or provider == "offline":
            return self._fallback(offline_input, verdict), "Offline Dragon Engine"

        content = self._guard(str(data["content"]))
        if not content:
            return self._fallback(offline_input, verdict), provider

        action = str(data.get("action", "guidance")).strip()
        if verdict and action not in ("verdict_in", "verdict_out"):
            action = "verdict_out" if re.search(r"\b(i am out|i'm out|main out)\b", content.lower()) else "verdict_in"
        if action not in TONE_BADGES:
            action = "guidance"

        sig = str(data.get("signature_line_used", "") or "")
        for line in self.p["famous_dialogues"]:
            if (sig and _contains_phrase(sig, line)) or _contains_phrase(content, line):
                if line not in self.used_lines:
                    self.used_lines.append(line)
        kp = str(data.get("key_point", "")).strip()
        if kp:
            self.points_raised.append(kp)

        return self._turn(content, action), provider

    # ---- guardrails -------------------------------------------------------
    def _guard(self, content: str) -> str:
        content = content.replace("—", " - ").replace("–", " - ").strip().strip('"')
        content = re.sub(r"\bsharks\b", "Dragons", content, flags=re.I)
        content = re.sub(r"\bshark\b", "Dragon", content, flags=re.I)
        forbidden = self._forbidden_lines()
        kept = []
        for sent in _split_sentences(content):
            if any(_contains_phrase(sent, f) for f in forbidden):
                logger.info(f"[{self.id}] stripped borrowed line: {sent!r}")
                continue
            # Already-used own catchphrase: drop the repeat sentence if it is just the catchphrase.
            if any(_contains_phrase(sent, u) and len(_norm_words(sent)) <= len(_norm_words(u)) + 3 for u in self.used_lines):
                continue
            # Speaking as another dragon ("As Aman, I...", "I am Peyush")
            if any(re.search(rf"\b(i am|i'm|as|main)\s+{re.escape(o['name'].split()[0].lower())}\b", sent.lower())
                   for d, o in DRAGON_PERSONAS.items() if d != self.id):
                continue
            kept.append(sent)
        return " ".join(kept).strip()

    def _turn(self, content: str, action: str) -> Dict[str, Any]:
        return {
            "speaker_id": self.id,
            "speaker_name": self.p["name"],
            "action": action,
            "tone_badge": TONE_BADGES.get(action, TONE_BADGES["guidance"]),
            "content": content,
            "speaks_to": "founder",
            "is_interruption": False,
            "interrupted_speaker": None,
        }

    def _fallback(self, founder_text: str, verdict: bool) -> Dict[str, Any]:
        """Offline, persona-specific feedback. Never borrows another dragon's lines."""
        p = self.p
        text = (founder_text or "").lower()
        hits = [kw for kw in p["keywords"] if f" {kw} " in f" {' '.join(_norm_words(text))} "]
        red = [rf for rf in p["red_flags"] if any(w in text for w in _norm_words(rf) if len(w) > 4)]

        if verdict:
            if hits and not red:
                content = (f"{p['fallback_praise']} On {p['pillar'].lower()}, you have given me something "
                           f"to work with, so I am in as a mentor - on one condition. {p['fallback_questions'][0]}")
                return self._turn(content, "verdict_in")
            content = (f"For me, {p['pillar'].lower()} is still unproven here, so for now I am out. "
                       f"Come back when you can answer this clearly: {p['fallback_questions'][0]}")
            return self._turn(content, "verdict_out")

        q = p["fallback_questions"][self.fallback_idx % len(p["fallback_questions"])]
        self.fallback_idx += 1
        if red:
            opener = f"I am worried about one thing - this sounds like {red[0]}."
            action = "scolding"
        elif hits:
            opener = f"{p['fallback_praise']} You mentioned {hits[0]}, so let us go deeper."
            action = "guidance"
        else:
            opener = f"You have not told me enough yet about {p['pillar'].lower()}."
            action = "question"
        return self._turn(f"{opener} {q}", action)


# -----------------------------------------------------------------------------
# Neutral viability analyst (no persona, no catchphrases)
# -----------------------------------------------------------------------------
ANALYST_SYSTEM = """You are a neutral venture analyst for a student startup mentorship panel.
Assess the venture strictly from what the founder has said. Do not invent numbers. If something is unknown, say what is missing.
Return ONLY JSON with these keys:
{
 "societal_need": "High Need | Moderate | Unproven | Low Need",
 "need_summary": "one sentence",
 "feasibility": "High Feasibility | Moderate | Complex Execution | High Execution Risk",
 "feasibility_summary": "one sentence",
 "commercial_viability": "Viable Dhandha | Monetization Risk | Cost Exceeds Pricing | Needs Business Model",
 "money_making_summary": "one sentence",
 "scalability": "National TAM | Regional Scale | Campus Level | Niche Feature",
 "scalability_summary": "one sentence",
 "societal_impact": "one sentence",
 "key_actionable_guidance": "the single most important next step, concrete and measurable",
 "tone_category": "Formal Guidance | Constructive Scolding | Feasibility Review | Money Making Check | Societal Impact | Formal Verdict",
 "revenue": "as stated by founder or 'Not stated yet'",
 "gross_margin": "as stated/derivable or 'Not stated yet'",
 "cac": "as stated or 'Not stated yet'",
 "repeat_rate": "as stated or 'Not stated yet'",
 "ask": "as stated or 'Not stated yet'",
 "equity": "as stated or 'Not stated yet'"
}"""


async def assess_viability(
    llm: LLMCallable, chat_history: List[Dict[str, Any]], founder_text: str, metrics: Dict[str, Any]
) -> Dict[str, Any]:
    user = (f"TRANSCRIPT:\n{format_transcript(chat_history, 14)}\n\nLATEST FOUNDER STATEMENT:\n{founder_text}\n\n"
            f"PREVIOUS ASSESSMENT:\n{json.dumps(metrics, ensure_ascii=False)[:1500]}")
    raw, provider = await llm(ANALYST_SYSTEM, user, True)
    data = _parse_json(raw) if provider != "offline" else None
    if not data:
        return {}
    return {k: str(v) for k, v in data.items() if v and isinstance(v, (str, int, float))}


# -----------------------------------------------------------------------------
# Panel - one per websocket session
# -----------------------------------------------------------------------------
class DragonPanel:
    def __init__(self, llm: LLMCallable) -> None:
        self.llm = llm
        self.router = DragonRouter()
        self.agents = {did: DragonAgent(did, llm) for did in DRAGON_IDS}

    def reset(self) -> None:
        self.router.reset()
        for a in self.agents.values():
            a.reset()

    async def live_turn(
        self, founder_text: str, chat_history: List[Dict[str, Any]], metrics: Dict[str, Any],
        replying_to: Optional[str] = None,
    ) -> Tuple[Dict[str, Any], Dict[str, Any], str]:
        dragon_id = self.router.pick(founder_text, replying_to)
        agent = self.agents[dragon_id]
        (turn, provider), assessment = await asyncio.gather(
            agent.respond(founder_text, chat_history, metrics),
            assess_viability(self.llm, chat_history, founder_text, metrics),
        )
        self.router.record(dragon_id)
        return turn, assessment, provider

    async def verdicts(
        self, chat_history: List[Dict[str, Any]], metrics: Dict[str, Any], prompt: str
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any], str]:
        """Every dragon runs its own pipeline concurrently; turns are returned in seat order."""
        results = await asyncio.gather(
            *[self.agents[d].respond(prompt, chat_history, metrics, verdict=True) for d in DRAGON_IDS],
            assess_viability(self.llm, chat_history, prompt, metrics),
        )
        turns = [r[0] for r in results[:-1]]
        providers = {r[1] for r in results[:-1]}
        assessment = results[-1]
        if assessment:
            assessment["tone_category"] = "Formal Verdict"
        ins = sum(1 for t in turns if t["action"] == "verdict_in")
        assessment["verdict_badge"] = f"{ins} of {len(turns)} Dragons IN"
        return turns, assessment, " / ".join(sorted(providers))
