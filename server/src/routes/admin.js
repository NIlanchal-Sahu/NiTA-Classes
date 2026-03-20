import { Router } from 'express'
import { verifyToken, getUserById, getUsers, saveUsers } from '../auth.js'
import { getAttendanceFor, getAttendanceFor as _getAttendanceFor } from '../student.js'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const router = Router()

const __dirname = dirname(fileURLToPath(import.meta.url))
const ATTENDANCE_PATH = join(__dirname, '..', 'data', 'attendance.json')
const USERS_PATH = join(__dirname, '..', 'data', 'users.json')
const COURSES_PATH = join(__dirname, '..', 'data', 'courses.json')

const studentAuth = (req, res, next) => {
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token' })
  if (payload.role !== 'admin') return res.status(403).json({ error: 'Admin access only' })
  req.auth = payload
  next()
}

function loadJson(path) {
  if (!existsSync(path)) return []
  return JSON.parse(readFileSync(path, 'utf8'))
}

function parseDateKey(d) {
  if (!d) return null
  // expect YYYY-MM-DD
  return String(d).slice(0, 10)
}

function computeRange(range) {
  const now = new Date()
  const end = now.toISOString().slice(0, 10)
  let start = end
  if (range === 'daily') start = end
  if (range === 'weekly') start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  if (range === 'monthly') start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  return { start, end }
}

function sumRevenue(attendanceRecords) {
  // Revenue model: ₹10 per class paid unless VVIP paid info exists (attendance does not store it).
  // For this MVP admin dashboard, we compute using classesCount * 10.
  const sum = attendanceRecords.reduce((acc, r) => acc + (Number(r.classesCount) || 0), 0)
  return sum * 10
}

router.get('/me', studentAuth, (req, res) => {
  const user = getUserById(req.auth.userId)
  res.json({ user: { id: user?.id, email: user?.email, role: user?.role, name: user?.name } })
})

router.get('/students', studentAuth, (req, res) => {
  const users = loadJson(USERS_PATH)
  const students = users.filter((u) => u.role === 'student').map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    walletBalance: Number(u.walletBalance) || 0,
    totalClassesAttended: Number(u.totalClassesAttended) || 0,
    vvipValidUntil: u.vvipValidUntil || null,
  }))
  res.json({ students })
})

router.get('/attendance-stats', studentAuth, (req, res) => {
  const range = req.query.range || 'weekly'
  const { start, end } = computeRange(range)
  const records = loadJson(ATTENDANCE_PATH)
  const filtered = records.filter((r) => r.date >= start && r.date <= end)

  const totalClasses = filtered.reduce((acc, r) => acc + (Number(r.classesCount) || 0), 0)
  const revenue = sumRevenue(filtered)

  // Group by day
  const byDate = {}
  for (const r of filtered) {
    byDate[r.date] = (byDate[r.date] || 0) + (Number(r.classesCount) || 0)
  }

  res.json({ range, start, end, totalClasses, revenue, byDate })
})

router.get('/revenue', studentAuth, (req, res) => {
  const range = req.query.range || 'weekly'
  const { start, end } = computeRange(range)
  const records = loadJson(ATTENDANCE_PATH)
  const filtered = records.filter((r) => r.date >= start && r.date <= end)

  const revenue = sumRevenue(filtered)
  res.json({ range, start, end, revenue })
})

router.get('/courses', studentAuth, (req, res) => {
  const courses = loadJson(COURSES_PATH)
  res.json({ courses })
})

// Enrollments: currently stored in Google Sheet only (FORM_ENDPOINT).
// In this MVP we return empty list; hook can be added later.
router.get('/enrollments', studentAuth, (_req, res) => {
  res.json({ enrollments: [] })
})

export default router

