import { useEffect, useRef } from 'react'
import { LOGO_SRC } from '../../config'

const RESPAWN_MS = 100_000
const INITIAL_SPAWN_GAP_MS = 5_000
const LABELS = [
  'Python',
  'OAV-ICT 6th-10th',
  'OAV-IT 11th-12th',
  '+2-IT Arts & Science',
  'Spoken English Mastery',
  'DCA',
  'CCA',
  'PGDCA',
  '\'O\' Level',
  'OS-CIT',
  'OS-CIT A',
  'OS-CIT A+',
  'Tally',
  'AI Web Development',
  'AI Video Creation',
  'AI Vibe Coding',
]

/**
 * Bubble colors by course category — edit CATEGORY_COLORS to change hues.
 * Applied in layoutNodes() via colorsForLabel(); drawn in drawFrame() from node.colors.
 */
const CATEGORY_COLORS = {
  oav: { light: '#34d399', dark: '#059669', stroke: '#047857' },
  diploma: { light: '#fde047', dark: '#fbbf24', stroke: '#f59e1b' },
  osCit: { light: '#fbbf24', dark: '#d97706', stroke: '#b45309' },
  ai: { light: '#a78bfa', dark: '#7c3aed', stroke: '#6d28d9' },
  language: { light: '#f472b6', dark: '#db2777', stroke: '#be185d' },
  accounting: { light: '#38bdf8', dark: '#0284c7', stroke: '#0369a1' },
}

/** Map each bubble label to a category (same category → same color) */
const LABEL_CATEGORY = {
  'OAV-ICT 6th-10th': 'oav',
  'OAV-IT 11th-12th': 'oav',
  '+2-IT Arts & Science': 'oav',
  DCA: 'diploma',
  CCA: 'diploma',
  PGDCA: 'diploma',
  '\'O\' Level': 'diploma',
  'OS-CIT': 'osCit',
  'OS-CIT A': 'osCit',
  'OS-CIT A+': 'osCit',
  Tally: 'accounting',
  Python: 'ai',
  'AI Web Development': 'ai',
  'AI Video Creation': 'ai',
  'AI Vibe Coding': 'ai',
  'Spoken English Mastery': 'language',
}

function colorsForLabel(label) {
  const category = LABEL_CATEGORY[label] || 'diploma'
  return CATEGORY_COLORS[category]
}

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

function createNode(label, i, n, cx, cy, w, h, ctx) {
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
    colors: colorsForLabel(label),
    alive: true,
    respawnAt: 0,
    spawnScale: 1,
    wobble: Math.random() * Math.PI * 2,
  }
}

function spawnBurstParticles(particles, x, y, colors) {
  const { light, dark, stroke } = colors
  const palette = [light, dark, stroke, '#ffffff', '#fef08a', '#fbcfe8']

  for (let i = 0; i < 32; i++) {
    const angle = (i / 32) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
    const speed = 5 + Math.random() * 12
    particles.push({
      kind: 'dot',
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      r: 2.5 + Math.random() * 5,
      life: 1,
      decay: 0.012 + Math.random() * 0.018,
      color: palette[i % palette.length],
      gravity: 0.18,
      spin: (Math.random() - 0.5) * 0.3,
      rot: Math.random() * Math.PI * 2,
    })
  }

  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 8 + Math.random() * 14
    particles.push({
      kind: 'star',
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 4 + Math.random() * 5,
      life: 1,
      decay: 0.02 + Math.random() * 0.025,
      color: '#ffffff',
      gravity: 0.08,
      spin: (Math.random() - 0.5) * 0.45,
      rot: Math.random() * Math.PI * 2,
    })
  }

  particles.push({
    kind: 'ring',
    x,
    y,
    r: 8,
    maxR: 140,
    life: 1,
    decay: 0.035,
    color: light,
  })
  particles.push({
    kind: 'ring',
    x,
    y,
    r: 4,
    maxR: 90,
    life: 1,
    decay: 0.055,
    color: '#ffffff',
  })
}

