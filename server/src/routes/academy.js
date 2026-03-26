import { Router } from 'express'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { verifyToken, adminResetStudentPassword, adminResetAdminPassword, hashPassword } from '../auth.js'
import { readJsonSync, writeJsonSync } from '../services/sheetsJsonStore.js'

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
  courseContent: join(__dirname, '..', 'data', 'academy_course_content.json'),
  certificates: join(__dirname, '..', 'data', 'academy_certificates.json'),
  referralLinks: join(__dirname, '..', 'data', 'referral_links.json'),
  paymentRequests: join(__dirname, '..', 'data', 'payment_requests.json'),
  users: join(__dirname, '..', 'data', 'users.json'),
  legacyCourses: join(__dirname, '..', 'data', 'courses.json'),
  studentNotifications: join(__dirname, '..', 'data', 'student_notifications.json'),
  adminAlerts: join(__dirname, '..', 'data', 'admin_alerts.json'),
  studentProfiles: join(__dirname, '..', 'data', 'student_profiles.json'),
  admissionsQueue: join(__dirname, '..', 'data', 'enrollments.json'),
  teacherAttendance: join(__dirname, '..', 'data', 'teacher_attendance.json'),
  teacherAttendanceRequests: join(__dirname, '..', 'data', 'teacher_attendance_requests.json'),
  teacherPayments: join(__dirname, '..', 'data', 'teacher_payments.json'),
  walletAttendance: join(__dirname, '..', 'data', 'attendance.json'),
}

function loadJson(path, fallback = []) {
  return readJsonSync(path, fallback)
}

function saveJson(path, data) {
  writeJsonSync(path, data)
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

function removeAdmissionsByPhones(phones = []) {
  const targets = new Set((phones || []).map((p) => normalizePhone(p)).filter(Boolean))
  if (targets.size === 0) return
  const rows = loadJson(PATHS.admissionsQueue, [])
  const next = rows.filter((r) => !targets.has(normalizePhone(r.mobile)))
  if (next.length !== rows.length) saveJson(PATHS.admissionsQueue, next)
}

function normalizeCourseIds(rawCourses, rawCourse) {
  const base = Array.isArray(rawCourses) ? rawCourses : rawCourse ? [rawCourse] : []
  return [...new Set(base.map((x) => String(x || '').trim()).filter(Boolean))]
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
      normCourseId(e.courseId) !== 'trial-course'
  )
}

function reconcileAdmissionsQueueRows() {
  const rows = loadJson(PATHS.admissionsQueue, [])
  if (!rows.length) return rows
  const students = loadJson(PATHS.students, [])
  const users = loadJson(PATHS.users, [])
  const studentEnrollments = loadJson(PATHS.enrollments, [])
  const next = rows
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
  if (next.length !== rows.length) saveJson(PATHS.admissionsQueue, next)
  return next
}

function nextTeacherId(users) {
  const nums = users
    .filter((u) => u.role === 'teacher')
    .map((u) => Number(String(u.id || '').replace(/^TCH-/, '')))
    .filter((n) => Number.isFinite(n))
  const max = nums.length ? Math.max(...nums) : 0
  return `TCH-${String(max + 1).padStart(3, '0')}`
}

function normalizeTeacherUsername(input, fallbackId) {
  const raw = String(input || '').trim().toLowerCase()
  if (raw) return raw.replace(/[^a-z0-9._-]/g, '')
  return String(fallbackId || '').toLowerCase()
}

function teacherPublicShape(u) {
  return {
    id: String(u.id),
    name: String(u.name || u.email || u.id),
    username: String(u.username || u.email || u.id),
    mobile: String(u.mobile || ''),
    email: String(u.email || ''),
    qualification: String(u.qualification || ''),
    expertise: String(u.expertise || ''),
    profilePhotoUrl: String(u.profilePhotoUrl || ''),
    assignedCourseIds: Array.isArray(u.assignedCourseIds) ? u.assignedCourseIds : [],
    perClassRate: Number(u.perClassRate) || 0,
    status: String(u.status || 'active').toLowerCase() === 'inactive' ? 'inactive' : 'active',
    role: u.role,
  }
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

function todayIso() {
  return parseDate(new Date().toISOString())
}

function monthKey(isoDate) {
  return String(isoDate || '').slice(0, 7)
}

function byOrder(a, b) {
  return (Number(a.order) || 0) - (Number(b.order) || 0)
}

function normCourseId(id) {
  return String(id || '').trim().toLowerCase()
}

function normMode(mode) {
  const m = String(mode || '').trim().toLowerCase()
  if (m === 'on-center' || m === 'offline' || m === 'oncenter') return 'on-center'
  if (m === 'self-paced' || m === 'selfpaced' || m === 'app') return 'self-paced'
  return 'online'
}

function normalizeTeacherIds(input) {
  const arr = Array.isArray(input) ? input : String(input || '').split(',')
  const list = arr.map((x) => String(x || '').trim()).filter(Boolean)
  return [...new Set(list)]
}

function computeBatchLifecycleStatus(batch, now = todayIso()) {
  const manual = String(batch?.status || '').toLowerCase()
  if (manual === 'completed' || manual === 'cancelled') return manual
  const start = parseDate(batch?.startDate || '')
  const end = parseDate(batch?.endDate || '')
  if (start && start > now) return 'upcoming'
  if (start && end && now >= start && now <= end) return 'active'
  if (end && now > end) return 'completed'
  return 'active'
}

function createTeacherNameMap(users) {
  const out = {}
  for (const u of users) {
    if (u.role !== 'teacher') continue
    out[String(u.id)] = u.name || u.email || u.id
  }
  // Requested default teacher when no assignment exists.
  out['NILanchal25'] = out['NILanchal25'] || 'NILanchal25'
  return out
}

function uniqueStudentIdsByPhone(studentIds, students) {
  const chosen = []
  const seenPhone = new Set()
  const seenStudentId = new Set()
  for (const sid of Array.isArray(studentIds) ? studentIds : []) {
    const id = String(sid || '').trim()
    if (!id || seenStudentId.has(id)) continue
    const stu = students.find((s) => s.id === id)
    if (!stu) continue
    const ph = normalizePhone(stu.phone)
    if (ph && seenPhone.has(ph)) continue
    if (ph) seenPhone.add(ph)
    seenStudentId.add(id)
    chosen.push(id)
  }
  return chosen
}

function addStudentNotifications(studentRows, studentsById, ids, message) {
  const now = new Date().toISOString()
  for (const sid of ids) {
    const stu = studentsById.get(sid)
    if (!stu?.accountUserId) continue
    studentRows.push({
      id: `stu-notif-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      userId: stu.accountUserId,
      message: String(message),
      read: false,
      createdAt: now,
    })
  }
}

function upsertBatchEnrollments(enrollments, studentIds, courseId, batchId, startDate, endDate) {
  const now = new Date().toISOString()
  const course = String(courseId || '')
  const batch = String(batchId || '')
  const start = parseDate(startDate || now)
  const expires = parseDate(endDate || start)
  for (const sid of studentIds) {
    const studentId = String(sid || '')
    if (!studentId) continue
    const idx = enrollments.findIndex(
      (e) =>
        String(e.studentId) === studentId &&
        normCourseId(e.courseId) === normCourseId(course) &&
        String(e.batchId || '') === batch
    )
    if (idx >= 0) {
      enrollments[idx] = {
        ...enrollments[idx],
        status: 'active',
        startDate: enrollments[idx].startDate || start,
        expiresAt: enrollments[idx].expiresAt || expires,
        updatedAt: now,
      }
    } else {
      enrollments.push({
        id: `enr-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        studentId,
        courseId: course,
        batchId: batch,
        status: 'active',
        startDate: start,
        expiresAt: expires,
        createdAt: now,
      })
    }
  }
}

