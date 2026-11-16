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
  Play,
  Scale,
  Target
} from 'lucide-react'
import { ALL_DRAGON_PROFILES, DragonProfile } from './dragonDialogues'

interface HomePageProps {
  onEnterPitch: (initialMetrics?: { ask: string; equity: string; valuation: string }) => void
}

export default function HomePage({ onEnterPitch }: HomePageProps) {
  // Student Venture Viability & Unit Economics State
  const [userReach, setUserReach] = useState(1000) // 1,000 students/users
  const [unitCost, setUnitCost] = useState(60) // ₹60 cost to build/serve
  const [unitPrice, setUnitPrice] = useState(120) // ₹120 charged to user
  const [monthlyOverhead, setMonthlyOverhead] = useState(15000) // ₹15,000 monthly infra/materials

  // Computed Real-World Fundamentals
  const unitMargin = unitPrice - unitCost
  const marginPercent = unitPrice > 0 ? Math.round((unitMargin / unitPrice) * 100) : 0
  const breakEvenUnits = unitMargin > 0 ? Math.ceil(monthlyOverhead / unitMargin) : 0
  const monthlyGrossProfit = userReach * unitMargin
  const netMonthlyCashFlow = monthlyGrossProfit - monthlyOverhead
  const isProfitable = netMonthlyCashFlow > 0

  // Voice Preview State (Visual display of famous dialogues)
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

  // Dynamic Formal Guidance & Scolding based on Real Fundamentals
  const getViabilityReaction = () => {
    if (unitMargin <= 0) {
      return {
        dragon: 'Ashneer Grover',
        role: 'Financial Discipline & Unit Economics Mentor',
        reaction:
          'Your direct unit cost (₹' +
          unitCost +
          ') exceeds your selling price (₹' +
          unitPrice +
          '). Subsidizing students out of personal pocket money is not a viable venture. In the real world, a business must generate positive gross contribution from Day 1.',
        badge: 'Negative Margin Reality Check',
        tone: 'Formal Scolding'
      }
    } else if (breakEvenUnits > userReach) {
      return {
        dragon: 'Namita Thapar',
        role: 'Operational Feasibility & Cashflow Mentor',
        reaction:
          'You require ' +
          breakEvenUnits +
          ' paying units monthly to cover fixed operational overheads of ₹' +
          monthlyOverhead.toLocaleString() +
          ', but your projected reach is only ' +
          userReach +
          '. You risk depleting your student budget within 45 days. Reduce fixed costs or establish direct campus partnerships.',
        badge: 'Cash Runway Warning',
        tone: 'Feasibility Guidance'
      }
    } else if (marginPercent >= 45 && isProfitable && userReach >= 1000) {
      return {
        dragon: 'Peyush Bansal',
        role: 'Societal Impact & Technical Moat Mentor',
        reaction:
          'A healthy margin of ' +
          marginPercent +
          '% while generating ₹' +
          netMonthlyCashFlow.toLocaleString() +
          ' monthly surplus indicates genuine commercial viability. Next, we must verify your technical moat: what prevents an incumbent tech firm from replicating this next semester?',
        badge: 'Viable Foundation',
        tone: 'Strategic Guidance'
      }
    } else if (userReach >= 5000 && marginPercent < 25) {
      return {
        dragon: 'Aman Gupta',
        role: 'Consumer Pulse & Distribution Mentor',
        reaction:
          'You are addressing a large student demographic (' +
          userReach.toLocaleString() +
          ' users), but a thin ' +
          marginPercent +
          '% margin leaves zero room for logistics or server spikes. Build stronger brand differentiation so students will willingly pay for the premium value.',
        badge: 'Margin Compression Alert',
        tone: 'Constructive Suggestion'
      }
    } else {
      return {
        dragon: 'Anupam Mittal',
        role: 'Strategic Viability & Scalability Mentor',
        reaction:
          'For an early student venture, customer retention and measurable societal benefit matter far more than theoretical valuation. Validate that your first 100 campus users achieve repeatable utility before attempting national expansion.',
        badge: 'Validation Priority',
        tone: 'Formal Guidance'
      }
    }
  }

  const reaction = getViabilityReaction()

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-900 overflow-x-hidden">
      {/* ---------------------------------------------------------------------
          Gentle Ambient Light Mesh
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
                  Student Mentorship Boardroom
                </span>
              </div>
            </div>
          </div>

          {/* Clean Glass Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#dragons" className="hover:text-slate-900 transition-colors">
              The 6 Mentors
            </a>
            <a href="#viability-lab" className="hover:text-slate-900 transition-colors">
              Viability & Unit Economics Lab
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
              Evaluation Flow
            </a>
            <a href="#case-studies" className="hover:text-slate-900 transition-colors">
              Student Case Studies
            </a>
            <a href="#tank-rules" className="hover:text-slate-900 transition-colors">
              Boardroom Rules
            </a>
          </nav>

          {/* Action CTA */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-[11px] font-medium text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Strictly 1 Shark at a Time</span>
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
          Hero Section: Student-First, Real-World Fundamentals
      ---------------------------------------------------------------------- */}
      <section className="relative z-10 pt-16 md:pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto w-full flex flex-col items-center text-center">
        {/* Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill border border-slate-200/80 text-slate-700 text-xs font-semibold mb-6 shadow-2xs"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Tailored for College Innovators, Hackathon Projects & Youth Social Ventures</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] max-w-4xl"
        >
          Turn Your Student Project into a{' '}
          <span className="text-amber-700 underline decoration-amber-200 decoration-wavy decoration-from-font">
            Viable, Real-World Venture
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed font-normal"
        >
          Pitch your capstone, software prototype, or campus venture to 6 iconic mentors. Experience deep, one-at-a-time examination with formal guidance, strategic suggestions, and constructive reality checks—grounded in <strong>Societal Need, Feasibility, Unit Economics, and Measurable Impact</strong>.
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
            <span>Start Live Student Pitch</span>
            <ChevronRight className="w-4 h-4 text-amber-300" />
          </button>

          <a
            href="#viability-lab"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl glass-panel hover:bg-white text-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-amber-600" />
            <span>Test Unit Economics Lab</span>
          </a>
        </motion.div>

        {/* 4 Real-World Pillars Strip */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-4xl w-full">
          {[
            {
              label: '1. Societal Need & Benefits',
              desc: 'Does society genuinely require this? Who directly benefits and what pain is removed?'
            },
            {
              label: '2. Technical Feasibility',
              desc: 'Can a student team build and sustain it without unmanageable technical dependencies?'
            },
            {
              label: '3. Money Making & Costs',
              desc: 'Real unit economics: raw costs, pricing tolerance, operational burn, and gross margin.'
            },
            {
              label: '4. Scalability & Real Impact',
              desc: 'How the solution expands from campus pilot to broader society with lasting social value.'
            }
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
          The 6 Dragons Showcase: Dedicated Student Mentors
      ---------------------------------------------------------------------- */}
      <section id="dragons" className="relative z-10 py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold tracking-wider text-amber-700 uppercase block mb-1">
              The Mentorship Board
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Meet the 6 Mentors & Their Real-World Focus
            </h2>
          </div>
          <p className="text-slate-500 text-xs md:text-sm max-w-md mt-2 md:mt-0 leading-relaxed">
            In our boardroom, <strong>strictly one shark speaks at a time</strong> to provide focused, disciplined guidance without interruption.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {ALL_DRAGON_PROFILES.map((dragon) => {
            const currentIdx = activeDialogueIndex[dragon.id] || 0
            const currentDialogue = dragon.dialogues[currentIdx]

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
                  <div className="p-3 rounded-xl glass-panel-subtle border border-slate-200/60 mb-3 min-h-[95px] flex flex-col justify-between">
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
          Viability & Unit Economics Lab: Student Venture Sandbox
      ---------------------------------------------------------------------- */}
      <section id="viability-lab" className="relative z-10 py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="glass-panel rounded-3xl p-6 md:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Sliders */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-bold tracking-wider text-amber-700 uppercase block mb-1">
                  Student Economics Sandbox
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Venture Viability & Unit Economics Lab
                </h3>
                <p className="text-slate-500 text-xs md:text-sm mt-1 leading-relaxed">
                  Test your real-world costs, customer pricing, and campus reach to see live formal guidance, strategic feasibility advice, or constructive scolding before facing the boardroom.
                </p>
              </div>

              {/* Unit Cost Slider */}
              <div className="p-4 rounded-2xl glass-panel-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Direct Unit Cost (Building / Serving 1 Unit)
                  </label>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    ₹{unitCost}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="5"
                  value={unitCost}
                  onChange={(e) => setUnitCost(Number(e.target.value))}
                  className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>₹10 (Software / Digital)</span>
                  <span>₹150 (Hardware Prototype)</span>
                  <span>₹500 (Complex System)</span>
                </div>
              </div>

              {/* Customer Pricing Slider */}
              <div className="p-4 rounded-2xl glass-panel-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Customer Price / Student Fee
                  </label>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    ₹{unitPrice}
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="10"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>₹20 Micro-fee</span>
                  <span>₹250 Subscription</span>
                  <span>₹1,000 Premium</span>
                </div>
              </div>

              {/* User Reach Slider */}
              <div className="p-4 rounded-2xl glass-panel-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Active Target Community Reach
                  </label>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {userReach.toLocaleString()} Users
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={userReach}
                  onChange={(e) => setUserReach(Number(e.target.value))}
                  className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>100 Campus Cohort</span>
                  <span>2,000 Campus Wide</span>
                  <span>10,000 Regional Reach</span>
                </div>
              </div>
            </div>

            {/* Right Column: Computed Numbers & Shark Feedback */}
            <div className="lg:col-span-5 flex flex-col gap-3.5">
              {/* Unit Economics Card */}
              <div
                className={`p-5 md:p-6 rounded-2xl border shadow-2xs ${
                  unitMargin > 0
                    ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
                    : 'bg-rose-50/70 border-rose-200/80 text-rose-950'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider block">
                    Gross Unit Contribution & Margin
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      unitMargin > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {marginPercent}% Margin
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight">
                    {unitMargin >= 0 ? `+₹${unitMargin}` : `-₹${Math.abs(unitMargin)}`}
                  </span>
                  <span className="text-xs opacity-75">per unit sold/served</span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-300/40 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="opacity-70 block text-[10px]">Break-even Point:</span>
                    <span className="font-bold font-mono">
                      {unitMargin > 0 ? `${breakEvenUnits} units/mo` : 'Never (Negative Margin)'}
                    </span>
                  </div>
                  <div>
                    <span className="opacity-70 block text-[10px]">Net Monthly Run-Rate:</span>
                    <span className="font-bold font-mono">
                      {netMonthlyCashFlow >= 0
                        ? `+₹${netMonthlyCashFlow.toLocaleString()}`
                        : `-₹${Math.abs(netMonthlyCashFlow).toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dragon Formal Guidance & Scolding Preview */}
              <div className="p-4 rounded-2xl glass-panel border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{reaction.dragon}</span>
                    <span className="text-[10px] text-slate-500">| {reaction.role}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    {reaction.tone}
                  </span>
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "{reaction.reaction}"
                </p>
              </div>

              {/* Boardroom Guideline Note */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Boardroom Rule:</strong> In the live boardroom, television equity gimmicks are discarded. Mentors evaluate your real societal impact, technical feasibility, and sustainable unit economics.
                </span>
              </div>

              {/* Launch Button */}
              <button
                onClick={() =>
                  onEnterPitch({
                    ask: `Student Project: ₹${unitPrice} Price, ₹${unitCost} Cost (${marginPercent}% Margin), Target ${userReach} Users`,
                    equity: `${marginPercent}% Margin`,
                    valuation: `Break-even at ${breakEvenUnits} units`
                  })
                }
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs tracking-wide shadow-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>Pitch This Model to the Mentors</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          How It Works: 4 Clean Steps
      ---------------------------------------------------------------------- */}
      <section id="how-it-works" className="relative z-10 py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold tracking-wider text-amber-700 uppercase block mb-1">
            Boardroom Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How the Student Mentorship Boardroom Works
          </h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1 leading-relaxed">
            A disciplined, single-speaker framework designed to help students transition from prototype to sustainable enterprise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          {[
            {
              step: '01',
              title: 'Present Your Student Idea',
              desc: 'Articulate the societal problem you are solving, your solution prototype, and target beneficiaries.',
              icon: Flame
            },
            {
              step: '02',
              title: 'Strictly One Shark at a Time',
              desc: 'No confusing crosstalk or interruptions. One mentor takes the floor to examine your specific operational pillar.',
              icon: Users
            },
            {
              step: '03',
              title: 'Constructive Formal Guidance',
              desc: 'Receive formal strategic advice, technical feasibility checks, or honest constructive scolding on unit costs.',
              icon: MessageSquare
            },
            {
              step: '04',
              title: 'Formal Viability Ruling',
              desc: 'Gain a formal score across Societal Need, Feasibility, Commercial Viability, and Scalability with actionable next steps.',
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
          Student Venture Case Studies
      ---------------------------------------------------------------------- */}
      <section id="case-studies" className="relative z-10 py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold tracking-wider text-amber-700 uppercase block mb-1">
              Case Studies
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Real Student Venture Evaluations
            </h2>
          </div>
          <p className="text-slate-500 text-xs md:text-sm max-w-md mt-2 md:mt-0 leading-relaxed">
            See how different college projects were assessed on technical feasibility, societal benefit, and unit economics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              brand: 'JalShuddhi Low-Cost Water Sensor',
              category: 'Rural IoT & Public Health',
              verdict: 'Viable Social Enterprise: High Impact',
              leadMentor: 'Peyush Bansal',
              summary:
                'Unit cost of ₹220 with direct societal benefit to rural water testing. Peyush guided the team on optical calibration moats.'
            },
            {
              brand: 'CampusRide Peer Cycle Sharing',
              category: 'Smart Campus Mobility',
              verdict: 'Operational Reality Check: Pivot Required',
              leadMentor: 'Ashneer Grover',
              summary:
                'Negative unit contribution due to bike maintenance and theft. Ashneer delivered a formal scolding on ignoring operational depreciation.'
            },
            {
              brand: 'MedKit Verified Generic Delivery',
              category: 'Healthcare Access',
              verdict: 'Feasibility Approval: Regulatory Steps',
              leadMentor: 'Namita Thapar',
              summary:
                'High societal need with 55% gross margin. Namita provided precise guidance on CDSCO and pharmacy state licensing.'
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
                <span>Lead Reviewer: </span>
                <span className="text-slate-800 font-medium">{deal.leadMentor}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          Boardroom Rules: Real-World Principles
      ---------------------------------------------------------------------- */}
      <section id="tank-rules" className="relative z-10 py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="glass-panel rounded-3xl p-6 md:p-10 shadow-xs">
          <div className="max-w-2xl mb-6">
            <span className="text-xs font-bold tracking-wider text-amber-700 uppercase block mb-1">
              Guiding Principles
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              The 4 Rules of the Mentorship Boardroom
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[
              {
                title: '1. Society First, Technology Second',
                desc: 'A sophisticated AI model or prototype is useless if it does not solve an acute, identifiable pain point for real human beings.'
              },
              {
                title: '2. Unit Costs Down to the Paisa',
                desc: 'Calculate exact component, hosting, and delivery costs. A venture cannot survive on student pocket money or subsidized pricing.'
              },
              {
                title: '3. Technical & Operational Feasibility',
                desc: 'Be honest about dependencies, regulatory approvals, and team bandwidth. Feasibility in the field beats hype on a slide.'
              },
              {
                title: '4. Strictly One Shark at a Time',
                desc: 'Respectful, focused dialogue. Each mentor examines a specific dimension of your business without crosstalk or overlapping noise.'
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
            Ready to Face the Mentorship Boardroom?
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            The mentors are seated. Present your student prototype, answer rigorous one-on-one inquiries, and receive your comprehensive viability verdict.
          </p>

          <button
            onClick={() => onEnterPitch()}
            className="mt-6 px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
          >
            <span>Enter Pitch Boardroom</span>
            <ChevronRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          Detailed Glassmorphism Footer
      ---------------------------------------------------------------------- */}
      <footer className="relative z-10 mt-auto border-t border-slate-200/80 bg-white/60 backdrop-blur-2xl text-slate-600 pt-14 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Top Dispatch Strip */}
          <div className="glass-panel-subtle rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="max-w-md">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-0.5">
                Student Venture Dispatch
              </span>
              <h4 className="text-base font-bold text-slate-900">
                Weekly Student Venture Viability & Unit Economics Briefing
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-world unit cost breakdowns, feasibility frameworks, and societal impact case studies.
              </p>
            </div>

            <div className="flex w-full md:w-auto items-center gap-2">
              <input
                type="email"
                placeholder="founder@student.edu"
                className="px-3.5 py-2 rounded-xl glass-panel text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 w-full sm:w-60"
              />
              <button
                onClick={() => alert('Subscribed to the Student Venture Dispatch!')}
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
                Dedicated student venture simulator helping college founders evaluate feasibility, societal need, and unit economics with iconic mentors.
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-medium pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>Single-Speaker Orchestration Active</span>
              </div>
            </div>

            {/* Col 2: Simulator Features */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 tracking-wider uppercase text-[11px]">
                Boardroom
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
                  <a href="#viability-lab" className="hover:text-slate-900 transition-colors">
                    Unit Economics Lab
                  </a>
                </li>
                <li>
                  <a href="#dragons" className="hover:text-slate-900 transition-colors">
                    Meet the 6 Mentors
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
                    Evaluation Flow
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Pillars */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 tracking-wider uppercase text-[11px]">
                Pillars
              </h5>
              <ul className="space-y-1.5 text-slate-500 text-[11px]">
                <li>Societal Need & Benefits</li>
                <li>Technical Feasibility</li>
                <li>Commercial Viability</li>
                <li>Scalability & Impact</li>
              </ul>
            </div>

            {/* Col 4: Campus Resources */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 tracking-wider uppercase text-[11px]">
                Campus Resources
              </h5>
              <ul className="space-y-1.5 text-slate-500 text-[11px]">
                <li>Hackathon Pitch Kit</li>
                <li>Capstone Viability Rubric</li>
                <li>Campus Pilot Guide</li>
                <li>Non-Dilutive Student Grants</li>
              </ul>
            </div>

            {/* Col 5: Governance */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 tracking-wider uppercase text-[11px]">
                Governance
              </h5>
              <ul className="space-y-1.5 text-slate-500 text-[11px]">
                <li>Academic Integrity Policy</li>
                <li>Student Cap Table Privacy</li>
                <li>Terms of Educational Use</li>
                <li>Open Mentor Standards</li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Disclaimer */}
          <div className="pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <div>
              © {new Date().getFullYear()} Dragon Tank India AI Simulator. Built for Student Innovators.
            </div>
            <div className="flex items-center gap-4">
              <span>Zero Television Gimmicks</span>
              <span>•</span>
              <span>100% Real-World Viability</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
