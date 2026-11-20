<div align="center">

# 🐲 DRAGON TANK INDIA
### Real-Time AI Mentorship & Boardroom Simulator for Student Ventures

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2_App_Router-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110_Async-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.5_Flash_Lite-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini_Fallback-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![Supabase](https://img.shields.io/badge/Supabase-pgvector_HNSW-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4_VisionOS_Glass-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Native_Synthesizer-FF6F00?style=for-the-badge&logo=webrtc&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Security Audited](https://img.shields.io/badge/Security-Airtight_Zero--Leak-10B981?style=for-the-badge&logo=githubactions&logoColor=white)](#-security--api-key-management-vault)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)

<br/>

> **"Dhandha profit aur cash flow se banta hai, presentation deck se nahi."**  
> *A high-fidelity boardroom simulator built for college innovators, hackathon teams, and student entrepreneurs to test their ventures against India’s most iconic startup titans before facing real-world market consequences.*

<br/>

[🚀 Quick Start](#-quick-start-in-under-2-minutes) •
[🏛️ Architecture](#-high-level-system-architecture) •
[🐲 The 6 Mentors](#-the-6-iconic-mentorship-personas) •
[🧭 4-Pillar Rubric](#-the-4-real-world-venture-pillars) •
[🔐 Key Security](#-security--api-key-management-vault) •
[📡 WebSocket Protocol](#-websocket-event-protocol-specification) •
[🗄️ Supabase pgvector](#-database-architecture--supabase-pgvector) •
[🧪 Viability Lab](#-student-venture-economics--viability-lab)

---

</div>

<br/>

## 📖 Executive Summary & Mission

Most student startup founders face the **"Classroom-to-Market Disconnect"**:
1. **Vanity Valuation Syndrome**: Projecting ₹20–50 Crore valuations from tech blog headlines rather than calculating actual unit costs and customer purchasing power.
2. **Confusing Code with Commercial Reality**: Believing that writing a Python script or assembling a Figma prototype equates to an operating enterprise.
3. **Negative Unit Economics**: Underpricing solutions claiming "student discounts" and burning personal pocket money without a sustainable money-making model.
4. **Feasibility Blindness**: Neglecting compliance (FSSAI, CDSCO, BIS, IT Act), vendor credit cycles, distributor margins, and physical delivery friction.

**Dragon Tank India** transforms early-stage validation. Unlike theatrical TV pitch shows focused on staged bidding wars and television royalty gimmicks, Dragon Tank India operates as a **rigorous virtual incubator boardroom**:
- **Student-First Reality Check**: Grounded in campus budgets, final-year capstones, hardware prototypes, and student team constraints.
- **Strict Single-Speaker Protocol**: Zero chaotic crosstalk. Exactly one mentor interrogates and evaluates each statement with undivided focus.
- **Formal Mentorship, Suggestions & Constructive Scolding**: Objective, respectful boardroom critique that praises true innovation and formally scolds ungrounded assumptions.
- **The 4 Real-World Pillars**: Every project is scored across **Societal Need, Customer Benefits, Technical/Operational Feasibility, Commercial Viability & Money Making, and Scalability**.

---

## ⚡ The Television Show vs. Dragon Tank India

| Dimension | Entertainment TV Pitch Show | 🐲 Dragon Tank India (Incubator Reality) |
|---|---|---|
| **Target Audience** | Television entertainment viewers | **College innovators, hackathon teams & student founders** |
| **Speaker Dynamics** | Chaotic interruptions & shouting over founders | **Strictly Single-Speaker Director**: Zero crosstalk, 100% focused turn |
| **Feedback Quality** | Theatrical soundbites & dramatic exits | **Formal Mentorship, Actionable Guidance & Constructive Scolding** |
| **Evaluation Focus** | Paper equity bargaining & royalty demands | **Societal Need, Unit Economics, Feasibility & Scalability** |
| **Economics Lab** | Back-of-the-napkin paper math | **Interactive Bezel Dial**: Unit Contribution, Gross Margin % & Break-Even |
| **Audio Infrastructure**| Pre-recorded static sound files | **Native In-Memory Web Audio Synthesizer**: Zero audio assets loaded |
| **Architecture** | Scripted studio production | **Real-Time Reactive WebSocket Engine with Cascading Multi-LLMs** |

---

## 🏛️ High-Level System Architecture

```
                                  +-----------------------------------------------+
                                  |         Next.js 14 Client (Den Stage)         |
                                  |  - Sovereign Chamber (VisionOS Glassmorphism)  |
                                  |  - Bespoke SVG Bezel Dial Margin Gauge        |
                                  |  - Native Web Audio Synthesizer (0 MP3 Assets) |
                                  |  - Hand-drawn SVG Iconography (Ishaan-UI)     |
                                  +-----------------------+-----------------------+
                                                          |
                                           WebSocket /ws/pitch (Bi-directional)
                                                          v
                                  +-----------------------------------------------+
                                  |         FastAPI Asynchronous Gateway          |
                                  |  - Concurrent Session Lifecycle Manager       |
                                  |  - Strict Single-Speaker Turn Clamping Engine |
                                  |  - 4-Pillar Real-World Viability Scorer       |
                                  +-----------------------+-----------------------+
                                                          |
                +-----------------------------------------+-----------------------------------------+
                |                                                                                   |
                v                                                                                   v
+-------------------------------+                                                   +-------------------------------+
|   Multi-LLM Cascading Router  |                                                   |  Supabase pgvector (Postgres) |
| 1. Gemini 3.5 Flash Lite (0.4s)|                                                   | - public.sessions             |
| 2. Gemini 3.5 Flash (Fallback)|                                                   | - public.market_benchmarks    |
| 3. GPT-4o-mini (Secondary FB) |                                                   | - HNSW Cosine Vector Index    |
| 4. Deterministic Rule Engine  |                                                   | - Row Level Security (RLS)    |
+---------------+---------------+                                                   +-------------------------------+
                |
                v
+-------------------------------+
|  Typewriter Streaming Engine  |
| - 2-Word Bursts every 20ms    |
| - Persona Status Sync (Auras) |
| - Dynamic Tone Badging        |
+-------------------------------+
```

```mermaid
flowchart TD
    subgraph Client["Next.js 14 Frontend (Browser Client)"]
        UI["Den Stage UI (Split-Pane Boardroom)"]
        AudioSynth["Native Web Audio Synthesizer (In-Memory DSP)"]
        Bezel["Bespoke SVG Bezel Dial (Gross Margin & Reach)"]
        Mic["Web Speech API / Text Input Stream"]
    end

    subgraph Server["FastAPI Asynchronous Backend (:8000)"]
        WS["WebSocket Gateway (/ws/pitch)"]
        Director["Single-Speaker Director Engine"]
        Viability["4-Pillar Viability & Impact Scorer"]
        SessionStore["In-Memory State Coordinator"]
    end

    subgraph LLM_Cascades["Cascading Multi-LLM Inference Hierarchy"]
        GeminiLite["1. Google Gemini 3.5 Flash Lite (Primary • Sub-second)"]
        GeminiFlash["2. Google Gemini 3.5 Flash (First Fallback)"]
        OpenAI["3. OpenAI GPT-4o-mini (Secondary Fallback)"]
        RuleEngine["4. Deterministic Python Rule Engine (Offline Guarantee)"]
    end

    subgraph Database["Supabase Storage & Vector Memory"]
        Sessions["public.sessions (Transcripts, UUID & JSONB Metrics)"]
        Benchmarks["public.market_benchmarks (768-dim HNSW Vector Store)"]
    end

    Mic -->|Live Audio / Pitch Text| WS
    Bezel -->|Live Unit Economics Updates| WS
    WS <--> SessionStore
    SessionStore --> Director
    Director --> Viability
    Viability --> LLM_Cascades

    LLM_Cascades --> GeminiLite
    GeminiLite -.->|On Quota / Timeout| GeminiFlash
    GeminiFlash -.->|On Error / Exception| OpenAI
    OpenAI -.->|On Disconnection| RuleEngine

    LLM_Cascades -->|Strict Single Shark JSON Payload| Director
    Director -->|Token Stream Chunks (2 words / 20ms)| WS
    WS -->|Reactive Typewriter Event Stream| UI
    WS -->|Async Non-blocking Background Task| Sessions
    Benchmarks -.->|Vector Semantic Retrieval (RAG)| Director
    UI --> AudioSynth
```

---

## 🐲 The 6 Iconic Mentorship Personas

Each mentor commands a specialized evaluation domain, delivering articulate boardroom feedback with distinct guidance and scolding criteria:

```
+---------------------------------------------------------------------------------------------------------+
|                                    THE 6 DRAGON TANK MENTOR PERSONAS                                    |
+-------------------+-----------------------------+---------------------------------+---------------------+
| Mentor Name       | Professional Archetype      | Domain & Core Scrutiny          | Iconic Tone Motto   |
+-------------------+-----------------------------+---------------------------------+---------------------+
| Ashneer Grover    | The Dhandha Realist         | Unit Economics, Gross Margin    | "Dhandha profit se  |
|                   | (Fintech Unicorn Founder)   | (>60%), Eliminating Subsidies   | chalta hai..."      |
| Aman Gupta        | The Brand & Need Mentor     | Customer Need, Differentiation, | "Customer need aur  |
|                   | (boAt Lifestyle Mogul)      | Campus Distribution & Viral SKU | clear benefits..."  |
| Peyush Bansal     | The DeepTech Visionary      | Proprietary Moats, Engineering  | "Tech moat kya hai? |
|                   | (Lenskart Pioneer)          | Architecture & Grassroots TAM   | Purpose kya hai?"   |
| Namita Thapar     | The Compliance Leader       | Operational Feasibility, FSSAI/ | "Operational        |
|                   | (Executive Director, Emcure)| CDSCO Laws, Working Capital     | feasibility..."     |
| Anupam Mittal     | The Strategic Mastermind    | Market Sizing (India 1 vs 2),   | "Chalo math karte   |
|                   | (Shaadi.com / People Group) | Churn Curves & Scalability      | hain..."            |
| Vineeta Singh     | The Unit Hustle Mentor      | Repeat Retention Cohorts, CAC   | "Repeat retention   |
|                   | (SUGAR Cosmetics CEO)       | vs LTV, Delivery Friction       | rate kitna hai?"    |
+-------------------+-----------------------------+---------------------------------+---------------------+
```

### Detailed Mentor Rubrics

<details>
<summary><b>1. Ashneer Grover — Financial Discipline & Unit Economics Mentor</b></summary>

- **Core Scrutiny**: Unit economics, manufacturing/hosting costs, gross margin integrity (>60%), eliminating student subsidies.
- **Formal Guidance Focus**: Instructs students on real-world cost accounting: customer acquisition cost, payment gateway fees, server compute costs, and pricing structures that generate cash from Day 1.
- **Constructive Scolding Trigger**: Negative unit contribution margins, offering free products without pricing models, or celebrating survey form responses instead of paying customers.
- **Tone**: Formal, direct, no-nonsense boardroom executive.
</details>

<details>
<summary><b>2. Aman Gupta — Customer Need & Distribution Mentor</b></summary>

- **Core Scrutiny**: Real consumer adoption, product-market fit, packaging aesthetics, campus brand virality, and quick-commerce channels.
- **Formal Guidance Focus**: Guiding student founders to narrow down a cluttered feature set into one crisp "Hero Product" that solves an urgent consumer irritation.
- **Constructive Scolding Trigger**: Building products nobody asked for, disguising classroom assignments as commercial ventures, or failing to articulate why anyone will switch from existing alternatives.
- **Tone**: Energetic, street-smart, razor-sharp yet supportive.
</details>

<details>
<summary><b>3. Peyush Bansal — DeepTech Moat & Societal Purpose Visionary</b></summary>

- **Core Scrutiny**: Technical feasibility, proprietary engineering moats, automation, and long-term societal utility for Bharat’s 140 Crore citizens.
- **Formal Guidance Focus**: Helping student engineers build defensible architectures (patents, proprietary datasets, hardware automation) that cannot be cloned overnight by Big Tech.
- **Constructive Scolding Trigger**: Building thin API wrappers around generic models, presenting toy scripts without scalable backend infrastructure, or lacking problem-solving intent.
- **Tone**: Calm, deeply empathetic, highly intellectual, and visionary.
</details>

<details>
<summary><b>4. Namita Thapar — Operational Feasibility & Regulatory Leader</b></summary>

- **Core Scrutiny**: Physical supply chains, 60–90 day distributor working capital cycles, regulatory compliance (FSSAI, CDSCO, BIS, IT Act), and corporate liability.
- **Formal Guidance Focus**: Stress-testing whether a student team has the legal and logistical bandwidth to operate without burning out or running afoul of Indian law.
- **Constructive Scolding Trigger**: Making unsubstantiated medical/health claims, ignoring statutory compliance, or assuming physical fulfillment runs on magic.
- **Tone**: Dignified, corporate, disciplined, and authoritative.
</details>

<details>
<summary><b>5. Anupam Mittal — Market Sizing & Strategic Growth Mastermind</b></summary>

- **Core Scrutiny**: Total Addressable Market (TAM), India 1 (Affluent) vs. India 2 (Aspirational) sizing, structural unit economics, and network effects.
- **Formal Guidance Focus**: Teaching founders how to model cohort retention, calculate customer lifetime value, and expand beyond university walls into national markets.
- **Constructive Scolding Trigger**: Claiming "everyone in India will use our app", conflating surface activity with traction, or dodging questions on user churn.
- **Tone**: Articulate, analytical, chess-player mentality, and dignified.
</details>

<details>
<summary><b>6. Vineeta Singh — Unit Contribution & Retention Mentor</b></summary>

- **Core Scrutiny**: Cash-on-delivery logistics, Return-to-Origin (RTO) rates, 30-day and 90-day repeat cohort retention, and customer acquisition costs.
- **Formal Guidance Focus**: Guiding founders to balance academic commitments with operational discipline, proving product love through high organic repeat rates.
- **Constructive Scolding Trigger**: Boasting about total downloads when 95% of users churn within 7 days, or burning cash on advertisements without organic word-of-mouth.
- **Tone**: Fast-paced, intense, empathetic to student hustle, yet mathematically unyielding.
</details>

---

## 🧭 The 4 Real-World Venture Pillars

Every pitch evaluation, typewriter token stream, and final verdict is structured against four foundational pillars:

```
+---------------------------------------------------------------------------------------+
|                           THE 4 FOUNDATIONAL VENTURE PILLARS                          |
+-----------------------------------------+---------------------------------------------+
| 1. Societal Need & Tangible Benefits    | Does society genuinely require this?        |
|                                         | Who suffers if this venture never exists?   |
+-----------------------------------------+---------------------------------------------+
| 2. Technical & Operational Feasibility  | Can a student team build & maintain it?     |
|                                         | Are dependencies, APIs & compliance clear?  |
+-----------------------------------------+---------------------------------------------+
| 3. Commercial Viability & Money Making  | Does selling price exceed all costs?        |
|                                         | Is there a reliable path to cash profit?    |
+-----------------------------------------+---------------------------------------------+
| 4. Scalability & Measurable Impact      | How does it expand from campus to Bharat?   |
|                                         | What measurable human value is generated?   |
+-----------------------------------------+---------------------------------------------+
```

### Structured Director Output Schema
Every turn generates deterministic structured JSON:
```json
{
  "viability_assessment": {
    "societal_need": "High Need | Moderate | Unproven | Low Need",
    "need_summary": "Analysis of societal need and target user pain point",
    "feasibility": "High Feasibility | Moderate | Complex Execution | High Execution Risk",
    "feasibility_summary": "Assessment of technical and operational feasibility for a student team",
    "commercial_viability": "Viable Dhandha | Monetization Risk | Cost Exceeds Pricing | Needs Business Model",
    "money_making_summary": "How this venture generates real cash profit and covers all costs",
    "scalability": "National TAM | Regional Scale | Campus Level | Niche Feature",
    "scalability_summary": "Assessment of scaling potential beyond a campus or hackathon demo",
    "societal_impact": "Measurable societal, environmental, and human benefits",
    "key_actionable_guidance": "Concrete next step or formal instruction for student founders",
    "tone_category": "Formal Guidance | Constructive Scolding | Feasibility Review | Money Making Check"
  },
  "turns": [
    {
      "speaker_id": "roaster",
      "speaker_name": "Ashneer Grover",
      "action": "money_making_check",
      "tone_badge": "💰 Money Making & Viability",
      "content": "Bhai, your direct cost per order is ₹450 and you are charging students ₹300. You are losing ₹150 on every single delivery. Presentation deck band karo aur pricing theek karo.",
      "speaks_to": "founder",
      "is_interruption": false,
      "interrupted_speaker": null
    }
  ]
}
```

---

## 🔐 Security & API Key Management Vault

> [!IMPORTANT]
> **API Key Security is a Top-Priority Operational Invariant in Dragon Tank India.**  
> Under no circumstances should real API keys, tokens, or private credentials be committed to version control, exposed in client bundles, or logged in console output.

### 🛡️ The 5 Golden Rules of Key Security

1. **Zero-Key Invariant in Git History**: Real `.env` files are permanently ignored via [`.gitignore`](./.gitignore). Never commit `.env`, `.env.local`, or any variant.
2. **Clear Architecture Boundary (Client vs. Server)**:
   - **Backend Private Zone** (`backend/.env`): Holds sensitive master secrets (`GEMINI_API_KEY`, `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, and `SUPABASE_SECRET_KEY`).
   - **Frontend Public Zone** (`frontend/.env.local`): Only holds `NEXT_PUBLIC_` endpoints (`NEXT_PUBLIC_WS_URL`, `NEXT_PUBLIC_API_URL`, and the public `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
   - **Warning**: Never prefix private AI keys with `NEXT_PUBLIC_`. All LLM calls and private transactions are mediated exclusively through the FastAPI backend.
3. **Least Privilege Principles**: When generating API keys:
   - Restrict your Gemini and OpenAI keys to their intended models.
   - For Supabase, use Row Level Security (RLS) so the public anon key can only perform permitted operations.
4. **Automated Secret Scanning**: Pre-commit hooks block any accidental key pushes before they leave your workstation.
5. **Immediate Incident Protocol**: If a key is accidentally exposed, revoke it immediately and follow the [Incident Response Playbook](#-emergency-incident-response-playbook) below.

### 🔒 Environment File Architecture

```
dragon-tank-india/
├── .env.example              <-- Checked into git (Clean template with placeholder values)
├── .env                      <-- Local only (IGNORED BY GIT - Contains actual backend keys)
├── backend/
│   ├── .env.example          <-- Checked into git (Clean template for backend)
│   └── .env                  <-- Local only (IGNORED BY GIT)
└── frontend/
    ├── .env.example          <-- Checked into git (Clean template for client)
    └── .env.local            <-- Local only (IGNORED BY GIT - ONLY contains NEXT_PUBLIC_ values)
```

### ⚙️ Setting Up Pre-Commit Secret Scanning

Protect your repository by installing pre-commit secret detection:

```bash
# 1. Install pre-commit and gitleaks or detect-secrets
pip install pre-commit detect-secrets

# 2. Initialize pre-commit hook config
cat << 'EOF' > .pre-commit-config.yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.2
    hooks:
      - id: gitleaks
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: check-added-large-files
      - id: check-merge-conflict
      - id: detect-private-key
EOF

# 3. Install the git hook into .git/hooks
pre-commit install
```

### 🚨 Emergency Incident Response Playbook

If you suspect an API key was ever accidentally staged or pushed to a remote repository:

1. **Immediate Revocation**: Go to the provider console and delete/revoke the key instantly:
   - [Google AI Studio (Gemini Keys)](https://aistudio.google.com/app/apikey)
   - [OpenAI API Keys Console](https://platform.openai.com/api-keys)
   - [ElevenLabs Profile Keys](https://elevenlabs.io/app/speech-synthesis)
   - [Supabase Project API Settings](https://supabase.com/dashboard/project/_/settings/api)
2. **Purge Git History**: Do not just make a new commit deleting the file—the key remains in your git tree. Run [git-filter-repo](https://github.com/newren/git-filter-repo):
   ```bash
   # Install git-filter-repo
   pip install git-filter-repo

   # Scrub any trace of .env from all historical commits
   git filter-repo --path .env --invert-paths --force
   git filter-repo --path backend/.env --invert-paths --force

   # Force push sanitized history to your remote (requires admin permissions)
   git push origin --force --all
   ```
3. **Issue New Key**: Generate a fresh key and place it solely in your local `.env`.

---

## 🎨 Frontend Design Brain: Ishaan-UI & Anti-Slop Manifesto

The visual experience is governed by the art-directed **Ishaan-UI design philosophy**, intentionally discarding generic dashboard templates and purple-gradient AI tropes in favor of an authored boardroom atmosphere:

```
+---------------------------------------------------------------------------------------+
|                             ISHAAN-UI DESIGN PHILOSOPHY                               |
+----------------------+----------------------------------------------------------------+
| Metaphor             | The Sovereign Chamber (Warm Ivory Parchment & Deep Obsidian)    |
| Base Colors          | Parchment (#FAF8F5), Obsidian (#1C1917), Amber Lacquer (#B45309)|
| Glass Surfaces       | Pure Apple VisionOS frosted glass (.glass, .glass-strong)      |
| Display Typography   | Google Newsreader Display Serif with expressive italic turns   |
| Body Typography      | Plus Jakarta Sans (Clean, high legibility at 13-15px)          |
| Code / Numerals      | JetBrains Mono (Strict tabular alignment on financial figures) |
| Hand-Drawn Glyphs    | Custom 24x24 open-stroke vector icons (IshaanIcons.tsx)        |
| Bespoke Visuals      | Radial SVG Bezel Dial with 60 hairline ticks (BezelDial.tsx)   |
| Zero External Audio  | Synthesized algorithmic Web Audio sound effects (SoundEffects.ts)|
+----------------------+----------------------------------------------------------------+
```

### 🚫 The Anti-Slop Rules Enforced in This Repository
- **No Kicker / Eyebrow Tags**: Clean, confident headings carry their own contextual weight without redundant "FEATURE OVERVIEW" labels above them.
- **No Stock Icon Packs**: Every icon is hand-crafted with consistent 1.4px stroke weights and intentional open gaps ([`IshaanIcons.tsx`](./frontend/components/IshaanIcons.tsx)).
- **No Generic Chart Skins**: Data is presented through bespoke tactile components like the [SVG Bezel Dial](./frontend/components/BezelDial.tsx) rather than default libraries.
- **Zero MP3/WAV Asset Bloat**: Room transitions, hydraulic door hisses, sub-bass booms, and camera flashes are synthesized on-the-fly in browser memory using the Web Audio API ([`SoundEffects.ts`](./frontend/components/SoundEffects.ts)).

---

## 🧪 Student Venture Economics & Viability Lab

Located directly on the landing page ([`HomePage.tsx`](./frontend/components/HomePage.tsx)), founders can stress-test their startup numbers in real time:

$$\text{Unit Contribution Margin (₹)} = \text{Customer Pricing} - \text{Direct Unit Cost}$$

$$\text{Gross Margin (\%)} = \left(\frac{\text{Customer Pricing} - \text{Direct Unit Cost}}{\text{Customer Pricing}}\right) \times 100$$

$$\text{Monthly Net Run-Rate (₹)} = (\text{Unit Contribution Margin} \times \text{Monthly Units}) - \text{Fixed Operational Burn}$$

```
+---------------------------------------------------------------------------------------+
|                    STUDENT VENTURE VIABILITY & ECONOMICS LAB                          |
+-------------------------+-------------------------+-----------------------------------+
| Metric Slider           | Range                   | Live Impact Evaluation            |
+-------------------------+-------------------------+-----------------------------------+
| Direct Unit Cost (₹)    | ₹10 – ₹50,000           | Determines manufacturing/burn     |
| Customer Pricing (₹)    | ₹10 – ₹1,00,000         | Evaluates willingness-to-pay      |
| Target Reach (Users)    | 100 – 10,00,000         | Validates realistic student TAM   |
+-------------------------+-------------------------+-----------------------------------+
```

The embedded **Bezel Dial** dynamically renders the calculated Gross Margin %:
- **Red Alert Zone (< 25%)**: Ashneer and Vineeta warn against subsidized models and operational insolvency.
- **Caution Zone (25% – 50%)**: Namita notes working capital risk and distributor squeeze.
- **Healthy Zone (> 60%)**: Aman and Anupam commend strong gross margins and encourage campus scaling.

---

## 🚀 Quick Start in Under 2 Minutes

### 📋 Prerequisites
- **Node.js**: v18.17.0 or higher
- **Python**: v3.10 or higher
- **Package Managers**: `npm` and `pip` (or `uv`)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/dragon-tank-india.git
cd dragon-tank-india
```

---

### Step 2: Configure Environment Variables

Create your local `.env` from the provided secure template:

```bash
# Copy root template
cp .env.example .env

# Copy backend template
cp backend/.env.example backend/.env

# Copy frontend template
cp frontend/.env.example frontend/.env.local
```

Open `backend/.env` (or root `.env`) in your editor and add your keys:
```env
# Primary Multi-Agent Engine (Get key from https://aistudio.google.com/)
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
GEMINI_MODEL=gemini-3.5-flash-lite

# Secondary Multi-LLM Fallback (Optional but recommended)
OPENAI_API_KEY=sk-proj-YourOpenAIApiKeyHere
OPENAI_MODEL=gpt-4o-mini

# Supabase Storage & Vector Benchmarks (Optional - runs with in-memory state if omitted)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-or-service-role-key-here

# Server Bindings
PORT=8000
HOST=0.0.0.0
```

---

### Step 3: One-Command Automated Launch

Use the pre-configured executable startup script:

```bash
chmod +x start.sh
./start.sh
```

This single command will:
1. Boot the **FastAPI LangGraph Boardroom Backend** on `http://localhost:8000`
2. Launch the **Next.js 14 App Router Den Frontend** on `http://localhost:3000`
3. Automatically handle graceful shutdown of both servers on `Ctrl+C`.

> **Alternatively, launch manually in two separate terminal tabs:**
>
> **Terminal 1 (Backend):**
> ```bash
> python3 -m venv venv
> source venv/bin/activate
> pip install -r backend/requirements.txt
> python3 -m uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload
> ```
>
> **Terminal 2 (Frontend):**
> ```bash
> cd frontend
> npm install
> npm run dev
> ```

Open **`http://localhost:3000`** in your browser, step onto the red carpet, and present your venture!

---

## 🗄️ Database Architecture & Supabase pgvector

Dragon Tank India uses **Supabase PostgreSQL 15** with `pgvector` for session persistence and semantic retrieval of Indian startup market benchmarks.

### Schema Deployment (One-Click)

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor**.
3. Copy the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and paste it into the editor.
4. Click **Run**.

```sql
-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Pitch Sessions Table (Transcripts, UUID & JSONB Metrics)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
    business_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Indian Market Benchmark Knowledge Table (pgvector)
CREATE TABLE IF NOT EXISTS public.market_benchmarks (
    id BIGSERIAL PRIMARY KEY,
    industry TEXT NOT NULL,
    stat TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding VECTOR(768),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- High-performance HNSW vector index for sub-millisecond similarity search
CREATE INDEX IF NOT EXISTS idx_market_benchmarks_embedding 
ON public.market_benchmarks 
USING hnsw (embedding vector_cosine_ops);
```

### 🛡️ Row Level Security (RLS) Setup
The schema automatically enforces airtight RLS:
- `public.sessions`: Only the backend `service_role` can write transcripts; authenticated founders can view their own sessions; unauthorized public queries are blocked.
- `public.market_benchmarks`: Public read-only access for reference stats; write access is locked to the backend service role.

---

## 📡 WebSocket Event Protocol Specification

All communication between the browser den and the multi-agent director flows through `/ws/pitch`:

```
Client (Browser)                                    Server (FastAPI)
       |                                                    |
       | ------------------ pitch_text -------------------> | (Founder pitches idea)
       | <-------------- moderator_evaluating ------------- | (Shark preparing critique)
       | <------------ dragon_stream_chunk (x N) ---------- | (Typewriter token stream)
       | <----------------- dragon_turn ------------------- | (Finalized message & 4 pillars)
       |                                                    |
       | --------------- call_for_decisions --------------> | (Final boardroom ruling)
       | <----------------- dragon_turn ------------------- | (Formal viability seal)
```

### Inbound Events (Client $\rightarrow$ Server)

| Event Type | Payload Attributes | Purpose |
|---|---|---|
| `pitch_text` | `{ text: string, replying_to?: string, metrics?: object }` | Submits a pitch or answer to the boardroom |
| `call_for_decisions` | `{ type: "call_for_decisions" }` | Requests final formal viability rulings from the panel |
| `reset_session` | `{ type: "reset_session" }` | Clears boardroom transcript and restores initial pillar state |

### Outbound Events (Server $\rightarrow$ Client)

| Event Type | Payload Attributes | Purpose |
|---|---|---|
| `session_init` | `{ session_id, dragons, metrics, dragon_statuses }` | Synchronizes initial boardroom state |
| `moderator_evaluating`| `{ status: string }` | Displays live thinking indicator on the stage HUD |
| `dragon_stream_chunk`| `{ speaker_id, chunk, tone_badge, action }` | Typewriter token bursts (2 words / 20ms) |
| `dragon_turn` | `{ dragon, message, action, tone_badge, metrics }` | Complete turn with updated 4-pillar assessments |

---

## 📂 Repository Directory Structure

```
dragon-tank-india/
├── .env.example                     # Root master environment configuration template
├── .gitignore                       # High-security exclusion list (prevents all credential leaks)
├── README.md                        # Production project documentation (You are here)
├── abc.md                           # Detailed technical specification & architectural deep-dive
├── start.sh                         # Dual-server automated startup script (FastAPI + Next.js)
├── server.py                        # Root launcher proxying backend.server:app
│
├── backend/                         # FastAPI Asynchronous Application
│   ├── .env.example                 # Backend configuration template
│   ├── requirements.txt             # Python dependencies (FastAPI, GenAI, OpenAI, Supabase)
│   └── server.py                    # Multi-agent Director Engine, WebSocket router & scoring
│
├── frontend/                        # Next.js 14 App Router Application
│   ├── .env.example                 # Client configuration template (Public URLs only)
│   ├── package.json                 # Next.js dependencies, scripts & dev dependencies
│   ├── tailwind.config.js           # Theme configuration: Ishaan-UI glass surfaces & tokens
│   ├── tsconfig.json                # Strict TypeScript configuration
│   │
│   ├── app/                         # Next.js App Directory
│   │   ├── globals.css              # Glassmorphism tokens, parchment background, grain overlay
│   │   ├── layout.tsx               # Root HTML wrapper, metadata, Google Font loaders
│   │   └── page.tsx                 # View state coordinator (Landing Page vs. Boardroom Floor)
│   │
│   └── components/                  # Bespoke Hand-Crafted UI Components
│       ├── HomePage.tsx             # Landing hero, Economics Lab, Mentor grid, FAQ
│       ├── PitchBoardroom.tsx       # Split-pane stage: Boardroom transcript & Viability Radar
│       ├── BezelDial.tsx            # Radial SVG dial with 60 ticks & animated arc
│       ├── IshaanIcons.tsx          # Hand-drawn 24x24 SVG glyphs (zero external icon packs)
│       ├── SoundEffects.ts          # Native Web Audio API synthesizer (0 MP3/WAV dependencies)
│       ├── RedCarpetTransition.tsx  # Parting hydraulic doors & sub-bass carpet sequence
│       └── dragonDialogues.ts       # Iconic dialogue library and mentor profiles
│
└── supabase/                        # Database & Vector Setup
    └── schema.sql                   # SQL migration: sessions, pgvector, HNSW index & RLS policies
```

---

## 🛠️ Troubleshooting & Developer FAQ

<details>
<summary><b>1. WebSocket connection fails or disconnects immediately</b></summary>

- Ensure the FastAPI server is running on port 8000: `curl http://localhost:8000/` should return `{"status":"online"}`.
- If running in Docker or WSL, verify `HOST=0.0.0.0` in your backend `.env`.
- Check browser console for mixed content warnings: Next.js on `http://` connects to `ws://`, while `https://` requires `wss://`.
</details>

<details>
<summary><b>2. Google Gemini API returns quota or rate limit errors (429)</b></summary>

- The cascading router will automatically fall back to **Gemini 3.5 Flash**, then **OpenAI GPT-4o-mini**, and finally the **Deterministic Rule Engine**.
- If you wish to use OpenAI as primary, ensure `OPENAI_API_KEY` is defined in `backend/.env`.
</details>

<details>
<summary><b>3. Web Audio sound effects are silent in the browser</b></summary>

- Modern browsers require user interaction before playing audio. Clicking anywhere on the screen (such as the "Enter The Den" button) unlocks the browser `AudioContext`.
</details>

<details>
<summary><b>4. Supabase warning: "Database connection omitted"</b></summary>

- This is normal if you haven't supplied Supabase credentials. Dragon Tank India functions with in-memory session management without requiring a Supabase instance.
- To enable persistent transcripts and market benchmarks, provide `SUPABASE_URL` and `SUPABASE_KEY` in `backend/.env`.
</details>

---

## 🗺️ Roadmap & Future Enhancements

- [x] **Strict Single-Speaker Turn Engine**: Zero crosstalk between dragons.
- [x] **Cascading Multi-LLM Fallback**: Gemini 3.5 Flash-Lite $\rightarrow$ Flash $\rightarrow$ GPT-4o-mini $\rightarrow$ Rule Engine.
- [x] **Native Web Audio Synthesizer**: 100% in-memory audio DSP with zero asset latency.
- [x] **Bespoke Hand-Crafted UI**: Ishaan-UI Apple VisionOS glassmorphism and SVG Bezel Dial.
- [ ] **Multi-Founder Synchronized Pitching**: Synchronize multiple student co-founders pitching from different devices via shared WebSocket rooms.
- [ ] **Student Capstone Deck & Code Analyzer**: Upload prototype GitHub URLs or slide decks for automated unit cost and architecture extraction.
- [ ] **Downloadable Incubator PDF Scorecard**: Export a formal 4-pillar evaluation report with actionable next steps for university pitch competitions.
- [ ] **Campus E-Cell Tournament Mode**: Custom rubric configuration for university entrepreneurship cells.

---

## 📄 License & Attribution

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for complete details.

Built with pride for the next generation of Indian student innovators, engineering builders, and grassroots social entrepreneurs.

<div align="center">

<br/>

**Step onto the floor. Face the titans. Prove your venture.**

[⬆ Back to Top](#-dragon-tank-india)

</div>
