import { useRef, useEffect, useState } from 'react'
import styles from './OscilloscopeScreen.module.css'

// CRT phosphor colors
const CRT = {
  bg        : '#000d00',
  grid      : 'rgba(0,255,65,0.08)',
  gridBright: 'rgba(0,255,65,0.15)',
  wave      : '#00ff41',
  waveDim   : 'rgba(0,255,65,0.25)',
  waveGlow  : 'rgba(0,255,65,0.08)',
  spectrum  : '#00c030',
  text      : 'rgba(0,255,65,0.75)',
  textBright: '#00ff41',
}

export default function OscilloscopeScreen({ analyzer }) {
  const canvasRef  = useRef()
  const [subMode, setSubMode] = useState('wave') // 'wave' | 'lissajous' | 'spectrum3d'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !analyzer) return

    const ctx = canvas.getContext('2d')
    const FFT = 2048

    // Separate arrays for waveform and frequency
    const timeDomain = new Uint8Array(FFT)
    const freqDomain = new Uint8Array(FFT)

    let raf
    let phase = 0 // phosphor persistence phase

    function resize() {
      canvas.width  = canvas.clientWidth  * window.devicePixelRatio
      canvas.height = canvas.clientHeight * window.devicePixelRatio
    }
    resize()
    window.addEventListener('resize', resize)

    function drawGrid(w, h) {
      const cols = 10, rows = 8
      ctx.strokeStyle = CRT.grid
      ctx.lineWidth   = 0.5

      for (let i = 0; i <= cols; i++) {
        const x = (w / cols) * i
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        // Brighter on center
        ctx.strokeStyle = (i === cols / 2) ? CRT.gridBright : CRT.grid
        ctx.stroke()
      }
      for (let j = 0; j <= rows; j++) {
        const y = (h / rows) * j
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.strokeStyle = (j === rows / 2) ? CRT.gridBright : CRT.grid
        ctx.stroke()
      }

      // Tick marks
      ctx.strokeStyle = CRT.grid
      ctx.lineWidth = 0.5
      for (let i = 0; i <= cols * 5; i++) {
        const x = (w / (cols * 5)) * i
        ctx.beginPath()
        ctx.moveTo(x, h / 2 - 4)
        ctx.lineTo(x, h / 2 + 4)
        ctx.stroke()
      }
    }

    function drawWaveform(w, h) {
      if (!analyzer.analyser) return
      analyzer.analyser.getByteTimeDomainData(timeDomain)
      analyzer.analyser.getByteFrequencyData(freqDomain)

      const sliceW = w / FFT
      const midY   = h * 0.45 // waveform zone (top 55%)
      const specH  = h * 0.22 // spectrum zone height
      const specY  = h * 0.72 // spectrum zone top

      // ── Waveform (time domain) ──────────────────────
      // Multi-pass glow: outer → inner
      const passes = [
        { color: CRT.waveGlow, lw: 12, alpha: 0.06 },
        { color: CRT.waveDim,  lw: 6,  alpha: 0.18 },
        { color: CRT.wave,     lw: 1.8,alpha: 1.0  },
      ]

      passes.forEach(pass => {
        ctx.beginPath()
        ctx.strokeStyle = pass.color
        ctx.lineWidth   = pass.lw
        ctx.globalAlpha = pass.alpha
        ctx.shadowBlur  = pass.lw * 3
        ctx.shadowColor = CRT.wave

        for (let i = 0; i < FFT; i++) {
          const v = (timeDomain[i] / 128.0) - 1.0
          const x = sliceW * i
          const y = midY + v * midY * 0.85
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()
      })
      ctx.globalAlpha = 1
      ctx.shadowBlur  = 0

      // ── Spectrum bars (frequency domain) ───────────
      const barCount = 64
      const barW     = w / barCount
      const padding  = barW * 0.15

      for (let i = 0; i < barCount; i++) {
        // Map bar index to FFT bin (logarithmic)
        const logPos  = Math.pow(i / barCount, 1.5)
        const binIdx  = Math.floor(logPos * (FFT / 2))
        const val     = freqDomain[Math.min(binIdx, FFT - 1)] / 255

        const barH = val * specH
        const x    = i * barW + padding / 2
        const y    = specY + specH - barH

        // Bar gradient: dim at bottom, bright at top
        const grad = ctx.createLinearGradient(x, y + barH, x, y)
        grad.addColorStop(0, 'rgba(0,192,48,0.4)')
        grad.addColorStop(0.6, CRT.spectrum)
        grad.addColorStop(1.0, CRT.textBright)
        ctx.fillStyle = grad

        // Glow on tall bars
        if (val > 0.6) {
          ctx.shadowBlur  = 8
          ctx.shadowColor = CRT.wave
        } else {
          ctx.shadowBlur = 0
        }

        ctx.fillRect(x, y, barW - padding, barH)

        // Peak dot
        if (val > 0.05) {
          ctx.fillStyle = CRT.textBright
          ctx.fillRect(x, y - 2, barW - padding, 1.5)
        }
      }
      ctx.shadowBlur = 0
    }

    function drawLissajous(w, h) {
      if (!analyzer.analyser) return
      analyzer.analyser.getByteTimeDomainData(timeDomain)

      const cx = w / 2
      const cy = h / 2
      const r  = Math.min(w, h) * 0.38

      // Draw XY using first half as X, second as Y (simulated stereo)
      const halfFFT = FFT / 2

      const passes = [
        { color: CRT.waveGlow, lw: 10, alpha: 0.06 },
        { color: CRT.waveDim,  lw: 4,  alpha: 0.22 },
        { color: CRT.wave,     lw: 1.5,alpha: 1.0  },
      ]

      passes.forEach(pass => {
        ctx.beginPath()
        ctx.strokeStyle = pass.color
        ctx.lineWidth   = pass.lw
        ctx.globalAlpha = pass.alpha

        for (let i = 0; i < halfFFT; i++) {
          // Use interleaved samples as pseudo L/R channels
          const xv = (timeDomain[i * 2]     / 128.0 - 1.0)
          const yv = (timeDomain[i * 2 + 1] / 128.0 - 1.0)
          const px = cx + xv * r
          const py = cy + yv * r

          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
        }
        // Close the loop
        const x0 = (timeDomain[0] / 128 - 1) * r + cx
        const y0 = (timeDomain[1] / 128 - 1) * r + cy
        ctx.lineTo(x0, y0)
        ctx.stroke()
      })
      ctx.globalAlpha = 1
    }

    function drawHUD(w, h) {
      ctx.font      = `${Math.round(h * 0.022)}px 'Courier New', monospace`
      ctx.fillStyle = CRT.text

      // Top left
      ctx.fillText('◉ OSCILLOSCOPE  v1.0', w * 0.03, h * 0.06)

      // BPM
      const bpm = analyzer.bpm > 30 ? `${analyzer.bpm} BPM` : '-- BPM'
      ctx.fillText(bpm, w * 0.03, h * 0.12)

      // Amplitude
      const amp = (analyzer.amplitude * 100).toFixed(1)
      ctx.fillText(`AMP  ${amp}%`, w * 0.03, h * 0.18)

      // Mode label top right
      ctx.textAlign = 'right'
      ctx.fillStyle = CRT.textBright
      const label = subMode === 'lissajous' ? 'XY MODE' : 'TIME DOMAIN'
      ctx.fillText(label, w * 0.97, h * 0.06)

      // Spectrum label
      ctx.fillStyle = CRT.text
      ctx.fillText('FREQ SPECTRUM', w * 0.97, h * 0.74)
      ctx.textAlign = 'left'

      // Divider line
      ctx.strokeStyle = CRT.gridBright
      ctx.lineWidth   = 0.5
      ctx.beginPath()
      ctx.moveTo(w * 0.03, h * 0.68)
      ctx.lineTo(w * 0.97, h * 0.68)
      ctx.stroke()
    }

    function drawScanlines(w, h) {
      ctx.globalAlpha = 0.07
      const lineH = Math.max(1, h / 280)
      for (let y = 0; y < h; y += lineH * 2) {
        ctx.fillStyle = '#000'
        ctx.fillRect(0, y, w, lineH)
      }
      ctx.globalAlpha = 1

      // Vignette
      const vign = ctx.createRadialGradient(w/2, h/2, h*0.2, w/2, h/2, h*0.8)
      vign.addColorStop(0, 'transparent')
      vign.addColorStop(1, 'rgba(0,0,0,0.55)')
      ctx.fillStyle = vign
      ctx.fillRect(0, 0, w, h)
    }

    function draw() {
      const w = canvas.width
      const h = canvas.height

      // Background with phosphor trail
      ctx.fillStyle = 'rgba(0,13,0,0.88)'
      ctx.fillRect(0, 0, w, h)

      drawGrid(w, h)

      if (subMode === 'lissajous') {
        drawLissajous(w, h)
      } else {
        drawWaveform(w, h)
      }

      drawHUD(w, h)
      drawScanlines(w, h)

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [analyzer, subMode])

  return (
    <div className={styles.root}>
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* Mode toggle */}
      <div className={styles.modeBar}>
        <button
          className={`${styles.modeBtn} ${subMode === 'wave' ? styles.active : ''}`}
          onClick={() => setSubMode('wave')}
        >
          WAVE
        </button>
        <button
          className={`${styles.modeBtn} ${subMode === 'lissajous' ? styles.active : ''}`}
          onClick={() => setSubMode('lissajous')}
        >
          XY
        </button>
      </div>
    </div>
  )
}
