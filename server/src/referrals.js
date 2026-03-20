import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PARTNERS_PATH = join(__dirname, 'data', 'referrals.json')
const LINKS_PATH = join(__dirname, 'data', 'referral_links.json')
const PAYOUTS_PATH = join(__dirname, 'data', 'referral_payouts.json')
const ATTENDANCE_PATH = join(__dirname, 'data', 'attendance.json')

function loadJson(path, fallback) {
  if (!existsSync(path)) return fallback
  const raw = readFileSync(path, 'utf8') || ''
  try {
    return JSON.parse(raw || JSON.stringify(fallback))
  } catch {
    return fallback
  }
}

function saveJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8')
}

export function getPartners() {
  return loadJson(PARTNERS_PATH, [])
}
export function savePartners(list) {
  saveJson(PARTNERS_PATH, list)
}

export function getReferralLinks() {
  return loadJson(LINKS_PATH, [])
}
export function saveReferralLinks(list) {
  saveJson(LINKS_PATH, list)
}

export function getReferralPayouts() {
  return loadJson(PAYOUTS_PATH, [])
}
export function saveReferralPayouts(list) {
  saveJson(PAYOUTS_PATH, list)
}

export function getAttendanceRecords() {
  return loadJson(ATTENDANCE_PATH, [])
}

export function normalizeCode(input) {
  return String(input || '').trim().toUpperCase()
}

export function generatePartnerCode() {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  const rand2 = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `NITA-${rand}${rand2}`
}

export function monthKeyFromDate(isoDate) {
  return String(isoDate || '').slice(0, 7) // YYYY-MM
}

export function countClassesForStudentInMonth(attendanceRecords, studentId, month) {
  return attendanceRecords
    .filter((r) => r.studentId === studentId && String(r.date || '').slice(0, 7) === month)
    .reduce((acc, r) => acc + (Number(r.classesCount) || 0), 0)
}

export function applyReferralCodeToStudent({ studentId, referralCode }) {
  const code = normalizeCode(referralCode)
  if (!code) return { ok: false, error: 'No code' }

  const partners = getPartners()
  const partner = partners.find((p) => p.code === code && p.active)
  if (!partner) return { ok: false, error: 'Invalid code' }
  if (partner.userId === studentId) return { ok: false, error: 'Cannot refer yourself' }

  const links = getReferralLinks()
  const exists = links.find((l) => l.referredStudentId === studentId)
  if (exists) return { ok: true, alreadyLinked: true }

  links.push({
    id: `link-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    code,
    referrerUserId: partner.userId,
    referredStudentId: studentId,
    createdAt: new Date().toISOString(),
    fixedPaid: false,
    lastPaidMonth: null,
  })
  saveReferralLinks(links)
  return { ok: true, linked: true, referrerUserId: partner.userId }
}

