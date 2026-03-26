import { Router } from 'express'
import { verifyToken, getUsers, saveUsers } from '../auth.js'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readJsonSync } from '../services/sheetsJsonStore.js'
import {
  getPartners,
  savePartners,
  getReferralLinks,
  saveReferralLinks,
  getReferralPayouts,
  saveReferralPayouts,
  getAttendanceRecords,
  normalizeCode,
  generatePartnerCode,
  countClassesForStudentInMonth,
  applyReferralCodeToStudent,
} from '../referrals.js'

const router = Router()
const __dirname = dirname(fileURLToPath(import.meta.url))
const STUDENTS_PATH = join(__dirname, '..', 'data', 'students.json')

function authRequired(req, res, next) {
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token' })
  req.auth = payload
  next()
}

function studentOnly(req, res, next) {
  if (req.auth.role !== 'student') return res.status(403).json({ error: 'Students only' })
  next()
}

function adminOnly(req, res, next) {
  if (req.auth.role !== 'admin') return res.status(403).json({ error: 'Admin access only' })
  next()
}

function getStudent(users, id) {
  return users.find((u) => u.id === id && u.role === 'student') || null
}

// Student: register as affiliate partner (₹0) and choose benefit option:
// - fixed200: ₹200 per student referred (paid once, after first attendance)
// - perClass1: ₹1 per class attended by referred student (paid monthly)
router.post('/register', authRequired, studentOnly, (req, res) => {
  const option = String(req.body?.option || '').trim()
  if (!['fixed200', 'perClass1'].includes(option)) {
    return res.status(400).json({ error: 'Invalid option. Use fixed200 or perClass1.' })
  }

  const users = getUsers()
  const me = getStudent(users, req.auth.userId)
  if (!me) return res.status(404).json({ error: 'Student not found' })

  const partners = getPartners()
  const existing = partners.find((p) => p.userId === me.id)
  if (existing) {
    existing.option = option
    existing.active = true
    savePartners(partners)
    return res.json({ success: true, partner: existing, walletBalance: Number(me.walletBalance) || 0 })
  }

  const fee = 0
  const balance = Number(me.walletBalance) || 0
  if (balance < fee) return res.status(400).json({ error: `Need ₹${fee} in wallet to register as affiliate partner.` })

  me.walletBalance = balance - fee
  const code = (() => {
    let next = generatePartnerCode()
    while (partners.some((p) => p.code === next)) next = generatePartnerCode()
    return next
  })()

  const partner = {
    userId: me.id,
    code,
    option,
    active: true,
    registeredAt: new Date().toISOString(),
  }
  partners.push(partner)
  saveUsers(users)
  savePartners(partners)
  res.json({ success: true, partner, walletBalance: Number(me.walletBalance) || 0 })
})

router.get('/me', authRequired, studentOnly, (req, res) => {
  const users = getUsers()
  const academyStudents = readJsonSync(STUDENTS_PATH, [])
  const partners = getPartners()
  const partner = partners.find((p) => p.userId === req.auth.userId) || null

  const links = getReferralLinks().filter((l) => l.referrerUserId === req.auth.userId)
  const payouts = getReferralPayouts().filter((p) => p.referrerUserId === req.auth.userId).slice().reverse()
  const referredStudents = links
    .map((link) => {
      const accountUser = users.find((u) => u.id === link.referredStudentId && u.role === 'student') || null
      const academyStudent =
        academyStudents.find((s) => String(s.accountUserId || '') === String(link.referredStudentId || '')) || null
      return {
        id: String(link.referredStudentId || ''),
        name: academyStudent?.name || accountUser?.name || 'Student',
        contact:
          academyStudent?.phone ||
          String(accountUser?.email || '')
            .replace(/\D/g, '')
            .slice(-10) ||
          '—',
        joinedAt: link.createdAt || '',
      }
    })
    .sort((a, b) => String(b.joinedAt || '').localeCompare(String(a.joinedAt || '')))

  res.json({
    partner,
    totals: {
      totalReferred: links.length,
      totalPayouts: payouts.reduce((acc, p) => acc + (Number(p.amount) || 0), 0),
    },
    referredStudents,
    recentPayouts: payouts.slice(0, 12),
  })
})

// Admin: view partners/links/payouts
router.get('/admin/overview', authRequired, adminOnly, (_req, res) => {
  res.json({
    partners: getPartners(),
    links: getReferralLinks(),
    payouts: getReferralPayouts(),
  })
})

// Admin: run payouts for a month (YYYY-MM). Typically run on 1st for previous month.
router.post('/admin/run-payouts', authRequired, adminOnly, (req, res) => {
  const month = String(req.body?.month || '').trim() // YYYY-MM
  if (!/^\d{4}-\d{2}$/.test(month)) return res.status(400).json({ error: 'month must be YYYY-MM' })

  const partners = getPartners()
  const links = getReferralLinks()
  const payouts = getReferralPayouts()
  const attendance = getAttendanceRecords()
  const users = getUsers()

  const nowIso = new Date().toISOString()
  const newPayoutItems = []

  for (const link of links) {
    const partner = partners.find((p) => p.userId === link.referrerUserId && p.active)
    if (!partner) continue

    if (partner.option === 'fixed200') {
      if (link.fixedPaid) continue
      const classes = countClassesForStudentInMonth(attendance, link.referredStudentId, month)
      if (classes <= 0) continue
      newPayoutItems.push({
        kind: 'fixed200',
        month,
        referrerUserId: link.referrerUserId,
        referredStudentId: link.referredStudentId,
        amount: 200,
      })
      link.fixedPaid = true
      link.fixedPaidAt = nowIso
    } else if (partner.option === 'perClass1') {
      if (link.lastPaidMonth === month) continue
      const classes = countClassesForStudentInMonth(attendance, link.referredStudentId, month)
      if (classes <= 0) continue
      newPayoutItems.push({
        kind: 'perClass1',
        month,
        referrerUserId: link.referrerUserId,
        referredStudentId: link.referredStudentId,
        amount: classes,
        classes,
      })
      link.lastPaidMonth = month
      link.lastPaidAt = nowIso
    }
  }

  // Apply wallet credits + persist payout records
  for (const item of newPayoutItems) {
    const ref = users.find((u) => u.id === item.referrerUserId && u.role === 'student')
    if (!ref) continue
    ref.walletBalance = (Number(ref.walletBalance) || 0) + (Number(item.amount) || 0)
    payouts.push({
      id: `pay-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      ...item,
      createdAt: nowIso,
    })
  }

  saveUsers(users)
  saveReferralLinks(links)
  saveReferralPayouts(payouts)

  res.json({
    success: true,
    month,
    payoutsCreated: newPayoutItems.length,
    totalAmount: newPayoutItems.reduce((acc, x) => acc + (Number(x.amount) || 0), 0),
  })
})

// Internal helper used by auth flow (called via dynamic import to avoid cycles).
export default router

