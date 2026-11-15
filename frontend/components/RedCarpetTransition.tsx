'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { soundFx } from './SoundEffects'
import { Sparkles, ChevronRight, Volume2, VolumeX, Eye } from 'lucide-react'

interface RedCarpetTransitionProps {
  onComplete: () => void
  onCancel?: () => void
  isMuted?: boolean
}

export default function RedCarpetTransition({
  onComplete,
  onCancel,
  isMuted = false
}: RedCarpetTransitionProps) {
  const [stage, setStage] = useState<'doors_closed' | 'opening' | 'unrolling' | 'entering'>('doors_closed')
  const [progress, setProgress] = useState(0)
  const [muted, setMuted] = useState(isMuted)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    // Play dramatic studio entrance audio
    soundFx.playRedCarpetEntrance(muted)

    // Sequence progression:
    // 0.2s: Doors start parting
    const t1 = setTimeout(() => {
      setStage('opening')
    }, 200)

    // 0.8s: Red carpet unrolls forward
    const t2 = setTimeout(() => {
      setStage('unrolling')
    }, 800)

    // 1.8s: Camera flash paparazzi effect
    const t3 = setTimeout(() => {
      setFlash(true)
      setTimeout(() => setFlash(false), 120)
    }, 1700)

    const t3b = setTimeout(() => {
      setFlash(true)
      setTimeout(() => setFlash(false), 90)
    }, 2100)

    // 2.2s: Walking in
    const t4 = setTimeout(() => {
      setStage('entering')
    }, 2200)

    // 3.4s: Complete transition to boardroom
    const t5 = setTimeout(() => {
      onComplete()
    }, 3400)

    // Progress bar animation
    const startTime = Date.now()
    const totalDuration = 3400
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const p = Math.min(100, Math.round((elapsed / totalDuration) * 100))
      setProgress(p)
      if (p >= 100) clearInterval(interval)
    }, 40)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t3b)
      clearTimeout(t4)
      clearTimeout(t5)
      clearInterval(interval)
    }
  }, [onComplete, muted])

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#070A13] flex flex-col items-center justify-center select-none">
      {/* Flashbulb Overlay */}
      {flash && (
        <div className="absolute inset-0 z-50 bg-white/70 pointer-events-none transition-opacity duration-100" />
      )}

      {/* Top Controls: Sound & Skip */}
      <div className="absolute top-6 left-6 right-6 z-40 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-full bg-red-600/30 border border-red-500/40 backdrop-blur-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-bold tracking-widest text-red-300 uppercase">
              STUDIO 1 • ON AIR
            </span>
          </div>

          <button
            onClick={() => setMuted(!muted)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-slate-300 hover:text-white transition-all"
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        <button
          onClick={onComplete}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-md text-xs font-semibold text-white transition-all hover:scale-105"
        >
          <span>Skip to Tank</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Sweeping Volumetric Studio Spotlights */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
        {/* Left Spotlight */}
        <motion.div
          animate={{
            rotate: stage === 'doors_closed' ? -25 : [-25, -15, -20],
            opacity: stage === 'doors_closed' ? 0.2 : [0.3, 0.7, 0.5]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 left-1/4 w-[280px] h-[900px] bg-gradient-to-b from-amber-400/40 via-amber-200/15 to-transparent blur-[60px] transform origin-top -rotate-20"
        />

        {/* Right Spotlight */}
        <motion.div
          animate={{
            rotate: stage === 'doors_closed' ? 25 : [25, 15, 20],
            opacity: stage === 'doors_closed' ? 0.2 : [0.3, 0.7, 0.5]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 right-1/4 w-[280px] h-[900px] bg-gradient-to-b from-blue-400/35 via-cyan-200/10 to-transparent blur-[60px] transform origin-top rotate-20"
        />

        {/* Ambient Stage Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-red-600/15 rounded-full blur-[140px]" />
      </div>

      {/* The Stage / Studio Floor with 3D Perspective */}
      <div
        className="relative w-full h-full flex flex-col items-center justify-end overflow-hidden"
        style={{ perspective: '1100px' }}
      >
        {/* Distant Dragon Podium Silhouette & LED Arc */}
        <motion.div
          animate={{
            scale: stage === 'entering' ? 1.15 : 1,
            opacity: stage === 'doors_closed' ? 0.1 : 1,
            y: stage === 'entering' ? 20 : 0
          }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute top-[18%] md:top-[15%] flex flex-col items-center z-15 pointer-events-none"
        >
          {/* Dragon Tank Golden Glowing Arches */}
          <div className="w-[320px] md:w-[540px] h-[160px] md:h-[220px] rounded-t-full border-t-4 border-l-2 border-r-2 border-amber-400/70 shadow-[0_0_60px_rgba(245,158,11,0.35)] relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 via-blue-950/40 to-transparent" />
            <div className="text-center z-10 px-4">
              <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-amber-300 uppercase block mb-1">
                DRAGON TANK INDIA
              </span>
              <h2 className="text-lg md:text-2xl font-black text-white tracking-wide drop-shadow-md">
                THE 6 INVESTORS
              </h2>
            </div>
          </div>

          {/* 6 Dragon Podiums in the distance */}
          <div className="flex items-end justify-center gap-2 md:gap-4 -mt-4">
            {['Ashneer', 'Namita', 'Aman', 'Peyush', 'Vineeta'].map((name, i) => (
              <div
                key={name}
                className="w-12 md:w-16 h-14 md:h-18 rounded-t-xl bg-gradient-to-b from-slate-700/80 to-slate-900 border-t border-l border-r border-amber-400/40 shadow-lg flex flex-col items-center justify-center p-1"
              >
                <div className="w-4 h-4 rounded-full bg-amber-400/40 mb-1 animate-pulse" />
                <span className="text-[8px] md:text-[9px] font-bold text-slate-300 tracking-tight">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* -------------------------------------------------------------------
            The Red Carpet (3D Perspective Unroll Effect)
        -------------------------------------------------------------------- */}
        <div className="relative w-full h-[58%] flex justify-center items-end z-20">
          {/* Stanchions & Velvet Ropes Left */}
          <div className="absolute left-[15%] md:left-[28%] bottom-0 top-0 flex flex-col justify-between py-6 z-25 pointer-events-none">
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className="relative flex items-center">
                <div className="w-3 md:w-4 h-12 md:h-16 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-600 rounded-sm shadow-[0_0_15px_rgba(245,158,11,0.5)] relative">
                  <div className="w-5 md:w-6 h-5 md:h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-200 -top-2.5 -left-1 absolute shadow-md" />
                </div>
              </div>
            ))}
          </div>

          {/* Stanchions & Velvet Ropes Right */}
          <div className="absolute right-[15%] md:right-[28%] bottom-0 top-0 flex flex-col justify-between py-6 z-25 pointer-events-none">
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className="relative flex items-center justify-end">
                <div className="w-3 md:w-4 h-12 md:h-16 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-600 rounded-sm shadow-[0_0_15px_rgba(245,158,11,0.5)] relative">
                  <div className="w-5 md:w-6 h-5 md:h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-200 -top-2.5 -right-1 absolute shadow-md" />
                </div>
              </div>
            ))}
          </div>

          {/* The Carpet Itself */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: stage === 'doors_closed' ? 0 : '100%',
              opacity: stage === 'doors_closed' ? 0 : 1
            }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-[260px] sm:w-[340px] md:w-[480px] bg-gradient-to-t from-red-800 via-red-600 to-rose-700 relative shadow-[0_0_50px_rgba(220,38,38,0.6)] flex flex-col justify-between overflow-hidden"
            style={{
              transform: 'perspective(600px) rotateX(28deg)',
              transformOrigin: 'bottom center',
              borderLeft: '4px solid #F59E0B',
              borderRight: '4px solid #F59E0B'
            }}
          >
            {/* Velvet Texture & Highlights */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/35 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />

            {/* Embroidered Gold Border Inlay */}
            <div className="absolute inset-y-0 left-2 w-1 bg-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <div className="absolute inset-y-0 right-2 w-1 bg-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />

            {/* Glowing Center Carpet Runner Pattern */}
            <div className="flex flex-col items-center justify-around h-full py-6">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-16 md:w-24 h-0.5 bg-amber-300/40 rounded-full"
                />
              ))}
            </div>

            {/* The Pitcher's Mark (X Marks the Spot) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-12 h-12 rounded-full border-2 border-amber-300 flex items-center justify-center bg-red-950/80 shadow-[0_0_20px_rgba(245,158,11,0.8)]"
              >
                <span className="text-amber-300 font-black text-sm">X</span>
              </motion.div>
              <span className="text-[9px] font-bold tracking-widest text-amber-200 uppercase mt-1">
                STAND HERE
              </span>
            </div>
          </motion.div>
        </div>

        {/* -------------------------------------------------------------------
            Studio Heavy Double Stage Doors
        -------------------------------------------------------------------- */}
        {/* Left Door */}
        <motion.div
          initial={{ x: '0%' }}
          animate={{
            x: stage === 'doors_closed' ? '0%' : '-102%'
          }}
          transition={{ duration: 1.6, ease: [0.77, 0, 0.175, 1] }}
          className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 border-r-4 border-amber-500/70 z-30 shadow-2xl flex items-center justify-end pr-6 md:pr-12"
        >
          {/* Industrial Panel Details */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="flex flex-col items-end gap-6 z-10 text-right">
            <div className="w-1.5 h-32 bg-amber-400/70 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
            <div>
              <span className="text-[10px] md:text-xs font-mono text-slate-500 uppercase tracking-widest block">
                STAGE ENTRANCE A
              </span>
              <span className="text-sm md:text-xl font-black text-slate-300 tracking-tight">
                STUDIO GATE
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right Door */}
        <motion.div
          initial={{ x: '0%' }}
          animate={{
            x: stage === 'doors_closed' ? '0%' : '102%'
          }}
          transition={{ duration: 1.6, ease: [0.77, 0, 0.175, 1] }}
          className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-slate-950 via-slate-900 to-slate-800 border-l-4 border-amber-500/70 z-30 shadow-2xl flex items-center justify-start pl-6 md:pl-12"
        >
          {/* Industrial Panel Details */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="flex flex-col items-start gap-6 z-10 text-left">
            <div className="w-1.5 h-32 bg-amber-400/70 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
            <div>
              <span className="text-[10px] md:text-xs font-mono text-slate-500 uppercase tracking-widest block">
                STAGE ENTRANCE B
              </span>
              <span className="text-sm md:text-xl font-black text-slate-300 tracking-tight">
                THE TANK
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ---------------------------------------------------------------------
          Bottom Cinematic Walkway HUD & Subtitles
      ---------------------------------------------------------------------- */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-6 text-center">
        {/* Dynamic Status Text */}
        <div className="mb-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center"
            >
              <span className="text-amber-400 text-xs font-bold tracking-[0.25em] uppercase mb-1">
                {stage === 'doors_closed' && 'DOORS LOCKED • PREPARING STAGE'}
                {stage === 'opening' && 'HYDRAULIC DOORS OPENING...'}
                {stage === 'unrolling' && 'STEPPING ONTO THE RED CARPET'}
                {stage === 'entering' && 'THE 6 DRAGONS ARE WATCHING YOU'}
              </span>
              <p className="text-slate-300 text-sm md:text-base font-semibold">
                {stage === 'doors_closed' && 'Stand by founder, cameras are going live.'}
                {stage === 'opening' && 'Entering the Dragon Tank studio floor.'}
                {stage === 'unrolling' && 'Walk down the carpet to your mark.'}
                {stage === 'entering' && 'Microphone live. State your business and ask.'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Cinematic Progress Bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden border border-white/10 p-0.5">
          <motion.div
            className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