function findTreeCourseIndex(tree, courseId) {
  const n = normCourseId(courseId)
  return tree.findIndex((x) => normCourseId(x.courseId) === n)
}

function getAuthUser(req) {
  const users = loadJson(PATHS.users, [])
  return users.find((u) => u.id === req.auth.userId) || null
}

function getTeacherAssignedCourseIds(req) {
  const me = getAuthUser(req)
  if (!me || me.role !== 'teacher') return null
  const list = Array.isArray(me.assignedCourseIds) ? me.assignedCourseIds : []
  return list.map((x) => String(x))
}

function canTeacherAccessCourse(req, courseId) {
  const assigned = getTeacherAssignedCourseIds(req)
  if (assigned == null) return true
  // Empty list = no restriction (otherwise teachers could not manage any course)
  if (assigned.length === 0) return true
  const n = normCourseId(courseId)
  return assigned.some((id) => normCourseId(id) === n)
}

function requireTeacherCourseAccess(req, res, courseId) {
  if (!canTeacherAccessCourse(req, courseId)) {
    res.status(403).json({ error: 'Teacher can manage only assigned courses' })
    return false
  }
  return true
}

function loadCourseContentTree() {
  return loadJson(PATHS.courseContent, [])
}

function saveCourseContentTree(tree) {
  saveJson(PATHS.courseContent, tree)
}

