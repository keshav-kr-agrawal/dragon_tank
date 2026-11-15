// -----------------------------------------------------------------------------
// Dragon Tank Studio Web Audio Synthesizer
// Zero external asset dependencies. High-fidelity cinematic audio in browser memory.
// -----------------------------------------------------------------------------

class DragonTankSoundSynthesizer {
  private ctx: AudioContext | null = null

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  /**
   * Dramatic Red Carpet Entrance Sequence:
   * 1. Sub-bass tension boom
   * 2. Heavy hydraulic stage door hiss
   * 3. Cinematic brass / gong tension swell
   * 4. Camera flash shutter pops
   */
  public playRedCarpetEntrance(muted: boolean = false) {
    if (muted) return
    const ctx = this.getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    try {
      // 1. Deep Sub-Bass Impact (0.0s - 2.8s)
      const subOsc = ctx.createOscillator()
      const subGain = ctx.createGain()
      subOsc.type = 'sine'
      subOsc.frequency.setValueAtTime(110, now)
      subOsc.frequency.exponentialRampToValueAtTime(36, now + 1.8)

      subGain.gain.setValueAtTime(0.45, now)
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5)

      subOsc.connect(subGain)
      subGain.connect(ctx.destination)
      subOsc.start(now)
      subOsc.stop(now + 2.6)

      // 2. Stage Door Hydraulic Release Hiss (0.1s - 1.2s)
      const bufferSize = ctx.sampleRate * 1.0
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1
      }
      const whiteNoise = ctx.createBufferSource()
      whiteNoise.buffer = noiseBuffer

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(1200, now)
      filter.frequency.exponentialRampToValueAtTime(350, now + 1.0)
      filter.Q.setValueAtTime(3.0, now)

      const hissGain = ctx.createGain()
      hissGain.gain.setValueAtTime(0.01, now)
      hissGain.gain.linearRampToValueAtTime(0.18, now + 0.15)
      hissGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1)

      whiteNoise.connect(filter)
      filter.connect(hissGain)
      hissGain.connect(ctx.destination)
      whiteNoise.start(now + 0.05)
      whiteNoise.stop(now + 1.2)

      // 3. Cinematic Dragon Tank Gong / Metallic Chime (0.6s - 3.2s)
      const harmonics = [220, 440, 659.25, 880]
      harmonics.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle'
        osc.frequency.setValueAtTime(freq, now + 0.5)

        const startVol = 0.15 / (idx + 1)
        g.gain.setValueAtTime(0.001, now)
        g.gain.linearRampToValueAtTime(startVol, now + 0.6)
        g.gain.exponentialRampToValueAtTime(0.0001, now + 3.0)

        osc.connect(g)
        g.connect(ctx.destination)
        osc.start(now + 0.5)
        osc.stop(now + 3.1)
      })

      // 4. Camera Shutter / Strobe Clicks (1.0s, 1.4s, 1.8s)
      const clickTimes = [0.9, 1.35, 1.8, 2.2]
      clickTimes.forEach((t) => {
        const clickOsc = ctx.createOscillator()
        const clickGain = ctx.createGain()
        clickOsc.type = 'square'
        clickOsc.frequency.setValueAtTime(1800, now + t)
        clickOsc.frequency.exponentialRampToValueAtTime(120, now + t + 0.04)

        clickGain.gain.setValueAtTime(0.08, now + t)
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.05)

        clickOsc.connect(clickGain)
        clickGain.connect(ctx.destination)
        clickOsc.start(now + t)
        clickOsc.stop(now + t + 0.06)
      })
    } catch (e) {
      console.warn('Red carpet audio synthesis fallback:', e)
    }
  }

  /**
   * Tension Gong for Dragon Out or Major Deal
   */
  public playTensionGong(type: 'out' | 'offer' | 'cheque', muted: boolean = false) {
    if (muted) return
    const ctx = this.getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type === 'out' ? 'sawtooth' : 'triangle'
      const baseFreq = type === 'out' ? 82.4 : type === 'offer' ? 329.6 : 440
      osc.frequency.setValueAtTime(baseFreq, now)
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + 1.5)

      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 1.9)
    } catch (e) {
      console.warn('Gong sound error:', e)
    }
  }
}

export const soundFx = new DragonTankSoundSynthesizer()
