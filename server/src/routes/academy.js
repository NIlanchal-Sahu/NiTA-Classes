import { Router } from 'express'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { verifyToken } from '../auth.js'

const router = Router()
const __dirname = dirname(fileURLToPath(import.meta.url))

const PATHS = {
  students: join(__dirname, '..', 'data', 'students.json'),
  enrollments: join(__dirname, '..', 'data', 'student_enrollments.json'),
  courses: join(__dirname, '..', 'data', 'academy_courses.json'),
  batches: join(__dirname, '..', 'data', 'academy_batches.json'),
  attendance: join(__dirname, '..', 'data', 'academy_attendance.json'),
  fees: join(__dirname, '..', 'data', 'academy_fees.json'),
  discounts: join(__dirname, '..', 'data', 'academy_discounts.json'),
  notes: join(__dirname, '..', 'data', 'academy_notes.json'),
  certificates: join(__dirname, '..', 'data', 'academy_certificates.json'),
  referralLinks: join(__dirname, '..', 'data', 'referral_links.json'),
  paymentRequests: join(__dirname, '..', 'data', 'payment_requests.json'),
  users: join(__dirname, '..', 'data', 'users.json'),
}

function loadJson(path, fallback = []) {
  if (!existsSync(path)) return fallback
  try {
    return JSON.parse(readFileSync(path, 'utf8') || JSON.stringify(fallback))
  } catch {
    return fallback
  }
}

function saveJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8')
}

function auth(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token' })
  req.auth = payload
  next()
}

function allowRoles(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.auth.role)) {
      return res.status(403).json({ error: `Access denied for role: ${req.auth.role}` })
    }
    next()
  }
}

function normalizePhone(input) {
  return String(input || '').replace(/\D/g, '').slice(-10)
}

function makeStudentId(name, phone) {
  const first = String(name || '')
    .trim()
    .split(/\s+/)[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') || 'student'
  const last4 = normalizePhone(phone).slice(-4) || '0000'
  return `${first}-${last4}`
}

function parseDate(value) {
  return String(value || '').slice(0, 10)
}

function monthKey(isoDate) {
  return String(isoDate || '').slice(0, 7)
}

// ===== Students =====
router.get('/students', auth, allowRoles(['admin', 'teacher']), (_req, res) => {
  const students = loadJson(PATHS.students, [])
  res.json({ students: students.slice().reverse() })
})

router.get('/students/:id', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const students = loadJson(PATHS.students, [])
  const enrollments = loadJson(PATHS.enrollments, [])
  const fees = loadJson(PATHS.fees, [])
  const attendance = loadJson(PATHS.attendance, [])
  const student = students.find((s) => s.id === req.params.id)
  if (!student) return res.status(404).json({ error: 'Student not found' })
  res.json({
    student,
    enrollments: enrollments.filter((x) => x.studentId === student.id).slice().reverse(),
    payments: fees.filter((x) => x.studentId === student.id).slice().reverse(),
    attendance: attendance.filter((x) => x.studentId === student.id).slice().reverse(),
  })
})

router.post('/students', auth, allowRoles(['admin']), (req, res) => {
  const { name, phone, courseEnrolled, batchId, admissionDate, enrollmentFeeStatus = 'pending' } = req.body || {}
  if (!name || !phone) return res.status(400).json({ error: 'name and phone are required' })
  const students = loadJson(PATHS.students, [])
  const id = makeStudentId(name, phone)
  if (students.some((x) => x.id === id)) return res.status(400).json({ error: 'Student ID already exists' })
  const next = {
    id,
    name: String(name).trim(),
    phone: normalizePhone(phone),
    courseEnrolled: courseEnrolled ? String(courseEnrolled) : '',
    batchId: batchId ? String(batchId) : '',
    admissionDate: parseDate(admissionDate || new Date().toISOString()),
    enrollmentFeeStatus: String(enrollmentFeeStatus),
    createdAt: new Date().toISOString(),
  }
  students.push(next)
  saveJson(PATHS.students, students)
  res.json({ success: true, student: next })
})

