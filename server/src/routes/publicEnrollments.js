import { Router } from 'express'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { hashPassword, getUsers, saveUsers } from '../auth.js'
import { createReferralReviewRequest } from '../referrals.js'
import {
  generateNitaStudentId,
  defaultPasswordFromPhone,
  normalizePhoneDigits,
} from '../enrollmentCredentials.js'
import { readJsonSync, writeJsonSync } from '../services/sheetsJsonStore.js'

const router = Router()
const __dirname = dirname(fileURLToPath(import.meta.url))
const ENROLLMENTS_PATH = join(__dirname, '..', 'data', 'enrollments.json')
const STUDENTS_PATH = join(__dirname, '..', 'data', 'students.json')
const STUDENT_ENROLLMENTS_PATH = join(__dirname, '..', 'data', 'student_enrollments.json')

function loadJson(path) {
  return readJsonSync(path, [])
}

function saveJson(path, data) {
  writeJsonSync(path, data)
}

function normalizeMobile(input) {
  return normalizePhoneDigits(input)
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
  const phone = normalizeMobile(row?.mobile)
  if (!phone) return false
  const student = students.find((s) => normalizeMobile(s.phone) === phone)
  const user = users.find((u) => u.role === 'student' && normalizeMobile(u.email) === phone)
  if (!student || !user) return false
  return studentEnrollments.some(
    (e) =>
      String(e.studentId || '') === String(student.id || '') &&
      String(e.courseId || '').trim().toLowerCase() !== 'trial-course',
  )
}

function reconcileAdmissionsQueue() {
  const rows = loadJson(ENROLLMENTS_PATH)
  if (!rows.length) return rows
  const students = loadJson(STUDENTS_PATH)
  const users = getUsers()
  const studentEnrollments = loadJson(STUDENT_ENROLLMENTS_PATH)
  const next = rows
    .map((r) => {
      const courseIds = normalizeCourseIds(r.courseIds, r.course)
      return {
        ...r,
        mobile: normalizeMobile(r.mobile),
        courseIds,
        course: courseIds[0] || '',
        status: r.status || 'queued',
      }
    })
    .filter((r) => !isConvertedAdmissionRow(r, students, users, studentEnrollments))
  if (next.length !== rows.length) saveJson(ENROLLMENTS_PATH, next)
  return next
}

function upsertQueueByMobile(list, entry) {
  const phone = normalizeMobile(entry?.mobile)
  const idx = list.findIndex((x) => normalizeMobile(x.mobile) === phone)
  if (idx < 0) {
    list.push(entry)
    return { mode: 'created', enrollment: entry }
  }
  const prev = list[idx]
  const updated = {
    ...prev,
    ...entry,
    id: prev.id || entry.id,
    admissionId: prev.admissionId || entry.admissionId,
    createdAt: prev.createdAt || entry.createdAt,
    updatedAt: new Date().toISOString(),
    status: 'queued',
  }
  list[idx] = updated
  return { mode: 'updated', enrollment: updated }
}