function loadCoursesWithLegacyFallback() {
  const academyCourses = loadJson(PATHS.courses, [])
  if (academyCourses.length > 0) return academyCourses

  const legacy = loadJson(PATHS.legacyCourses, [])
  if (!legacy.length) return academyCourses

  const seeded = legacy.map((c, idx) => ({
    id: String(c.id || `course-${Date.now()}-${idx}`),
    name: String(c.name || c.title || `Course ${idx + 1}`),
    description: String(c.description || ''),
    duration: String(c.duration || ''),
    status: String(c.status || 'active').toLowerCase() === 'draft' ? 'draft' : 'active',
    priceType: String(c.priceType || 'perClass10'),
    price: Number(c.price) || 10,
    createdAt: c.createdAt || new Date().toISOString(),
    migratedFromLegacy: true,
  }))

  saveJson(PATHS.courses, seeded)
  return seeded
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

router.get('/students/:id/dashboard-view', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const students = loadJson(PATHS.students, [])
  const student = students.find((s) => s.id === req.params.id)
  if (!student) return res.status(404).json({ error: 'Student not found' })
  const users = loadJson(PATHS.users, [])
  const authUser = users.find((u) => String(u.id) === String(student.accountUserId) && u.role === 'student') || null
  const walletAttendance = loadJson(PATHS.walletAttendance, [])
  const academyAttendance = loadJson(PATHS.attendance, [])
  const enrollments = loadJson(PATHS.enrollments, [])

  const today = parseDate(new Date().toISOString())
  const currentMonth = monthKey(today)
  const attendanceRows = academyAttendance.filter((a) => String(a.studentId) === String(student.id))
  const monthRows = attendanceRows.filter((a) => monthKey(a.date) === currentMonth)
  const monthPresent = monthRows.filter((a) => String(a.status) === 'present').length
  const monthAttendancePct = monthRows.length ? Math.round((monthPresent / monthRows.length) * 100) : 0

  const unlockByCourse = new Map()
  for (const e of enrollments) {
    if (String(e.studentId) !== String(student.id)) continue
    const cid = normCourseId(e.courseId)
    if (!cid || cid === 'trial-course') continue
    const start = parseDate(e.startDate || e.createdAt || '')
    if (!start) continue
    if (!unlockByCourse.has(cid) || start < unlockByCourse.get(cid)) unlockByCourse.set(cid, start)
  }
  const conducted = new Set()
  const present = new Set()
  for (const r of attendanceRows) {
    const cid = normCourseId(r.courseId)
    const unlockDate = unlockByCourse.get(cid)
    const date = parseDate(r.date)
    if (!cid || !unlockDate || !date || date < unlockDate) continue
    const key = `${cid}|${date}`
    conducted.add(key)
    if (String(r.status) === 'present') present.add(key)
  }
  const attendancePct = conducted.size ? Math.round((present.size / conducted.size) * 100) : 0

  const totalClassesAttended = walletAttendance
    .filter((x) => String(x.studentId) === String(student.accountUserId || ''))
    .reduce((sum, x) => sum + (Number(x.classesCount) || 0), 0)

  res.json({
    studentId: student.id,
    name: student.name || '',
    walletBalance: Number(authUser?.walletBalance) || 0,
    totalClassesAttended,
    attendancePercentage: attendancePct,
    monthlyAttendancePercentage: monthAttendancePct,
    classesConductedCount: conducted.size,
    classesPresentCount: present.size,
    feeStatus: String(student.enrollmentFeeStatus || 'pending'),
    batchId: String(student.batchId || ''),
    courseId: String(student.courseEnrolled || ''),
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
  const student = students.find((s) => s.id === req.params.id)
  if (!student) return res.status(404).json({ error: 'Student not found' })
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
  removeAdmissionsByPhones([student.phone])
  res.json({ success: true, enrollment: next })
})

router.post('/students/reset-password', auth, allowRoles(['admin']), (req, res) => {
  const { studentIdOrPhone, newPassword } = req.body || {}
  if (!String(studentIdOrPhone || '').trim() || !newPassword) {
    return res.status(400).json({ error: 'studentIdOrPhone and newPassword are required' })
  }
  const result = adminResetStudentPassword(String(studentIdOrPhone).trim(), String(newPassword))
  if (!result.ok) return res.status(400).json({ error: result.error })
  res.json({ success: true })
})

router.post('/admins/reset-password', auth, allowRoles(['admin']), (req, res) => {
  const { adminEmail, newPassword } = req.body || {}
  if (!String(adminEmail || '').trim() || !newPassword) {
    return res.status(400).json({ error: 'adminEmail and newPassword are required' })
  }
  const result = adminResetAdminPassword(String(adminEmail).trim(), String(newPassword))
  if (!result.ok) return res.status(400).json({ error: result.error })
  res.json({ success: true })
})

router.get('/teachers', auth, allowRoles(['admin', 'teacher']), (_req, res) => {
  const users = loadJson(PATHS.users, [])
  const teachers = users.filter((u) => u.role === 'teacher').map((u) => teacherPublicShape(u))
  if (!teachers.some((t) => t.id === 'NILanchal25')) {
    teachers.unshift({
      id: 'NILanchal25',
      name: 'NILanchal25 (Default)',
      username: 'nilanchal25',
      mobile: '',
      email: '',
      qualification: '',
      expertise: '',
      profilePhotoUrl: '',
      assignedCourseIds: [],
      perClassRate: 0,
      status: 'active',
      role: 'teacher',
    })
  }
  res.json({ teachers })
})

router.post('/teachers', auth, allowRoles(['admin']), (req, res) => {
  const {
    name,
    mobile,
    email = '',
    qualification = '',
    expertise = '',
    assignedCourseIds = [],
    username = '',
    password = '',
    profilePhotoUrl = '',
    perClassRate = 0,
  } = req.body || {}
  if (!name || !mobile || !password) return res.status(400).json({ error: 'name, mobile and password are required' })
  const users = loadJson(PATHS.users, [])
  const teacherId = nextTeacherId(users)
  const uName = normalizeTeacherUsername(username, teacherId)
  const phone = normalizePhone(mobile)
  if (phone.length !== 10) return res.status(400).json({ error: 'Valid 10-digit mobile is required' })
  if (users.some((u) => u.role === 'teacher' && String(u.username || '').toLowerCase() === uName)) {
    return res.status(409).json({ error: 'Username already exists' })
  }
  if (users.some((u) => u.role === 'teacher' && normalizePhone(u.mobile) === phone)) {
    return res.status(409).json({ error: 'Mobile already exists for another teacher' })
  }
  const next = {
    id: teacherId,
    role: 'teacher',
    name: String(name).trim(),
    mobile: phone,
    email: String(email || '').trim(),
    username: uName,
    qualification: String(qualification || '').trim(),
    expertise: String(expertise || '').trim(),
    assignedCourseIds: Array.isArray(assignedCourseIds) ? [...new Set(assignedCourseIds.map(String))] : [],
    passwordHash: hashPassword(String(password)),
    profilePhotoUrl: String(profilePhotoUrl || ''),
    perClassRate: Number(perClassRate) || 0,
    status: 'active',
    createdAt: new Date().toISOString(),
  }
  users.push(next)
  saveJson(PATHS.users, users)
  res.json({ success: true, teacher: teacherPublicShape(next) })
})

router.put('/teachers/:id', auth, allowRoles(['admin']), (req, res) => {
  const users = loadJson(PATHS.users, [])
  const idx = users.findIndex((u) => u.role === 'teacher' && String(u.id) === req.params.id)
  if (idx < 0) return res.status(404).json({ error: 'Teacher not found' })
  const prev = users[idx]
  const nextPhone = req.body?.mobile ? normalizePhone(req.body.mobile) : normalizePhone(prev.mobile)
  if (nextPhone && nextPhone.length !== 10) return res.status(400).json({ error: 'Valid 10-digit mobile is required' })
  if (
    nextPhone &&
    users.some((u) => u.id !== prev.id && u.role === 'teacher' && normalizePhone(u.mobile) === nextPhone)
  ) {
    return res.status(409).json({ error: 'Mobile already exists for another teacher' })
  }
  const nextUsername = req.body?.username ? normalizeTeacherUsername(req.body.username, prev.id) : prev.username
  if (
    nextUsername &&
    users.some((u) => u.id !== prev.id && u.role === 'teacher' && String(u.username || '').toLowerCase() === nextUsername)
  ) {
    return res.status(409).json({ error: 'Username already exists' })
  }
  users[idx] = {
    ...prev,
    ...req.body,
    mobile: nextPhone || '',
    username: nextUsername,
    assignedCourseIds: Array.isArray(req.body?.assignedCourseIds)
      ? [...new Set(req.body.assignedCourseIds.map(String))]
      : prev.assignedCourseIds || [],
    perClassRate: req.body?.perClassRate != null ? Number(req.body.perClassRate) || 0 : Number(prev.perClassRate) || 0,
    status: String(req.body?.status || prev.status || 'active').toLowerCase() === 'inactive' ? 'inactive' : 'active',
    updatedAt: new Date().toISOString(),
  }
  // Admin can reset password while editing teacher profile.
  if (req.body?.password) users[idx].passwordHash = hashPassword(String(req.body.password))
  saveJson(PATHS.users, users)
  res.json({ success: true, teacher: teacherPublicShape(users[idx]) })
})

router.patch('/teachers/:id/status', auth, allowRoles(['admin']), (req, res) => {
  const users = loadJson(PATHS.users, [])
  const idx = users.findIndex((u) => u.role === 'teacher' && String(u.id) === req.params.id)
  if (idx < 0) return res.status(404).json({ error: 'Teacher not found' })
  const status = String(req.body?.status || '').toLowerCase() === 'inactive' ? 'inactive' : 'active'
  users[idx] = { ...users[idx], status, updatedAt: new Date().toISOString() }
  saveJson(PATHS.users, users)
  res.json({ success: true, teacher: teacherPublicShape(users[idx]) })
})

router.delete('/teachers/:id', auth, allowRoles(['admin']), (req, res) => {
  const users = loadJson(PATHS.users, [])
  const idx = users.findIndex((u) => u.role === 'teacher' && String(u.id) === req.params.id)
  if (idx < 0) return res.status(404).json({ error: 'Teacher not found' })
  const teacherId = String(users[idx].id)
  const batches = loadJson(PATHS.batches, [])
  const linked = batches.some((b) => {
    const ids = normalizeTeacherIds(b.teacherIds?.length ? b.teacherIds : b.teacherId || '')
    return ids.includes(teacherId)
  })
  if (linked) {
    users[idx] = { ...users[idx], status: 'inactive', updatedAt: new Date().toISOString() }
    saveJson(PATHS.users, users)
    return res.status(409).json({
      error: 'Teacher has assigned batches. Teacher was deactivated (soft delete) instead.',
      softDeleted: true,
      teacher: teacherPublicShape(users[idx]),
    })
  }
  const next = users.filter((u) => String(u.id) !== teacherId)
  saveJson(PATHS.users, next)
  res.json({ success: true, deleted: true })
})

router.get('/teachers/attendance', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const teacherIdParam = String(req.query.teacherId || '')
  const month = String(req.query.month || '')
  const courseId = String(req.query.courseId || '')
  const batches = loadJson(PATHS.batches, [])
  const list = loadJson(PATHS.teacherAttendance, [])
  const me = getAuthUser(req)
  const teacherId = req.auth.role === 'teacher' ? String(me?.id || '') : teacherIdParam
  const batchById = new Map(batches.map((b) => [String(b.id), b]))
  const rows = list.filter((r) => {
    if (teacherId && String(r.teacherId) !== teacherId) return false
    if (month && monthKey(r.date) !== month) return false
    const b = batchById.get(String(r.batchId || ''))
    const cid = String(r.courseId || b?.courseId || '')
    if (courseId && normCourseId(cid) !== normCourseId(courseId)) return false
    return true
  })
  res.json({ attendance: rows.slice().reverse() })
})

router.post('/teachers/attendance', auth, allowRoles(['admin']), (req, res) => {
  const { teacherId, batchId, date, status } = req.body || {}
  if (!teacherId || !batchId || !date || !['present', 'absent'].includes(String(status || ''))) {
    return res.status(400).json({ error: 'teacherId, batchId, date and status(present/absent) are required' })
  }
  const users = loadJson(PATHS.users, [])
  const teacher = users.find((u) => u.role === 'teacher' && String(u.id) === String(teacherId))
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' })
  const batches = loadJson(PATHS.batches, [])
  const batch = batches.find((b) => String(b.id) === String(batchId))
  if (!batch) return res.status(404).json({ error: 'Batch not found' })
  const teacherIds = normalizeTeacherIds(batch.teacherIds?.length ? batch.teacherIds : batch.teacherId || '')
  if (!teacherIds.includes(String(teacherId))) {
    return res.status(400).json({ error: 'Teacher is not assigned to this batch' })
  }
  const list = loadJson(PATHS.teacherAttendance, [])
  const d = parseDate(date)
  const idx = list.findIndex(
    (r) => String(r.teacherId) === String(teacherId) && String(r.batchId) === String(batchId) && String(r.date) === d
  )
  const nextRow = {
    id: idx >= 0 ? list[idx].id : `tatt-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    teacherId: String(teacherId),
    batchId: String(batchId),
    courseId: String(batch.courseId || ''),
    date: d,
    status: String(status),
    markedBy: req.auth.userId,
    updatedAt: new Date().toISOString(),
    createdAt: idx >= 0 ? list[idx].createdAt : new Date().toISOString(),
  }
  if (idx >= 0) list[idx] = nextRow
  else list.push(nextRow)
  saveJson(PATHS.teacherAttendance, list)
  res.json({ success: true, attendance: nextRow })
})

router.get('/teachers/attendance-requests', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const month = String(req.query.month || '')
  const status = String(req.query.status || '')
  const teacherIdParam = String(req.query.teacherId || '')
  const me = getAuthUser(req)
  const teacherId = req.auth.role === 'teacher' ? String(me?.id || '') : teacherIdParam
  const rows = loadJson(PATHS.teacherAttendanceRequests, []).filter((r) => {
    if (teacherId && String(r.teacherId) !== teacherId) return false
    if (month && monthKey(r.date) !== month) return false
    if (status && String(r.status || '') !== status) return false
    return true
  })
  res.json({ requests: rows.slice().reverse() })
})

router.post('/teachers/attendance-requests', auth, allowRoles(['teacher']), (req, res) => {
  const me = getAuthUser(req)
  const teacherId = String(me?.id || '')
  if (!teacherId) return res.status(401).json({ error: 'Teacher not found' })
  const { batchId, date, status = 'present', note = '' } = req.body || {}
  if (!batchId || !date || !['present', 'absent'].includes(String(status))) {
    return res.status(400).json({ error: 'batchId, date, status(present/absent) are required' })
  }
  const batches = loadJson(PATHS.batches, [])
  const batch = batches.find((b) => String(b.id) === String(batchId))
  if (!batch) return res.status(404).json({ error: 'Batch not found' })
  const teacherIds = normalizeTeacherIds(batch.teacherIds?.length ? batch.teacherIds : batch.teacherId || '')
  if (!teacherIds.includes(teacherId)) return res.status(403).json({ error: 'You are not assigned to this batch' })
  const d = parseDate(date)
  const existingAttendance = loadJson(PATHS.teacherAttendance, []).some(
    (r) => String(r.teacherId) === teacherId && String(r.batchId) === String(batchId) && String(r.date) === d
  )
  if (existingAttendance) {
    return res.status(409).json({ error: 'Attendance already marked for this teacher, batch and date' })
  }
  const requests = loadJson(PATHS.teacherAttendanceRequests, [])
  const dupPending = requests.some(
    (r) =>
      String(r.teacherId) === teacherId &&
      String(r.batchId) === String(batchId) &&
      String(r.date) === d &&
      String(r.status) === 'pending'
  )
  if (dupPending) return res.status(409).json({ error: 'Pending request already exists for this batch and date' })
  const next = {
    id: `tattreq-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    teacherId,
    batchId: String(batchId),
    courseId: String(batch.courseId || ''),
    date: d,
    attendanceStatus: String(status),
    note: String(note || ''),
    status: 'pending',
    requestedAt: new Date().toISOString(),
  }
  requests.push(next)
  saveJson(PATHS.teacherAttendanceRequests, requests)
  res.json({ success: true, request: next })
})

router.post('/teachers/attendance-requests/:id/approve', auth, allowRoles(['admin']), (req, res) => {
  const requests = loadJson(PATHS.teacherAttendanceRequests, [])
  const idx = requests.findIndex((r) => String(r.id) === String(req.params.id))
  if (idx < 0) return res.status(404).json({ error: 'Request not found' })
  const row = requests[idx]
  if (String(row.status) !== 'pending') return res.status(400).json({ error: 'Request already processed' })
  const att = loadJson(PATHS.teacherAttendance, [])
  const aIdx = att.findIndex(
    (r) => String(r.teacherId) === String(row.teacherId) && String(r.batchId) === String(row.batchId) && String(r.date) === String(row.date)
  )
  const nextAtt = {
    id: aIdx >= 0 ? att[aIdx].id : `tatt-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    teacherId: String(row.teacherId),
    batchId: String(row.batchId),
    courseId: String(row.courseId || ''),
    date: String(row.date),
    status: String(row.attendanceStatus || 'present'),
    markedBy: req.auth.userId,
    updatedAt: new Date().toISOString(),
    createdAt: aIdx >= 0 ? att[aIdx].createdAt : new Date().toISOString(),
  }
  if (aIdx >= 0) att[aIdx] = nextAtt
  else att.push(nextAtt)
  saveJson(PATHS.teacherAttendance, att)
  requests[idx] = {
    ...row,
    status: 'approved',
    approvedBy: req.auth.userId,
    approvedAt: new Date().toISOString(),
  }
  saveJson(PATHS.teacherAttendanceRequests, requests)
  res.json({ success: true, request: requests[idx], attendance: nextAtt })
})

router.post('/teachers/attendance-requests/:id/reject', auth, allowRoles(['admin']), (req, res) => {
  const requests = loadJson(PATHS.teacherAttendanceRequests, [])
  const idx = requests.findIndex((r) => String(r.id) === String(req.params.id))
  if (idx < 0) return res.status(404).json({ error: 'Request not found' })
  if (String(requests[idx].status) !== 'pending') return res.status(400).json({ error: 'Request already processed' })
  requests[idx] = {
    ...requests[idx],
    status: 'rejected',
    rejectedBy: req.auth.userId,
    rejectedAt: new Date().toISOString(),
    rejectionNote: String(req.body?.note || ''),
  }
  saveJson(PATHS.teacherAttendanceRequests, requests)
  res.json({ success: true, request: requests[idx] })
})

router.get('/teachers/payments', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const teacherIdParam = String(req.query.teacherId || '')
  const month = String(req.query.month || '')
  const courseId = String(req.query.courseId || '')
  const me = getAuthUser(req)
  const teacherId = req.auth.role === 'teacher' ? String(me?.id || '') : teacherIdParam
  const batches = loadJson(PATHS.batches, [])
  const batchById = new Map(batches.map((b) => [String(b.id), b]))
  const rows = loadJson(PATHS.teacherPayments, []).filter((r) => {
    if (teacherId && String(r.teacherId) !== teacherId) return false
    if (month && monthKey(r.date) !== month) return false
    const cid = String(r.courseId || batchById.get(String(r.batchId || ''))?.courseId || '')
    if (courseId && normCourseId(cid) !== normCourseId(courseId)) return false
    return true
  })
  const summary = {}
  for (const r of rows) {
    const tid = String(r.teacherId)
    summary[tid] ||= { teacherId: tid, classes: 0, amount: 0 }
    summary[tid].classes += Number(r.classesCount) || 0
    summary[tid].amount += Number(r.totalAmount) || 0
  }
  res.json({ payments: rows.slice().reverse(), summary: Object.values(summary) })
})

router.post('/teachers/payments', auth, allowRoles(['admin']), (req, res) => {
  const { teacherId, batchId, date, classesCount = 1, rate, bonus = 0, note = '' } = req.body || {}
  if (!teacherId || !batchId || !date) return res.status(400).json({ error: 'teacherId, batchId, date are required' })
  const users = loadJson(PATHS.users, [])
  const teacher = users.find((u) => u.role === 'teacher' && String(u.id) === String(teacherId))
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' })
  const batches = loadJson(PATHS.batches, [])
  const batch = batches.find((b) => String(b.id) === String(batchId))
  if (!batch) return res.status(404).json({ error: 'Batch not found' })
  const attendance = loadJson(PATHS.teacherAttendance, [])
  const d = parseDate(date)
  const attendancePresent = attendance.some(
    (a) =>
      String(a.teacherId) === String(teacherId) &&
      String(a.batchId) === String(batchId) &&
      String(a.date) === d &&
      String(a.status) === 'present'
  )
  if (!attendancePresent) {
    return res.status(400).json({ error: 'Payment allowed only when teacher attendance is marked present for that batch/date' })
  }
  const list = loadJson(PATHS.teacherPayments, [])
  if (list.some((r) => String(r.teacherId) === String(teacherId) && String(r.batchId) === String(batchId) && String(r.date) === d)) {
    return res.status(409).json({ error: 'Payment entry already exists for same teacher, batch and date' })
  }
  const effectiveRate = Number(rate != null ? rate : teacher.perClassRate) || 0
  const cls = Math.max(1, Number(classesCount) || 1)
  const extra = Number(bonus) || 0
  const total = cls * effectiveRate + extra
  const next = {
    id: `tpay-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    teacherId: String(teacherId),
    batchId: String(batchId),
    courseId: String(batch.courseId || ''),
    date: d,
    classesCount: cls,
    rate: effectiveRate,
    bonus: extra,
    totalAmount: total,
    note: String(note || ''),
    createdBy: req.auth.userId,
    createdAt: new Date().toISOString(),
  }
  list.push(next)
  saveJson(PATHS.teacherPayments, list)
  res.json({ success: true, payment: next })
})

// ===== Courses =====
router.get('/courses', auth, allowRoles(['admin', 'teacher']), (_req, res) => {
  const courses = loadCoursesWithLegacyFallback()
  res.json({ courses: courses.slice().reverse() })
})

router.post('/courses', auth, allowRoles(['admin']), (req, res) => {
  const { name, description = '', duration = '', status = 'active', priceType = 'perClass10', price = 10 } = req.body || {}
  if (!name) return res.status(400).json({ error: 'name is required' })
  const courses = loadJson(PATHS.courses, [])
  const next = {
    id: `course-${Date.now()}`,
    name: String(name),
    description: String(description),
    duration: String(duration),
    status: String(status || 'active').toLowerCase() === 'draft' ? 'draft' : 'active',
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

// ===== Course Content (Course -> Modules -> Chapters) =====
router.get('/content/courses', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const courses = loadJson(PATHS.courses, [])
  const tree = loadCourseContentTree()
  const assigned = getTeacherAssignedCourseIds(req)
  const baseCourses =
    assigned == null || assigned.length === 0
      ? courses
      : courses.filter((c) => assigned.some((id) => normCourseId(id) === normCourseId(c.id)))
  const out = baseCourses.map((course) => {
    const node = tree.find((x) => normCourseId(x.courseId) === normCourseId(course.id)) || { modules: [] }
    const modules = (node.modules || [])
      .slice()
      .sort(byOrder)
      .map((m) => ({
        ...m,
        chapters: (m.chapters || []).slice().sort(byOrder),
      }))
    return { ...course, modules }
  })
  res.json({ courses: out })
})

router.post('/content/courses/:courseId/modules', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const courseId = String(req.params.courseId)
  if (!requireTeacherCourseAccess(req, res, courseId)) return
  const { title, order } = req.body || {}
  if (!title) return res.status(400).json({ error: 'title is required' })
  const tree = loadCourseContentTree()
  let idx = findTreeCourseIndex(tree, courseId)
  const node = idx >= 0 ? tree[idx] : { courseId: normCourseId(courseId), modules: [] }
  const next = {
    id: `mod-${Date.now()}`,
    title: String(title),
    order: Number(order) || node.modules.length + 1,
    chapters: [],
    createdAt: new Date().toISOString(),
  }
  node.modules.push(next)
  node.modules.sort(byOrder)
  if (idx >= 0) tree[idx] = node
  else tree.push(node)
  saveCourseContentTree(tree)
  res.json({ success: true, module: next })
})

router.put('/content/courses/:courseId/modules/:moduleId', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const courseId = String(req.params.courseId)
  if (!requireTeacherCourseAccess(req, res, courseId)) return
  const moduleId = String(req.params.moduleId)
  const tree = loadCourseContentTree()
  const idx = findTreeCourseIndex(tree, courseId)
  if (idx < 0) return res.status(404).json({ error: 'Course content not found' })
  const modules = tree[idx].modules || []
  const mIdx = modules.findIndex((m) => String(m.id) === moduleId)
  if (mIdx < 0) return res.status(404).json({ error: 'Module not found' })
  modules[mIdx] = { ...modules[mIdx], ...req.body, updatedAt: new Date().toISOString() }
  modules.sort(byOrder)
  tree[idx].modules = modules
  saveCourseContentTree(tree)
  res.json({ success: true, module: modules[mIdx] })
})

router.delete('/content/courses/:courseId/modules/:moduleId', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const courseId = String(req.params.courseId)
  if (!requireTeacherCourseAccess(req, res, courseId)) return
  const moduleId = String(req.params.moduleId)
  const tree = loadCourseContentTree()
  const idx = findTreeCourseIndex(tree, courseId)
  if (idx < 0) return res.status(404).json({ error: 'Course content not found' })
  const next = (tree[idx].modules || []).filter((m) => String(m.id) !== moduleId)
  tree[idx].modules = next
  saveCourseContentTree(tree)
  res.json({ success: true })
})

