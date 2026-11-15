'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Flame,
  Mic,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Cpu,
  ShieldAlert,
  Gavel,
  Zap,
  DollarSign,
  ArrowRight,
  Sliders,
  CheckCircle2,
  Award,
  Layers,
  HelpCircle,
  ExternalLink,
  MessageSquare,
  Users,
  Compass,
  Activity,
  Heart,
  ArrowUpRight,
  MessageCircle,
  Play
} from 'lucide-react'
import { ALL_DRAGON_PROFILES, DragonProfile } from './dragonDialogues'

interface HomePageProps {
  onEnterPitch: (initialMetrics?: { ask: string; equity: string; valuation: string }) => void
}

export default function HomePage({ onEnterPitch }: HomePageProps) {
  // Valuation Lab State (Student & Early-Stage Scale)
  const [askAmount, setAskAmount] = useState(25) // ₹25 Lakhs
  const [equityPercent, setEquityPercent] = useState(5) // 5%

  const postMoneyLakhs = (askAmount / equityPercent) * 100
  const postMoneyCrores = (postMoneyLakhs / 100).toFixed(1)
  const preMoneyCrores = ((postMoneyLakhs - askAmount) / 100).toFixed(1)

  const askFormatted =
    askAmount >= 100 ? `₹${(askAmount / 100).toFixed(1)} Cr` : `₹${askAmount} Lakhs`

  // Voice Preview State (Voice output strictly disabled, visual display only)
  const [activeVoicePlaying, setActiveVoicePlaying] = useState<string | null>(null)
  const [activeDialogueIndex, setActiveDialogueIndex] = useState<{ [dragonId: string]: number }>({
    roaster: 0,
    marketing: 0,
    tech: 0,
    operator: 0,
    strategist: 0,
    d2c: 0
  })

  const playDragonQuote = (dragonId: string, quote: string) => {
    setActiveVoicePlaying(quote)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setTimeout(() => setActiveVoicePlaying(null), 1800)
  }

  // Dynamic reaction based on metrics (Tailored for College Students & Early-Stage Startups)
  const getValuationReaction = () => {
    const val = parseFloat(postMoneyCrores)
    if (val > 25) {
      return {
        dragon: 'Ashneer Grover',
        role: 'The Dhandha & Valuation Roaster',
        reaction:
          'Yeh sab doglapan hai. Asking for a ₹' +
          val +
          ' Crore valuation for a college prototype with zero customer validation makes no sense. Interview 50 paying users outside campus first, then talk valuation!',
        badge: 'Validation Reality Check'
      }
    } else if (equityPercent >= 15) {
      return {
        dragon: 'Aman Gupta',
        role: 'Marketing Guru',
        reaction:
          'Dhandha brand se banta hai! Giving away ' +
          equityPercent +
          '% equity this early will leave your student team heavily diluted before you even hit Series A. Keep your cap table clean!',
        badge: 'Dilution Warning'
      }
    } else if (val <= 10 && equityPercent >= 5) {
      return {
        dragon: 'Peyush Bansal',
        role: 'Tech Visionary',
        reaction:
          'Tech moat kya hai? This is a realistic student seed ask (' +
          askFormatted +
          ' for ' +
          equityPercent +
          '%). Now explain your tech architecture and how you plan to get your first 500 campus users.',
        badge: 'Moat Evaluation'
      }
    } else {
      return {
        dragon: 'Anupam Mittal',
        role: 'Strategic Investor',
        reaction:
          'Chalo math karte hain. For early-stage student ventures, customer validation and unit economics must come before raising capital. Let us calculate your CAC and TAM.',
        badge: 'Economics Sanity'
      }
    }
  }

  const reaction = getValuationReaction()

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-900 overflow-x-hidden">
      {/* ---------------------------------------------------------------------
          Gentle Ambient Light Mesh (Brings Pure Glassmorphism to Life)
      ---------------------------------------------------------------------- */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] bg-amber-100/50 rounded-full blur-[140px]" />
        <div className="absolute top-1/4 right-0 w-[550px] h-[550px] bg-slate-200/50 rounded-full blur-[160px]" />
        <div className="absolute top-2/3 left-1/4 w-[600px] h-[600px] bg-blue-50/60 rounded-full blur-[180px]" />
        <div className="absolute -bottom-32 right-1/4 w-[500px] h-[500px] bg-rose-50/50 rounded-full blur-[160px]" />
      </div>

      {/* ---------------------------------------------------------------------
          Navigation: Floating Glass Dock
      ---------------------------------------------------------------------- */}
      <header className="sticky top-4 z-40 px-4 md:px-8 max-w-7xl mx-auto w-full transition-all">
        <div className="glass-dock rounded-2xl px-4 md:px-6 py-3 flex items-center justify-between shadow-xs">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-xs">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Flame className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base md:text-lg tracking-tight text-slate-900">
                  Dragon Tank <span className="text-amber-700">India</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200/80">
                  AI Simulator
                </span>
              </div>
            </div>
          </div>

          {/* Clean Glass Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#dragons" className="hover:text-slate-900 transition-colors">
              The 6 Dragons
            </a>
            <a href="#valuation-lab" className="hover:text-slate-900 transition-colors">
              Valuation Lab
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
              How It Works
            </a>
            <a href="#hall-of-fame" className="hover:text-slate-900 transition-colors">
              Hall of Fame
            </a>
            <a href="#tank-rules" className="hover:text-slate-900 transition-colors">
              Den Rules
            </a>
          </nav>

          {/* Action CTA */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-[11px] font-medium text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>6 Dragons Seated</span>
            </div>

            <button
              onClick={() => onEnterPitch()}
              className="flex items-center gap-1.5 px-4 md:px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs md:text-sm shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Step Into the Den</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------------
          Hero Section: Clean, Spacious, Ultra-Refined Glass
      ---------------------------------------------------------------------- */}
      <section className="relative z-10 pt-16 md:pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto w-full flex flex-col items-center text-center">
        {/* Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill border border-slate-200/80 text-slate-700 text-xs font-semibold mb-6 shadow-2xs"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Dedicated to College Students, Hackathon Projects & Early-Stage Startups</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] max-w-4xl"
        >
          Turn Your College Project into a{' '}
          <span className="text-amber-700 underline decoration-amber-200 decoration-wavy decoration-from-font">
            Validated Startup
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed font-normal"
        >
          Built a capstone project, AI prototype, or hackathon idea? Pitch to India's top 6 Dragons for honest valuation reality checks, customer validation guidance, and concrete early-stage frameworks.
        </motion.p>

        {/* Primary CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto"
        >
          <button
            onClick={() => onEnterPitch()}
            className="w-full sm:w-auto px-8 md:px-9 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm md:text-base shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>Step Into the Den</span>
            <ChevronRight className="w-4 h-4 text-amber-300" />
          </button>

          <a
            href="#valuation-lab"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl glass-panel hover:bg-white text-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-amber-600" />
            <span>Valuation Calculator</span>
          </a>
        </motion.div>

        {/* 4 Clean Glass Metrics Strip */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-4xl w-full">
          {[
            { label: 'Honest Valuation Math', desc: 'Pre-revenue student benchmarks and realistic dilution curves' },
            { label: 'Customer Validation Check', desc: 'Actionable experiments to prove paying demand on campus' },
            { label: 'Targeted Dragon Replies', desc: 'Direct your response to any individual Dragon on the panel' },
            { label: 'English & Real-Time Intelligence', desc: 'Articulate mentorship with iconic signature dialogues' }
          ].map((item, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{item.label}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          The 6 Dragons Showcase: Featuring ALL Famous Dialogues
      ---------------------------------------------------------------------- */}
      <section id="dragons" className="relative z-10 py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold tracking-wider text-amber-700 uppercase block mb-1">
              The Investor Board
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Meet the 6 Iconic Dragons & All Famous Dialogues
            </h2>
          </div>
          <p className="text-slate-500 text-xs md:text-sm max-w-md mt-2 md:mt-0 leading-relaxed">
            Click through all of their famous dialogues below and test their voice speech live.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {ALL_DRAGON_PROFILES.map((dragon) => {
            const currentIdx = activeDialogueIndex[dragon.id] || 0
            const currentDialogue = dragon.dialogues[currentIdx]
            const isPlaying = activeVoicePlaying === currentDialogue.quote

            return (
              <div
                key={dragon.id}
                className="glass-panel rounded-2xl p-4 flex flex-col justify-between transition-all hover:bg-white/90 hover:-translate-y-1 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-2xs"
                      style={{ backgroundColor: dragon.accentColor }}
                    >
                      {dragon.avatarInitials}
                    </div>

                    <span className="text-[10px] font-bold text-slate-400">
                      {currentIdx + 1} / {dragon.dialogues.length}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    {dragon.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium mb-3 truncate">
                    {dragon.archetype}
                  </p>

                  {/* Active Dialogue Bubble */}
                  <div className="p-3 rounded-xl glass-panel-subtle border border-slate-200/60 mb-3 min-h-[90px] flex flex-col justify-between">
                    <p className="text-[11px] text-slate-800 italic leading-snug">
                      "{currentDialogue.quote}"
                    </p>
                    <span className="text-[9px] text-slate-400 mt-1 block">
                      {currentDialogue.context}
                    </span>
                  </div>
                </div>

                {/* Dialogues Control Buttons */}
                <div className="pt-2 border-t border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <button
                      onClick={() =>
                        setActiveDialogueIndex((prev) => ({
                          ...prev,
                          [dragon.id]: (currentIdx - 1 + dragon.dialogues.length) % dragon.dialogues.length
                        }))
                      }
                      className="px-2 py-1 rounded-lg glass-btn text-[10px] text-slate-600 font-semibold"
                    >
                      ← Prev
                    </button>

                    <span className="text-[10px] font-bold text-slate-500 font-mono px-2 py-0.5 rounded-md glass-panel">
                      {currentIdx + 1}/{dragon.dialogues.length}
                    </span>

                    <button
                      onClick={() =>
                        setActiveDialogueIndex((prev) => ({
                          ...prev,
                          [dragon.id]: (currentIdx + 1) % dragon.dialogues.length
                        }))
                      }
                      className="px-2 py-1 rounded-lg glass-btn text-[10px] text-slate-600 font-semibold"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          Valuation Lab: Clean Modern Glass Card
      ---------------------------------------------------------------------- */}
      <section id="valuation-lab" className="relative z-10 py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="glass-panel rounded-3xl p-6 md:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Sliders */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-bold tracking-wider text-amber-700 uppercase block mb-1">
                  Valuation Lab
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Calculate Pre-Money Valuation
                </h3>
                <p className="text-slate-500 text-xs md:text-sm mt-1 leading-relaxed">
                  Adjust your investment ask and equity dilution to observe implied company value and simulate Dragon reactions.
                </p>
              </div>

              {/* Ask Slider */}
              <div className="p-4 rounded-2xl glass-panel-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Investment Ask
                  </label>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {askFormatted}
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="10"
                  value={askAmount}
                  onChange={(e) => setAskAmount(Number(e.target.value))}
                  className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>₹20 Lakhs</span>
                  <span>₹1 Crore</span>
                  <span>₹5 Crores</span>
                  <span>₹10 Crores</span>
                </div>
              </div>

              {/* Equity Dilution Slider */}
              <div className="p-4 rounded-2xl glass-panel-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Equity Dilution
                  </label>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {equityPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  step="0.5"
                  value={equityPercent}
                  onChange={(e) => setEquityPercent(Number(e.target.value))}
                  className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>1%</span>
                  <span>5%</span>
                  <span>10%</span>
                  <span>25%</span>
                </div>
              </div>
            </div>

            {/* Right Column: Computed Numbers */}
            <div className="lg:col-span-5 flex flex-col gap-3.5">
              {/* Valuation Result */}
              <div className="p-5 md:p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                  Implied Pre-Money Valuation
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-extrabold text-emerald-950 font-mono tracking-tight">
                    ₹{preMoneyCrores} Cr
                  </span>
                  <span className="text-xs text-emerald-700">
                    (Post-Money: ₹{postMoneyCrores} Cr)
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-emerald-200/60 flex justify-between text-xs text-emerald-900">
                  <span>Stake: {equityPercent}%</span>
                  <span className="font-semibold">{askFormatted} Capital Inflow</span>
                </div>
              </div>

              {/* Dragon Reaction Preview */}
              <div className="p-4 rounded-2xl glass-panel border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">
                      {reaction.dragon}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      | {reaction.role}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    {reaction.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "{reaction.reaction}"
                </p>
              </div>

              {/* Boardroom rule note */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Boardroom Rule:</strong> In the live boardroom, no numbers are assumed. You state your ask in your pitch, or the Dragons will ask you directly!
                </span>
              </div>

              {/* Launch Button */}
              <button
                onClick={() =>
                  onEnterPitch({
                    ask: `${askFormatted} for ${equityPercent}%`,
                    equity: `${equityPercent}%`,
                    valuation: `₹${preMoneyCrores} Cr`
                  })
                }
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs tracking-wide shadow-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>Prepare Pitch & Enter Boardroom</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          How It Works: 4 Clean Glass Steps
      ---------------------------------------------------------------------- */}
      <section id="how-it-works" className="relative z-10 py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold tracking-wider text-amber-700 uppercase block mb-1">
            Studio Flow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How the Pitch Simulator Works
          </h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1 leading-relaxed">
            Multi-agent architecture with low-latency streaming and real-time investor cross-examination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          {[
            {
              step: '01',
              title: 'Enter the Den',
              desc: 'Review your initial business ask, equity dilution, and monthly revenue metrics.',
              icon: Flame
            },
            {
              step: '02',
              title: 'Speak Naturally',
              desc: 'Use voice via your microphone or type your pitch into the studio transcript dock.',
              icon: Mic
            },
            {
              step: '03',
              title: 'Live Dragon Questions',
              desc: 'The Dragons probe your margins, verify unit economics, and test working capital cycles.',
              icon: Users
            },
            {
              step: '04',
              title: 'Terms or Exit',
              desc: 'Receive formal investment offers, counter-offer on equity, or hear the final call.',
              icon: Gavel
            }
          ].map((item, i) => (
            <div
              key={i}
              className="glass-panel rounded-2xl p-5 relative overflow-hidden transition-all hover:bg-white hover:-translate-y-0.5"
            >
              <span className="text-2xl font-black text-slate-200 font-mono absolute top-4 right-4">
                {item.step}
              </span>
              <div className="w-9 h-9 rounded-xl glass-pill flex items-center justify-center mb-3.5 shadow-2xs">
                <item.icon className="w-4 h-4 text-amber-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          Deal Hall of Fame: Clean Cards
      ---------------------------------------------------------------------- */}
      <section id="hall-of-fame" className="relative z-10 py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold tracking-wider text-amber-700 uppercase block mb-1">
              Arena Highlights
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Simulated Deal Hall of Fame
            </h2>
          </div>
          <p className="text-slate-500 text-xs md:text-sm max-w-md mt-2 md:mt-0 leading-relaxed">
            See how different startup business models performed under Dragon cross-examination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              brand: 'RoboChai Automation',
              category: 'DeepTech Food Robotics',
              verdict: 'Deal Closed: ₹1.2 Cr for 3.5%',
              investors: 'Peyush Bansal and Aman Gupta',
              summary:
                'Optical vision hardware moat satisfied Peyush. Aman backed pan-India commercial deployment.'
            },
            {
              brand: 'GlowRoot Ayurvedic D2C',
              category: 'Beauty and Personal Care',
              verdict: 'Deal Closed: ₹75 Lakhs for 4%',
              investors: 'Vineeta Singh (Solo Deal)',
              summary:
                '68% gross margin with 38% 60-day repeat cohort convinced Vineeta to make a clean offer.'
            },
            {
              brand: 'InstantBite Cloud Kitchens',
              category: 'Hyperlocal Food Delivery',
              verdict: 'All 6 Dragons Out',
              investors: 'Ashneer Roasted | Namita Out',
              summary:
                'High burn rate with negative contribution margins. Dragons exited quickly on unsustainable CAC.'
            }
          ].map((deal, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-2xl p-5 flex flex-col justify-between transition-all hover:bg-white hover:-translate-y-0.5"
            >
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  {deal.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">
                  {deal.brand}
                </h3>
                <span className="text-xs font-bold text-amber-800 block mb-2.5">
                  {deal.verdict}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {deal.summary}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/60 text-[11px] text-slate-500">
                <span>Involved Dragons: </span>
                <span className="text-slate-800 font-medium">{deal.investors}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          Den Rules: Clean Glass Card
      ---------------------------------------------------------------------- */}
      <section id="tank-rules" className="relative z-10 py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="glass-panel rounded-3xl p-6 md:p-10 shadow-xs">
          <div className="max-w-2xl mb-6">
            <span className="text-xs font-bold tracking-wider text-amber-700 uppercase block mb-1">
              Founder Preparation
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              The 4 Rules of the Den
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[
              {
                title: '1. Know Your Numbers Down to the Paisa',
                desc: 'Be ready with your Gross Margin, Blended CAC, and Monthly Burn rate without hesitation.'
              },
              {
                title: '2. Valuation Is Earned, Not Assumed',
                desc: 'Multiples should correlate with revenue, defensible intellectual property, and path to profitability.'
              },
              {
                title: '3. A Mobile App Is Not A Moat',
                desc: 'Demonstrate proprietary technology, customer retention stickiness, or distribution partnerships.'
              },
              {
                title: '4. Respect Working Capital Cycles',
                desc: 'Monitor inventory turnover and receivable cycles to ensure sustainable operational cash flow.'
              }
            ].map((rule, idx) => (
              <div key={idx} className="p-4 rounded-2xl glass-panel-subtle">
                <h4 className="text-xs font-bold text-slate-900 mb-1">{rule.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{rule.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          Call to Action Card
      ---------------------------------------------------------------------- */}
      <section className="relative z-10 py-16 px-4 md:px-8 max-w-4xl mx-auto w-full text-center">
        <div className="glass-panel rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden">
          <div className="w-11 h-11 rounded-2xl glass-pill flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <Flame className="w-5 h-5 text-amber-700" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Ready to Face the Boardroom?
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            The 6 Dragons are seated. Present your business ask, answer investor inquiries, and negotiate your term sheet.
          </p>

          <button
            onClick={() => onEnterPitch()}
            className="mt-6 px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
          >
            <span>Enter Pitch Room</span>
            <ChevronRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          Detailed Glassmorphism Footer (Clean, Modern, No Em Dash)
      ---------------------------------------------------------------------- */}
      <footer className="relative z-10 mt-auto border-t border-slate-200/80 bg-white/60 backdrop-blur-2xl text-slate-600 pt-14 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Top Dispatch Strip */}
          <div className="glass-panel-subtle rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="max-w-md">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-0.5">
                Founder Dispatch
              </span>
              <h4 className="text-base font-bold text-slate-900">
                Weekly Pitch Breakdowns and Valuation Guides
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Unit economics analysis, CAC cohort trends, and valuation formulas.
              </p>
            </div>

            <div className="flex w-full md:w-auto items-center gap-2">
              <input
                type="email"
                placeholder="founder@startup.in"
                className="px-3.5 py-2 rounded-xl glass-panel text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 w-full sm:w-60"
              />
              <button
                onClick={() => alert('Subscribed to the Founder Dispatch!')}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shrink-0 transition-all shadow-xs"
              >
                Subscribe
              </button>
            </div>
          </div>

          {/* 5-Column Navigation Matrix */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-xs">
            {/* Col 1: Platform & Mission */}
            <div className="col-span-2 md:col-span-1 space-y-2.5">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-700" />
                <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                  Dragon Tank India AI
                </span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Real-time multi-agent investment simulator created to help founders test unit economics against iconic investor personas.
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-medium pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>LangGraph & Gemini Flash Online</span>
              </div>
            </div>

            {/* Col 2: Simulator Features */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 tracking-wider uppercase text-[11px]">
                Simulator
              </h5>
              <ul className="space-y-1.5 text-slate-500 text-[11px]">
                <li>
                  <button
                    onClick={() => onEnterPitch()}
                    className="hover:text-slate-900 transition-colors text-left"
                  >
                    Live Pitch Boardroom
                  </button>
                </li>
                <li>
                  <a href="#valuation-lab" className="hover:text-slate-900 transition-colors">
                    Pre-Money Valuation Lab
                  </a>
                </li>
                <li>
                  <a href="#dragons" className="hover:text-slate-900 transition-colors">
                    Investor Voice Auditions
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
                    Evaluation Pipeline
                  </a>
                </li>
                <li>
                  <a href="#hall-of-fame" className="hover:text-slate-900 transition-colors">
                    Deal Term Sheets
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: The 6 Dragons */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 tracking-wider uppercase text-[11px]">
                The 6 Dragons
              </h5>
              <ul className="space-y-1.5 text-slate-500 text-[11px]">
                <li>Ashneer Grover : Roaster</li>
                <li>Aman Gupta : Marketing</li>
                <li>Peyush Bansal : DeepTech</li>
                <li>Namita Thapar : Operations</li>
                <li>Anupam Mittal : Valuation Guru</li>
                <li>Vineeta Singh : D2C Cohorts</li>
              </ul>
            </div>

            {/* Col 4: AI Architecture */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 tracking-wider uppercase text-[11px]">
                Architecture
              </h5>
              <ul className="space-y-1.5 text-slate-500 text-[11px]">
                <li>LangGraph Agent Network</li>
                <li>Google Gemini 1.5 Flash</li>
                <li>Whisper Speech-to-Text</li>
                <li>ElevenLabs Voice Streaming</li>
                <li>Supabase pgvector Memory</li>
              </ul>
            </div>

            {/* Col 5: Disclaimers */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 tracking-wider uppercase text-[11px]">
                Disclaimer
              </h5>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Educational and satirical AI simulation created for pitch preparation. All characterizations are simulated parodies.
              </p>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Audio is processed in memory and never retained on servers.
              </p>
            </div>
          </div>

          {/* Bottom Copyright & Ticker */}
          <div className="pt-6 border-t border-slate-200/70 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>
              © 2026 Dragon Tank India AI Simulator. Built for Indian founders building world-class startups.
            </div>

            <div className="flex items-center gap-3">
              <a href="#dragons" className="hover:text-slate-700">
                The Dragons
              </a>
              <span>·</span>
              <a href="#valuation-lab" className="hover:text-slate-700">
                Valuation Lab
              </a>
              <span>·</span>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-slate-900 transition-colors font-medium"
              >
                Back to Top ↑
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
