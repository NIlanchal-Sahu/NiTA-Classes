import { Router } from 'express'
import { verifyToken, getUsers, saveUsers } from '../auth.js'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readJsonSync, writeJsonSync } from '../services/sheetsJsonStore.js'

const router = Router()
const __dirname = dirname(fileURLToPath(import.meta.url))
const ENROLLMENTS_PATH = join(__dirname, '..', 'data', 'enrollments.json')
const STUDENTS_PATH = join(__dirname, '..', 'data', 'students.json')
const STUDENT_ENROLLMENTS_PATH = join(__dirname, '..', 'data', 'student_enrollments.json')

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
  return readJsonSync(path, [])
}

function saveJson(path, data) {
  writeJsonSync(path, data)
}

function digits(input) {
  return String(input || '').replace(/\D/g, '')
}

function normalizePhone(input) {
  return digits(input).slice(-10)
}

function normalizeCourseIds(rawCourses, rawCourse) {
  const base = Array.isArray(rawCourses) ? rawCourses : rawCourse ? [rawCourse] : []
  return [...new Set(base.map((x) => String(x || '').trim()).filter(Boolean))]
}

function monthNameUpper(dateObj) {
  return dateObj.toLocaleString('en-US', { month: 'long' }).toUpperCase()
}

function makeAdmissionId(phone, existing, now = new Date()) {
  const last4 = String(phone || '').slice(-4) || '0000'
  const prefix = `${monthNameUpper(now)}${now.getFullYear()}${last4}`
  let out = prefix
  let i = 1
  const used = new Set(existing.map((e) => String(e.admissionId || '')))
  while (used.has(out)) {
    i += 1
    out = `${prefix}-${i}`
  }
  return out
}

function isConvertedAdmissionRow(row, students, users, studentEnrollments) {
  const phone = normalizePhone(row?.mobile)
  if (!phone) return false
  const student = students.find((s) => normalizePhone(s.phone) === phone)
  const user = users.find((u) => u.role === 'student' && normalizePhone(u.email) === phone)
  if (!student || !user) return false
  return studentEnrollments.some(
    (e) =>
      String(e.studentId || '') === String(student.id || '') &&
      String(e.courseId || '').trim().toLowerCase() !== 'trial-course'
  )
}

function reconcileAdmissionsQueue() {
  const list = loadJson(ENROLLMENTS_PATH)
  if (!list.length) return list
  const students = loadJson(STUDENTS_PATH)
  const users = getUsers()
  const studentEnrollments = loadJson(STUDENT_ENROLLMENTS_PATH)
  const next = list
    .map((r) => {
      const courseIds = normalizeCourseIds(r.courseIds, r.course)
      return {
        ...r,
        mobile: normalizePhone(r.mobile),
        courseIds,
        course: courseIds[0] || '',
        status: r.status || 'queued',
      }
    })
    .filter((r) => !isConvertedAdmissionRow(r, students, users, studentEnrollments))
  if (next.length !== list.length) saveJson(ENROLLMENTS_PATH, next)
  return next
}

router.get('/', studentAdminAuth, (req, res) => {
  const list = reconcileAdmissionsQueue()
  res.json({ enrollments: list.slice().reverse() })
})

router.get('/recent-unenrolled', studentAdminAuth, (req, res) => {
  const limitRaw = Number(req.query?.limit)
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 100) : 30

  const students = loadJson(STUDENTS_PATH)
  const studentEnrollments = loadJson(STUDENT_ENROLLMENTS_PATH)
  const hasNonTrialEnrollment = new Set(
    studentEnrollments
      .filter((e) => String(e.courseId || '').trim().toLowerCase() !== 'trial-course')
      .map((e) => String(e.studentId || ''))
      .filter(Boolean)
  )

  const rows = students
    .filter((s) => !hasNonTrialEnrollment.has(String(s.id || '')))
    .map((s) => ({
      studentId: String(s.id || ''),
      name: String(s.name || ''),
      mobile: normalizePhone(s.phone),
      admissionDate: String(s.admissionDate || '').slice(0, 10),
      createdAt: String(s.createdAt || ''),
      selectedCourseIds: Array.isArray(s.selectedCourseIds)
        ? s.selectedCourseIds
        : s.courseEnrolled
          ? [s.courseEnrolled]
          : [],
      courseEnrolled: String(s.courseEnrolled || ''),
      enrollmentFeeStatus: String(s.enrollmentFeeStatus || 'pending'),
    }))
    .sort((a, b) => String(b.createdAt || b.admissionDate || '').localeCompare(String(a.createdAt || a.admissionDate || '')))
    .slice(0, limit)

  res.json({ recentUnenrolled: rows })
})