router.post('/content/courses/:courseId/modules/reorder', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const courseId = String(req.params.courseId)
  if (!requireTeacherCourseAccess(req, res, courseId)) return
  const orders = Array.isArray(req.body?.orders) ? req.body.orders : []
  const tree = loadCourseContentTree()
  const idx = findTreeCourseIndex(tree, courseId)
  if (idx < 0) return res.status(404).json({ error: 'Course content not found' })
  const map = new Map(orders.map((o) => [String(o.id), Number(o.order) || 0]))
  tree[idx].modules = (tree[idx].modules || [])
    .map((m) => ({ ...m, order: map.has(String(m.id)) ? map.get(String(m.id)) : m.order }))
    .sort(byOrder)
  saveCourseContentTree(tree)
  res.json({ success: true, modules: tree[idx].modules })
})

router.post('/content/courses/:courseId/modules/:moduleId/chapters', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const courseId = String(req.params.courseId)
  if (!requireTeacherCourseAccess(req, res, courseId)) return
  const moduleId = String(req.params.moduleId)
  const { title, videoUrl, description = '', heading = '', order, noteText = '', resourceType = 'video' } = req.body || {}
  if (!title || !videoUrl) return res.status(400).json({ error: 'title and videoUrl are required' })
  const tree = loadCourseContentTree()
  const idx = findTreeCourseIndex(tree, courseId)
  if (idx < 0) return res.status(404).json({ error: 'Course content not found' })
  const modules = tree[idx].modules || []
  const mIdx = modules.findIndex((m) => String(m.id) === moduleId)
  if (mIdx < 0) return res.status(404).json({ error: 'Module not found' })
  const list = modules[mIdx].chapters || []
  const next = {
    id: `ch-${Date.now()}`,
    title: String(title),
    heading: String(heading || title),
    videoUrl: String(videoUrl),
    description: String(description),
    resourceType: String(resourceType || 'video'),
    noteText: String(noteText || ''),
    order: Number(order) || list.length + 1,
    createdAt: new Date().toISOString(),
  }
  list.push(next)
  list.sort(byOrder)
  modules[mIdx].chapters = list
  tree[idx].modules = modules
  saveCourseContentTree(tree)
  res.json({ success: true, chapter: next })
})

