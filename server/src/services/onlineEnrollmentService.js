import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { hashPassword, getUsers, saveUsers } from '../auth.js'
import { createReferralReviewRequest } from '../referrals.js'
import {
  generateNitaStudentId,
  defaultPasswordFromPhone,
  normalizePhoneDigits,
} from '../enrollmentCredentials.js'
import { readJsonSync, writeJsonSync } from './sheetsJsonStore.js'
import { pushStudentNotification } from './eventTriggers.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STUDENTS_PATH = join(__dirname, '..', 'data', 'students.json')
const FEES_PATH = join(__dirname, '..', 'data', 'academy_fees.json')
const ADMISSIONS_PATH = join(__dirname, '..', 'data', 'enrollments.json')

function loadJson(path, fallback) {
  return readJsonSync(path, fallback)
}

function saveJson(path, data) {
  writeJsonSync(path, data)
}

function makeAdmissionId(phone, existing) {
  const last4 = String(phone || '').slice(-4) || '0000'
  const now = new Date()
  const prefix = `${now.toLocaleString('en-US', { month: 'long' }).toUpperCase()}${now.getFullYear()}${last4}`
  const used = new Set(existing.map((e) => String(e.admissionId || '')))
  let out = prefix
  let i = 1
  while (used.has(out)) {
    i += 1
    out = `${prefix}-${i}`
  }
  return out
}

/** After Razorpay payment: create or link student account, record fee, queue admission. */
export function provisionStudentAfterOnlinePayment({ order, enrollment }) {
  const phone = normalizePhoneDigits(order.mobile)
  const name = String(order.studentName || '').trim()
  const courseId = String(order.courseId || '').trim()
  const courseName = String(order.courseName || courseId)
  const amount = Number(order.amount) || 0

  const users = getUsers()
  const students = loadJson(STUDENTS_PATH, [])
  const existingUser = users.find((u) => u.role === 'student' && normalizePhoneDigits(u.email) === phone) || null
  let existingStudent =
    students.find((s) => normalizePhoneDigits(s.phone) === phone) ||
    (existingUser?.studentId ? students.find((s) => s.id === existingUser.studentId) : null) ||
    null

  let authUserId
  let studentId
  let plainPassword = null
  let isNewAccount = false

  if (existingUser) {
    authUserId = existingUser.id
    studentId = existingUser.studentId || existingStudent?.id || ''
    if (existingStudent) {
      existingStudent.enrollmentFeeStatus = 'paid'
      existingStudent.courseEnrolled = courseId
      const ids = new Set([...(existingStudent.selectedCourseIds || []), courseId].filter(Boolean))
      existingStudent.selectedCourseIds = [...ids]
      existingStudent.accountUserId = authUserId
      existingStudent.updatedAt = new Date().toISOString()
    } else {
      studentId = generateNitaStudentId(users.map((u) => u.studentId).filter(Boolean))
      existingUser.studentId = studentId
      students.push({
        id: studentId,
        name,
        phone,
        courseEnrolled: courseId,
        selectedCourseIds: [courseId],
        batchId: '',
        admissionDate: new Date().toISOString().slice(0, 10),
        enrollmentFeeStatus: 'paid',
        accountUserId: authUserId,
        createdAt: new Date().toISOString(),
      })
    }
    saveUsers(users)
    saveJson(STUDENTS_PATH, students)
  } else {
    isNewAccount = true
    studentId = generateNitaStudentId(users.map((u) => u.studentId).filter(Boolean))
    plainPassword = defaultPasswordFromPhone(phone)
    authUserId = `auth-${Date.now()}`
    users.push({
      id: authUserId,
      email: phone,
      studentId,
      name,
      role: 'student',
      passwordHash: hashPassword(plainPassword),
      walletBalance: 0,
      totalClassesAttended: 0,
      vvipValidUntil: null,
    })
    saveUsers(users)
    students.push({
      id: studentId,
      name,
      phone,
      courseEnrolled: courseId,
      selectedCourseIds: [courseId],
      batchId: '',
      admissionDate: new Date().toISOString().slice(0, 10),
      enrollmentFeeStatus: 'paid',
      accountUserId: authUserId,
      createdAt: new Date().toISOString(),
    })
    saveJson(STUDENTS_PATH, students)
  }

  const fees = loadJson(FEES_PATH, [])
  if (!fees.some((f) => f.onlineEnrollmentId === enrollment.id)) {
    fees.push({
      id: `fee-online-${Date.now()}`,
      studentId,
      amount,
      date: new Date().toISOString().slice(0, 10),
      mode: 'razorpay',
      feeStatus: 'paid',
      note: `Online enrollment fee — ${courseName} (${enrollment.id})`,
      onlineEnrollmentId: enrollment.id,
      razorpayPaymentId: enrollment.razorpayPaymentId || '',
      source: 'online_enrollment',
      createdAt: new Date().toISOString(),
    })
    saveJson(FEES_PATH, fees)
  }

  const admissions = loadJson(ADMISSIONS_PATH, [])
  admissions.push({
    id: `enroll-online-${Date.now()}`,
    admissionId: makeAdmissionId(phone, admissions),
    name,
    mobile: phone,
    courseIds: [courseId],
    course: courseId,
    status: 'online_paid',
    paymentSource: 'razorpay',
    onlineEnrollmentId: enrollment.id,
    razorpayPaymentId: enrollment.razorpayPaymentId || '',
    amountPaid: amount,
    referralCode: order.referralCode || '',
    createdAt: new Date().toISOString(),
  })
  saveJson(ADMISSIONS_PATH, admissions)

  if (order.referralCode && authUserId) {
    try {
      createReferralReviewRequest({
        studentId: authUserId,
        referralCode: order.referralCode,
        source: 'online-payment',
        mobile: phone,
      })
    } catch (e) {
      console.warn('[onlineEnrollment] referral review failed:', e.message)
    }
  }

  try {
    pushStudentNotification({
      userId: authUserId,
      title: 'Enrollment confirmed',
      message: isNewAccount
        ? `Payment received for ${courseName}. Your student account is ready — log in with Student ID ${studentId} or mobile ${phone}.`
        : `Payment received for ${courseName}. Your enrollment fee is marked paid on your account.`,
      type: 'online_enrollment_confirmed',
      popup: true,
    })
  } catch {
    /* ignore */
  }

  enrollment.studentId = studentId
  enrollment.accountUserId = authUserId
  enrollment.isNewAccount = isNewAccount

  return {
    authUserId,
    studentId,
    plainPassword: isNewAccount ? plainPassword : null,
    isNewAccount,
    mobile: phone,
  }
}
