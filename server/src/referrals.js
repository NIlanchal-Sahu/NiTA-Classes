import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readJsonSync, writeJsonSync } from './services/sheetsJsonStore.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PARTNERS_PATH = join(__dirname, 'data', 'referrals.json')
const LINKS_PATH = join(__dirname, 'data', 'referral_links.json')
const PAYOUTS_PATH = join(__dirname, 'data', 'referral_payouts.json')
const ATTENDANCE_PATH = join(__dirname, 'data', 'attendance.json')
const REVIEW_REQUESTS_PATH = join(__dirname, 'data', 'referral_review_requests.json')

function loadJson(path, fallback) {
  return readJsonSync(path, fallback)
}

function saveJson(path, data) {
  writeJsonSync(path, data)
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

export function getReferralReviewRequests() {
  return loadJson(REVIEW_REQUESTS_PATH, [])
}
export function saveReferralReviewRequests(list) {
  saveJson(REVIEW_REQUESTS_PATH, list)
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

export function createReferralReviewRequest({ studentId, referralCode, source = 'enrollment', mobile = '' }) {
  const code = normalizeCode(referralCode)
  if (!code || !studentId) return { ok: false, error: 'Missing studentId or referralCode' }

  const links = getReferralLinks()
  const existingLink = links.find((l) => String(l.referredStudentId) === String(studentId))
  if (existingLink) return { ok: true, alreadyLinked: true }

  const reqs = getReferralReviewRequests()
  const idx = reqs.findIndex((r) => String(r.studentId) === String(studentId) && String(r.status) === 'pending')
  const payload = {
    id: `rr-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    studentId: String(studentId),
    referralCode: code,
    source: String(source || 'enrollment'),
    mobile: String(mobile || ''),
    status: 'pending',
    requestedAt: new Date().toISOString(),
  }
  if (idx >= 0) {
    reqs[idx] = { ...reqs[idx], ...payload, id: reqs[idx].id, requestedAt: reqs[idx].requestedAt }
  } else {
    reqs.push(payload)
  }
  saveReferralReviewRequests(reqs)
  return { ok: true, queued: true }
}

