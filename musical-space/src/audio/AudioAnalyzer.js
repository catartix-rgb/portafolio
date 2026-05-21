/* ─── Audio Analyzer ──────────────────────────────────────────
   Web Audio API: FFT analysis, band energy, BPM onset detection.
──────────────────────────────────────────────────────────────── */

const SMOOTHING = 0.82
const FFT_SIZE  = 2048

function ema(prev, next, alpha = 0.3) {
  return prev + alpha * (next - prev)
}

export class AudioAnalyzer {
  constructor() {
    this.ctx        = null
    this.analyser   = null
    this.source     = null
    this.audio      = null
    this.dataArray  = null
    this.binCount   = 0
    this.sampleRate = 44100
    this._isPlaying = false
    this._volume    = 0.8

    this.bands = {
      subBass : 0, bass  : 0, lowMids  : 0,
      mids    : 0, highs : 0, presence : 0,
    }
    this.amplitude   = 0
    this.bpm         = 0
    this._bpmHistory = []
    this._lastBeat   = 0
    this._prevSub    = 0
    this._bpmSmooth  = 0
  }

  async load(file) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    this.ctx = new AudioCtx()

    // Resume immediately — must happen close to user gesture
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }

    this.analyser                    = this.ctx.createAnalyser()
    this.analyser.fftSize            = FFT_SIZE
    this.analyser.smoothingTimeConstant = SMOOTHING

    // Volume node so we can control it independently
    this.gainNode = this.ctx.createGain()
    this.gainNode.gain.value = this._volume

    this.audio        = new Audio()
    this.audio.loop   = true
    this.audio.volume = 1.0 // gain node handles volume
    this.audio.src    = URL.createObjectURL(file)

    // Connect graph: source → analyser → gainNode → destination
    this.source = this.ctx.createMediaElementSource(this.audio)
    this.source.connect(this.analyser)
    this.analyser.connect(this.gainNode)
    this.gainNode.connect(this.ctx.destination)

    this.binCount  = this.analyser.frequencyBinCount
    this.dataArray = new Uint8Array(this.binCount)
    this.sampleRate = this.ctx.sampleRate

    await this.audio.play()
    this._isPlaying = true
  }

  // ── Controls ───────────────────────────────────────────────
  async togglePlay() {
    if (!this.audio) return
    if (this.audio.paused) {
      if (this.ctx?.state === 'suspended') await this.ctx.resume()
      await this.audio.play()
      this._isPlaying = true
    } else {
      this.audio.pause()
      this._isPlaying = false
    }
  }

  setVolume(v) {
    this._volume = Math.max(0, Math.min(1, v))
    if (this.gainNode) this.gainNode.gain.value = this._volume
  }

  get isPlaying()  { return !!(this.audio && !this.audio.paused) }
  get volume()     { return this._volume }
  get fileName()   {
    if (!this.audio?.src) return ''
    try {
      return decodeURIComponent(this.audio.src.split('/').pop()).replace(/\?.*$/, '')
    } catch { return '' }
  }

  // ── Analysis ───────────────────────────────────────────────
  _hzToBin(hz) {
    return Math.round(hz / (this.sampleRate / FFT_SIZE))
  }

  _bandEnergy(minHz, maxHz) {
    const lo = Math.max(0, this._hzToBin(minHz))
    const hi = Math.min(this.binCount - 1, this._hzToBin(maxHz))
    if (lo >= hi) return 0
    let sum = 0
    for (let i = lo; i <= hi; i++) sum += this.dataArray[i]
    return sum / ((hi - lo + 1) * 255)
  }

  _rms() {
    let sum = 0
    for (let i = 0; i < this.binCount; i++) {
      const v = this.dataArray[i] / 255
      sum += v * v
    }
    return Math.sqrt(sum / this.binCount)
  }

  _detectBPM(subBassRaw) {
    const now = performance.now()
    const thr = 0.18
    if (subBassRaw > thr && this._prevSub <= thr) {
      if (this._lastBeat > 0) {
        const iv = now - this._lastBeat
        if (iv > 200 && iv < 2000) {
          this._bpmHistory.push(60000 / iv)
          if (this._bpmHistory.length > 8) this._bpmHistory.shift()
          const avg = this._bpmHistory.reduce((a, b) => a + b, 0) / this._bpmHistory.length
          this._bpmSmooth = ema(this._bpmSmooth, avg, 0.15)
        }
      }
      this._lastBeat = now
    }
    this._prevSub = subBassRaw
    this.bpm = Math.round(this._bpmSmooth) || 0
  }

  update() {
    if (!this.analyser || !this.audio || this.audio.paused) return
    this.analyser.getByteFrequencyData(this.dataArray)

    const raw = {
      subBass : this._bandEnergy(20,   80),
      bass    : this._bandEnergy(80,   250),
      lowMids : this._bandEnergy(250,  500),
      mids    : this._bandEnergy(500,  2000),
      highs   : this._bandEnergy(2000, 8000),
      presence: this._bandEnergy(8000, 20000),
    }

    for (const k of Object.keys(this.bands)) {
      this.bands[k] = ema(this.bands[k], raw[k], 0.25)
    }
    this.amplitude = ema(this.amplitude, this._rms(), 0.2)
    this._detectBPM(raw.subBass)
  }

  destroy() {
    this.audio?.pause()
    if (this.audio?.src) URL.revokeObjectURL(this.audio.src)
    this.source?.disconnect()
    this.gainNode?.disconnect()
    this.analyser?.disconnect()
    this.ctx?.close()
  }
}
