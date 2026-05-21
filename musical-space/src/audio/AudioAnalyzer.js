/* ─── Audio Analyzer ──────────────────────────────────────────
   Wraps Web Audio API: FFT analysis, band energy extraction,
   BPM onset detection, and RMS amplitude.
──────────────────────────────────────────────────────────────── */

const SMOOTHING = 0.82
const FFT_SIZE  = 2048

// Frequency bands (Hz)
const BANDS = {
  subBass : { min: 20,   max: 80   },
  bass    : { min: 80,   max: 250  },
  lowMids : { min: 250,  max: 500  },
  mids    : { min: 500,  max: 2000 },
  highs   : { min: 2000, max: 8000 },
  presence: { min: 8000, max: 20000},
}

// Exponential moving average
function ema(prev, next, alpha = 0.3) {
  return prev + alpha * (next - prev)
}

export class AudioAnalyzer {
  constructor() {
    this.ctx       = null
    this.analyser  = null
    this.source    = null
    this.audio     = null
    this.dataArray = null
    this.binCount  = 0
    this.sampleRate = 44100

    // Smoothed band values (0.0–1.0)
    this.bands = {
      subBass : 0,
      bass    : 0,
      lowMids : 0,
      mids    : 0,
      highs   : 0,
      presence: 0,
    }
    this.amplitude = 0  // RMS amplitude
    this.bpm       = 0

    // BPM detection
    this._bpmHistory    = []
    this._lastBeat      = 0
    this._prevSubBass   = 0
    this._bpmSmoothed   = 0
  }

  async load(file) {
    // Create audio context on user gesture
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    this.ctx = new AudioCtx()

    this.analyser              = this.ctx.createAnalyser()
    this.analyser.fftSize      = FFT_SIZE
    this.analyser.smoothingTimeConstant = SMOOTHING

    this.audio    = new Audio()
    this.audio.src = URL.createObjectURL(file)
    this.audio.loop = true

    this.source = this.ctx.createMediaElementSource(this.audio)
    this.source.connect(this.analyser)
    this.analyser.connect(this.ctx.destination)

    this.binCount  = this.analyser.frequencyBinCount
    this.dataArray = new Uint8Array(this.binCount)
    this.sampleRate = this.ctx.sampleRate

    await this.audio.play()
  }

  // Convert Hz to FFT bin index
  _hzToBin(hz) {
    return Math.round(hz / (this.sampleRate / FFT_SIZE))
  }

  // Average energy in a frequency range, normalized 0–1
  _bandEnergy(minHz, maxHz) {
    const lo  = Math.max(0, this._hzToBin(minHz))
    const hi  = Math.min(this.binCount - 1, this._hzToBin(maxHz))
    if (lo >= hi) return 0
    let sum = 0
    for (let i = lo; i <= hi; i++) sum += this.dataArray[i]
    return (sum / ((hi - lo + 1) * 255))
  }

  // RMS amplitude
  _rms() {
    let sum = 0
    for (let i = 0; i < this.binCount; i++) {
      const v = this.dataArray[i] / 255
      sum += v * v
    }
    return Math.sqrt(sum / this.binCount)
  }

  // Simple onset-based BPM detection
  _detectBPM(subBassRaw) {
    const now = performance.now()
    const threshold = 0.18

    // Detect onset: subBass jumps up significantly
    if (subBassRaw > threshold && this._prevSubBass <= threshold) {
      if (this._lastBeat > 0) {
        const interval = now - this._lastBeat
        if (interval > 200 && interval < 2000) { // 30–300 BPM
          this._bpmHistory.push(60000 / interval)
          if (this._bpmHistory.length > 8) this._bpmHistory.shift()
          const avg = this._bpmHistory.reduce((a, b) => a + b, 0) / this._bpmHistory.length
          this._bpmSmoothed = ema(this._bpmSmoothed, avg, 0.15)
        }
      }
      this._lastBeat = now
    }
    this._prevSubBass = subBassRaw
    this.bpm = Math.round(this._bpmSmoothed) || 0
  }

  // Call every animation frame
  update() {
    if (!this.analyser) return
    this.analyser.getByteFrequencyData(this.dataArray)

    // Raw band energies
    const raw = {
      subBass : this._bandEnergy(BANDS.subBass.min,  BANDS.subBass.max),
      bass    : this._bandEnergy(BANDS.bass.min,     BANDS.bass.max),
      lowMids : this._bandEnergy(BANDS.lowMids.min,  BANDS.lowMids.max),
      mids    : this._bandEnergy(BANDS.mids.min,     BANDS.mids.max),
      highs   : this._bandEnergy(BANDS.highs.min,    BANDS.highs.max),
      presence: this._bandEnergy(BANDS.presence.min, BANDS.presence.max),
    }

    // Smooth all bands
    for (const key of Object.keys(this.bands)) {
      this.bands[key] = ema(this.bands[key], raw[key], 0.25)
    }

    this.amplitude = ema(this.amplitude, this._rms(), 0.2)
    this._detectBPM(raw.subBass)
  }

  destroy() {
    this.audio?.pause()
    this.source?.disconnect()
    this.analyser?.disconnect()
    this.ctx?.close()
  }

  get fileName() {
    return this.audio?.src ? decodeURIComponent(this.audio.src.split('/').pop()) : ''
  }
}
