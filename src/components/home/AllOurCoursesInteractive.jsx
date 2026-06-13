import { useEffect, useRef } from 'react'
import { LOGO_SRC } from '../../config'

/** Skills & course tags shown as interactive bubbles */
const LABELS = [
  'Java',
  'Python',
  'CCC',
  'OAV-ICT 6th-10th',
  'OAV-IT 11th-12th',
  '+2-IT Arts & Science',
  'Spoken English',
  'Spoken English Mastery',
  'DCA',
  'PGDCA',
  '\'O\' Level',
  'OS-CIT',
  'OS-CIT A',
  'OS-CIT A+',
  'MS-Office',
  'Tally',
  'AI Web Development',
  'AI Video Creation',
  'Custom GPT',
  'AI Vibe Coding',
]

/** Vibrant bubble palette — cycled per label */
const BUBBLE_PALETTE = [
  { light: '#818cf8', dark: '#4f46e5', stroke: '#4338ca' },
  { light: '#38bdf8', dark: '#0284c7', stroke: '#0369a1' },
  { light: '#34d399', dark: '#059669', stroke: '#047857' },
  { light: '#fbbf24', dark: '#d97706', stroke: '#b45309' },
  { light: '#f472b6', dark: '#db2777', stroke: '#be185d' },
  { light: '#a78bfa', dark: '#7c3aed', stroke: '#6d28d9' },
  { light: '#fb7185', dark: '#e11d48', stroke: '#be123c' },
  { light: '#2dd4bf', dark: '#0d9488', stroke: '#0f766e' },
  { light: '#60a5fa', dark: '#2563eb', stroke: '#1d4ed8' },
  { light: '#a3e635', dark: '#65a30d', stroke: '#4d7c0f' },
]

