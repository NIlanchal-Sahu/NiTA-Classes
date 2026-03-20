import { Router } from 'express'
import { verifyToken, getUsers, saveUsers } from '../auth.js'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, writeFileSync, existsSync } from 'fs'

const router = Router()
const __dirname = dirname(fileURLToPath(import.meta.url))
const ENROLLMENTS_PATH = join(__dirname, '..', 'data', 'enrollments.json')

function studentAdminAuth(req, res, next) {
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
  const raw = readFileSync(path, 'utf8') || '[]'
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8')
}

router.get('/', studentAdminAuth, (req, res) => {
  const list = loadJson(ENROLLMENTS_PATH)
  res.json({ enrollments: list.slice().reverse() })
})

router.post('/', studentAdminAuth, (req, res) => {
  const { name, mobile, course, school, referralCode } = req.body || {}
  if (!name || !mobile || !course) return res.status(400).json({ error: 'name, mobile, course are required' })
  const list = loadJson(ENROLLMENTS_PATH)
  const next = {
    id: `enroll-${Date.now()}`,
    name: String(name),
    mobile: String(mobile),
    course: String(course),
    school: school ? String(school) : '',
    referralCode: referralCode ? String(referralCode).trim().toUpperCase() : '',
    createdAt: new Date().toISOString(),
  }
  list.push(next)
  saveJson(ENROLLMENTS_PATH, list)
  res.json({ success: true, enrollment: next })
})

export default router

