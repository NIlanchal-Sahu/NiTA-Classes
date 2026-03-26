import { Router } from 'express'
import { verifyToken } from '../auth.js'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readJsonSync, writeJsonSync } from '../services/sheetsJsonStore.js'

const router = Router()

const __dirname = dirname(fileURLToPath(import.meta.url))
const BATCHES_PATH = join(__dirname, '..', 'data', 'batches.json')

function adminAuth(req, res, next) {
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token' })
  if (payload.role !== 'admin') return res.status(403).json({ error: 'Admin access only' })
  req.auth = payload
  next()
}

function loadJson() {
  return readJsonSync(BATCHES_PATH, [])
}

function saveJson(data) {
  writeJsonSync(BATCHES_PATH, data)
}

// Batch schema (MVP):
// { id, courseId, className, startDate, time, timezone, whatsappGroupLink, createdAt }
router.get('/', adminAuth, (_req, res) => {
  res.json({ batches: loadJson().slice().reverse() })
})

router.post('/', adminAuth, (req, res) => {
  const { courseId, className, startDate, time, timezone, whatsappGroupLink } = req.body || {}
  if (!courseId || !className || !startDate) {
    return res.status(400).json({ error: 'courseId, className, startDate are required' })
  }
  const list = loadJson()
  const next = {
    id: `batch-${Date.now()}`,
    courseId: String(courseId),
    className: String(className),
    startDate: String(startDate).slice(0, 10),
    time: time ? String(time) : '',
    timezone: timezone ? String(timezone) : '',
    whatsappGroupLink: whatsappGroupLink ? String(whatsappGroupLink) : '',
    createdAt: new Date().toISOString(),
  }
  list.push(next)
  saveJson(list)
  res.json({ success: true, batch: next })
})

export default router

