import { Router } from 'express'
import { verifyToken } from '../auth.js'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, writeFileSync, existsSync } from 'fs'

const router = Router()

const __dirname = dirname(fileURLToPath(import.meta.url))
const NOTIFICATIONS_PATH = join(__dirname, '..', 'data', 'notifications.json')

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
  if (!existsSync(NOTIFICATIONS_PATH)) return []
  try {
    return JSON.parse(readFileSync(NOTIFICATIONS_PATH, 'utf8') || '[]')
  } catch {
    return []
  }
}

function saveJson(data) {
  writeFileSync(NOTIFICATIONS_PATH, JSON.stringify(data, null, 2), 'utf8')
}

// MVP: admin can queue a notification (WhatsApp message template).
// Fields:
// { id, title, message, courseId?, batchId?, createdAt, sendTo: 'all-students'|'course' }
router.get('/', adminAuth, (_req, res) => {
  res.json({ notifications: loadJson().slice().reverse() })
})

router.post('/', adminAuth, (req, res) => {
  const { title, message, courseId, batchId, sendTo } = req.body || {}
  if (!title || !message) return res.status(400).json({ error: 'title and message required' })
  const list = loadJson()
  const next = {
    id: `note-${Date.now()}`,
    title: String(title),
    message: String(message),
    courseId: courseId ? String(courseId) : '',
    batchId: batchId ? String(batchId) : '',
    sendTo: sendTo ? String(sendTo) : 'all-students',
    createdAt: new Date().toISOString(),
    status: 'queued',
  }
  list.push(next)
  saveJson(list)
  res.json({ success: true, notification: next })
})

export default router