router.put('/students/:id', auth, allowRoles(['admin']), (req, res) => {
  const students = loadJson(PATHS.students, [])
  const idx = students.findIndex((s) => s.id === req.params.id)
  if (idx < 0) return res.status(404).json({ error: 'Student not found' })
  const old = students[idx]
  students[idx] = {
    ...old,
    ...req.body,
    phone: req.body?.phone ? normalizePhone(req.body.phone) : old.phone,
    updatedAt: new Date().toISOString(),
  }
  saveJson(PATHS.students, students)
  res.json({ success: true, student: students[idx] })
})

router.delete('/students/:id', auth, allowRoles(['admin']), (req, res) => {
  const students = loadJson(PATHS.students, [])
  const next = students.filter((s) => s.id !== req.params.id)
  if (next.length === students.length) return res.status(404).json({ error: 'Student not found' })
  saveJson(PATHS.students, next)
  res.json({ success: true })
})

router.post('/students/:id/enrollments', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const students = loadJson(PATHS.students, [])
  if (!students.some((s) => s.id === req.params.id)) return res.status(404).json({ error: 'Student not found' })
  const { courseId, batchId, note = '' } = req.body || {}
  if (!courseId) return res.status(400).json({ error: 'courseId is required' })
  const enrollments = loadJson(PATHS.enrollments, [])
  const next = {
    id: `enr-${Date.now()}`,
    studentId: req.params.id,
    courseId: String(courseId),
    batchId: batchId ? String(batchId) : '',
    note: String(note || ''),
    createdAt: new Date().toISOString(),
  }
  enrollments.push(next)
  saveJson(PATHS.enrollments, enrollments)
  res.json({ success: true, enrollment: next })
})

// ===== Courses =====
router.get('/courses', auth, allowRoles(['admin', 'teacher']), (_req, res) => {
  const courses = loadJson(PATHS.courses, [])
  res.json({ courses: courses.slice().reverse() })
})

router.post('/courses', auth, allowRoles(['admin']), (req, res) => {
  const { name, description = '', duration = '', priceType = 'perClass10', price = 10 } = req.body || {}
  if (!name) return res.status(400).json({ error: 'name is required' })
  const courses = loadJson(PATHS.courses, [])
  const next = {
    id: `course-${Date.now()}`,
    name: String(name),
    description: String(description),
    duration: String(duration),
    priceType: String(priceType), // perClass10 | custom
    price: Number(price) || 10,
    createdAt: new Date().toISOString(),
  }
  courses.push(next)
  saveJson(PATHS.courses, courses)
  res.json({ success: true, course: next })
})

router.put('/courses/:id', auth, allowRoles(['admin']), (req, res) => {
  const courses = loadJson(PATHS.courses, [])
  const idx = courses.findIndex((x) => x.id === req.params.id)
  if (idx < 0) return res.status(404).json({ error: 'Course not found' })
  courses[idx] = { ...courses[idx], ...req.body, updatedAt: new Date().toISOString() }
  saveJson(PATHS.courses, courses)
  res.json({ success: true, course: courses[idx] })
})

router.delete('/courses/:id', auth, allowRoles(['admin']), (req, res) => {
  const courses = loadJson(PATHS.courses, [])
  const next = courses.filter((x) => x.id !== req.params.id)
  if (next.length === courses.length) return res.status(404).json({ error: 'Course not found' })
  saveJson(PATHS.courses, next)
  res.json({ success: true })
})

// ===== Batches =====
router.get('/batches', auth, allowRoles(['admin', 'teacher']), (_req, res) => {
  const batches = loadJson(PATHS.batches, [])
  const students = loadJson(PATHS.students, [])
  const withSize = batches.map((b) => ({
    ...b,
    batchSize: students.filter((s) => s.batchId === b.id).length,
  }))
  res.json({ batches: withSize.slice().reverse() })
})