function bubbleTypography(label, ctx) {
  const words = label.split(' ')
  const fs =
    label.length > 18 ? 10 : label.length > 14 ? 11 : words.length > 2 ? 11 : words.length > 1 ? 12 : 13
  ctx.font = `700 ${fs}px system-ui, "Segoe UI", sans-serif`
  let maxW = 0
  for (const word of words) {
    maxW = Math.max(maxW, ctx.measureText(word).width)
  }
  const lineH = fs + 4
  const textH = words.length * lineH
  const pad = 16
  const r = Math.max(44, Math.ceil(Math.hypot(maxW, textH) / 2 + pad))
  return { fs, words, lineH, r }
}

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function AllOurCoursesInteractive() {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const pointerRef = useRef({ x: -9999, y: -9999, active: false })

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = prefersReducedMotion()

    let nodes = []
    let w = 0
    let h = 0
    let dpr = 1

    function layoutNodes() {
      const rect = wrap.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = Math.max(320, Math.floor(rect.width))
      h = Math.max(420, Math.min(680, Math.floor(rect.width * 0.42)))
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const cx = w / 2
      const cy = h / 2
      const n = LABELS.length
      nodes = LABELS.map((label, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2
        const ring = 0.35 + (i % 3) * 0.06
        const hx = cx + Math.cos(angle) * w * ring * 0.55
        const hy = cy + Math.sin(angle) * h * ring * 0.45
        const { fs, words, lineH, r } = bubbleTypography(label, ctx)
        const dir = Math.random() * Math.PI * 2
        const speed = 0.85 + Math.random() * 1.75
        return {
          label,
          x: hx,
          y: hy,
          hx,
          hy,
          vx: Math.cos(dir) * speed,
          vy: Math.sin(dir) * speed,
          r,
          fs,
          words,
          lineH,
          colors: BUBBLE_PALETTE[i % BUBBLE_PALETTE.length],
        }
      })
    }

    layoutNodes()

    const onResize = () => layoutNodes()
    window.addEventListener('resize', onResize)

    const setPointer = (clientX, clientY, active) => {
      const rect = canvas.getBoundingClientRect()
      pointerRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top,
        active,
      }
    }

    const onMove = (e) => setPointer(e.clientX, e.clientY, true)
    const onLeave = () => {
      pointerRef.current = { x: -9999, y: -9999, active: false }
    }
    const onTouch = (e) => {
      if (e.touches.length === 0) return
      const t = e.touches[0]
      setPointer(t.clientX, t.clientY, true)
    }
    const onTouchEnd = () => {
      pointerRef.current = { x: -9999, y: -9999, active: false }
    }

    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('pointerdown', onMove)
    canvas.addEventListener('touchstart', onTouch, { passive: true })
    canvas.addEventListener('touchmove', onTouch, { passive: true })
    canvas.addEventListener('touchend', onTouchEnd)

    const repelR = 175
    /** Squared falloff — strong push when cursor is close */
    const repelImpulse = 9.5
    const maxVel = 16
    const drag = 0.993
    const wander = 0.18
    const wallBounce = 0.9

    function drawFrame() {
      ctx.clearRect(0, 0, w, h)

      for (const node of nodes) {
        const { light, dark, stroke } = node.colors

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2)
        const grd = ctx.createRadialGradient(
          node.x - node.r * 0.35,
          node.y - node.r * 0.35,
          node.r * 0.05,
          node.x,
          node.y,
          node.r,
        )
        grd.addColorStop(0, light)
        grd.addColorStop(0.55, dark)
        grd.addColorStop(1, stroke)
        ctx.fillStyle = grd
        ctx.fill()
        ctx.strokeStyle = stroke
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.save()
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = `700 ${node.fs}px system-ui, "Segoe UI", sans-serif`
        ctx.shadowColor = 'rgba(15, 23, 42, 0.45)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetY = 1

        if (node.words.length > 1) {
          node.words.forEach((word, i) => {
            ctx.fillText(
              word,
              node.x,
              node.y + (i - (node.words.length - 1) / 2) * node.lineH,
            )
          })
        } else {
          ctx.fillText(node.label, node.x, node.y)
        }
        ctx.restore()
      }
    }

    function tick() {
      const p = pointerRef.current

      if (!reduced) {
        for (const node of nodes) {
          if (p.active) {
            const dx = node.x - p.x
            const dy = node.y - p.y
            const dist = Math.hypot(dx, dy) || 0.001
            if (dist < repelR) {
              const t = 1 - dist / repelR
              const imp = t * t * repelImpulse
              node.vx += (dx / dist) * imp
              node.vy += (dy / dist) * imp
            }
          }

          node.vx += (Math.random() - 0.5) * wander
          node.vy += (Math.random() - 0.5) * wander
          node.vx *= drag
          node.vy *= drag

          let sp = Math.hypot(node.vx, node.vy)
          if (sp > maxVel) {
            node.vx = (node.vx / sp) * maxVel
            node.vy = (node.vy / sp) * maxVel
          }

          node.x += node.vx
          node.y += node.vy

          if (node.x - node.r < 0) {
            node.x = node.r
            node.vx = -node.vx * wallBounce
          } else if (node.x + node.r > w) {
            node.x = w - node.r
            node.vx = -node.vx * wallBounce
          }
          if (node.y - node.r < 0) {
            node.y = node.r
            node.vy = -node.vy * wallBounce
          } else if (node.y + node.r > h) {
            node.y = h - node.r
            node.vy = -node.vy * wallBounce
          }
        }
      }

      drawFrame()
      rafRef.current = requestAnimationFrame(tick)
    }

    if (reduced) {
      drawFrame()
    } else {
      rafRef.current = requestAnimationFrame(tick)
    }

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('pointerdown', onMove)
      canvas.removeEventListener('touchstart', onTouch)
      canvas.removeEventListener('touchmove', onTouch)
      canvas.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50/90 via-white to-indigo-50/50 shadow-sm">
      <h2 className="px-4 pb-2 pt-6 text-center text-xl font-bold tracking-tight text-gray-900 sm:px-6 sm:pb-3 sm:text-2xl">
        Explore skills across our courses
      </h2>
      <div className="relative w-full overflow-hidden border-t border-primary-100/80 bg-white/40">
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-transparent"
          aria-hidden
        >
          <img
            src={LOGO_SRC}
            alt=""
            className="h-[min(48vw,300px)] w-auto max-w-[90%] object-contain opacity-[0.49] sm:h-[min(34vw,320px)]"
          />
        </div>
        <div ref={wrapRef} className="relative z-10 w-full">
          <canvas
            ref={canvasRef}
            className="block w-full cursor-crosshair touch-none select-none bg-transparent"
          />
        </div>
      </div>
    </div>
  )
}