router.get('/lookup-by-mobile', studentAdminAuth, (req, res) => {
  const phone = normalizePhone(String(req.query?.mobile || ''))
  if (!phone || phone.length !== 10) {
    return res.status(400).json({ error: 'Valid 10-digit mobile is required' })
  }
  const raw = loadJson(ENROLLMENTS_PATH)
  const visible = reconcileAdmissionsQueue()
  const rawMatches = raw.filter((x) => normalizePhone(x.mobile) === phone)
  const visibleIds = new Set(visible.map((x) => String(x.id || '')))
  const matches = rawMatches.map((row) => ({
    ...row,
    hiddenInVisibleQueue: !visibleIds.has(String(row.id || '')),
  }))
  res.json({
    mobile: phone,
    totalRawMatches: matches.length,
    totalVisibleMatches: matches.filter((m) => !m.hiddenInVisibleQueue).length,
    matches: matches.slice().reverse(),
  })
})

router.delete('/cleanup-by-mobile/:mobile', studentAdminAuth, (req, res) => {
  const phone = normalizePhone(req.params.mobile)
  if (!phone || phone.length !== 10) {
    return res.status(400).json({ error: 'Valid 10-digit mobile is required' })
  }
  const list = loadJson(ENROLLMENTS_PATH)
  const next = list.filter((x) => normalizePhone(x.mobile) !== phone)
  const removed = list.length - next.length
  if (removed > 0) saveJson(ENROLLMENTS_PATH, next)
  res.json({ success: true, removed, mobile: phone })
})

router.post('/', studentAdminAuth, (req, res) => {
  const {
    name,
    mobile,
    course,
    courses,
    school = '',
    highestQualification = '',
    villageCity = '',
    gender = '',
    fatherName = '',
    referralCode,
  } = req.body || {}
  const phone = normalizePhone(mobile)
  const courseIds = normalizeCourseIds(courses, course)
  if (!name || !phone || courseIds.length === 0) {
    return res.status(400).json({ error: 'name, mobile and at least one course are required' })
  }
  if (phone.length !== 10) return res.status(400).json({ error: 'Valid 10-digit mobile is required' })
  const list = reconcileAdmissionsQueue()
  if (list.some((x) => normalizePhone(x.mobile) === phone)) {
    return res.status(409).json({ error: 'Mobile number already exists in admission queue. Contact WhatsApp support.' })
  }
  const students = loadJson(STUDENTS_PATH)
  if (students.some((s) => normalizePhone(s.phone) === phone)) {
    return res.status(409).json({ error: 'Mobile number already exists as active student. Contact WhatsApp support.' })
  }
  const users = getUsers()
  if (users.some((u) => u.role === 'student' && normalizePhone(u.email) === phone)) {
    return res.status(409).json({ error: 'Mobile number already has LMS account. Contact WhatsApp support.' })
  }
  const now = new Date()
  const next = {
    id: `enroll-${Date.now()}`,
    admissionId: makeAdmissionId(phone, list, now),
    name: String(name).trim(),
    mobile: phone,
    courseIds,
    course: courseIds[0],
    school: String(school || '').trim(),
    highestQualification: String(highestQualification || '').trim(),
    villageCity: String(villageCity || '').trim(),
    gender: String(gender || '').trim(),
    fatherName: String(fatherName || '').trim(),
    referralCode: referralCode ? String(referralCode).trim().toUpperCase() : '',
    status: 'queued',
    createdAt: now.toISOString(),
  }
  list.push(next)
  saveJson(ENROLLMENTS_PATH, list)
  res.json({ success: true, enrollment: next })
})

router.put('/:id', studentAdminAuth, (req, res) => {
  const list = reconcileAdmissionsQueue()
  const idx = list.findIndex((x) => x.id === req.params.id)
  if (idx < 0) return res.status(404).json({ error: 'Enrollment not found' })
  const old = list[idx]
  const nextMobile = req.body?.mobile ? normalizePhone(req.body.mobile) : normalizePhone(old.mobile)
  if (nextMobile.length !== 10) return res.status(400).json({ error: 'Valid 10-digit mobile is required' })
  if (list.some((x) => x.id !== old.id && normalizePhone(x.mobile) === nextMobile)) {
    return res.status(409).json({ error: 'Mobile number already exists in admission queue. Contact WhatsApp support.' })
  }
  const nextCourses = req.body?.courses || req.body?.course
    ? normalizeCourseIds(req.body?.courses, req.body?.course)
    : normalizeCourseIds(old.courseIds, old.course)
  if (nextCourses.length === 0) return res.status(400).json({ error: 'At least one course is required' })
  list[idx] = {
    ...old,
    ...req.body,
    mobile: nextMobile,
    courseIds: nextCourses,
    course: nextCourses[0],
    referralCode: req.body?.referralCode ? String(req.body.referralCode).trim().toUpperCase() : old.referralCode || '',
    updatedAt: new Date().toISOString(),
  }
  saveJson(ENROLLMENTS_PATH, list)
  res.json({ success: true, enrollment: list[idx] })
})

router.delete('/:id', studentAdminAuth, (req, res) => {
  const list = loadJson(ENROLLMENTS_PATH)
  const next = list.filter((x) => x.id !== req.params.id)
  if (next.length === list.length) return res.status(404).json({ error: 'Enrollment not found' })
  saveJson(ENROLLMENTS_PATH, next)
  res.json({ success: true })
})

export default router

