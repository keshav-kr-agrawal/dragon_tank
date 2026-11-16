'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconFlame,
  IconCompass,
  IconGear,
  IconCoins,
  IconAscend,
  IconSeal,
  IconArrow,
  IconCheckCircle,
  IconMic,
  IconSliders,
  IconChevronRight,
  IconRotate,
  IconSend
} from './IshaanIcons'
import BezelDial from './BezelDial'
import {
  Check,
  Copy,
  X,
  MessageCircle,
  AlertTriangle,
  ArrowLeft,
  Play
} from 'lucide-react'
import { ALL_DRAGON_PROFILES, DragonProfile, DragonDialogue } from './dragonDialogues'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export interface Dragon {
  id: string
  name: string
  title: string
  archetype: string
  avatarInitials: string
  tagline: string
  status: 'listening' | 'speaking' | 'out' | 'offer'
  accentColor: string
}

export interface BusinessMetrics {
  // Real-world venture viability dimensions
  societal_need?: string
  need_summary?: string
  feasibility?: string
  feasibility_summary?: string
  commercial_viability?: string
  money_making_summary?: string
  scalability?: string
  scalability_summary?: string
  societal_impact?: string
  key_actionable_guidance?: string
  verdict_badge?: string
  tone_category?: string
  // Legacy / optional numbers
  ask?: string
  equity?: string
  valuation?: string
  revenue?: string
  gross_margin?: string
  arr?: string
  cac?: string
  repeat_rate?: string
  implied_multiple?: string
  multiple_verdict?: string
  future_valuation_advice?: string
}

export interface ChatMessage {
  id: string
  role: 'founder' | 'dragon' | 'moderator'
  speaker: string
  dragonId?: string
  content: string
  timestamp: string
  action?: 'speech' | 'out' | 'offer' | 'crosstalk' | 'roast' | 'scold' | 'praise' | 'motivate' | 'suggestion' | 'valuation_guidance' | 'interruption' | 'guidance'
  tone_badge?: string
  is_interruption?: boolean
  interrupted_speaker?: string
}

export interface DealOffer {
  dragon_id: string
  dragon_name: string
  terms: string
}

export const INITIAL_DRAGONS: Dragon[] = ALL_DRAGON_PROFILES.map((p) => ({
  id: p.id,
  name: p.name,
  title: p.title,
  archetype: p.archetype,
  avatarInitials: p.avatarInitials,
  tagline: p.tagline,
  status: 'listening',
  accentColor: p.accentColor
}))

interface PitchBoardroomProps {
  onBackToHome: () => void
  initialMetrics?: { ask: string; equity: string; valuation: string }
}

