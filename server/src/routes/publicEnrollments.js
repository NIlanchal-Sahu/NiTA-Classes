import { Router } from 'express'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { hashPassword, getUsers, saveUsers } from '../auth.js'
import {
  generateNitaStudentId,
  defaultPasswordFromPhone,
  normalizePhoneDigits,
} from '../enrollmentCredentials.js'

const router = Router()
const __dirname = dirname(fileURLToPath(import.meta.url))
const ENROLLMENTS_PATH = join(__dirname, '..', 'data', 'enrollments.json')
const STUDENTS_PATH = join(__dirname, '..', 'data', 'students.json')
const STUDENT_ENROLLMENTS_PATH = join(__dirname, '..', 'data', 'student_enrollments.json')

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
  return normalizePhoneDigits(input)
}

function findStudentUserByPhone(phone) {
  const p = normalizeMobile(phone)
  return getUsers().find(
    (u) => u.role === 'student' && normalizeMobile(u.email) === p,
  )
}

router.post('/', (req, res) => {
  const { name, mobile, course, school, referralCode } = req.body || {}
  if (!name || !mobile || !course) return res.status(400).json({ error: 'name, mobile, course are required' })
  const phone = normalizeMobile(mobile)
  if (phone.length !== 10) return res.status(400).json({ error: 'Valid 10-digit mobile is required' })

  const list = loadJson(ENROLLMENTS_PATH)
  const next = {
    id: `enroll-${Date.now()}`,
    name: String(name).trim(),
    mobile: phone,
    course: String(course).trim(),
    school: school ? String(school).trim() : '',
    referralCode: referralCode ? String(referralCode).trim().toUpperCase() : '',
    createdAt: new Date().toISOString(),
  }
  list.push(next)
  saveJson(ENROLLMENTS_PATH, list)

  const existingUser = findStudentUserByPhone(phone)
  if (existingUser) {
    const enr = loadJson(STUDENT_ENROLLMENTS_PATH)
    enr.push({
      id: `enr-${Date.now()}`,
      studentId: existingUser.studentId || existingUser.id,
      courseId: String(course).trim(),
      batchId: '',
      note: 'Public admission form (existing account)',
      createdAt: new Date().toISOString(),
    })
    saveJson(STUDENT_ENROLLMENTS_PATH, enr)

    return res.json({
      success: true,
      enrollment: next,
      existingAccount: true,
      studentId: existingUser.studentId || null,
      message:
        'You already have an LMS account. Log in with your Student ID or mobile number and your password. If you forgot your password, contact admin.',
    })
  }

  const users = getUsers()
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

  const students = loadJson(STUDENTS_PATH)
  const studentRecord = {
    id: studentId,
    name: String(name).trim(),
    phone,
    courseEnrolled: String(course).trim(),
    batchId: '',
    admissionDate: new Date().toISOString().slice(0, 10),
    enrollmentFeeStatus: 'pending',
    accountUserId: authUserId,
    createdAt: new Date().toISOString(),
  }
  students.push(studentRecord)
  saveJson(STUDENTS_PATH, students)

  const enr = loadJson(STUDENT_ENROLLMENTS_PATH)
  enr.push({
    id: `enr-${Date.now()}`,
    studentId,
    courseId: String(course).trim(),
    batchId: '',
    note: 'Public admission form',
    createdAt: new Date().toISOString(),
  })
  saveJson(STUDENT_ENROLLMENTS_PATH, enr)

  return res.json({
    success: true,
    enrollment: next,
    credentials: {
      studentId,
      password: plainPassword,
      note:
        'Save your Student ID and password. Use them to log in to the LMS (Student ID or mobile + password). Change your password after first login.',
    },
  })
})

export default router
