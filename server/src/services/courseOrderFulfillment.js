import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readJsonSync, writeJsonSync } from './sheetsJsonStore.js'
import { provisionStudentAfterOnlinePayment } from './onlineEnrollmentService.js'
import { notifyAdminOnlinePayment, notifyStudentOnlineEnrollment } from './adminNotify.js'
import { onOnlineEnrollment } from './eventTriggers.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ORDERS_PATH = join(__dirname, '..', 'data', 'course_payment_orders.json')
const ONLINE_ENROLLMENTS_PATH = join(__dirname, '..', 'data', 'online_enrollments.json')

function loadJson(path, fallback) {
  return readJsonSync(path, fallback)
}

function saveJson(path, data) {
  writeJsonSync(path, data)
}

async function finalizeOnlineEnrollment(order, enrollment) {
  const account = provisionStudentAfterOnlinePayment({ order, enrollment })

  const notifyOut = await notifyAdminOnlinePayment({ enrollment, account })
  await notifyStudentOnlineEnrollment({ enrollment, account }).catch(() => {})

  await onOnlineEnrollment({
    enrollment,
    account,
    notify: {
      whatsappNotifyUrl: notifyOut.whatsappNotifyUrl,
      emailSent: notifyOut.emailResult?.sent,
    },
  })

  return { enrollment, account }
}

/**
 * Mark order paid, create online enrollment, provision student account.
 * Safe to call twice (idempotent) — used by frontend verify + Razorpay webhook.
 */
export async function completePaidCourseOrder({ razorpayOrderId, razorpayPaymentId, source = 'verify' }) {
  const orders = loadJson(ORDERS_PATH, [])
  const idx = orders.findIndex((o) => o.razorpayOrderId === razorpayOrderId)
  if (idx < 0) return { ok: false, error: 'Order not found' }

  const order = orders[idx]
  const enrollments = loadJson(ONLINE_ENROLLMENTS_PATH, [])

  if (order.status === 'paid') {
    const existing = enrollments.find((e) => e.id === order.enrollmentId)
    return {
      ok: true,
      alreadyProcessed: true,
      enrollment: existing || null,
      account: existing
        ? {
            studentId: existing.studentId,
            authUserId: existing.accountUserId,
            isNewAccount: existing.isNewAccount,
            mobile: existing.mobile,
            plainPassword: null,
          }
        : null,
    }
  }

  order.status = 'paid'
  order.razorpayPaymentId = razorpayPaymentId
  order.paidAt = new Date().toISOString()
  order.paidVia = source
  orders[idx] = order
  saveJson(ORDERS_PATH, orders)

  const enrollment = {
    id: `online-${Date.now()}`,
    source: 'razorpay',
    courseId: order.courseId,
    courseName: order.courseName,
    studentName: order.studentName,
    mobile: order.mobile,
    email: order.email || '',
    referralCode: order.referralCode || '',
    amount: order.amount,
    razorpayOrderId,
    razorpayPaymentId,
    paymentOrderId: order.id,
    status: 'paid',
    confirmedVia: source,
    createdAt: new Date().toISOString(),
  }
  enrollments.push(enrollment)
  saveJson(ONLINE_ENROLLMENTS_PATH, enrollments)

  order.enrollmentId = enrollment.id
  orders[idx] = order
  saveJson(ORDERS_PATH, orders)

  const { account } = await finalizeOnlineEnrollment(order, enrollment)

  const enrollmentsList = loadJson(ONLINE_ENROLLMENTS_PATH, [])
  const eIdx = enrollmentsList.findIndex((e) => e.id === enrollment.id)
  if (eIdx >= 0) {
    enrollmentsList[eIdx] = {
      ...enrollmentsList[eIdx],
      studentId: account.studentId,
      accountUserId: account.authUserId,
      isNewAccount: account.isNewAccount,
    }
    saveJson(ONLINE_ENROLLMENTS_PATH, enrollmentsList)
    enrollment.studentId = account.studentId
    enrollment.isNewAccount = account.isNewAccount
  }

  return {
    ok: true,
    enrollment,
    account,
  }
}
