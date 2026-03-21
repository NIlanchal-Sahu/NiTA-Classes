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
 * NITA + YYYYMMDD (first of day), then NITA + YYYYMMDD + 001, 002, ...
 */
export function generateNitaStudentId(existingUserStudentIds = []) {
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const prefix = `NITA${ymd}`
  const fromStudents = loadStudentIds()
  const ids = new Set([...existingUserStudentIds, ...fromStudents].filter(Boolean))

  if (!ids.has(prefix)) return prefix

  let maxSeq = 0
  for (const id of ids) {
    if (id === prefix) {
      maxSeq = Math.max(maxSeq, 0)
      continue
    }
    if (id.startsWith(prefix) && id.length > prefix.length) {
      const suf = id.slice(prefix.length)
      if (/^\d{3}$/.test(suf)) maxSeq = Math.max(maxSeq, parseInt(suf, 10))
    }
  }
  return `${prefix}${String(maxSeq + 1).padStart(3, '0')}`
}
