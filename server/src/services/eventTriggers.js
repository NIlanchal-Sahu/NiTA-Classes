import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readJsonSync, writeJsonSync } from './sheetsJsonStore.js'
import { getUsers } from '../auth.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')
const STUDENT_NOTIFICATIONS_PATH = join(DATA_DIR, 'student_notifications.json')
const ADMIN_ALERTS_PATH = join(DATA_DIR, 'admin_alerts.json')

function loadStudentNotifications() {
  return readJsonSync(STUDENT_NOTIFICATIONS_PATH, [])
}

function saveStudentNotifications(rows) {
  writeJsonSync(STUDENT_NOTIFICATIONS_PATH, rows)
}

function loadAdminAlerts() {
  return readJsonSync(ADMIN_ALERTS_PATH, [])
}

function saveAdminAlerts(rows) {
  writeJsonSync(ADMIN_ALERTS_PATH, rows)
}

function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function daysUntilDate(expiryDateStr) {
  const today = new Date(`${todayIso()}T00:00:00`)
  const until = new Date(`${String(expiryDateStr || '').slice(0, 10)}T00:00:00`)
  if (Number.isNaN(until.getTime())) return null
  return Math.round((until - today) / 86400000)
}

/** Write to student_notifications.json (student portal bell + optional popup). */
export function pushStudentNotification({ userId, title, message, type, popup = true, meta = {} }) {
  if (!userId) return null
  const list = loadStudentNotifications()
  const row = {
    id: newId('stu-notif'),
    userId: String(userId),
    title: title ? String(title) : '',
    message: String(message),
    read: false,
    popup: Boolean(popup),
    type: type ? String(type) : 'system',
    createdAt: new Date().toISOString(),
    ...(Object.keys(meta).length ? { meta } : {}),
  }
  list.push(row)
  saveStudentNotifications(list)
  return row
}

/** Write to admin_alerts.json (admin fees / enrollments dashboards). */
export function pushAdminAlert({ type, ...fields }) {
  const list = loadAdminAlerts()
  const row = {
    id: newId('alert'),
    type: String(type),
    createdAt: new Date().toISOString(),
    ...fields,
  }
  list.push(row)
  saveAdminAlerts(list)
  return row
}

/** Payment approved → notify student in portal. */
export function onPaymentApproved({ authUserId, credited, paymentRequestId }) {
  const amount = Number(credited) || 0
  if (!authUserId || amount <= 0) return null

  const list = loadStudentNotifications()
  const dup = list.some(
    (n) =>
      n.userId === authUserId &&
      n.type === 'payment_approved' &&
      n.meta?.paymentRequestId === paymentRequestId,
  )
  if (dup) return null

  return pushStudentNotification({
    userId: authUserId,
    title: 'Payment approved',
    message: `₹${amount} has been added to your wallet. Your payment request was approved.`,
    type: 'payment_approved',
    popup: true,
    meta: { paymentRequestId, credited: amount },
  })
}

/** Online course payment (Razorpay) → alert admin (+ optional email/WhatsApp link). */
export async function onOnlineEnrollment({ enrollment, account, notify = {} }) {
  if (!enrollment) return null

  const name = String(enrollment.studentName || '').trim()
  const phone = String(enrollment.mobile || '').trim()
  const course = String(enrollment.courseName || enrollment.courseId || '')
  const amount = Number(enrollment.amount) || 0

  const alert = pushAdminAlert({
    type: 'online_enrollment',
    studentName: name,
    studentPhone: phone,
    courseId: String(enrollment.courseId || ''),
    courseName: course,
    amount,
    paymentId: String(enrollment.razorpayPaymentId || ''),
    enrollmentId: String(enrollment.id || ''),
    studentId: String(account?.studentId || enrollment.studentId || ''),
    isNewAccount: Boolean(account?.isNewAccount),
    whatsappNotifyUrl: notify.whatsappNotifyUrl || '',
    emailSent: Boolean(notify.emailSent),
    message: `Online enrollment: ${name} (${phone}) paid ₹${amount} for ${course}.`,
  })

  return alert
}

/** Enrollment submitted → alert admin. */
export function onEnrollmentSubmitted({ enrollment, queueAction = 'created', existingAccount = false }) {
  if (!enrollment) return null
  const courseIds = Array.isArray(enrollment.courseIds)
    ? enrollment.courseIds
    : enrollment.course
      ? [enrollment.course]
      : []
  const courseLabel = courseIds.join(', ') || 'courses'
  const name = String(enrollment.name || '').trim()
  const phone = String(enrollment.mobile || '').trim()

  return pushAdminAlert({
    type: 'enrollment_submitted',
    studentName: name,
    studentPhone: phone,
    admissionId: String(enrollment.admissionId || enrollment.id || ''),
    courseIds,
    courses: courseLabel,
    referralCode: String(enrollment.referralCode || ''),
    queueAction: String(queueAction),
    existingAccount: Boolean(existingAccount),
    enrollmentId: String(enrollment.id || ''),
    message: existingAccount
      ? `${name} (${phone}) re-submitted enrollment for ${courseLabel}.`
      : `New enrollment: ${name} (${phone}) applied for ${courseLabel}.`,
  })
}

/** VVIP expiring in N days → reminder to student (runs on schedule). */
export function runVvipExpiryReminders({ daysBefore = 3 } = {}) {
  const users = getUsers().filter((u) => u.role === 'student' && u.vvipValidUntil)
  const notifications = loadStudentNotifications()
  let sent = 0

  for (const user of users) {
    const expiry = String(user.vvipValidUntil).slice(0, 10)
    const daysLeft = daysUntilDate(expiry)
    if (daysLeft == null || daysLeft !== daysBefore) continue

    const dedupeKey = `vvip-${user.id}-${expiry}`
    const already = notifications.some(
      (n) =>
        n.userId === user.id &&
        n.type === 'vvip_expiry_reminder' &&
        (n.meta?.dedupeKey === dedupeKey || n.meta?.expiryDate === expiry),
    )
    if (already) continue

    pushStudentNotification({
      userId: user.id,
      title: 'VVIP plan expiring soon',
      message: `Your VVIP unlimited plan expires on ${expiry} (in ${daysBefore} days). Recharge ₹699 to continue unlimited classes.`,
      type: 'vvip_expiry_reminder',
      popup: true,
      meta: { dedupeKey, expiryDate: expiry, daysLeft: daysBefore },
    })
    sent += 1
  }

  return { checked: users.length, sent }
}

/** Run VVIP reminder check on boot and once every 24 hours. */
export function startEventTriggerJobs() {
  const run = () => {
    try {
      const out = runVvipExpiryReminders({ daysBefore: 3 })
      if (out.sent > 0) {
        console.log(`[event-triggers] VVIP expiry reminders sent: ${out.sent}`)
      }
    } catch (e) {
      console.warn('[event-triggers] VVIP reminder job failed:', e.message)
    }
  }
  run()
  const timer = setInterval(run, 24 * 60 * 60 * 1000)
  return () => clearInterval(timer)
}