router.post('/', (req, res) => {
  const {
    name,
    mobile,
    course,
    courses,
    highestQualification,
    villageCity,
    gender,
    fatherName,
    school,
    referralCode,
  } = req.body || {}
  const courseIds = normalizeCourseIds(courses, course)
  if (!name || !mobile || courseIds.length === 0) {
    return res.status(400).json({ error: 'name, mobile, and at least one course are required' })
  }
  if (!highestQualification || !villageCity || !gender) {
    return res.status(400).json({
      error: 'highestQualification, villageCity and gender are required',
    })
  }
  const phone = normalizeMobile(mobile)
  if (phone.length !== 10) return res.status(400).json({ error: 'Valid 10-digit mobile is required' })

  const list = reconcileAdmissionsQueue()
  const users = getUsers()
  const students = loadJson(STUDENTS_PATH)
  const existingUser = users.find((u) => u.role === 'student' && normalizeMobile(u.email) === phone) || null
  const existingStudent = students.find((s) => normalizeMobile(s.phone) === phone) || null
  const now = new Date()
  const admissionId = makeAdmissionId(phone, list, now)
  const next = {
    id: `enroll-${Date.now()}`,
    admissionId,
    name: String(name).trim(),
    mobile: phone,
    courseIds,
    course: courseIds[0],
    school: school ? String(school).trim() : '',
    highestQualification: String(highestQualification).trim(),
    villageCity: String(villageCity).trim(),
    gender: String(gender).trim(),
    fatherName: fatherName ? String(fatherName).trim() : '',
    referralCode: referralCode ? String(referralCode).trim().toUpperCase() : '',
    status: 'queued',
    createdAt: now.toISOString(),
  }
  const queueWrite = upsertQueueByMobile(list, next)
  saveJson(ENROLLMENTS_PATH, list)

  // Existing account path: keep wallet/referrals untouched; only queue request and optional referral review.
  if (existingUser || existingStudent) {
    const linkedUserId = String(existingUser?.id || existingStudent?.accountUserId || '')
    if (next.referralCode && linkedUserId) {
      createReferralReviewRequest({
        studentId: linkedUserId,
        referralCode: next.referralCode,
        source: 're-enrollment',
        mobile: phone,
      })
    }
    if (!existingStudent && existingUser) {
      const recoveryRecord = {
        id: existingUser.studentId || generateNitaStudentId(users.map((u) => u.studentId).filter(Boolean)),
        name: String(existingUser.name || name || '').trim(),
        phone,
        courseEnrolled: String(courseIds[0] || '').trim(),
        selectedCourseIds: courseIds,
        highestQualification: String(highestQualification).trim(),
        villageCity: String(villageCity).trim(),
        gender: String(gender).trim(),
        fatherName: fatherName ? String(fatherName).trim() : '',
        batchId: '',
        admissionDate: new Date().toISOString().slice(0, 10),
        enrollmentFeeStatus: 'pending',
        accountUserId: existingUser.id,
        createdAt: new Date().toISOString(),
      }
      students.push(recoveryRecord)
      saveJson(STUDENTS_PATH, students)
    }
    return res.json({
      success: true,
      existingAccount: true,
      queueAction: queueWrite.mode,
      enrollment: queueWrite.enrollment,
      studentId: String(existingUser?.studentId || existingStudent?.id || ''),
      walletBalancePreserved: Number(existingUser?.walletBalance || 0),
      message:
        'Existing account detected. Wallet balance is preserved. Referral code is sent for admin review.',
    })
  }

  const studentIds = users.map((u) => u.studentId).filter(Boolean)
  const studentId = generateNitaStudentId(studentIds)
  const plainPassword = defaultPasswordFromPhone(phone)
  const authUserId = `auth-${Date.now()}`
  const userRecord = {
    id: authUserId,
    email: phone,
    studentId,
    name: String(name).trim(),
    role: 'student',
    passwordHash: hashPassword(plainPassword),
    walletBalance: 0,
    totalClassesAttended: 0,
    vvipValidUntil: null,
  }
  users.push(userRecord)
  saveUsers(users)
  if (next.referralCode) {
    createReferralReviewRequest({
      studentId: authUserId,
      referralCode: next.referralCode,
      source: 'new-enrollment',
      mobile: phone,
    })
  }

  const studentRecord = {
    id: studentId,
    name: String(name).trim(),
    phone,
    courseEnrolled: String(courseIds[0] || '').trim(),
    selectedCourseIds: courseIds,
    highestQualification: String(highestQualification).trim(),
    villageCity: String(villageCity).trim(),
    gender: String(gender).trim(),
    fatherName: fatherName ? String(fatherName).trim() : '',
    batchId: '',
    admissionDate: new Date().toISOString().slice(0, 10),
    enrollmentFeeStatus: 'pending',
    accountUserId: authUserId,
    createdAt: new Date().toISOString(),
  }
  students.push(studentRecord)
  saveJson(STUDENTS_PATH, students)

  return res.json({
    success: true,
    queueAction: queueWrite.mode,
    enrollment: queueWrite.enrollment,
    credentials: {
      studentId,
      password: plainPassword,
      note:
        'Save your Student ID and password. Use them to log in to the LMS (Student ID or mobile + password). Change your password after first login.',
    },
  })
})

export default router