router.post('/batches', auth, allowRoles(['admin']), (req, res) => {
  const { name, monthYear, courseId, timing, teacherId = '', studentIds = [] } = req.body || {}
  if (!name || !monthYear || !courseId || !timing) {
    return res.status(400).json({ error: 'name, monthYear, courseId, timing are required' })
  }
  const batches = loadJson(PATHS.batches, [])
  const students = loadJson(PATHS.students, [])
  const next = {
    id: `batch-${Date.now()}`,
    name: String(name),
    monthYear: String(monthYear),
    courseId: String(courseId),
    timing: String(timing),
    teacherId: String(teacherId || ''),
    studentIds: Array.isArray(studentIds) ? studentIds.map(String) : [],
    createdAt: new Date().toISOString(),
  }
  batches.push(next)
  saveJson(PATHS.batches, batches)
  if (next.studentIds.length) {
    for (const s of students) {
      if (next.studentIds.includes(s.id)) s.batchId = next.id
    }
    saveJson(PATHS.students, students)
  }
  res.json({ success: true, batch: next })
})

router.put('/batches/:id', auth, allowRoles(['admin']), (req, res) => {
  const batches = loadJson(PATHS.batches, [])
  const idx = batches.findIndex((x) => x.id === req.params.id)
  if (idx < 0) return res.status(404).json({ error: 'Batch not found' })
  batches[idx] = { ...batches[idx], ...req.body, updatedAt: new Date().toISOString() }
  saveJson(PATHS.batches, batches)

  if (Array.isArray(req.body?.studentIds)) {
    const students = loadJson(PATHS.students, [])
    for (const s of students) {
      if (req.body.studentIds.includes(s.id)) s.batchId = batches[idx].id
    }
    saveJson(PATHS.students, students)
  }
  res.json({ success: true, batch: batches[idx] })
})

// ===== Attendance =====
router.get('/attendance', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const batchId = String(req.query.batchId || '')
  const date = parseDate(req.query.date || '')
  const records = loadJson(PATHS.attendance, [])
  const filtered = records.filter((r) => (!batchId || r.batchId === batchId) && (!date || r.date === date))
  res.json({ attendance: filtered.slice().reverse() })
})