router.put('/content/courses/:courseId/modules/:moduleId/chapters/:chapterId', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const courseId = String(req.params.courseId)
  if (!requireTeacherCourseAccess(req, res, courseId)) return
  const moduleId = String(req.params.moduleId)
  const chapterId = String(req.params.chapterId)
  const tree = loadCourseContentTree()
  const idx = findTreeCourseIndex(tree, courseId)
  if (idx < 0) return res.status(404).json({ error: 'Course content not found' })
  const modules = tree[idx].modules || []
  const mIdx = modules.findIndex((m) => String(m.id) === moduleId)
  if (mIdx < 0) return res.status(404).json({ error: 'Module not found' })
  const chapters = modules[mIdx].chapters || []
  const cIdx = chapters.findIndex((c) => String(c.id) === chapterId)
  if (cIdx < 0) return res.status(404).json({ error: 'Chapter not found' })
  chapters[cIdx] = { ...chapters[cIdx], ...req.body, updatedAt: new Date().toISOString() }
  chapters.sort(byOrder)
  modules[mIdx].chapters = chapters
  tree[idx].modules = modules
  saveCourseContentTree(tree)
  res.json({ success: true, chapter: chapters[cIdx] })
})

router.delete('/content/courses/:courseId/modules/:moduleId/chapters/:chapterId', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const courseId = String(req.params.courseId)
  if (!requireTeacherCourseAccess(req, res, courseId)) return
  const moduleId = String(req.params.moduleId)
  const chapterId = String(req.params.chapterId)
  const tree = loadCourseContentTree()
  const idx = findTreeCourseIndex(tree, courseId)
  if (idx < 0) return res.status(404).json({ error: 'Course content not found' })
  const modules = tree[idx].modules || []
  const mIdx = modules.findIndex((m) => String(m.id) === moduleId)
  if (mIdx < 0) return res.status(404).json({ error: 'Module not found' })
  modules[mIdx].chapters = (modules[mIdx].chapters || []).filter((c) => String(c.id) !== chapterId)
  tree[idx].modules = modules
  saveCourseContentTree(tree)
  res.json({ success: true })
})

