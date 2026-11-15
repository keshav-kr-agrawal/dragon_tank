'use client'

import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import HomePage from '../components/HomePage'
import PitchBoardroom from '../components/PitchBoardroom'

export default function DragonTankApp() {
  const [view, setView] = useState<'home' | 'pitch'>('home')
  const [customMetrics, setCustomMetrics] = useState<{
    ask: string
    equity: string
    valuation: string
  } | undefined>(undefined)

  // Listen to browser URL query params on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('view') === 'pitch') {
        setView('pitch')
      }
    }
  }, [])

  const handleEnterPitch = (metrics?: {
    ask: string
    equity: string
    valuation: string
  }) => {
    if (metrics) {
      setCustomMetrics(metrics)
    }
    setView('pitch')
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({ view: 'pitch' }, '', '?view=pitch')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToHome = () => {
    setView('home')
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({ view: 'home' }, '', window.location.pathname)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-100 selection:text-amber-900">
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <HomePage onEnterPitch={handleEnterPitch} />
          </motion.div>
        )}

        {view === 'pitch' && (
          <motion.div
            key="pitch"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <PitchBoardroom
              onBackToHome={handleBackToHome}
              initialMetrics={customMetrics}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
