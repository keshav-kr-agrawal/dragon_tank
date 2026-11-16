'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  IconFlame,
  IconCompass,
  IconGear,
  IconCoins,
  IconAscend,
  IconSeal,
  IconArrow,
  IconCheckCircle,
  IconSliders,
  IconChevronRight
} from './IshaanIcons'
import BezelDial from './BezelDial'
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

  // Active dialogue index for quotes
  const [activeDialogueIndex, setActiveDialogueIndex] = useState<{ [dragonId: string]: number }>({
    roaster: 0,
    marketing: 0,
    tech: 0,
    operator: 0,
    strategist: 0,
    d2c: 0
  })

  // Dynamic Formal Guidance & Constructive Scolding
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
        badge: 'Negative Contribution',
        tone: 'Formal Reality Check'
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
          '. You risk running out of cash within 45 days. Reduce fixed costs or establish direct campus partnerships.',
        badge: 'Cash Runway Warning',
        tone: 'Feasibility Guidance'
      }
    } else if (marginPercent >= 45 && netMonthlyCashFlow > 0 && userReach >= 1000) {
      return {
        dragon: 'Peyush Bansal',
        role: 'Societal Impact & Technical Moat Mentor',
        reaction:
          'A healthy margin of ' +
          marginPercent +
          '% while generating ₹' +
          netMonthlyCashFlow.toLocaleString() +
          ' monthly surplus demonstrates commercial viability. Next, we must verify your technical moat: what prevents an incumbent tech firm from replicating this next semester?',
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
          '% margin leaves zero buffer for logistics or server spikes. Build stronger brand differentiation so students willingly pay for the value.',
        badge: 'Margin Compression',
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
    <div className="relative min-h-screen bg-[#FAF8F5] text-[#1C1917] font-sans-ui selection:bg-amber-100 selection:text-amber-950 overflow-x-hidden grain">
      {/* ---------------------------------------------------------------------
          Authored Atmospheric Gradient (Warm Canvas, No Cold Blue Noise)
      ---------------------------------------------------------------------- */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 -right-20 w-[540px] h-[540px] bg-stone-200/40 rounded-full blur-[160px]" />
        <div className="absolute -bottom-40 left-1/4 w-[580px] h-[580px] bg-orange-50/50 rounded-full blur-[170px]" />
      </div>

      {/* ---------------------------------------------------------------------
          Navigation: High-Elevation Floating Command Dock
      ---------------------------------------------------------------------- */}
      <header className="sticky top-5 z-40 px-4 md:px-8 max-w-6xl mx-auto w-full transition-all">
        <div className="glass-dock rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-xs">
          {/* Brand Mark */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1C1917] text-amber-400 flex items-center justify-center shadow-xs">
              <IconFlame size={17} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-base tracking-tight text-[#1C1917]">
                Dragon Tank <span className="font-display italic font-normal text-amber-800">India</span>
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium text-stone-500 tracking-wide">
                Student Venture Mentorship
              </span>
            </div>
          </div>

          {/* Clean Editorial Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-stone-600">
            <a href="#lab" className="hover:text-stone-900 transition-colors">
              Viability Lab
            </a>
            <a href="#mentors" className="hover:text-stone-900 transition-colors">
              The 6 Mentors
            </a>
            <a href="#pillars" className="hover:text-stone-900 transition-colors">
              Four Pillars
            </a>
            <a href="#case-studies" className="hover:text-stone-900 transition-colors">
              Student Cases
            </a>
          </nav>

          {/* Action Callout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full glass-inset text-[11px] font-medium text-stone-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Strictly 1 Speaker</span>
            </div>

            <button
              onClick={() => onEnterPitch()}
              className="flex items-center gap-1.5 px-4 md:px-5 py-2.5 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-stone-50 font-semibold text-xs tracking-wide shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Enter Chamber</span>
              <IconChevronRight size={13} className="text-amber-300" />
            </button>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------------
          Hero Section: Editorial Display Typography with Italic Turn
      ---------------------------------------------------------------------- */}
      <section className="relative z-10 pt-20 md:pt-28 pb-20 px-4 md:px-8 max-w-5xl mx-auto w-full flex flex-col items-center text-center">
        {/* Editorial Status Line */}
        <motion.div
          initial={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-stone-700 text-xs font-medium mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          <span>For College Innovators, Hackathons & Student Social Ventures</span>
        </motion.div>

        {/* Masthead: Big Display with Italic Turn */}
        <motion.h1
          initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#1C1917] leading-[1.08] max-w-4xl"
        >
          Where student prototypes become{' '}
          <span className="font-display italic font-normal text-amber-800 decoration-amber-300 underline decoration-1 underline-offset-8">
            viable ventures.
          </span>
        </motion.h1>

        {/* Lede: Human, Concise, No Hype */}
        <motion.p
          initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 text-base sm:text-lg md:text-xl text-stone-600 max-w-2xl leading-relaxed font-normal"
        >
          Pitch your capstone, software model, or campus project to 6 iconic mentors. Experience focused, single-speaker inquiry with formal strategic suggestions, unit economics reality checks, and honest constructive critique.
        </motion.p>

        {/* Hero CTA Controls */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto"
        >
          <button
            onClick={() => onEnterPitch()}
            className="w-full sm:w-auto px-8 md:px-9 py-4 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-stone-50 font-semibold text-sm shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>Present to the Mentors</span>
            <IconArrow size={16} className="text-amber-300" />
          </button>

          <a
            href="#lab"
            className="w-full sm:w-auto px-6 py-4 rounded-xl glass hover:bg-white text-stone-800 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <IconSliders size={15} className="text-amber-700" />
            <span>Test Unit Economics</span>
          </a>
        </motion.div>

        {/* The 4 Architectural Guarantees */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-4xl w-full text-left">
          {[
            {
              title: 'Strictly One Speaker',
              desc: 'Zero crosstalk or overlapping noise. One mentor holds the floor to examine your specific operational pillar.'
            },
            {
              title: 'Real Societal Need',
              desc: 'Proving who directly benefits in society before writing complex software or building hardware.'
            },
            {
              title: 'Unit Economics First',
              desc: 'Direct unit cost, customer pricing, and gross margin integrity over television paper valuations.'
            },
            {
              title: 'Formal Constructive Critique',
              desc: 'Clear, articulate guidance and constructive scolding when unvalidated assumptions are made.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="glass rounded-2xl p-4 transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 mb-1.5">
                <IconCheckCircle size={14} className="text-amber-700 shrink-0" />
                <span>{item.title}</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          Viability & Unit Economics Lab: Featuring Ishaan-UI Bezel Dial
      ---------------------------------------------------------------------- */}
      <section id="lab" className="relative z-10 py-16 px-4 md:px-8 max-w-6xl mx-auto w-full">
        <div className="glass-strong rounded-3xl p-6 md:p-10 shadow-sm">
          {/* Section Heading: Composed, No Kicker Tag */}
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight">
              Test your project's unit economics{' '}
              <span className="font-display italic font-normal text-amber-800">
                before facing the boardroom.
              </span>
            </h2>
            <p className="text-stone-500 text-xs md:text-sm mt-1.5 leading-relaxed">
              Adjust your cost per unit, student pricing, and campus reach to see live calculations and formal mentor feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Unit Cost Slider */}
              <div className="p-4 rounded-2xl glass-inset space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">
                    Direct Unit Cost (Building / Serving 1 Unit)
                  </label>
                  <span className="font-mono-num text-sm font-bold text-stone-900">
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
                  className="w-full accent-amber-700 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 font-medium">
                  <span>₹10 (Digital/API)</span>
                  <span>₹150 (Hardware Prototype)</span>
                  <span>₹500 (Complex System)</span>
                </div>
              </div>

              {/* Customer Pricing Slider */}
              <div className="p-4 rounded-2xl glass-inset space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">
                    Customer Price / Student Fee
                  </label>
                  <span className="font-mono-num text-sm font-bold text-stone-900">
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
                  className="w-full accent-amber-700 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 font-medium">
                  <span>₹20 Micro-fee</span>
                  <span>₹250 Subscription</span>
                  <span>₹1,000 Premium</span>
                </div>
              </div>

              {/* User Reach Slider */}
              <div className="p-4 rounded-2xl glass-inset space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">
                    Target Community / Campus Reach
                  </label>
                  <span className="font-mono-num text-sm font-bold text-stone-900">
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
                  className="w-full accent-amber-700 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 font-medium">
                  <span>100 Cohort</span>
                  <span>2,000 Campus Wide</span>
                  <span>10,000 Regional</span>
                </div>
              </div>
            </div>

            {/* Right Gauge & Feedback (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-3.5">
              {/* Dial & Unit Margin Split */}
              <div className="p-5 rounded-2xl glass flex items-center justify-between gap-4">
                <BezelDial
                  value={marginPercent}
                  label="Gross Unit Margin"
                  sublabel={unitMargin > 0 ? `${marginPercent}% Margin` : 'Deficit'}
                  size={124}
                />

                <div className="flex flex-col justify-center space-y-2.5 text-right flex-1 border-l border-stone-200/70 pl-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                      Profit per Unit
                    </span>
                    <span
                      className={`font-mono-num text-lg font-bold ${
                        unitMargin >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {unitMargin >= 0 ? `+₹${unitMargin}` : `-₹${Math.abs(unitMargin)}`}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                      Break-even Units
                    </span>
                    <span className="font-mono-num text-xs font-bold text-stone-800">
                      {unitMargin > 0 ? `${breakEvenUnits} / month` : 'Unattainable'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                      Net Monthly Cashflow
                    </span>
                    <span className="font-mono-num text-xs font-bold text-stone-800">
                      {netMonthlyCashFlow >= 0
                        ? `+₹${netMonthlyCashFlow.toLocaleString()}`
                        : `-₹${Math.abs(netMonthlyCashFlow).toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Mentor Feedback Preview */}
              <div className="p-4 rounded-2xl glass-inset border border-stone-200/70">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-stone-900">{reaction.dragon}</span>
                  <span className="text-[10px] font-semibold text-amber-800 px-2 py-0.5 rounded-md glass">
                    {reaction.tone}
                  </span>
                </div>
                <p className="text-xs text-stone-600 italic leading-relaxed">
                  "{reaction.reaction}"
                </p>
              </div>

              {/* Launch Action */}
              <button
                onClick={() =>
                  onEnterPitch({
                    ask: `Student Project: ₹${unitPrice} Price, ₹${unitCost} Cost (${marginPercent}% Margin), Target ${userReach} Users`,
                    equity: `${marginPercent}% Margin`,
                    valuation: `Break-even at ${breakEvenUnits} units`
                  })
                }
                className="w-full py-3.5 px-4 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-stone-50 font-semibold text-xs tracking-wide shadow-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>Pitch This Model to Mentors</span>
                <IconArrow size={14} className="text-amber-300" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          The 6 Mentors: Minimalist Seals & Distinct Real-World Focus
      ---------------------------------------------------------------------- */}
      <section id="mentors" className="relative z-10 py-16 px-4 md:px-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight">
              The Mentorship Chamber{' '}
              <span className="font-display italic font-normal text-amber-800">
                and their operational focus.
              </span>
            </h2>
          </div>
          <p className="text-stone-500 text-xs md:text-sm max-w-md mt-2 md:mt-0 leading-relaxed">
            Strictly one mentor speaks at a time to examine your pitch with undivided focus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_DRAGON_PROFILES.map((dragon) => {
            const currentIdx = activeDialogueIndex[dragon.id] || 0
            const currentDialogue = dragon.dialogues[currentIdx]

            return (
              <div
                key={dragon.id}
                className="glass rounded-2xl p-5 flex flex-col justify-between transition-all hover:bg-white/90 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-2xs"
                      style={{ backgroundColor: dragon.accentColor }}
                    >
                      {dragon.avatarInitials}
                    </div>

                    <span className="text-[10px] font-mono-num text-stone-400">
                      {currentIdx + 1} of {dragon.dialogues.length}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 tracking-tight">
                    {dragon.name}
                  </h3>
                  <p className="text-[11px] text-stone-500 font-medium mb-3">
                    {dragon.archetype}
                  </p>

                  {/* Quote Display */}
                  <div className="p-3.5 rounded-xl glass-inset mb-3 min-h-[90px] flex flex-col justify-between">
                    <p className="text-xs text-stone-800 italic leading-snug">
                      "{currentDialogue.quote}"
                    </p>
                    <span className="text-[10px] text-stone-400 mt-2 block">
                      {currentDialogue.context}
                    </span>
                  </div>
                </div>

                {/* Subtle Cycle Controls */}
                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                  <button
                    onClick={() =>
                      setActiveDialogueIndex((prev) => ({
                        ...prev,
                        [dragon.id]:
                          (currentIdx - 1 + dragon.dialogues.length) % dragon.dialogues.length
                      }))
                    }
                    className="px-2.5 py-1 rounded-lg glass-btn text-[10px] text-stone-600 font-semibold"
                  >
                    Previous
                  </button>

                  <button
                    onClick={() =>
                      setActiveDialogueIndex((prev) => ({
                        ...prev,
                        [dragon.id]: (currentIdx + 1) % dragon.dialogues.length
                      }))
                    }
                    className="px-2.5 py-1 rounded-lg glass-btn text-[10px] text-stone-600 font-semibold"
                  >
                    Next Quote
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          The 4 Real-World Pillars
      ---------------------------------------------------------------------- */}
      <section id="pillars" className="relative z-10 py-16 px-4 md:px-8 max-w-6xl mx-auto w-full">
        <div className="max-w-2xl mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight">
            The four real-world pillars{' '}
            <span className="font-display italic font-normal text-amber-800">
              evaluated by the chamber.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              icon: IconCompass,
              title: '1. Societal Need & Tangible Benefits',
              desc: 'Does society genuinely require this? Who suffers if this solution is missing, and what measurable human pain is removed from daily life?'
            },
            {
              icon: IconGear,
              title: '2. Technical & Operational Feasibility',
              desc: 'Can an undergraduate or student team realistically build and maintain this without prohibitive dependencies, compliance barriers, or failure points?'
            },
            {
              icon: IconCoins,
              title: '3. Commercial Viability & Unit Economics',
              desc: 'Every unit sold must exceed all direct component, server, and logistics costs. A venture cannot rely on student pocket money or subsidized pricing.'
            },
            {
              icon: IconAscend,
              title: '4. Scalability & Lasting Societal Impact',
              desc: 'A structured roadmap showing how the venture expands from an initial campus pilot into regional or national scale with lasting positive value.'
            }
          ].map((pillar, idx) => (
            <div key={idx} className="glass rounded-2xl p-6 transition-all hover:bg-white/90">
              <div className="w-9 h-9 rounded-xl glass-inset flex items-center justify-center text-amber-800 mb-3.5">
                <pillar.icon size={18} />
              </div>
              <h3 className="text-sm font-bold text-stone-900 mb-1.5">{pillar.title}</h3>
              <p className="text-xs text-stone-500 leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          Real Student Venture Case Studies
      ---------------------------------------------------------------------- */}
      <section id="case-studies" className="relative z-10 py-16 px-4 md:px-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight">
              Student venture case studies{' '}
              <span className="font-display italic font-normal text-amber-800">
                and real chamber outcomes.
              </span>
            </h2>
          </div>
          <p className="text-stone-500 text-xs md:text-sm max-w-md mt-2 md:mt-0 leading-relaxed">
            Real evaluations on technical feasibility, societal benefit, and unit economics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              brand: 'JalShuddhi Low-Cost Water Sensor',
              domain: 'Rural IoT & Public Health',
              verdict: 'Viable Social Enterprise',
              reviewer: 'Peyush Bansal',
              summary:
                'Unit cost of ₹220 with direct societal benefit to rural water testing. Peyush guided the team on optical calibration moats.'
            },
            {
              brand: 'CampusRide Peer Cycle Sharing',
              domain: 'Smart Campus Mobility',
              verdict: 'Operational Reality Check',
              reviewer: 'Ashneer Grover',
              summary:
                'Negative unit contribution due to bike maintenance and theft. Ashneer delivered a formal scolding on ignoring operational depreciation.'
            },
            {
              brand: 'MedKit Verified Generic Delivery',
              domain: 'Healthcare Access',
              verdict: 'Feasibility Approval',
              reviewer: 'Namita Thapar',
              summary:
                'High societal need with 55% gross margin. Namita provided precise guidance on CDSCO and pharmacy state licensing.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="glass rounded-2xl p-5 flex flex-col justify-between transition-all hover:bg-white"
            >
              <div>
                <span className="text-[10px] font-mono-num font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                  {item.domain}
                </span>
                <h3 className="text-base font-bold text-stone-900 tracking-tight mb-1">
                  {item.brand}
                </h3>
                <span className="text-xs font-semibold text-amber-800 block mb-2.5">
                  {item.verdict}
                </span>
                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  {item.summary}
                </p>
              </div>
              <div className="pt-3 border-t border-stone-200/60 text-[11px] text-stone-500">
                <span>Lead Reviewer: </span>
                <span className="text-stone-900 font-semibold">{item.reviewer}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          Quiet Final Invitation
      ---------------------------------------------------------------------- */}
      <section className="relative z-10 py-16 px-4 md:px-8 max-w-4xl mx-auto w-full text-center">
        <div className="glass-strong rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-[#1C1917] text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <IconSeal size={20} />
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight">
            Ready to face the chamber?
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            The mentors are seated. Present your student prototype, answer rigorous one-on-one inquiries, and receive your comprehensive viability verdict.
          </p>

          <button
            onClick={() => onEnterPitch()}
            className="mt-6 px-8 py-3.5 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-stone-50 font-semibold text-sm shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
          >
            <span>Enter Pitch Chamber</span>
            <IconArrow size={15} className="text-amber-300" />
          </button>
        </div>
      </section>

      {/* ---------------------------------------------------------------------
          Designed Editorial Footer
      ---------------------------------------------------------------------- */}
      <footer className="relative z-10 mt-auto border-t border-stone-200/80 bg-white/60 backdrop-blur-2xl text-stone-600 pt-12 pb-10 px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
            <div className="col-span-2 md:col-span-1 space-y-2">
              <div className="flex items-center gap-2">
                <IconFlame size={16} className="text-amber-800" />
                <span className="font-extrabold text-sm text-[#1C1917]">
                  Dragon Tank India
                </span>
              </div>
              <p className="text-stone-500 text-[11px] leading-relaxed">
                Dedicated student venture simulator helping college founders evaluate feasibility, societal need, and unit economics.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-stone-900 text-xs">Pillars</h4>
              <ul className="space-y-1 text-stone-500 text-[11px]">
                <li>Societal Need & Purpose</li>
                <li>Technical Feasibility</li>
                <li>Commercial Viability</li>
                <li>Scalability & Impact</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-stone-900 text-xs">Incubation</h4>
              <ul className="space-y-1 text-stone-500 text-[11px]">
                <li>Capstone Validation Kit</li>
                <li>Unit Economics Worksheet</li>
                <li>Campus Pilot Framework</li>
                <li>Non-Dilutive Student Grants</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-stone-900 text-xs">Standards</h4>
              <ul className="space-y-1 text-stone-500 text-[11px]">
                <li>Zero Television Gimmicks</li>
                <li>Single-Speaker Discipline</li>
                <li>100% Real-World Viability</li>
                <li>Academic Integrity Protocol</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-200/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-2">
            <div>
              © {new Date().getFullYear()} Dragon Tank India AI Simulator. Built for Student Innovators.
            </div>
            <div className="flex items-center gap-3">
              <span>Authored for Higher Education</span>
              <span>•</span>
              <span>Real Venture Viability</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