export default function PitchBoardroom({ onBackToHome, initialMetrics }: PitchBoardroomProps) {
  // State
  const [dragons, setDragons] = useState<Dragon[]>(INITIAL_DRAGONS)
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null)
  const [selectedDragonForDialogues, setSelectedDragonForDialogues] = useState<DragonProfile | null>(null)
  const [interruptionBanner, setInterruptionBanner] = useState<{ interrupter: string; interrupted: string } | null>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'moderator',
      speaker: 'Studio Floor',
      content:
        'Step onto the floor, Student Founder. The Sharks are seated. Present your project or venture idea. Exactly one Shark will evaluate your pitch live, focusing on Societal Need, Real Benefits, Technical Feasibility, Commercial Viability, Money-Making Model, and Scalability.',
      timestamp: 'Just now'
    }
  ])

  // Business Metrics State (Real-world venture viability & student guidance)
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics>({
    societal_need: 'Awaiting Student Pitch',
    need_summary: 'State the real problem in society and who suffers without your solution.',
    feasibility: 'Awaiting Student Pitch',
    feasibility_summary: 'Explain your technical architecture and student execution feasibility.',
    commercial_viability: 'Awaiting Student Pitch',
    money_making_summary: 'Explain your unit economics, pricing model, and how you achieve profit.',
    scalability: 'Awaiting Student Pitch',
    scalability_summary: 'Explain how this venture expands beyond your campus or hackathon demo.',
    societal_impact: 'Measurable benefit and positive change created for people or industry.',
    key_actionable_guidance: 'Present your venture. Exactly one Shark will evaluate your pitch live with formal guidance or scolding.',
    verdict_badge: 'Awaiting Pitch',
    ask: initialMetrics?.ask || 'Not stated yet',
    equity: initialMetrics?.equity || 'Not stated yet',
    valuation: initialMetrics?.valuation || 'Student Project Stage',
    revenue: 'Not stated yet',
    arr: 'Not stated yet',
    gross_margin: 'Not stated yet'
  })

  // Market Benchmark
  const [marketBenchmark, setMarketBenchmark] = useState<string>(
    'Early-stage student ventures must prove societal need, customer willingness to pay, and operational feasibility.'
  )

  const [offers, setOffers] = useState<DealOffer[]>([])
  const [dealClosed, setDealClosed] = useState<DealOffer | null>(null)

  // Interaction State
  const [inputText, setInputText] = useState('')
  const [replyTargetDragon, setReplyTargetDragon] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluatingText, setEvaluatingText] = useState('Dragons evaluating your student venture...')
  const [copied, setCopied] = useState(false)
  const [showPitchPresets, setShowPitchPresets] = useState(false)

  // Audio & STT State
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const speechRecRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number | null>(null)

  // References
  const wsRef = useRef<WebSocket | null>(null)
  const chatBottomRef = useRef<HTMLDivElement | null>(null)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isEvaluating])

  // ---------------------------------------------------------------------------
  // Audio Visualizer
  // ---------------------------------------------------------------------------
  const startVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micStreamRef.current = stream
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioCtx
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 64
      const source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyser)
      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const loop = () => {
        analyser.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i]
        const avg = sum / dataArray.length
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)))
        animFrameRef.current = requestAnimationFrame(loop)
      }
      loop()
    } catch (err) {
      console.warn('Microphone stream error:', err)
    }
  }

  const stopVisualizer = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop())
      micStreamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    setAudioLevel(0)
  }

  // ---------------------------------------------------------------------------
  // Voice Output (Disabled per user instruction - Text & Visual only)
  // ---------------------------------------------------------------------------
  const playVoice = useCallback(
    (_text: string, _dragonId?: string, _audioBase64?: string) => {
      // Audio voice output strictly disabled
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause()
        currentAudioRef.current = null
      }
    },
    []
  )

  // ---------------------------------------------------------------------------
  // WebSocket Client
  // ---------------------------------------------------------------------------
  const connectWebSocket = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/pitch'
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => setIsConnected(true)
    ws.onclose = () => {
      setIsConnected(false)
      setTimeout(connectWebSocket, 2000)
    }
    ws.onerror = () => setIsConnected(false)

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        switch (data.type) {
          case 'session_init':
            if (data.metrics) setBusinessMetrics((prev) => ({ ...prev, ...data.metrics }))
            if (data.market_benchmark) setMarketBenchmark(data.market_benchmark)
            if (data.dragons) {
              setDragons((prev) => {
                const backendMap = new Map(data.dragons.map((d: any) => [d.id, d]))
                return INITIAL_DRAGONS.map((d) => {
                  const b = backendMap.get(d.id)
                  return {
                    ...d,
                    ...(b ? b : {}),
                    status: (data.dragon_statuses && data.dragon_statuses[d.id]) || d.status
                  }
                })
              })
            }
            break

          case 'chat_message':
            setMessages((prev) => [
              ...prev,
              {
                id: `msg_${Date.now()}_${Math.random()}`,
                role: 'founder',
                speaker: data.message.speaker || 'Founder',
                content: data.message.content,
                timestamp: 'Just now'
              }
            ])
            break

          case 'moderator_evaluating':
            setIsEvaluating(true)
            setEvaluatingText(data.status || 'Dragons reviewing your numbers...')
            break

          case 'dragon_interruption_event':
            setInterruptionBanner({
              interrupter: data.interrupter,
              interrupted: data.interrupted
            })
            setTimeout(() => setInterruptionBanner(null), 4000)
            break

          case 'dragon_stream_chunk':
            setIsEvaluating(false)
            if (data.dragon_id) setActiveSpeaker(data.dragon_id)

            setMessages((prev) => {
              const lastMsg = prev[prev.length - 1]
              if (lastMsg && lastMsg.id === data.stream_id) {
                return [
                  ...prev.slice(0, -1),
                  { ...lastMsg, content: lastMsg.content + data.chunk }
                ]
              } else {
                return [
                  ...prev,
                  {
                    id: data.stream_id,
                    role: 'dragon',
                    speaker: data.speaker,
                    dragonId: data.dragon_id,
                    content: data.chunk,
                    timestamp: 'Just now',
                    action: data.action || 'speech',
                    tone_badge: data.tone_badge || '🎙️ Grilling',
                    is_interruption: data.is_interruption || false
                  }
                ]
              }
            })
            break

          case 'dragon_turn':
            setIsEvaluating(false)
            if (data.dragon && data.dragon.id) setActiveSpeaker(data.dragon.id)

            if (data.metrics) setBusinessMetrics((prev) => ({ ...prev, ...data.metrics }))
            if (data.offers) setOffers(data.offers)

            if (data.dragon_statuses) {
              setDragons((prev) =>
                prev.map((d) => ({
                  ...d,
                  status: data.dragon_statuses[d.id] || d.status
                }))
              )
            }

            // Sync message tone and final content
            if (data.message) {
              setMessages((prev) => {
                const streamMatchIndex = prev.findIndex((m) => m.speaker === data.message.speaker && prev.length - 1 - prev.indexOf(m) < 3)
                if (streamMatchIndex >= 0) {
                  const updated = [...prev]
                  updated[streamMatchIndex] = {
                    ...updated[streamMatchIndex],
                    content: data.message.content,
                    action: data.action || updated[streamMatchIndex].action,
                    tone_badge: data.tone_badge || updated[streamMatchIndex].tone_badge,
                    is_interruption: data.is_interruption ?? updated[streamMatchIndex].is_interruption,
                    interrupted_speaker: data.message.interrupted_speaker
                  }
                  return updated
                } else {
                  return [
                    ...prev,
                    {
                      id: `turn_${Date.now()}_${Math.random()}`,
                      role: 'dragon',
                      speaker: data.message.speaker,
                      dragonId: data.dragon?.id,
                      content: data.message.content,
                      action: data.action,
                      tone_badge: data.tone_badge,
                      is_interruption: data.is_interruption,
                      interrupted_speaker: data.message.interrupted_speaker,
                      timestamp: 'Just now'
                    }
                  ]
                }
              })
            }

            // Voice output disabled per user instruction

            setTimeout(() => {
              setActiveSpeaker(null)
            }, 3500)
            break

          default:
            break
        }
      } catch (err) {
        console.error('Socket parse error:', err)
      }
    }
  }, [playVoice])

  useEffect(() => {
    connectWebSocket()
    return () => {
      if (wsRef.current) wsRef.current.close()
      if (timerRef.current) clearInterval(timerRef.current)
      stopVisualizer()
    }
  }, [connectWebSocket])

  // ---------------------------------------------------------------------------
  // Send Pitch Action
  // ---------------------------------------------------------------------------
  const handleSend = (overrideText?: string) => {
    const text = (overrideText !== undefined ? overrideText : inputText).trim()
    if (!text) return

    if (isRecording) {
      if (speechRecRef.current) {
        try {
          speechRecRef.current.stop()
        } catch (e) {}
        speechRecRef.current = null
      }
      if (timerRef.current) clearInterval(timerRef.current)
      stopVisualizer()
      setIsRecording(false)
      setRecordingSeconds(0)
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'pitch_text',
          text,
          replying_to: replyTargetDragon,
          metrics: businessMetrics
        })
      )
      setInputText('')
    }
  }

  // ---------------------------------------------------------------------------
  // Microphone Speech Recognition
  // ---------------------------------------------------------------------------
  const handleToggleMic = () => {
    if (isRecording) {
      if (speechRecRef.current) {
        try {
          speechRecRef.current.stop()
        } catch (e) {}
        speechRecRef.current = null
      }
      if (timerRef.current) clearInterval(timerRef.current)
      stopVisualizer()
      setIsRecording(false)
      setRecordingSeconds(0)
      return
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please type your pitch!')
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-IN'

      recognition.onstart = () => {
        setIsRecording(true)
        setRecordingSeconds(0)
        startVisualizer()
        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1)
        }, 1000)
      }

      recognition.onresult = (event: any) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setInputText(transcript)
      }

      recognition.onerror = (e: any) => {
        console.warn('Speech rec error:', e)
        setIsRecording(false)
        stopVisualizer()
        if (timerRef.current) clearInterval(timerRef.current)
      }

      recognition.onend = () => {
        setIsRecording(false)
        stopVisualizer()
        if (timerRef.current) clearInterval(timerRef.current)
      }

      speechRecRef.current = recognition
      recognition.start()
    } catch (e) {
      console.error('Mic error:', e)
    }
  }

  // ---------------------------------------------------------------------------
  // Verdict / Reset / Utility Handlers
  // ---------------------------------------------------------------------------
  const handleVerdict = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'call_for_decisions',
          text: 'Sharks, please deliver your final formal ruling on our venture viability, feasibility, and next steps.',
          metrics: businessMetrics
        })
      )
    }
  }

  const handleReset = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'reset_session' }))
    }
    setMessages([
      {
        id: 'reset',
        role: 'moderator',
        speaker: 'Studio Floor',
        content: 'The floor has been reset. A fresh student founder steps into the den. Present your project or venture idea.',
        timestamp: 'Just now'
      }
    ])
    setOffers([])
    setDealClosed(null)
    setDragons(INITIAL_DRAGONS)
  }

  const handleCopy = () => {
    const text = messages.map((m) => `${m.speaker}: ${m.content}`).join('\n\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getDragonSymbol = (id: string) => {
    switch (id) {
      case 'roaster':
        return <IconCoins size={15} className="text-amber-800" />
      case 'operator':
        return <IconCompass size={15} className="text-purple-800" />
      case 'marketing':
        return <IconFlame size={15} className="text-sky-800" />
      case 'tech':
        return <IconGear size={15} className="text-emerald-800" />
      case 'strategist':
        return <IconAscend size={15} className="text-indigo-800" />
      case 'd2c':
        return <IconSeal size={15} className="text-rose-800" />
      default:
        return <IconFlame size={15} className="text-stone-700" />
    }
  }

  const getDragonColor = (id?: string) => {
    const p = ALL_DRAGON_PROFILES.find((x) => x.id === id)
    return p?.accentColor || '#D97706'
  }

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] text-[#1C1917] flex flex-col font-sans-ui overflow-x-hidden selection:bg-amber-100 selection:text-amber-950 grain">
      {/* -----------------------------------------------------------------------
          Ambient Luxury Warm Atmosphere (Ishaan-UI Palette)
      ------------------------------------------------------------------------ */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-100/40 rounded-full blur-[140px]" />
        <div className="absolute top-1/4 right-0 w-[420px] h-[420px] bg-stone-200/40 rounded-full blur-[150px]" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-orange-50/40 rounded-full blur-[150px]" />
      </div>

      {/* -----------------------------------------------------------------------
          Glassmorphic Header with Minimal Dock
      ------------------------------------------------------------------------ */}
      <header className="sticky top-0 z-30 glass-dock border-b border-stone-200/60 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back to Home Button */}
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-btn text-xs font-semibold text-stone-700 hover:text-stone-950 transition-all shadow-xs"
            title="Return to Home Page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </button>

          <div className="w-8 h-8 rounded-xl bg-[#1C1917] text-amber-400 flex items-center justify-center shadow-xs">
            <IconFlame size={17} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="font-extrabold text-base md:text-lg tracking-tight text-[#1C1917]">
                Dragon Tank <span className="font-display italic font-normal text-amber-800">India</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Strictly 1 Speaker
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Sample Pitches */}
          <button
            onClick={() => setShowPitchPresets(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-btn text-xs font-semibold text-stone-700 hover:text-stone-900 transition-all"
          >
            <IconSliders size={13} className="text-amber-800" />
            <span>Presets</span>
          </button>

          {/* Final Verdict */}
          <button
            onClick={handleVerdict}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-stone-50 text-xs font-semibold shadow-xs transition-all hover:scale-[1.02]"
          >
            <IconSeal size={13} className="text-amber-400" />
            <span>Final Ruling</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-2 rounded-xl glass-btn text-stone-600 hover:text-stone-900 transition-all"
            title="Reset Floor"
          >
            <IconRotate size={15} />
          </button>
        </div>
      </header>

      {/* -----------------------------------------------------------------------
          Live Interruption Banner (High Drama Broadcast Alert)
      ------------------------------------------------------------------------ */}
      <AnimatePresence>
        {interruptionBanner && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="sticky top-14 z-20 mx-auto max-w-xl px-4 py-1.5"
          >
            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl glass-dock bg-amber-500/90 text-slate-950 font-bold text-xs shadow-lg border border-amber-300 tracking-wide">
              <IconFlame size={15} className="text-stone-950" />
              <span>
                Intervention: <span className="underline">{interruptionBanner.interrupter}</span> speaks to {interruptionBanner.interrupted}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -----------------------------------------------------------------------
          Top 6 Dragons Cards Strip (Fully Transparent Glassmorphism)
      ------------------------------------------------------------------------ */}
      <section className="relative z-10 max-w-7xl w-full mx-auto px-4 md:px-8 pt-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {dragons.map((dragon) => {
            const isSpeaking = activeSpeaker === dragon.id
            const isOut = dragon.status === 'out'
            const hasOffer = dragon.status === 'offer'
            const profile = ALL_DRAGON_PROFILES.find((p) => p.id === dragon.id)

            return (
              <div
                key={dragon.id}
                className={`rounded-2xl p-3 transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                  isSpeaking
                    ? 'dragon-speaking-glass ring-2 ring-amber-500/80 scale-[1.02]'
                    : isOut
                    ? 'glass-panel opacity-45 bg-slate-100/40'
                    : hasOffer
                    ? 'glass-panel border-emerald-400/60 ring-2 ring-emerald-500/20'
                    : 'glass-panel hover:bg-white/80 hover:-translate-y-0.5'
                }`}
              >
                {/* Header Icon + Dynamic Status */}
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg glass-pill flex items-center justify-center shadow-xs">
                    {getDragonSymbol(dragon.id)}
                  </div>

                  {/* Status Indicator */}
                  {isSpeaking ? (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-800">
                      <div className="flex items-center gap-0.5 h-2">
                        <span className="w-0.5 bg-amber-600 rounded-full eq-bar-1" />
                        <span className="w-0.5 bg-amber-600 rounded-full eq-bar-2" />
                        <span className="w-0.5 bg-amber-600 rounded-full eq-bar-3" />
                      </div>
                      Speaking
                    </div>
                  ) : isOut ? (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-500/10 text-rose-700 border border-rose-500/20">
                      OUT
                    </span>
                  ) : hasOffer ? (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-500/10 text-emerald-800 border border-emerald-500/30">
                      OFFER
                    </span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  )}
                </div>

                {/* Identity */}
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xs tracking-tight truncate">
                    {dragon.name}
                  </h3>
                  <p className="text-[10px] font-medium text-slate-500 truncate mb-1">
                    {dragon.archetype}
                  </p>
                  <p className="text-[10px] text-slate-600 line-clamp-2 leading-tight italic">
                    "{dragon.tagline}"
                  </p>
                </div>

                {/* Interactive All Dialogues Trigger */}
                <div className="mt-2.5 pt-2 border-t border-white/60">
                  <button
                    onClick={() => profile && setSelectedDragonForDialogues(profile)}
                    className="w-full py-1 px-1.5 rounded-lg glass-btn text-[10px] font-semibold text-slate-700 hover:text-slate-950 flex items-center justify-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3 text-amber-700" />
                    <span>All Famous Dialogues</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* -----------------------------------------------------------------------
          Split-Pane Main Stage (Transcript + Metrics HUD)
      ------------------------------------------------------------------------ */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 md:px-8 mt-3.5 grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* Left (60%): Clean Glass Boardroom Transcript */}
        <section className="lg:col-span-7 flex flex-col glass-panel rounded-3xl overflow-hidden h-[540px] md:h-[620px] shadow-sm">
          {/* Transcript Header */}
          <div className="px-5 py-2.5 border-b border-white/60 flex items-center justify-between bg-white/40">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Live Studio Floor
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                ({messages.length} exchanges)
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Pitch'}
            </button>
          </div>

          {/* Dialogue Feed */}
          <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-3.5">
            {messages.map((msg) => {
              const isFounder = msg.role === 'founder'
              const isDragon = msg.role === 'dragon'
              const isOut = msg.action === 'out'
              const isOffer = msg.action === 'offer'
              const isInterruption = msg.is_interruption
              const dragonProfile = ALL_DRAGON_PROFILES.find((p) => p.name === msg.speaker || p.id === msg.dragonId)

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isFounder ? 'items-end' : 'items-start'} text-sm`}
                >
                  <div
                    className={`max-w-[88%] md:max-w-[84%] rounded-2xl px-4 py-3 transition-all ${
                      isFounder
                        ? 'bg-slate-900 text-white rounded-tr-xs shadow-xs'
                        : isOut
                        ? 'glass-panel bg-rose-50/70 border-rose-200/90 text-rose-950 rounded-tl-xs'
                        : isOffer
                        ? 'glass-panel bg-emerald-50/80 border-emerald-300 text-emerald-950 rounded-tl-xs shadow-xs'
                        : isInterruption
                        ? 'glass-panel bg-amber-50/70 border-amber-300/80 text-amber-950 rounded-tl-xs shadow-xs'
                        : 'glass-panel text-slate-900 rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    {/* Header with Prominent Dragon Avatar, Full Name, and Tone Badges */}
                    <div className="flex items-center justify-between gap-3 mb-1.5 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isDragon && dragonProfile && (
                          <div
                            className="w-5 h-5 rounded-md flex items-center justify-center font-black text-[9px] text-white shadow-2xs"
                            style={{ backgroundColor: dragonProfile.accentColor }}
                          >
                            {dragonProfile.avatarInitials}
                          </div>
                        )}

                        <span
                          className={`font-black text-xs ${
                            isFounder ? 'text-amber-300' : 'text-slate-900'
                          }`}
                        >
                          {msg.speaker}
                        </span>

                        {isDragon && dragonProfile && (
                          <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                            · {dragonProfile.archetype}
                          </span>
                        )}

                        {/* Tone & Drama Badges */}
                        {msg.tone_badge && (
                          <span className="text-[10px] font-mono-num font-semibold px-2 py-0.5 rounded-md glass-inset text-amber-900 border border-amber-800/20">
                            {msg.tone_badge.replace(/[🔥💡⚠️⚙️💰🌍📈🌱📋🏛️⚡]/g, '').trim()}
                          </span>
                        )}

                        {isInterruption && msg.interrupted_speaker && (
                          <span className="text-[10px] font-mono-num font-semibold text-amber-950 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
                            Intervenes · {msg.interrupted_speaker}
                          </span>
                        )}

                        {isOut && (
                          <span className="text-[10px] font-mono-num font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Out
                          </span>
                        )}

                        {isOffer && (
                          <span className="text-[10px] font-mono-num font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                            Endorsement
                          </span>
                        )}
                      </div>

                      {isDragon && (
                        <button
                          onClick={() => {
                            setReplyTargetDragon(msg.speaker)
                            const inputEl = document.getElementById('boardroom-pitch-input')
                            inputEl?.focus()
                          }}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/70 hover:bg-slate-900 hover:text-white text-slate-600 transition-all border border-slate-200/80 flex items-center gap-1 shadow-2xs cursor-pointer"
                          title={`Reply directly to ${msg.speaker}`}
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Reply</span>
                        </button>
                      )}
                    </div>

                    <p
                      className={`leading-relaxed text-[13px] whitespace-pre-wrap ${
                        isFounder ? 'text-slate-100' : 'text-slate-800'
                      }`}
                    >
                      {msg.content}
                    </p>
                  </div>

                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              )
            })}

            {isEvaluating && (
              <div className="flex items-center gap-2 p-3 rounded-2xl glass-panel text-xs text-slate-700 max-w-xs animate-pulse border border-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span className="font-semibold">{evaluatingText}</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Interactive Student Founder Action Chips */}
          <div className="px-4 py-2.5 border-t border-stone-200/60 bg-stone-50/50 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
            <span className="text-[10px] font-mono-num font-bold text-stone-400 uppercase tracking-wider shrink-0">
              Guidance:
            </span>
            {[
              { label: 'Societal Need', icon: IconCompass, text: 'Here is the genuine societal problem we are solving and the exact user pain point.' },
              { label: 'Money Making & Costs', icon: IconCoins, text: 'Here is how our venture generates real revenue, our unit costs, pricing, and how we achieve profitability.' },
              { label: 'Technical Feasibility', icon: IconGear, text: 'Here is our technical prototype architecture and how our student team builds and maintains it.' },
              { label: 'Scalability Plan', icon: IconAscend, text: 'Here is how we scale from our campus pilot to 15 universities and regional markets.' },
              { label: 'Measurable Impact', icon: IconFlame, text: 'Here is the tangible benefit and measurable human or business impact our solution delivers.' },
              { label: 'Request Formal Critique', icon: IconSeal, text: 'Sharks, please give us a direct, formal reality check on our biggest feasibility blindspot.' }
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.text)}
                className="shrink-0 px-3 py-1.5 rounded-xl glass-btn text-[11px] font-semibold text-stone-700 hover:text-stone-950 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <chip.icon size={12} className="text-amber-800" />
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Target Dragon Selector for Replying */}
          <div className="px-4 pt-2.5 pb-2 bg-stone-50/70 border-t border-stone-200/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 max-w-full">
              <span className="text-[10px] font-mono-num font-bold text-stone-400 uppercase tracking-wider shrink-0">
                Direct To:
              </span>
              <button
                onClick={() => setReplyTargetDragon(null)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                  replyTargetDragon === null
                    ? 'bg-[#1C1917] text-stone-50 shadow-xs'
                    : 'glass-btn text-stone-600 hover:text-stone-900'
                }`}
              >
                Auto-Select Domain Mentor
              </button>
              {ALL_DRAGON_PROFILES.map((dp) => (
                <button
                  key={dp.id}
                  onClick={() => setReplyTargetDragon(dp.name)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    replyTargetDragon === dp.name
                      ? 'bg-[#1C1917] text-stone-50 shadow-xs ring-1 ring-amber-400'
                      : 'glass-btn text-stone-700 hover:text-stone-950'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ backgroundColor: dp.accentColor }}
                  />
                  <span>{dp.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
            {replyTargetDragon && (
              <button
                onClick={() => setReplyTargetDragon(null)}
                className="text-[10px] text-stone-400 hover:text-stone-700 ml-2 shrink-0 underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Desktop Pitch Dock */}
          <div className="p-3.5 border-t border-stone-200/60 bg-white/70 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleMic}
                className={`p-2.5 rounded-xl transition-all ${
                  isRecording
                    ? 'bg-rose-600 text-white shadow-md animate-pulse ring-4 ring-rose-200'
                    : 'glass-btn text-stone-700 hover:text-stone-900 hover:scale-105'
                }`}
                title={isRecording ? 'Stop Recording' : 'Voice Input'}
              >
                <IconMic size={16} />
              </button>

              <input
                id="boardroom-pitch-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend()
                }}
                placeholder={
                  isRecording
                    ? `Recording voice (${recordingSeconds}s)... Speak clearly.`
                    : replyTargetDragon
                    ? `Replying directly to ${replyTargetDragon} (e.g. explain feasibility, societal need, or costs)...`
                    : 'Present your project (e.g. societal need, technical feasibility, money-making model, or ask for guidance)...'
                }
                className="flex-1 glass-inset rounded-xl px-4 py-2.5 text-xs md:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
              />

              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-[#1C1917] hover:bg-stone-800 disabled:opacity-30 text-stone-50 transition-all hover:scale-105 shadow-xs"
                title="Send Pitch"
              >
                <IconSend size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* Right (40%): Live Student Venture Viability & Impact Radar */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="glass-strong rounded-3xl p-5 md:p-6 flex flex-col gap-4 shadow-sm">
            
            {/* Header: Viability Radar */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
              <div className="flex items-center gap-2">
                <IconCompass size={16} className="text-amber-800" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-800 font-mono-num">
                  Venture Viability Radar
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {businessMetrics.verdict_badge || 'Live Assessment'}
              </span>
            </div>

            {/* Shark's Formal Actionable Guidance & Reality Check Card */}
            <div className="p-4 rounded-2xl glass-inset border border-stone-200/80 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono-num font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <IconSeal size={13} className="text-amber-800" />
                  Mentor Formal Guidance
                </span>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                  {businessMetrics.tone_category || 'Formal Mentorship'}
                </span>
              </div>
              <p className="font-display italic text-sm text-stone-900 leading-relaxed">
                "{businessMetrics.key_actionable_guidance || 'Present your project to receive formal guidance, feasibility reality checks, or constructive scolding.'}"
              </p>
            </div>

            {/* The 4 Real-World Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Societal Need */}
              <div className="glass rounded-2xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-mono-num font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                      <IconCompass size={12} className="text-amber-800" />
                      Societal Need
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                      {businessMetrics.societal_need || 'Evaluating'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-700 leading-snug line-clamp-3">
                    {businessMetrics.need_summary || 'Does society or any real demographic genuinely need this solution?'}
                  </p>
                </div>
              </div>

              {/* 2. Technical Feasibility */}
              <div className="glass rounded-2xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-mono-num font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                      <IconGear size={12} className="text-emerald-800" />
                      Feasibility
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {businessMetrics.feasibility || 'Evaluating'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-700 leading-snug line-clamp-3">
                    {businessMetrics.feasibility_summary || 'Can a student team engineer, deploy, and maintain this reliably?'}
                  </p>
                </div>
              </div>

              {/* 3. Commercial Viability & Money Making */}
              <div className="glass rounded-2xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-mono-num font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                      <IconCoins size={12} className="text-amber-800" />
                      Money Making
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                      {businessMetrics.commercial_viability || 'Evaluating'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-700 leading-snug line-clamp-3">
                    {businessMetrics.money_making_summary || 'Are unit costs lower than price? How will this venture make profit?'}
                  </p>
                </div>
              </div>

              {/* 4. Scalability */}
              <div className="glass rounded-2xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-mono-num font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                      <IconAscend size={12} className="text-purple-800" />
                      Scalability
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                      {businessMetrics.scalability || 'Evaluating'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-700 leading-snug line-clamp-3">
                    {businessMetrics.scalability_summary || 'How does this grow beyond your campus into wider regional markets?'}
                  </p>
                </div>
              </div>
            </div>

            {/* Measurable Societal Impact & Benefits */}
            <div className="glass rounded-2xl p-4 bg-emerald-50/50 border border-emerald-200/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 mb-1">
                <IconSeal size={14} className="text-emerald-800" />
                <span>Measurable Societal & Human Impact</span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed font-normal">
                {businessMetrics.societal_impact || 'Evaluating positive change, productivity enhancement, and human benefits...'}
              </p>
            </div>

            {/* Action Bar: Request Formal Viability Ruling & Reset */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={handleVerdict}
                className="w-full flex-1 py-3 px-4 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-stone-50 font-semibold text-xs tracking-wide shadow-xs transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
              >
                <IconSeal size={14} className="text-amber-400" />
                <span>Request Final Formal Viability Ruling</span>
              </button>
              <button
                onClick={handleReset}
                className="py-3 px-3.5 rounded-xl glass-btn text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center justify-center gap-1.5 cursor-pointer"
                title="Reset Floor for Fresh Pitch"
              >
                <IconRotate size={14} />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* -----------------------------------------------------------------------
          Interactive Famous Dialogues Modal (All Famous Catchphrases)
      ------------------------------------------------------------------------ */}
      <AnimatePresence>
        {selectedDragonForDialogues && (
          <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-dock rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-white/80"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-xs"
                    style={{ backgroundColor: selectedDragonForDialogues.accentColor }}
                  >
                    {selectedDragonForDialogues.avatarInitials}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {selectedDragonForDialogues.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      All Iconic Dialogues · {selectedDragonForDialogues.archetype}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDragonForDialogues(null)}
                  className="p-1.5 rounded-xl glass-btn text-slate-400 hover:text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {selectedDragonForDialogues.dialogues.map((dlg, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl glass-panel hover:bg-white/90 transition-all flex items-start justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 italic leading-relaxed mb-1">
                        "{dlg.quote}"
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {dlg.context}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        Quote #{idx + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -----------------------------------------------------------------------
          Pitch Presets Modal
      ------------------------------------------------------------------------ */}
      <AnimatePresence>
        {showPitchPresets && (
          <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-dock rounded-3xl max-w-lg w-full p-6 shadow-xl border border-white/80"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                <h3 className="font-bold text-slate-900 text-base">
                  1-Click Student & Early-Stage Pitches
                </h3>
                <button
                  onClick={() => setShowPitchPresets(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-2.5">
                {[
                  {
                    title: '💡 Idea Only (No Numbers Stated: Dragons Will Ask Directly)',
                    text: 'We are engineering students who built an automated campus notes repository and study planner with 400 active student signups. We have not set any funding ask or valuation yet.'
                  },
                  {
                    title: '🎓 Campus AI Exam Copilot (₹20L for 5% Ask Stated)',
                    text: 'We are 3 computer science students who built an AI study copilot that summarizes lecture PDFs and generates mock exam quizzes. 850 active students on our campus use it weekly. We are asking for ₹20 Lakhs for 5% equity (₹4 Cr valuation) to expand to 10 partner engineering colleges.'
                  },
                  {
                    title: '☕ Hostel Late-Night Quick Delivery (₹1.8L Sales, ₹15L Ask)',
                    text: 'We started a late-night snack and coffee delivery run across 6 university hostels with a 15-minute delivery guarantee. We clocked ₹1.8 Lakhs in sales last month with 62% gross margin and zero marketing spend. We are asking for ₹15 Lakhs for 7% to buy two electric delivery scooters and inventory.'
                  },
                  {
                    title: '⚡ Smart Campus EV Charging Prototype (Hardware IoT, ₹35L Ask)',
                    text: 'Built as our final year engineering project, our smart IoT charging socket automates billing via UPI QR codes for campus two-wheelers. Tested in 3 college parking lots with 300 charge cycles. Asking for ₹35 Lakhs for 8% to manufacture the first 100 commercial units.'
                  },
                  {
                    title: '🚀 Unvalidated Hackathon Pitch (Absurd Valuation Reality Check)',
                    text: 'We won our college hackathon last Sunday with an unvalidated idea for an AI social network. We have 20 signups from our roommates and are asking for ₹2 Crores for 2% equity (₹100 Crore valuation)!'
                  }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(preset.text)
                      setShowPitchPresets(false)
                    }}
                    className="w-full text-left p-3 rounded-2xl glass-panel hover:bg-white/90 hover:border-amber-300 transition-all text-xs"
                  >
                    <span className="font-bold text-slate-900 block mb-1">
                      {preset.title}
                    </span>
                    <span className="text-slate-600 line-clamp-2">
                      {preset.text}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deal Closed Modal */}
      <AnimatePresence>
        {dealClosed && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-dock rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-emerald-300"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">DEAL CLOSED!</h2>
              <p className="text-sm text-slate-600 mb-4">
                You signed a term sheet with <span className="font-bold text-slate-900">{dealClosed.dragon_name}</span>.
              </p>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 mb-6">
                {dealClosed.terms}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDealClosed(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Continue Pitching
                </button>
                <button
                  onClick={onBackToHome}
                  className="px-4 py-3 rounded-xl glass-panel text-slate-700 font-bold text-xs"
                >
                  Return to Home
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
