import { Router } from 'express'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, writeFileSync, existsSync } from 'fs'

const router = Router()
const __dirname = dirname(fileURLToPath(import.meta.url))
const ENROLLMENTS_PATH = join(__dirname, '..', 'data', 'enrollments.json')

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

function normalizeMobile(input) {
  return String(input || '').replace(/\D/g, '').slice(-10)
}

router.post('/', (req, res) => {
  const { name, mobile, course, school, referralCode } = req.body || {}
  if (!name || !mobile || !course) return res.status(400).json({ error: 'name, mobile, course are required' })
  const list = loadJson(ENROLLMENTS_PATH)
  const next = {
    id: `enroll-${Date.now()}`,
    name: String(name).trim(),
    mobile: normalizeMobile(mobile),
    course: String(course).trim(),
    school: school ? String(school).trim() : '',
    referralCode: referralCode ? String(referralCode).trim().toUpperCase() : '',
    createdAt: new Date().toISOString(),
  }
  list.push(next)
  saveJson(ENROLLMENTS_PATH, list)
  res.json({ success: true, enrollment: next })
})

export default router