router.post('/content/courses/:courseId/modules/:moduleId/chapters/reorder', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const courseId = String(req.params.courseId)
  if (!requireTeacherCourseAccess(req, res, courseId)) return
  const moduleId = String(req.params.moduleId)
  const orders = Array.isArray(req.body?.orders) ? req.body.orders : []
  const tree = loadCourseContentTree()
  const idx = findTreeCourseIndex(tree, courseId)
  if (idx < 0) return res.status(404).json({ error: 'Course content not found' })
  const modules = tree[idx].modules || []
  const mIdx = modules.findIndex((m) => String(m.id) === moduleId)
  if (mIdx < 0) return res.status(404).json({ error: 'Module not found' })
  const map = new Map(orders.map((o) => [String(o.id), Number(o.order) || 0]))
  modules[mIdx].chapters = (modules[mIdx].chapters || [])
    .map((c) => ({ ...c, order: map.has(String(c.id)) ? map.get(String(c.id)) : c.order }))
    .sort(byOrder)
  tree[idx].modules = modules
  saveCourseContentTree(tree)
  res.json({ success: true, chapters: modules[mIdx].chapters })
})

// ===== Batches =====
router.get('/batches', auth, allowRoles(['admin', 'teacher']), (_req, res) => {
  const batches = loadJson(PATHS.batches, [])
  const students = loadJson(PATHS.students, [])
  const users = loadJson(PATHS.users, [])
  const teacherNameMap = createTeacherNameMap(users)
  const withSize = batches.map((b) => ({
    ...b,
    mode: b.mode ? normMode(b.mode) : 'online',
    teacherIds: normalizeTeacherIds(b.teacherIds?.length ? b.teacherIds : b.teacherId || 'NILanchal25'),
    status: computeBatchLifecycleStatus(b),
    teacherNames: normalizeTeacherIds(b.teacherIds?.length ? b.teacherIds : b.teacherId || 'NILanchal25').map(
      (id) => teacherNameMap[id] || id
    ),
    batchSize: students.filter((s) => s.batchId === b.id).length,
  }))
  res.json({ batches: withSize.slice().reverse() })
})

router.post('/batches', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const { name, monthYear, courseId, timing, startDate, endDate, mode = 'online', teacherId, teacherIds, studentIds = [] } =
    req.body || {}
  if (!name || !courseId || !timing || !startDate || !endDate) {
    return res.status(400).json({ error: 'name, courseId, timing, startDate, endDate are required' })
  }
  if (!requireTeacherCourseAccess(req, res, courseId)) return
  const batches = loadJson(PATHS.batches, [])
  const students = loadJson(PATHS.students, [])
  const enrollments = loadJson(PATHS.enrollments, [])
  const notifications = loadJson(PATHS.studentNotifications, [])
  const selectedStudentIds = uniqueStudentIdsByPhone(studentIds, students)
  const finalTeacherIds = normalizeTeacherIds(teacherIds?.length ? teacherIds : teacherId || 'NILanchal25')
  const next = {
    id: `batch-${Date.now()}`,
    name: String(name),
    monthYear: String(monthYear || monthKey(startDate)),
    courseId: String(courseId),
    timing: String(timing),
    mode: normMode(mode),
    startDate: parseDate(startDate),
    endDate: parseDate(endDate),
    status: String(req.body?.status || '').toLowerCase() === 'cancelled' ? 'cancelled' : 'active',
    teacherIds: finalTeacherIds,
    teacherId: finalTeacherIds[0] || 'NILanchal25',
    studentIds: selectedStudentIds,
    createdAt: new Date().toISOString(),
  }
  batches.push(next)
  saveJson(PATHS.batches, batches)
  if (selectedStudentIds.length) {
    const selected = new Set(selectedStudentIds)
    for (const s of students) {
      if (selected.has(s.id)) {
        s.batchId = next.id
        if (!s.courseEnrolled) s.courseEnrolled = String(courseId)
      }
    }
    saveJson(PATHS.students, students)
    upsertBatchEnrollments(enrollments, selectedStudentIds, courseId, next.id, next.startDate, next.endDate)
    saveJson(PATHS.enrollments, enrollments)
    const map = new Map(students.map((s) => [s.id, s]))
    addStudentNotifications(
      notifications,
      map,
      selectedStudentIds,
      `You were added to batch "${next.name}". Timing: ${next.timing}.`
    )
    saveJson(PATHS.studentNotifications, notifications)
  }
  res.json({ success: true, batch: next })
})

router.put('/batches/:id', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const batches = loadJson(PATHS.batches, [])
  const idx = batches.findIndex((x) => x.id === req.params.id)
  if (idx < 0) return res.status(404).json({ error: 'Batch not found' })
  const students = loadJson(PATHS.students, [])
  const enrollments = loadJson(PATHS.enrollments, [])
  const notifications = loadJson(PATHS.studentNotifications, [])
  const prev = batches[idx]
  const nextCourseId = String(req.body?.courseId ?? prev.courseId ?? '')
  if (!requireTeacherCourseAccess(req, res, nextCourseId)) return
  const hasStudentIdsUpdate = Array.isArray(req.body?.studentIds)
  const mergedTeacherIds = normalizeTeacherIds(
    req.body?.teacherIds?.length ? req.body.teacherIds : req.body?.teacherId ?? prev.teacherIds ?? prev.teacherId ?? 'NILanchal25'
  )
  const nextStudentIds = hasStudentIdsUpdate
    ? uniqueStudentIdsByPhone(req.body.studentIds, students)
    : Array.isArray(prev.studentIds)
      ? prev.studentIds
      : []
  const nextBatch = {
    ...prev,
    ...req.body,
    mode: req.body?.mode ? normMode(req.body.mode) : normMode(prev.mode || 'online'),
    startDate: req.body?.startDate ? parseDate(req.body.startDate) : prev.startDate,
    endDate: req.body?.endDate ? parseDate(req.body.endDate) : prev.endDate,
    teacherIds: mergedTeacherIds,
    teacherId: mergedTeacherIds[0] || 'NILanchal25',
    studentIds: nextStudentIds,
    updatedAt: new Date().toISOString(),
  }
  batches[idx] = nextBatch
  saveJson(PATHS.batches, batches)

  const prevSet = new Set(Array.isArray(prev.studentIds) ? prev.studentIds : [])
  const nextSet = new Set(nextStudentIds)
  const addedStudentIds = [...nextSet].filter((id) => !prevSet.has(id))
  const removedStudentIds = [...prevSet].filter((id) => !nextSet.has(id))

  if (hasStudentIdsUpdate) {
    for (const s of students) {
      if (nextSet.has(s.id)) {
        s.batchId = nextBatch.id
        if (!s.courseEnrolled) s.courseEnrolled = String(nextBatch.courseId || s.courseEnrolled || '')
      } else if (s.batchId === nextBatch.id && removedStudentIds.includes(s.id)) {
        s.batchId = ''
      }
    }
    saveJson(PATHS.students, students)
  }

  const effectiveStudentIds = hasStudentIdsUpdate
    ? nextStudentIds
    : Array.isArray(prev.studentIds)
      ? prev.studentIds
      : []
  if (effectiveStudentIds.length) {
    upsertBatchEnrollments(
      enrollments,
      effectiveStudentIds,
      nextBatch.courseId,
      nextBatch.id,
      nextBatch.startDate || prev.startDate,
      nextBatch.endDate || prev.endDate
    )
    saveJson(PATHS.enrollments, enrollments)
  }

  const changedTiming = typeof req.body?.timing === 'string' && String(req.body.timing) !== String(prev.timing || '')
  const changedTeacher =
    req.body?.teacherId != null ||
    (Array.isArray(req.body?.teacherIds) &&
      normalizeTeacherIds(req.body.teacherIds).join(',') !== normalizeTeacherIds(prev.teacherIds || prev.teacherId).join(','))

  const studentsById = new Map(students.map((s) => [s.id, s]))
  if (addedStudentIds.length) {
    addStudentNotifications(
      notifications,
      studentsById,
      addedStudentIds,
      `You were added to batch "${nextBatch.name}". Timing: ${nextBatch.timing}.`
    )
  }
  if (removedStudentIds.length) {
    addStudentNotifications(notifications, studentsById, removedStudentIds, `You were removed from batch "${nextBatch.name}".`)
  }
  if (changedTiming || changedTeacher) {
    const studentIdsToNotify = hasStudentIdsUpdate ? nextStudentIds : Array.isArray(prev.studentIds) ? prev.studentIds : []
    const msg = changedTiming && changedTeacher
      ? `Batch "${nextBatch.name}" timing and teacher have been updated.`
      : changedTiming
        ? `Batch "${nextBatch.name}" timing has changed to ${nextBatch.timing}.`
        : `Batch "${nextBatch.name}" teacher has been changed.`
    addStudentNotifications(notifications, studentsById, studentIdsToNotify, msg)
  }
  saveJson(PATHS.studentNotifications, notifications)
  res.json({ success: true, batch: nextBatch })
})

