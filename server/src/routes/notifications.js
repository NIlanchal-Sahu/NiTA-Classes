import { Router } from 'express'
import { verifyToken } from '../auth.js'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readJsonSync, writeJsonSync } from '../services/sheetsJsonStore.js'

const router = Router()

const __dirname = dirname(fileURLToPath(import.meta.url))
const NOTIFICATIONS_PATH = join(__dirname, '..', 'data', 'notifications.json')
const STUDENT_NOTIFICATIONS_PATH = join(__dirname, '..', 'data', 'student_notifications.json')
const USERS_PATH = join(__dirname, '..', 'data', 'users.json')
const STUDENTS_PATH = join(__dirname, '..', 'data', 'students.json')
const BATCHES_PATH = join(__dirname, '..', 'data', 'academy_batches.json')
const ENROLLMENTS_PATH = join(__dirname, '..', 'data', 'student_enrollments.json')

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
  return readJsonSync(NOTIFICATIONS_PATH, [])
}

function saveJson(data) {
  writeJsonSync(NOTIFICATIONS_PATH, data)
}

function normCourseId(id) {
  return String(id || '').trim().toLowerCase()
}

function pushPortalNotificationsForAdminBroadcast({ title, message, courseId, batchId, sendTo }) {
  const users = readJsonSync(USERS_PATH, [])
  const students = readJsonSync(STUDENTS_PATH, [])
  const batches = readJsonSync(BATCHES_PATH, [])
  const enrollments = readJsonSync(ENROLLMENTS_PATH, [])
  const stuRows = readJsonSync(STUDENT_NOTIFICATIONS_PATH, [])
  const cid = courseId ? normCourseId(courseId) : ''
  const bid = batchId ? String(batchId) : ''
  const st = sendTo ? String(sendTo) : 'all-students'

  const text = [title, message].filter(Boolean).join('\n\n')
  let targets = new Set()

  if (st === 'all-students') {
    for (const u of users) {
      if (u.role === 'student' && u.id) targets.add(u.id)
    }
  } else if (st === 'course' && cid) {
    for (const e of enrollments) {
      if (normCourseId(e.courseId) !== cid) continue
      const stu = students.find((s) => s.id === e.studentId)
      if (stu?.accountUserId) targets.add(stu.accountUserId)
    }
    for (const b of batches) {
      if (normCourseId(b.courseId) !== cid) continue
      for (const sid of b.studentIds || []) {
        const stu = students.find((x) => x.id === sid)
        if (stu?.accountUserId) targets.add(stu.accountUserId)
      }
    }
  }

  if (bid) {
    const b = batches.find((x) => String(x.id) === bid)
    const allowed = new Set()
    for (const sid of b?.studentIds || []) {
      const stu = students.find((x) => x.id === sid)
      if (stu?.accountUserId) allowed.add(stu.accountUserId)
    }
    targets = new Set([...targets].filter((uid) => allowed.has(uid)))
  }

  const now = new Date().toISOString()
  for (const userId of targets) {
    stuRows.push({
      id: `stu-notif-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      userId,
      title: String(title || ''),
      message: text,
      read: false,
      popup: true,
      fromAdmin: true,
      type: 'admin_broadcast',
      createdAt: now,
    })
  }
  writeJsonSync(STUDENT_NOTIFICATIONS_PATH, stuRows)
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
  try {
    pushPortalNotificationsForAdminBroadcast({ title, message, courseId, batchId, sendTo })
  } catch (e) {
    console.warn('[notifications] student portal push failed:', e.message)
  }
  res.json({ success: true, notification: next })
})

export default router

