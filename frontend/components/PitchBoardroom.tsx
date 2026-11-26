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
        'Step onto the floor, Student Founder. The Dragons are seated. Present your project or venture idea. The Dragon whose domain your pitch touches most will evaluate it live, focusing on Societal Need, Real Benefits, Technical Feasibility, Commercial Viability, Money-Making Model, and Scalability.',
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
    key_actionable_guidance: 'Present your venture. The Dragon whose domain it touches most will evaluate it live with formal guidance or scolding.',
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
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
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
                const byId = data.message.id ? prev.findIndex((m) => m.id === data.message.id) : -1
                const streamMatchIndex = byId >= 0 ? byId : prev.findIndex((m, i) => m.speaker === data.message.speaker && prev.length - 1 - i < 3)
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
          text: 'Dragons, please deliver your final formal ruling on our venture viability, feasibility, and next steps.',
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

  // ---------------------------------------------------------------------------
  // View helpers
  // ---------------------------------------------------------------------------
  const founderTurns = messages.filter((m) => m.role === 'founder').length
  const isEmpty = founderTurns === 0
  const targetProfile = ALL_DRAGON_PROFILES.find((p) => p.name === replyTargetDragon)
  const speakingDragon = dragons.find((d) => d.id === activeSpeaker)

  const pillarTone = (value?: string): 'good' | 'mid' | 'risk' | 'pending' => {
    const v = (value || '').toLowerCase()
    if (!v || v.includes('awaiting')) return 'pending'
    if (/(high need|high feasibility|viable|national)/.test(v)) return 'good'
    if (/(moderate|regional|campus to)/.test(v)) return 'mid'
    return 'risk'
  }
  const toneStyles = {
    good: { chip: 'bg-emerald-50 text-emerald-800 ring-emerald-200', bar: 'bg-emerald-500', w: '100%', label: 'Strong' },
    mid: { chip: 'bg-amber-50 text-amber-800 ring-amber-200', bar: 'bg-amber-500', w: '60%', label: 'Okay' },
    risk: { chip: 'bg-rose-50 text-rose-800 ring-rose-200', bar: 'bg-rose-500', w: '30%', label: 'Risky' },
    pending: { chip: 'bg-stone-100 text-stone-500 ring-stone-200', bar: 'bg-stone-300', w: '0%', label: 'Not yet' }
  }

  const pillars = [
    { key: 'need', title: 'Customer need', icon: IconFlame, value: businessMetrics.societal_need, summary: businessMetrics.need_summary },
    { key: 'feas', title: 'Can you build it?', icon: IconGear, value: businessMetrics.feasibility, summary: businessMetrics.feasibility_summary },
    { key: 'money', title: 'Makes money?', icon: IconCoins, value: businessMetrics.commercial_viability, summary: businessMetrics.money_making_summary },
    { key: 'scale', title: 'Can it scale?', icon: IconAscend, value: businessMetrics.scalability, summary: businessMetrics.scalability_summary }
  ]

  const numbers = [
    ['Revenue', businessMetrics.revenue],
    ['Gross margin', businessMetrics.gross_margin],
    ['CAC', businessMetrics.cac],
    ['Repeat rate', businessMetrics.repeat_rate],
    ['Ask', businessMetrics.ask]
  ].filter(([, v]) => v && !String(v).toLowerCase().includes('not stated'))

  const quickPrompts = [
    { label: 'Who is my customer?', text: 'Is the customer need strong enough? What would make someone switch to us?' },
    { label: 'Is my pricing right?', text: 'Here is how we plan to charge. Does our pricing cover our costs?' },
    { label: 'Can we build it?', text: 'Is our tech and operations plan realistic for a student team?' },
    { label: 'How do we scale?', text: 'How do we grow beyond our campus? What is our biggest scaling risk?' }
  ]

  const samplePitches = [
    { emoji: '🎓', title: 'Campus AI study copilot', text: 'We are 3 computer science students who built an AI study copilot that summarizes lecture PDFs and generates mock quizzes. 850 students on our campus use it weekly. We charge nothing yet and want to expand to 10 colleges.' },
    { emoji: '☕', title: 'Hostel late-night delivery', text: 'We run late-night snack and coffee delivery across 6 hostels with a 15-minute guarantee. ₹1.8 lakh sales last month, 62% gross margin, zero marketing spend. We want ₹15 lakh to buy two e-scooters and inventory.' },
    { emoji: '⚡', title: 'IoT EV charging socket', text: 'Our final-year project is a smart charging socket for campus two-wheelers with UPI QR billing. Tested in 3 parking lots with 300 charge cycles. We need ₹35 lakh to manufacture the first 100 units.' },
    { emoji: '🚀', title: 'Hackathon idea, big valuation', text: 'We won a hackathon last Sunday with an AI social network idea. 20 signups from roommates. We are asking ₹2 crore for 2% equity.' }
  ]

  const toggleTarget = (name: string) => setReplyTargetDragon((cur) => (cur === name ? null : name))

  const [mobileTab, setMobileTab] = useState<'chat' | 'score'>('chat')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [inputText])

  const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F5]'

  const Avatar = ({ id, size = 36, ring = false }: { id?: string; size?: number; ring?: boolean }) => {
    const p = ALL_DRAGON_PROFILES.find((x) => x.id === id)
    const color = p?.accentColor || '#78716C'
    return (
      <span
        className={`relative inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${ring ? 'ring-2 ring-offset-2 ring-offset-white' : ''}`}
        style={{ width: size, height: size, background: color, fontSize: size * 0.36, ['--tw-ring-color' as any]: color }}
        aria-hidden
      >
        {p?.name.split(' ').map((s) => s[0]).join('') || 'DT'}
      </span>
    )
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="relative flex h-[100dvh] flex-col bg-[#FAF8F5] font-sans-ui text-[#1C1917] selection:bg-amber-100">
      {/* Header */}
      <header className="z-30 flex items-center justify-between gap-2 border-b border-stone-200 bg-white/80 px-3 py-2.5 backdrop-blur md:px-6">
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <button
            onClick={onBackToHome}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-900 ${focusRing}`}
            aria-label="Back to home"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1C1917] text-amber-400">
            <IconFlame size={16} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-extrabold leading-tight tracking-tight">
              Dragon Tank <span className="font-display font-normal italic text-amber-800">India</span>
            </h1>
            <p className="flex items-center gap-1.5 text-[11px] text-stone-500">
              <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
              {isConnected ? 'Dragons are live' : 'Reconnecting…'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            disabled={isEmpty}
            className={`hidden h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-stone-600 hover:bg-stone-100 disabled:opacity-40 sm:inline-flex ${focusRing}`}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy transcript'}
          </button>
          <button
            onClick={handleReset}
            className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 ${focusRing}`}
            aria-label="Start over"
            title="Start over"
          >
            <IconRotate size={14} />
            <span className="hidden sm:inline">Start over</span>
          </button>
          <button
            onClick={handleVerdict}
            disabled={isEmpty || !isConnected || isEvaluating}
            title={isEmpty ? 'Pitch first, then ask for the verdict' : 'All six Dragons give their final verdict'}
            className={`inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1C1917] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300 ${focusRing}`}
          >
            <IconSeal size={14} className="text-amber-400" />
            Get verdict
          </button>
        </div>
      </header>

      {!isConnected && (
        <div role="status" className="flex items-center justify-center gap-2 bg-rose-50 px-4 py-2 text-xs text-rose-800">
          <AlertTriangle className="h-3.5 w-3.5" />
          Can&apos;t reach the Dragon server. Make sure the backend is running on port 8000. Retrying automatically…
        </div>
      )}

      {/* Dragon panel */}
      <nav aria-label="Dragon panel" className="border-b border-stone-200 bg-white/60">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-3 py-2.5 md:px-6 lg:justify-center [scrollbar-width:none]">
          {dragons.map((d) => {
            const isSpeaking = speakingDragon?.id === d.id
            const isTarget = replyTargetDragon === d.name
            const profile = ALL_DRAGON_PROFILES.find((p) => p.id === d.id)
            return (
              <div
                key={d.id}
                className={`group flex shrink-0 items-center gap-2 rounded-xl border px-2.5 py-1.5 transition ${
                  isTarget ? 'border-stone-900 bg-stone-900 text-white' : isSpeaking ? 'border-amber-300 bg-amber-50' : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <button
                  onClick={() => toggleTarget(d.name)}
                  aria-pressed={isTarget}
                  className={`flex items-center gap-2 rounded-lg text-left ${focusRing}`}
                  title={isTarget ? `Stop asking ${d.name} directly` : `Ask ${d.name} directly`}
                >
                  <span className="relative">
                    <Avatar id={d.id} size={30} />
                    {isSpeaking && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />}
                  </span>
                  <span className="leading-tight">
                    <span className="block text-[13px] font-semibold">{d.name.split(' ')[0]}</span>
                    <span className={`hidden text-[11px] sm:block ${isSpeaking ? 'text-emerald-700 font-semibold' : isTarget ? 'text-stone-300' : 'text-stone-500'}`}>
                      {isSpeaking ? 'Speaking…' : DOMAIN_SHORT[d.id] || 'Mentor'}
                    </span>
                  </span>
                </button>
                {profile && (
                  <button
                    onClick={() => setSelectedDragonForDialogues(profile)}
                    className={`ml-0.5 hidden sm:block rounded-md p-1 ${isTarget ? 'text-stone-300 hover:text-white' : 'text-stone-400 hover:text-stone-700'} ${focusRing}`}
                    aria-label={`About ${d.name}`}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* Mobile tabs */}
      <div className="flex border-b border-stone-200 bg-white lg:hidden" role="tablist">
        {(['chat', 'score'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={mobileTab === t}
            onClick={() => setMobileTab(t)}
            className={`flex-1 py-2.5 text-sm font-semibold ${mobileTab === t ? 'border-b-2 border-stone-900 text-stone-900' : 'text-stone-500'}`}
          >
            {t === 'chat' ? 'Boardroom' : 'Scorecard'}
          </button>
        ))}
      </div>

      {/* Main */}
      <main className="mx-auto grid min-h-0 w-full max-w-7xl flex-1 grid-cols-1 gap-5 px-0 md:px-6 md:py-5 lg:grid-cols-12">
        {/* Chat column */}
        <section
          className={`${mobileTab === 'chat' ? 'flex' : 'hidden'} min-h-0 flex-col overflow-hidden bg-white md:rounded-2xl md:border md:border-stone-200 md:shadow-sm lg:col-span-8 lg:flex`}
          aria-label="Boardroom conversation"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6" aria-live="polite">
            {isEmpty ? (
              <div className="mx-auto max-w-xl py-4 text-center md:py-8">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                  <IconFlame size={24} />
                </div>
                <h2 className="font-display text-2xl font-semibold md:text-3xl">Pitch your idea to the Dragons</h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  Describe what you&apos;re building in a few sentences. The Dragon whose expertise fits best will reply with honest
                  feedback: what works, what&apos;s missing, and what to do next.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-2 text-left sm:grid-cols-4">
                  {[
                    ['1', 'The problem', 'Who has it?'],
                    ['2', 'Your solution', 'What you built'],
                    ['3', 'Money', 'Price vs cost'],
                    ['4', 'Traction', 'Real users / sales']
                  ].map(([n, t, s]) => (
                    <div key={n} className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                      <div className="text-[11px] font-bold text-amber-700">{n}</div>
                      <div className="text-[13px] font-semibold">{t}</div>
                      <div className="text-[11px] text-stone-500">{s}</div>
                    </div>
                  ))}
                </div>

                <p className="mb-2 mt-7 text-xs font-semibold uppercase tracking-wider text-stone-500">Or try a sample pitch</p>
                <div className="grid gap-2 text-left sm:grid-cols-2">
                  {samplePitches.map((s) => (
                    <button
                      key={s.title}
                      onClick={() => {
                        setInputText(s.text)
                        textareaRef.current?.focus()
                      }}
                      className={`flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-3 text-left transition hover:border-amber-300 hover:bg-amber-50/40 ${focusRing}`}
                    >
                      <span className="text-lg" aria-hidden>{s.emoji}</span>
                      <span>
                        <span className="block text-[13px] font-semibold">{s.title}</span>
                        <span className="line-clamp-2 text-[12px] text-stone-500">{s.text}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ol className="mx-auto flex max-w-3xl flex-col gap-5">
                {messages
                  .filter((m) => m.role !== 'moderator')
                  .map((msg) => {
                    if (msg.role === 'founder') {
                      return (
                        <li key={msg.id} className="flex justify-end">
                          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#1C1917] px-4 py-3 text-[14px] leading-relaxed text-stone-50">
                            {msg.content}
                          </div>
                        </li>
                      )
                    }
                    const profile = ALL_DRAGON_PROFILES.find((p) => p.id === msg.dragonId || p.name === msg.speaker)
                    const action = String(msg.action || '')
                    const verdict = action === 'verdict_in' ? 'in' : action === 'verdict_out' ? 'out' : null
                    return (
                      <li key={msg.id} className="flex gap-3">
                        <Avatar id={profile?.id} size={36} />
                        <div className="min-w-0 max-w-[88%]">
                          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-[13px] font-bold">{msg.speaker}</span>
                            {verdict ? (
                              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${verdict === 'in' ? 'bg-emerald-50 text-emerald-800 ring-emerald-200' : 'bg-rose-50 text-rose-800 ring-rose-200'}`}>
                                {verdict === 'in' ? "I'm IN" : "I'm OUT"}
                              </span>
                            ) : (
                              msg.tone_badge && (
                                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600">{msg.tone_badge}</span>
                              )
                            )}
                          </div>
                          <div
                            className="rounded-2xl rounded-tl-md border bg-white px-4 py-3 text-[14px] leading-relaxed text-stone-800"
                            style={{ borderColor: (profile?.accentColor || '#d6d3d1') + '40', borderLeftWidth: 3, borderLeftColor: profile?.accentColor }}
                          >
                            {msg.content}
                          </div>
                          {profile && (
                            <button
                              onClick={() => {
                                setReplyTargetDragon(profile.name)
                                textareaRef.current?.focus()
                              }}
                              className={`mt-1 rounded px-1 text-[12px] font-medium text-stone-500 hover:text-stone-900 ${focusRing}`}
                            >
                              Reply to {profile.name.split(' ')[0]} →
                            </button>
                          )}
                        </div>
                      </li>
                    )
                  })}
                {isEvaluating && (
                  <li className="flex items-center gap-3 text-sm text-stone-500">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100">
                      <span className="flex gap-0.5">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400" style={{ animationDelay: `${i * 120}ms` }} />
                        ))}
                      </span>
                    </span>
                    {evaluatingText}
                  </li>
                )}
              </ol>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Composer */}
          <div className="border-t border-stone-200 bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:px-5">
            {!isEmpty && (
              <div className="mb-2 flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
                {quickPrompts.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => handleSend(q.text)}
                    disabled={!isConnected || isEvaluating}
                    className={`shrink-0 rounded-full border border-stone-200 px-3 py-1 text-[12px] font-medium text-stone-600 hover:border-stone-400 hover:text-stone-900 disabled:opacity-40 ${focusRing}`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            )}
            {targetProfile && (
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-stone-100 py-1 pl-1 pr-2 text-[12px]">
                <Avatar id={targetProfile.id} size={20} />
                Asking <b>{targetProfile.name}</b> directly
                <button onClick={() => setReplyTargetDragon(null)} aria-label="Ask the whole panel instead" className={`rounded-full p-0.5 hover:bg-stone-200 ${focusRing}`}>
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <div className="flex items-end gap-2 rounded-2xl border border-stone-300 bg-white p-1.5 focus-within:border-stone-900 focus-within:ring-1 focus-within:ring-stone-900">
              <button
                onClick={handleToggleMic}
                aria-label={isRecording ? 'Stop recording' : 'Speak your pitch'}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isRecording ? 'bg-rose-600 text-white' : 'text-stone-500 hover:bg-stone-100'} ${focusRing}`}
              >
                <IconMic size={18} />
              </button>
              <label htmlFor="pitch-input" className="sr-only">Your pitch</label>
              <textarea
                id="pitch-input"
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder={
                  isRecording
                    ? `Listening… ${recordingSeconds}s`
                    : targetProfile
                    ? `Reply to ${targetProfile.name.split(' ')[0]}…`
                    : isEmpty
                    ? 'Describe your idea: problem, solution, price, traction…'
                    : 'Answer the Dragon or add more details…'
                }
                className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent px-1 py-2.5 text-[15px] leading-snug placeholder:text-stone-400 focus:outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim() || !isConnected}
                aria-label="Send"
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1C1917] text-white transition hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 ${focusRing}`}
              >
                <IconSend size={16} />
              </button>
            </div>
            <p className="mt-1.5 hidden text-center text-[11px] text-stone-400 md:block">
              Enter to send · Shift+Enter for a new line · Click a Dragon above to ask them directly
            </p>
          </div>
        </section>

        {/* Scorecard */}
        <aside
          className={`${mobileTab === 'score' ? 'block' : 'hidden'} min-h-0 overflow-y-auto px-4 py-5 md:px-0 md:py-0 lg:col-span-4 lg:block`}
          aria-label="Venture scorecard"
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold">Scorecard</h2>
                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-stone-600">
                  {businessMetrics.verdict_badge && !businessMetrics.verdict_badge.includes('Awaiting') ? businessMetrics.verdict_badge : isEmpty ? 'Waiting for pitch' : 'Live'}
                </span>
              </div>
              <ul className="mt-4 space-y-4">
                {pillars.map((p) => {
                  const tone = pillarTone(p.value)
                  const s = toneStyles[tone]
                  const Icon = p.icon
                  return (
                    <li key={p.key}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-[13px] font-semibold">
                          <Icon size={14} className="text-stone-500" />
                          {p.title}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${s.chip}`} title={p.value}>
                          {tone === 'pending' ? s.label : p.value}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-stone-100">
                        <div className={`h-full rounded-full transition-all duration-700 ${s.bar}`} style={{ width: s.w }} />
                      </div>
                      <p className="mt-1.5 text-[12px] leading-relaxed text-stone-500">{p.summary}</p>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-amber-900">
                <IconCheckCircle size={15} /> Your next step
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-amber-950">{businessMetrics.key_actionable_guidance}</p>
            </div>

            {numbers.length > 0 && (
              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <h2 className="text-sm font-bold">Numbers you&apos;ve shared</h2>
                <dl className="mt-3 grid grid-cols-2 gap-3">
                  {numbers.map(([k, v]) => (
                    <div key={k as string}>
                      <dt className="text-[11px] text-stone-500">{k}</dt>
                      <dd className="font-mono-num text-[13px] font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {businessMetrics.societal_impact && !isEmpty && (
              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <h2 className="text-sm font-bold">Impact</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-stone-600">{businessMetrics.societal_impact}</p>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Dragon profile sheet */}
      <AnimatePresence>
        {selectedDragonForDialogues && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDragonForDialogues(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={selectedDragonForDialogues.name}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl"
            >
              <div className="flex items-start gap-3">
                <Avatar id={selectedDragonForDialogues.id} size={48} />
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{selectedDragonForDialogues.name}</h3>
                  <p className="text-[13px] text-stone-500">{selectedDragonForDialogues.title}</p>
                  <p className="mt-1 text-[12px] font-semibold text-amber-800">Judges: {DOMAIN_SHORT[selectedDragonForDialogues.id]}</p>
                </div>
                <button onClick={() => setSelectedDragonForDialogues(null)} aria-label="Close" className={`rounded-full p-1.5 hover:bg-stone-100 ${focusRing}`}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <h4 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-stone-500">Signature lines</h4>
              <ul className="space-y-2">
                {selectedDragonForDialogues.dialogues.map((d: DragonDialogue) => (
                  <li key={d.quote} className="rounded-xl bg-stone-50 p-3">
                    <p className="font-display text-[15px] italic">“{d.quote}”</p>
                    <p className="mt-1 text-[12px] text-stone-500">{d.context}</p>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  setReplyTargetDragon(selectedDragonForDialogues.name)
                  setSelectedDragonForDialogues(null)
                  setMobileTab('chat')
                  setTimeout(() => textareaRef.current?.focus(), 50)
                }}
                className={`mt-5 w-full rounded-xl bg-[#1C1917] py-3 text-sm font-semibold text-white hover:bg-stone-800 ${focusRing}`}
              >
                Ask {selectedDragonForDialogues.name.split(' ')[0]} directly
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const DOMAIN_SHORT: Record<string, string> = {
  roaster: 'Money & pricing',
  marketing: 'Customers & brand',
  tech: 'Tech & purpose',
  operator: 'Operations & legal',
  strategist: 'Market & scale',
  d2c: 'Retention & execution'
}