router.post('/batches/:id/mark-completed', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const batches = loadJson(PATHS.batches, [])
  const idx = batches.findIndex((x) => x.id === req.params.id)
  if (idx < 0) return res.status(404).json({ error: 'Batch not found' })
  batches[idx] = {
    ...batches[idx],
    status: 'completed',
    completedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  saveJson(PATHS.batches, batches)

  const students = loadJson(PATHS.students, [])
  const enrollments = loadJson(PATHS.enrollments, [])
  const studentsById = new Map(students.map((s) => [s.id, s]))
  const notifications = loadJson(PATHS.studentNotifications, [])
  const ids = Array.isArray(batches[idx].studentIds) ? batches[idx].studentIds : []
  for (const e of enrollments) {
    if (String(e.batchId || '') !== String(batches[idx].id)) continue
    e.status = 'completed'
    if (!e.expiresAt) e.expiresAt = parseDate(batches[idx].endDate || new Date().toISOString())
    e.updatedAt = new Date().toISOString()
  }
  saveJson(PATHS.enrollments, enrollments)
  addStudentNotifications(notifications, studentsById, ids, `Batch "${batches[idx].name}" has been marked as completed.`)
  saveJson(PATHS.studentNotifications, notifications)
  res.json({ success: true, batch: batches[idx] })
})

// ===== Attendance =====
router.get('/attendance', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const month = String(req.query.month || '')
  const courseId = String(req.query.courseId || '')
  const batchId = String(req.query.batchId || '')
  const date = parseDate(req.query.date || '')
  const mobile = normalizePhone(req.query.mobile || '')
  const unlockedOnly = String(req.query.unlockedOnly || '').toLowerCase() === 'true'
  const records = loadJson(PATHS.attendance, [])
  const students = loadJson(PATHS.students, [])
  const batches = loadJson(PATHS.batches, [])
  const enrollments = loadJson(PATHS.enrollments, [])
  const batchById = new Map(batches.map((b) => [String(b.id), b]))
  const studentsById = new Map(students.map((s) => [String(s.id), s]))
  const hasEnrollment = (studentId, cid) =>
    enrollments.some((e) => String(e.studentId) === String(studentId) && normCourseId(e.courseId) === normCourseId(cid))

  const filtered = records.filter((r) => {
    const b = batchById.get(String(r.batchId || ''))
    const recCourse = String(r.courseId || b?.courseId || '')
    const stu = studentsById.get(String(r.studentId || ''))
    if (batchId && String(r.batchId) !== batchId) return false
    if (date && parseDate(r.date) !== date) return false
    if (month && monthKey(r.date) !== month) return false
    if (courseId && normCourseId(recCourse) !== normCourseId(courseId)) return false
    if (mobile && normalizePhone(stu?.phone) !== mobile) return false
    if (unlockedOnly && !hasEnrollment(r.studentId, recCourse)) return false
    return true
  })
  res.json({ attendance: filtered.slice().reverse() })
})

