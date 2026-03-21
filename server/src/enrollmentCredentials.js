import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STUDENTS_PATH = join(__dirname, 'data', 'students.json')

export function normalizePhoneDigits(input) {
  return String(input || '')
    .replace(/\D/g, '')
    .slice(-10)
}

/** Default LMS password: NITA@ + last 4 digits of phone */
export function defaultPasswordFromPhone(phone) {
  const d = normalizePhoneDigits(phone)
  const last4 = d.slice(-4) || '0000'
  return `NITA@${last4}`
}

function loadStudentIds() {
  if (!existsSync(STUDENTS_PATH)) return []
  try {
    const list = JSON.parse(readFileSync(STUDENTS_PATH, 'utf8') || '[]')
    return Array.isArray(list) ? list.map((s) => s.id).filter(Boolean) : []
  } catch {
    return []
  }
}

/**
 * Primary-key style unique ID:
 * NITA + YYYYMMDD + 6-char entropy (millis+random base36, uppercased).
 * Example: NITA20260321AB12CD
 */
export function generateNitaStudentId(existingUserStudentIds = []) {
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const prefix = `NITA${ymd}`
  const fromStudents = loadStudentIds()
  const ids = new Set([...existingUserStudentIds, ...fromStudents].filter(Boolean))
  let candidate = ''
  let guard = 0
  do {
    const entropy = (Date.now().toString(36) + Math.random().toString(36).slice(2))
      .slice(-6)
      .toUpperCase()
    candidate = `${prefix}${entropy}`
    guard += 1
  } while (ids.has(candidate) && guard < 10)
  return candidate
}