function blastBubble(node, particles, nodes, now) {
  if (!node.alive) return
  node.alive = false
  node.respawnAt = now + RESPAWN_MS
  spawnBurstParticles(particles, node.x, node.y, node.colors)

  for (const other of nodes) {
    if (other === node || !other.alive) continue
    const dx = other.x - node.x
    const dy = other.y - node.y
    const dist = Math.hypot(dx, dy) || 0.001
    if (dist < 220) {
      const push = (1 - dist / 220) * 22
      other.vx += (dx / dist) * push
      other.vy += (dy / dist) * push
      other.wobble += 0.8
    }
  }
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
    let particles = []
    let w = 0
    let h = 0
    let dpr = 1
    let shake = 0
    let loadStartedAt = performance.now()

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
      loadStartedAt = performance.now()
      nodes = LABELS.map((label, i) => {
        const node = createNode(label, i, n, cx, cy, w, h, ctx)
        node.alive = false
        node.spawnScale = reduced ? 1 : 0
        node.respawnAt = loadStartedAt + i * INITIAL_SPAWN_GAP_MS
        return node
      })
      particles = []
    }

    layoutNodes()

    const onResize = () => layoutNodes()
    window.addEventListener('resize', onResize)

    const tryBlastAt = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top
      const now = performance.now()

      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i]
        if (!node.alive) continue
        if (Math.hypot(node.x - x, node.y - y) <= node.r) {
          if (reduced) {
            node.alive = false
            node.respawnAt = now + RESPAWN_MS
          } else {
            blastBubble(node, particles, nodes, now)
            shake = 6
          }
          return true
        }
      }
      return false
    }

    const setPointer = (clientX, clientY, active) => {
      const rect = canvas.getBoundingClientRect()
      pointerRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top,
        active,
      }
    }

    const onDown = (e) => {
      tryBlastAt(e.clientX, e.clientY)
      setPointer(e.clientX, e.clientY, true)
    }
    const onMove = (e) => setPointer(e.clientX, e.clientY, true)
    const onLeave = () => {
      pointerRef.current = { x: -9999, y: -9999, active: false }
    }
    const onTouch = (e) => {
      if (e.touches.length === 0) return
      const t = e.touches[0]
      tryBlastAt(t.clientX, t.clientY)
      setPointer(t.clientX, t.clientY, true)
    }
    const onTouchEnd = () => {
      pointerRef.current = { x: -9999, y: -9999, active: false }
    }

    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('pointerdown', onDown)
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

    function drawStar(x, y, r, rot) {
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const a = rot + (i * Math.PI * 2) / 5 - Math.PI / 2
        const b = rot + ((i + 0.5) * Math.PI * 2) / 5 - Math.PI / 2
        ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
        ctx.lineTo(x + Math.cos(b) * r * 0.42, y + Math.sin(b) * r * 0.42)
      }
      ctx.closePath()
    }

    function drawParticles() {
      for (const p of particles) {
        const alpha = Math.max(0, p.life)
        if (p.kind === 'ring') {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.strokeStyle = p.color
          ctx.globalAlpha = alpha * 0.85
          ctx.lineWidth = 2.5 * alpha + 0.5
          ctx.stroke()
          ctx.globalAlpha = 1
          continue
        }

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        if (p.kind === 'star') {
          drawStar(p.x, p.y, p.r * alpha, p.rot)
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r * (0.4 + alpha * 0.6), 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
    }

    function drawFrame() {
      ctx.save()
      if (shake > 0.2) {
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake)
        shake *= 0.82
      } else {
        shake = 0
      }
      ctx.clearRect(0, 0, w, h)

      for (const node of nodes) {
        if (!node.alive) continue

        const scale = node.spawnScale
        if (scale < 0.05) continue

        const drawR = node.r * scale
        const wobbleX = Math.sin(node.wobble) * 1.5 * scale
        const wobbleY = Math.cos(node.wobble * 1.3) * 1.5 * scale
        const bx = node.x + wobbleX
        const by = node.y + wobbleY
        const { light, dark, stroke } = node.colors

        ctx.beginPath()
        ctx.arc(bx, by, drawR, 0, Math.PI * 2)
        const grd = ctx.createRadialGradient(
          bx - drawR * 0.35,
          by - drawR * 0.35,
          drawR * 0.05,
          bx,
          by,
          drawR,
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
        ctx.font = `700 ${node.fs * scale}px system-ui, "Segoe UI", sans-serif`
        ctx.shadowColor = 'rgba(15, 23, 42, 0.45)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetY = 1

        if (node.words.length > 1) {
          node.words.forEach((word, i) => {
            ctx.fillText(
              word,
              bx,
              by + (i - (node.words.length - 1) / 2) * node.lineH * scale,
            )
          })
        } else {
          ctx.fillText(node.label, bx, by)
        }
        ctx.restore()
      }

      drawParticles()
      ctx.restore()
    }

    function updateParticles() {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life -= p.decay
        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }
        if (p.kind === 'ring') {
          p.r += (p.maxR - p.r) * 0.14
          continue
        }
        p.vy += p.gravity
        p.vx *= 0.985
        p.vy *= 0.985
        p.x += p.vx
        p.y += p.vy
        p.rot += p.spin
      }
    }

    function tick() {
      const p = pointerRef.current
      const now = performance.now()

      if (!reduced) {
        updateParticles()

        for (const node of nodes) {
          if (!node.alive) {
            if (now >= node.respawnAt) {
              node.alive = true
              node.spawnScale = 0
              node.x = node.hx + (Math.random() - 0.5) * 50
              node.y = node.hy + (Math.random() - 0.5) * 50
              const dir = Math.random() * Math.PI * 2
              node.vx = Math.cos(dir) * 2.5
              node.vy = Math.sin(dir) * 2.5
            }
            continue
          }

          if (node.spawnScale < 1) {
            node.spawnScale += (1 - node.spawnScale) * 0.14
            if (node.spawnScale > 0.995) node.spawnScale = 1
          }
          node.wobble += 0.04 + Math.hypot(node.vx, node.vy) * 0.008

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
      } else {
        for (const node of nodes) {
          if (!node.alive && now >= node.respawnAt) {
            node.alive = true
            node.spawnScale = 1
            node.x = node.hx
            node.y = node.hy
          }
        }
      }

      drawFrame()
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('touchstart', onTouch)
      canvas.removeEventListener('touchmove', onTouch)
      canvas.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50/90 via-white to-indigo-50/50 shadow-sm">
      <h2 className="px-4 pb-1 pt-6 text-center text-xl font-bold tracking-tight text-gray-900 sm:px-6 sm:pt-6 sm:text-2xl">
        Explore skills across our courses
      </h2>
      <p className="px-4 pb-2 text-center text-sm text-primary-700/90 sm:px-6">
        Tap or click a bubble to pop it — they grow back!
      </p>
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
            className="block w-full cursor-pointer touch-none select-none bg-transparent"
          />
        </div>
      </div>
    </div>
  )
}
