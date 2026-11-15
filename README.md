# Dragon Tank India - Live AI Voice Simulator

A real-time, voice-interactive **Dragon Tank India** investment simulator built with Next.js (App Router), FastAPI, multi-agent orchestration, Google Gemini 2.5 Flash, Whisper STT, and ElevenLabs voice streaming with browser speech fallback. Pure transparent glassmorphism UI in clean light theme.

---

## 🏛️ Executive Architecture

```
                                  +------------------------------+
                                  |   Next.js 14 Client (Den)    |
                                  | - MediaRecorder Chunk Stream |
                                  | - Real-time Audio Playback   |
                                  | - "I'm Out" Stamps & Cheques |
                                  +--------------+---------------+
                                                 |
                                     WebSocket   |  /ws/pitch
                                                 v
                                  +------------------------------+
                                  |   FastAPI WebSocket Router   |
                                  +--------------+---------------+
                                                 |
                     +---------------------------+---------------------------+
                     |                                                       |
                     v                                                       v
        +-------------------------+                             +-------------------------+
        |     Whisper STT         |                             |   Multi-Dragon Engine   |
        | Audio Chunks -> Text    |                             | Moderator + 6 Dragons   |
        +-------------------------+                             +------------+------------+
                                                                             |
                                                                             v
                                                                +-------------------------+
                                                                | Gemini 2.5 Flash (0.7T) |
                                                                | Official google-genai   |
                                                                +------------+------------+
                                                                             |
                                                                             v
                                                                +-------------------------+
                                                                | ElevenLabs TTS / Fallback|
                                                                | 6 Persona Voice Mappings|
                                                                +-------------------------+
```

---

## 🐲 The 6 Dragons Personas

| Dragon | Title | Core Focus | Signature Trait |
|---|---|---|---|
| **Ashneer Grover** | The Unfiltered Roaster | Unit Economics & EBITDA | Scrutinizes gross margins (>60%) & cash burns. *"Yeh sab doglapan hai"*. |
| **Aman Gupta** | Marketing & Brand Titan | Virality, Packaging & Swag | Quick commerce (Blinkit/Zepto), hero SKU clarity, brand recall. |
| **Peyush Bansal** | Purpose & Tech Visionary | DeepTech Moats & Bharat TAM | Software automation, robotics, empathy for grassroots founders. |
| **Namita Thapar** | Pharma & Healthcare Leader | Regulatory & Working Capital | CDSCO/FSSAI compliance, 60-90 day distributor credit cycles. |
| **Anupam Mittal** | Strategic Mastermind | Cap Table & Valuation Math | India 1 vs India 2 TAM sizing, clean equity structures, ARR multiples. |
| **Vineeta Singh** | D2C & Retail Powerhouse | Repeat Cohorts & Gross Margins | Return-to-origin (RTO), trade distributor margins (GT/MT). |

---

## 🚀 Quick Start

### 1. Environment Variables
Create a `.env` file in `backend/.env` (or project root):
```env
# Gemini 2.5 Flash
GEMINI_API_KEY=your_gemini_api_key_here

# Whisper STT (OpenAI)
OPENAI_API_KEY=your_openai_api_key_here

# ElevenLabs (Optional: falls back to browser SpeechSynthesis if omitted)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Supabase (Optional: logs session state and pitch transcripts)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
```

### 2. One-Command Launch
```bash
./start.sh
```
This automatically boots:
- **FastAPI Dragon Tank Backend** on `http://localhost:8000`
- **Next.js Den Frontend** on `http://localhost:3002`

---

## ⚡ Key Real-Time Capabilities

1. **Voice Pitching**: Hold down or click the gold microphone button to stream audio buffer chunks directly to Whisper STT.
2. **Interruption Protocol**: If a Dragon is speaking and you click the microphone or hit **"Interrupt Dragon"**, a `stop_audio` signal cancels the active TTS stream and immediately yields the floor.
3. **Dragon Tank States**:
   - **"I'M OUT"**: Dragons who find the model unviable bow out with the signature crimson stamp and audio drop.
   - **"OFFER ON TABLE"**: Dragons lay down structured deals (e.g., ₹50 Lakhs for 5% + 2% royalty).
   - **Counter-Offer**: Founder can negotiate revisions directly with individual Dragons.
4. **Interactive Valuation Calculator**: Dynamically adjusts Ask and Equity to project exact Pre-Money and Post-Money valuations in ₹ Crores with real-time Dragon reactions.
5. **Native Web Audio Synthesizer**: Zero external audio asset dependencies. Dramatic Dragon Tank gongs, stingers, stamps, and clicks are synthesized live in browser memory.