router.post('/attendance/mark', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const { date, batchId, studentId, status } = req.body || {}
  if (!date || !batchId || !studentId || !['present', 'absent'].includes(String(status))) {
    return res.status(400).json({ error: 'date, batchId, studentId, status(present/absent) are required' })
  }
  const records = loadJson(PATHS.attendance, [])
  const d = parseDate(date)
  const idx = records.findIndex((r) => r.date === d && r.batchId === String(batchId) && r.studentId === String(studentId))
  if (idx >= 0) {
    records[idx] = { ...records[idx], status: String(status), updatedAt: new Date().toISOString() }
  } else {
    records.push({
      id: `att-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      date: d,
      batchId: String(batchId),
      studentId: String(studentId),
      status: String(status),
      markedBy: req.auth.userId,
      createdAt: new Date().toISOString(),
    })
  }
  saveJson(PATHS.attendance, records)
  res.json({ success: true })
})

router.get('/attendance/report/monthly', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const month = String(req.query.month || monthKey(new Date().toISOString()))
  const batchId = String(req.query.batchId || '')
  const records = loadJson(PATHS.attendance, [])
  const filtered = records.filter((r) => monthKey(r.date) === month && (!batchId || r.batchId === batchId))
  const byStudent = {}
  for (const r of filtered) {
    byStudent[r.studentId] ||= { present: 0, absent: 0, total: 0 }
    byStudent[r.studentId].total += 1
    byStudent[r.studentId][r.status] += 1
  }
  const rows = Object.keys(byStudent).map((studentId) => {
    const x = byStudent[studentId]
    const percentage = x.total ? Math.round((x.present / x.total) * 100) : 0
    return { studentId, ...x, percentage }
  })
  res.json({ month, batchId: batchId || null, report: rows })
})

// ===== Fees / Payments =====
router.get('/fees', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const studentId = String(req.query.studentId || '')
  const records = loadJson(PATHS.fees, [])
  const filtered = records.filter((r) => !studentId || r.studentId === studentId)
  res.json({ payments: filtered.slice().reverse() })
})

router.post('/fees/payments', auth, allowRoles(['admin']), (req, res) => {
  const { studentId, amount, date, mode, feeStatus = 'paid', note = '' } = req.body || {}
  if (!studentId || !amount || !date || !mode) return res.status(400).json({ error: 'studentId, amount, date, mode are required' })
  const students = loadJson(PATHS.students, [])
  const student = students.find((s) => s.id === String(studentId))
  if (!student) return res.status(404).json({ error: 'Student not found' })
  const payments = loadJson(PATHS.fees, [])
  const next = {
    id: `fee-${Date.now()}`,
    studentId: String(studentId),
    amount: Number(amount) || 0,
    date: parseDate(date),
    mode: String(mode), // cash | upi
    feeStatus: String(feeStatus), // paid | pending | discounted
    note: String(note),
    createdAt: new Date().toISOString(),
  }
  payments.push(next)
  saveJson(PATHS.fees, payments)
  res.json({ success: true, payment: next })
})

router.get('/fees/payment-requests', auth, allowRoles(['admin', 'teacher']), (_req, res) => {
  const requests = loadJson(PATHS.paymentRequests, [])
  res.json({ requests: requests.slice().reverse() })
})

router.post('/fees/payment-requests/:id/approve', auth, allowRoles(['admin']), (req, res) => {
  const requests = loadJson(PATHS.paymentRequests, [])
  const idx = requests.findIndex((r) => r.id === req.params.id)
  if (idx < 0) return res.status(404).json({ error: 'Payment request not found' })
  if (requests[idx].status === 'approved') return res.json({ success: true, request: requests[idx] })

  requests[idx].status = 'approved'
  requests[idx].approvedAt = new Date().toISOString()
  requests[idx].approvedBy = req.auth.userId
  saveJson(PATHS.paymentRequests, requests)

  const users = loadJson(PATHS.users, [])
  const u = users.find((x) => x.id === requests[idx].authUserId && x.role === 'student')
  if (u) {
    u.walletBalance = (Number(u.walletBalance) || 0) + (Number(requests[idx].amount) || 0)
    saveJson(PATHS.users, users)
  }
  res.json({ success: true, request: requests[idx], walletBalance: Number(u?.walletBalance) || null })
})

// ===== Discounts =====
router.get('/discounts', auth, allowRoles(['admin', 'teacher']), (_req, res) => {
  const discounts = loadJson(PATHS.discounts, [])
  res.json({ discounts: discounts.slice().reverse() })
})

router.post('/discounts', auth, allowRoles(['admin']), (req, res) => {
  const { type, value, validity, applyToType, applyToId, note = '' } = req.body || {}
  if (!type || !value || !validity || !applyToType || !applyToId) {
    return res.status(400).json({ error: 'type, value, validity, applyToType, applyToId are required' })
  }
  const discounts = loadJson(PATHS.discounts, [])
  const next = {
    id: `disc-${Date.now()}`,
    type: String(type), // percent | fixed
    value: Number(value) || 0,
    validity: parseDate(validity),
    applyToType: String(applyToType), // student | course
    applyToId: String(applyToId),
    note: String(note),
    createdAt: new Date().toISOString(),
  }
  discounts.push(next)
  saveJson(PATHS.discounts, discounts)
  res.json({ success: true, discount: next })
})

// ===== Notes / Study Materials =====
router.get('/notes', auth, allowRoles(['admin', 'teacher']), (_req, res) => {
  const notes = loadJson(PATHS.notes, [])
  res.json({ notes: notes.slice().reverse() })
})

router.post('/notes', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const { title, resourceType, url, courseId = '', batchId = '' } = req.body || {}
  if (!title || !resourceType || !url) return res.status(400).json({ error: 'title, resourceType, url are required' })
  const notes = loadJson(PATHS.notes, [])
  const next = {
    id: `note-${Date.now()}`,
    title: String(title),
    resourceType: String(resourceType), // pdf | video | link
    url: String(url),
    courseId: String(courseId),
    batchId: String(batchId),
    uploadedBy: req.auth.userId,
    createdAt: new Date().toISOString(),
  }
  notes.push(next)
  saveJson(PATHS.notes, notes)
  res.json({ success: true, note: next })
})

// ===== Certificates =====
router.get('/certificates', auth, allowRoles(['admin', 'teacher']), (_req, res) => {
  const certificates = loadJson(PATHS.certificates, [])
  res.json({ certificates: certificates.slice().reverse() })
})

router.post('/certificates/generate', auth, allowRoles(['admin']), (req, res) => {
  const { studentId, studentName, courseName, completionDate } = req.body || {}
  if (!studentId || !studentName || !courseName || !completionDate) {
    return res.status(400).json({ error: 'studentId, studentName, courseName, completionDate are required' })
  }
  const certificates = loadJson(PATHS.certificates, [])
  const next = {
    id: `cert-${Date.now()}`,
    studentId: String(studentId),
    studentName: String(studentName),
    courseName: String(courseName),
    completionDate: parseDate(completionDate),
    pdfUrl: `/api/admin/academy/certificates/${Date.now()}.pdf`, // placeholder
    generatedBy: req.auth.userId,
    createdAt: new Date().toISOString(),
  }
  certificates.push(next)
  saveJson(PATHS.certificates, certificates)
  res.json({ success: true, certificate: next })
})

// ===== Referrals (tracking) =====
router.get('/referrals/links', auth, allowRoles(['admin', 'teacher']), (_req, res) => {
  const links = loadJson(PATHS.referralLinks, [])
  res.json({ links: links.slice().reverse() })
})

// ===== Dashboard =====
router.get('/dashboard', auth, allowRoles(['admin', 'teacher']), (_req, res) => {
  const students = loadJson(PATHS.students, [])
  const batches = loadJson(PATHS.batches, [])
  const fees = loadJson(PATHS.fees, [])
  const attendance = loadJson(PATHS.attendance, [])

  const today = parseDate(new Date().toISOString())
  const currentMonth = monthKey(today)
  const revenueDaily = fees.filter((x) => x.date === today).reduce((a, b) => a + (Number(b.amount) || 0), 0)
  const revenueMonthly = fees.filter((x) => monthKey(x.date) === currentMonth).reduce((a, b) => a + (Number(b.amount) || 0), 0)

  const present = attendance.filter((x) => x.status === 'present').length
  const attendanceRate = attendance.length ? Math.round((present / attendance.length) * 100) : 0

  const courseWise = {}
  for (const s of students) {
    const key = s.courseEnrolled || 'unassigned'
    courseWise[key] = (courseWise[key] || 0) + 1
  }

  const growthMap = {}
  for (const s of students) {
    const m = monthKey(s.createdAt || s.admissionDate || today)
    growthMap[m] = (growthMap[m] || 0) + 1
  }
  const revenueMap = {}
  for (const f of fees) {
    const m = monthKey(f.date || f.createdAt)
    revenueMap[m] = (revenueMap[m] || 0) + (Number(f.amount) || 0)
  }

  res.json({
    totals: {
      totalStudents: students.length,
      activeBatches: batches.length,
      revenueDaily,
      revenueMonthly,
      attendanceRate,
    },
    courseWiseStudents: courseWise,
    studentGrowth: growthMap,
    revenueTrend: revenueMap,
  })
})

export default router