router.post('/attendance/mark', auth, allowRoles(['admin', 'teacher']), (req, res) => {
  const { date, batchId, studentId, status } = req.body || {}
  if (!date || !batchId || !studentId || !['present', 'absent'].includes(String(status))) {
    return res.status(400).json({ error: 'date, batchId, studentId, status(present/absent) are required' })
  }
  const records = loadJson(PATHS.attendance, [])
  const batches = loadJson(PATHS.batches, [])
  const batch = batches.find((b) => String(b.id) === String(batchId))
  if (!batch) return res.status(404).json({ error: 'Batch not found' })
  if (!requireTeacherCourseAccess(req, res, batch.courseId)) return
  const d = parseDate(date)
  const courseId = String(batch.courseId || '')
  // Prevent duplicate attendance for the same student+course+date
  const idx = records.findIndex(
    (r) =>
      r.date === d &&
      String(r.studentId) === String(studentId) &&
      normCourseId(r.courseId || '') === normCourseId(courseId)
  )
  if (idx >= 0) {
    records[idx] = {
      ...records[idx],
      batchId: String(batchId),
      courseId,
      status: String(status),
      updatedAt: new Date().toISOString(),
    }
  } else {
    records.push({
      id: `att-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      date: d,
      batchId: String(batchId),
      courseId,
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
  const courseId = String(req.query.courseId || '')
  const batchId = String(req.query.batchId || '')
  const mobile = normalizePhone(req.query.mobile || '')
  const unlockedOnly = String(req.query.unlockedOnly || '').toLowerCase() === 'true'
  const records = loadJson(PATHS.attendance, [])
  const students = loadJson(PATHS.students, [])
  const batches = loadJson(PATHS.batches, [])
  const enrollments = loadJson(PATHS.enrollments, [])
  const batchById = new Map(batches.map((b) => [String(b.id), b]))
  const studentsById = new Map(students.map((s) => [String(s.id), s]))
  const hasEnrollment = (studentId, cid) =>
    enrollments.some((e) => String(e.studentId) === String(studentId) && normCourseId(e.courseId) === normCourseId(cid))

  const filtered = records.filter((r) => {
    if (monthKey(r.date) !== month) return false
    if (batchId && String(r.batchId) !== batchId) return false
    const b = batchById.get(String(r.batchId || ''))
    const recCourse = String(r.courseId || b?.courseId || '')
    if (courseId && normCourseId(recCourse) !== normCourseId(courseId)) return false
    const stu = studentsById.get(String(r.studentId || ''))
    if (mobile && normalizePhone(stu?.phone) !== mobile) return false
    if (unlockedOnly && !hasEnrollment(r.studentId, recCourse)) return false
    return true
  })
  const byStudent = {}
  for (const r of filtered) {
    byStudent[r.studentId] ||= { present: 0, absent: 0, total: 0, studentId: r.studentId, name: '', phone: '' }
    byStudent[r.studentId].total += 1
    byStudent[r.studentId][r.status] += 1
  }
  const rows = Object.keys(byStudent).map((sid) => {
    const x = byStudent[sid]
    const s = studentsById.get(String(sid))
    const percentage = x.total ? Math.round((x.present / x.total) * 100) : 0
    return {
      ...x,
      name: s?.name || sid,
      phone: s?.phone || '',
      percentage,
      below75: percentage < 75,
    }
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

router.get('/admin-alerts', auth, allowRoles(['admin', 'teacher']), (_req, res) => {
  const alerts = loadJson(PATHS.adminAlerts, [])
  res.json({ alerts: alerts.slice().reverse() })
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
  const credited = Number(requests[idx].amount) || 0
  if (u) {
    u.walletBalance = (Number(u.walletBalance) || 0) + credited
    saveJson(PATHS.users, users)
  }
  const notifs = loadJson(PATHS.studentNotifications, [])
  notifs.push({
    id: `stu-notif-${Date.now()}`,
    userId: requests[idx].authUserId,
    message: `₹${credited} (promotional offer credit) has been added successfully to your wallet.`,
    read: false,
    createdAt: new Date().toISOString(),
  })
  saveJson(PATHS.studentNotifications, notifs)
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
  const { title, resourceType, url, courseId = '', batchId = '', chapter = 'General', noteText = '' } = req.body || {}
  if (!title || !resourceType || !url || !courseId) {
    return res.status(400).json({ error: 'title, resourceType, url, courseId are required' })
  }
  const notes = loadJson(PATHS.notes, [])
  const next = {
    id: `note-${Date.now()}`,
    title: String(title),
    resourceType: String(resourceType), // pdf | video | link
    url: String(url),
    courseId: String(courseId),
    batchId: String(batchId),
    chapter: String(chapter || 'General'),
    noteText: String(noteText || ''),
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
  const admissions = reconcileAdmissionsQueueRows()
  const users = loadJson(PATHS.users, [])
  const teacherAttendance = loadJson(PATHS.teacherAttendance, [])
  const teacherPayments = loadJson(PATHS.teacherPayments, [])

  const today = parseDate(new Date().toISOString())
  const currentMonth = monthKey(today)
  const revenueDaily = fees.filter((x) => x.date === today).reduce((a, b) => a + (Number(b.amount) || 0), 0)
  const revenueMonthly = fees.filter((x) => monthKey(x.date) === currentMonth).reduce((a, b) => a + (Number(b.amount) || 0), 0)

  const present = attendance.filter((x) => x.status === 'present').length
  const attendanceRate = attendance.length ? Math.round((present / attendance.length) * 100) : 0

  // Course-wise student metrics must come from actual unlock/completion history.
  const studentEnrollments = loadJson(PATHS.enrollments, [])
  const courseWiseLifecycle = {}
  for (const e of studentEnrollments) {
    const courseId = normCourseId(e.courseId)
    if (!courseId || courseId === 'trial-course') continue
    courseWiseLifecycle[courseId] ||= { unlockedStudents: new Set(), completedStudents: new Set() }
    courseWiseLifecycle[courseId].unlockedStudents.add(String(e.studentId || ''))
    if (String(e.status || '').toLowerCase() === 'completed') {
      courseWiseLifecycle[courseId].completedStudents.add(String(e.studentId || ''))
    }
  }
  const courseWise = {}
  const courseWiseLifecycleOut = {}
  for (const [courseId, bucket] of Object.entries(courseWiseLifecycle)) {
    const unlockedCount = bucket.unlockedStudents.size
    const completedCount = bucket.completedStudents.size
    courseWise[courseId] = unlockedCount
    courseWiseLifecycleOut[courseId] = {
      unlocked: unlockedCount,
      completed: completedCount,
    }
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

  const statusBuckets = { active: 0, upcoming: 0, completed: 0, cancelled: 0 }
  const batchStudentCount = {}
  for (const b of batches) {
    const status = computeBatchLifecycleStatus(b)
    statusBuckets[status] = (statusBuckets[status] || 0) + 1
    batchStudentCount[b.id] = students.filter((s) => s.batchId === b.id).length
  }

  const coursePerformance = {}
  for (const b of batches) {
    const cid = String(b.courseId || 'unassigned')
    coursePerformance[cid] ||= { batches: 0, students: 0, completed: 0 }
    coursePerformance[cid].batches += 1
    coursePerformance[cid].students += batchStudentCount[b.id] || 0
    if (computeBatchLifecycleStatus(b) === 'completed') coursePerformance[cid].completed += 1
  }

  const admissionCount = admissions.length
  const activeStudentCount = students.length
  const funnelTotal = admissionCount + activeStudentCount
  const conversionRate = funnelTotal ? Math.round((activeStudentCount / funnelTotal) * 100) : 0
  const referralMap = {}
  for (const a of admissions) {
    const code = String(a.referralCode || '').trim().toUpperCase()
    if (!code) continue
    referralMap[code] = (referralMap[code] || 0) + 1
  }
  const referralPerformance = Object.entries(referralMap)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const teacherMap = new Map(users.filter((u) => u.role === 'teacher').map((u) => [String(u.id), u]))
  const teacherAttendanceById = {}
  const teacherPresentById = {}
  const teacherEarningsTrend = {}
  const teacherClassesTrend = {}
  for (const a of teacherAttendance) {
    const tid = String(a.teacherId || '')
    if (!tid) continue
    teacherAttendanceById[tid] = (teacherAttendanceById[tid] || 0) + 1
    if (String(a.status) === 'present') teacherPresentById[tid] = (teacherPresentById[tid] || 0) + 1
    const m = monthKey(a.date || a.createdAt)
    teacherClassesTrend[m] = (teacherClassesTrend[m] || 0) + (String(a.status) === 'present' ? 1 : 0)
  }
  for (const p of teacherPayments) {
    const m = monthKey(p.date || p.createdAt)
    teacherEarningsTrend[m] = (teacherEarningsTrend[m] || 0) + (Number(p.totalAmount) || 0)
  }
  const topPerformingTeachers = Object.keys(teacherAttendanceById)
    .map((tid) => {
      const total = teacherAttendanceById[tid] || 0
      const presentCount = teacherPresentById[tid] || 0
      return {
        teacherId: tid,
        name: String(teacherMap.get(tid)?.name || tid),
        consistency: total ? Math.round((presentCount / total) * 100) : 0,
        total,
      }
    })
    .sort((a, b) => b.consistency - a.consistency || b.total - a.total)
    .slice(0, 10)

  res.json({
    totals: {
      totalStudents: students.length,
      totalBatches: batches.length,
      activeBatches: statusBuckets.active,
      completedBatches: statusBuckets.completed,
      revenueDaily,
      revenueMonthly,
      attendanceRate,
    },
    batchesAnalytics: {
      statuses: statusBuckets,
      studentCountPerBatch: batchStudentCount,
      coursePerformance,
    },
    admissionsAnalytics: {
      queueCount: admissionCount,
      activeStudents: activeStudentCount,
      conversionRate,
      referralPerformance,
    },
    teacherInsights: {
      topPerformingTeachers,
      teacherClassesTrend,
      teacherEarningsTrend,
    },
    courseWiseStudents: courseWise,
    courseWiseLifecycle: courseWiseLifecycleOut,
    studentGrowth: growthMap,
    revenueTrend: revenueMap,
  })
})

/** Certification profiles (structured data + file URLs) — admin/teacher read-only */
router.get('/student-profiles', auth, allowRoles(['admin', 'teacher']), (_req, res) => {
  const profiles = loadJson(PATHS.studentProfiles, [])
  res.json({ profiles: profiles.slice().reverse() })
})

export default router

