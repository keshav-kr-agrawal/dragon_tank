'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame,
  Mic,
  MicOff,
  Send,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Cpu,
  ShieldAlert,
  Gavel,
  Check,
  Copy,
  Layers,
  X,
  Zap,
  DollarSign,
  ArrowLeft,
  AlertTriangle,
  Target,
  Briefcase,
  Award,
  ChevronRight,
  TrendingDown,
  MessageCircle,
  GraduationCap,
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
  ask: string
  equity: string
  valuation: string
  revenue: string
  gross_margin: string
  arr: string
  cac: string
  repeat_rate: string
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
  action?: 'speech' | 'out' | 'offer' | 'crosstalk' | 'roast' | 'scold' | 'praise' | 'motivate' | 'suggestion' | 'valuation_guidance' | 'interruption'
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
        'Step onto the floor, Student Founder. The 6 Dragons are seated. Present your venture and state your funding ask, or the Dragons will ask for them directly.',
      timestamp: 'Just now'
    }
  ])

  // Business Metrics State (Zero pre-written numbers - comes from pitch or dragons ask)
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics>({
    ask: initialMetrics?.ask || 'Not stated yet',
    equity: initialMetrics?.equity || 'Not stated yet',
    valuation: initialMetrics?.valuation || 'Awaiting founder pitch',
    revenue: 'Not stated yet',
    arr: 'Not stated yet',
    gross_margin: 'Not stated yet',
    cac: 'Not stated yet',
    repeat_rate: 'Not stated yet',
    implied_multiple: 'Awaiting ask & numbers',
    multiple_verdict: 'Awaiting pitch details',
    future_valuation_advice: 'State your funding ask, equity, and sales in your pitch or Dragons will ask you directly.'
  })

  // Market Benchmark
  const [marketBenchmark, setMarketBenchmark] = useState<string>(
    'Early-stage student ventures need customer validation and evidence of traction before setting a valuation.'
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
          text: 'Dragons, give me your final decision. Are you in or are you out?',
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
        content: 'The floor has been reset. State your business, revenue, and your ask.',
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
        return <TrendingUp className="w-4 h-4 text-amber-700" />
      case 'operator':
        return <ShieldAlert className="w-4 h-4 text-purple-700" />
      case 'marketing':
        return <Flame className="w-4 h-4 text-sky-700" />
      case 'tech':
        return <Cpu className="w-4 h-4 text-emerald-700" />
      case 'strategist':
        return <Layers className="w-4 h-4 text-indigo-700" />
      case 'd2c':
        return <DollarSign className="w-4 h-4 text-rose-700" />
      default:
        return <Flame className="w-4 h-4 text-slate-700" />
    }
  }

  const getDragonColor = (id?: string) => {
    const p = ALL_DRAGON_PROFILES.find((x) => x.id === id)
    return p?.accentColor || '#D97706'
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-x-hidden selection:bg-amber-100 selection:text-amber-900">
      {/* -----------------------------------------------------------------------
          Ambient Luxury Gradient Orbs (Creates Glassmorphism Depth)
      ------------------------------------------------------------------------ */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-200/35 rounded-full blur-[130px]" />
        <div className="absolute top-1/4 right-0 w-[420px] h-[420px] bg-purple-100/35 rounded-full blur-[140px]" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-emerald-100/30 rounded-full blur-[140px]" />
      </div>

      {/* -----------------------------------------------------------------------
          Glassmorphic Header with Home Navigation
      ------------------------------------------------------------------------ */}
      <header className="sticky top-0 z-30 glass-dock border-b border-white/60 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back to Home Button */}
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel text-xs font-semibold text-slate-700 hover:text-slate-950 hover:scale-105 transition-all shadow-xs"
            title="Return to Home Page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home Lobby</span>
          </button>

          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-sm">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Flame className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base md:text-lg tracking-tight text-slate-900">
                Dragon Tank India
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live 6-Dragon Boardroom
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Student Mode Badge */}
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel text-xs font-semibold text-slate-700 border border-slate-200/80 shadow-2xs">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Student & Early-Stage Lab</span>
          </span>

          {/* Sample Pitches */}
          <button
            onClick={() => setShowPitchPresets(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Presets
          </button>

          {/* Final Verdict */}
          <button
            onClick={handleVerdict}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all hover:scale-105"
          >
            <Gavel className="w-3.5 h-3.5 text-amber-400" />
            Final Verdict
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-2 rounded-xl glass-panel text-slate-500 hover:text-slate-900 transition-all hover:scale-105"
            title="Reset Floor"
          >
            <RotateCcw className="w-4 h-4" />
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
            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl glass-dock bg-amber-500/90 text-slate-950 font-black text-xs shadow-lg border border-amber-300 tracking-wide">
              <Zap className="w-4 h-4 fill-slate-950 animate-bounce" />
              <span>
                ROOM INTERRUPTION: <span className="underline">{interruptionBanner.interrupter}</span> cuts off {interruptionBanner.interrupted}!
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
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {msg.tone_badge}
                          </span>
                        )}

                        {isInterruption && msg.interrupted_speaker && (
                          <span className="text-[10px] font-black text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                            ⚡ Cuts off {msg.interrupted_speaker}
                          </span>
                        )}

                        {isOut && (
                          <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                            I AM OUT
                          </span>
                        )}

                        {isOffer && (
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                            DEAL OFFER
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
          <div className="px-3.5 py-2 border-t border-white/60 bg-white/30 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Quick Reply:</span>
            {[
              { label: '🎓 Student Pilot', text: 'We tested this with 120 college students on our campus and 40% use it daily.' },
              { label: '🔍 Customer Validation', text: 'We conducted 35 customer interviews. 18 students paid ₹199 each via UPI for our beta.' },
              { label: '💡 Project to Startup', text: 'How do you recommend we transition this from a college capstone project into a real commercial venture?' },
              { label: '📊 Honest Valuation', text: 'Dragons, help me understand what an honest pre-seed valuation is for our current stage.' },
              { label: '🛡️ Tech Architecture', text: 'The core algorithms and hardware prototype were built entirely by our student team in the campus lab.' },
              { label: '💰 Campus Seed Ask', text: 'We are asking for ₹15 Lakhs for 7% equity to fund server costs and our 3-campus pilot.' }
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.text)}
                className="shrink-0 px-2.5 py-1 rounded-xl glass-panel text-[11px] font-semibold text-slate-700 hover:text-slate-950 hover:border-amber-400 transition-all cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Target Dragon Selector for Replying */}
          <div className="px-3.5 pt-2 pb-1.5 bg-white/40 border-t border-white/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 max-w-full">
              <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Replying to:</span>
              <button
                onClick={() => setReplyTargetDragon(null)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                  replyTargetDragon === null
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'glass-panel text-slate-600 hover:text-slate-900'
                }`}
              >
                🌐 All Dragons (Panel)
              </button>
              {ALL_DRAGON_PROFILES.map((dp) => (
                <button
                  key={dp.id}
                  onClick={() => setReplyTargetDragon(dp.name)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    replyTargetDragon === dp.name
                      ? 'bg-slate-900 text-white shadow-xs ring-1 ring-amber-400'
                      : 'glass-panel text-slate-700 hover:text-slate-950'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: dp.accentColor }}
                  />
                  <span>{dp.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
            {replyTargetDragon && (
              <button
                onClick={() => setReplyTargetDragon(null)}
                className="text-[10px] text-slate-400 hover:text-slate-700 ml-2 shrink-0 underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Desktop Pitch Dock */}
          <div className="p-3.5 border-t border-white/60 bg-white/50 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleMic}
                className={`p-2.5 rounded-xl transition-all ${
                  isRecording
                    ? 'bg-rose-500 text-white shadow-md animate-pulse ring-4 ring-rose-200'
                    : 'glass-panel text-slate-700 hover:text-slate-900 hover:scale-105'
                }`}
                title={isRecording ? 'Stop Recording' : 'Voice Input'}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
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
                    ? `Replying directly to ${replyTargetDragon} (e.g. explain customer validation or pricing)...`
                    : 'Pitch your venture (e.g. campus pilot, ₹20L ask for 5% equity, or pitch your idea and Dragons will ask)...'
                }
                className="flex-1 glass-panel rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/80 transition-all"
              />

              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white transition-all hover:scale-105 shadow-xs"
                title="Send Pitch"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Right (40%): Live Business Metrics & Valuation Math */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="glass-panel rounded-3xl p-5 md:p-6 flex flex-col gap-4 shadow-sm">
            {/* Valuation & ARR Multiple Card */}
            {businessMetrics.valuation &&
            !businessMetrics.valuation.toLowerCase().includes('awaiting') &&
            !businessMetrics.valuation.toLowerCase().includes('not stated') ? (
              <div className="glass-panel bg-emerald-50/70 border-emerald-200/80 rounded-2xl p-4 flex flex-col gap-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Pre-Money Valuation
                  </span>
                  <span className="text-xs font-medium text-emerald-700">
                    Ask: {businessMetrics.ask}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-900 tracking-tight font-mono">
                    {businessMetrics.valuation}
                  </span>
                  <span className="text-xs text-emerald-700">
                    ({businessMetrics.equity} Equity Dilution)
                  </span>
                </div>

                {/* Dynamic Multiple & Market Verdict */}
                {businessMetrics.implied_multiple && (
                  <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-900">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Multiple: <strong>{businessMetrics.implied_multiple}</strong></span>
                    </div>
                    {businessMetrics.multiple_verdict && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {businessMetrics.multiple_verdict}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-panel bg-amber-50/50 border-amber-200/70 rounded-2xl p-4 flex flex-col gap-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      Financial Valuation
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    Awaiting Pitch Numbers
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  No pre-written numbers or money are assumed. State your funding ask (e.g. ₹20L for 5%) and revenue in your pitch, or the Dragons will proactively ask you directly.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-200/60 text-xs">
                  <div className="glass-panel rounded-xl p-2 bg-white/60">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Ask Amount</span>
                    <span className="text-xs font-bold text-slate-800 block mt-0.5">{businessMetrics.ask}</span>
                  </div>
                  <div className="glass-panel rounded-xl p-2 bg-white/60">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Valuation</span>
                    <span className="text-xs font-bold text-slate-800 block mt-0.5">{businessMetrics.valuation}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4 Essential Numbers Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-panel rounded-2xl p-3.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Monthly Revenue
                </span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {businessMetrics.revenue}
                </span>
              </div>

              <div className="glass-panel rounded-2xl p-3.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Annualized ARR
                </span>
                <span className="text-base font-bold text-emerald-800 mt-1 block">
                  {businessMetrics.arr}
                </span>
              </div>

              <div className="glass-panel rounded-2xl p-3.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Gross Margin
                </span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {businessMetrics.gross_margin}
                </span>
              </div>

              <div className="glass-panel rounded-2xl p-3.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  CAC / Repeat Rate
                </span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {businessMetrics.cac} · {businessMetrics.repeat_rate}
                </span>
              </div>
            </div>

            {/* Strategic Future Valuation Advice */}
            {businessMetrics.future_valuation_advice && (
              <div className="glass-panel rounded-2xl p-4 bg-indigo-50/40 border-indigo-200/60">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 mb-1">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Strategic Valuation Roadmap</span>
                </div>
                <p className="text-xs text-indigo-950/80 leading-relaxed italic">
                  "{businessMetrics.future_valuation_advice}"
                </p>
              </div>
            )}

            {/* Structured Offers Area */}
            {offers.length > 0 && (
              <div className="pt-2 flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Extended Offers ({offers.length})
                </span>
                <div className="space-y-2">
                  {offers.map((off, i) => (
                    <div
                      key={i}
                      className="glass-panel bg-emerald-50/80 border-emerald-300 rounded-2xl p-3.5 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-xs text-emerald-950 block">
                          {off.dragon_name}
                        </span>
                        <span className="text-xs text-emerald-800 line-clamp-1">
                          {off.terms}
                        </span>
                      </div>
                      <button
                        onClick={() => setDealClosed(off)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
                      >
                        Accept Deal
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
