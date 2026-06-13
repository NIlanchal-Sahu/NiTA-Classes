import { Router } from 'express'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readJsonSync, writeJsonSync } from '../services/sheetsJsonStore.js'
import { getCourseFee, COURSE_FEES } from '../courseCatalog.js'
import {
  createRazorpayOrder,
  getRazorpayKeyId,
  isRazorpayConfigured,
  verifyRazorpayPaymentSignature,
} from '../services/razorpayPayments.js'
import { completePaidCourseOrder } from '../services/courseOrderFulfillment.js'

const router = Router()
const __dirname = dirname(fileURLToPath(import.meta.url))
const ORDERS_PATH = join(__dirname, '..', 'data', 'course_payment_orders.json')

function loadJson(path, fallback) {
  return readJsonSync(path, fallback)
}

function saveJson(path, data) {
  writeJsonSync(path, data)
}

function normalizePhone(input) {
  return String(input || '').replace(/\D/g, '').slice(-10)
}

router.get('/', (_req, res) => {
  const courses = Object.entries(COURSE_FEES).map(([id, c]) => ({
    id,
    name: c.name,
    enrollmentFees: c.enrollmentFees,
  }))
  res.json({ courses })
})

router.get('/payment/config', (_req, res) => {
  res.json({
    configured: isRazorpayConfigured(),
    keyId: getRazorpayKeyId(),
  })
})

router.get('/:courseId', (req, res) => {
  const course = getCourseFee(req.params.courseId)
  if (!course) return res.status(404).json({ error: 'Course not found' })
  res.json({
    course: {
      id: String(req.params.courseId).trim().toLowerCase(),
      name: course.name,
      enrollmentFees: course.enrollmentFees,
    },
  })
})

router.post('/payment/create-order', async (req, res) => {
  try {
    const { courseId, name, mobile, email, referralCode } = req.body || {}
    const course = getCourseFee(courseId)
    if (!course) return res.status(404).json({ error: 'Course not found' })

    const studentName = String(name || '').trim()
    const phone = normalizePhone(mobile)
    if (!studentName || phone.length !== 10) {
      return res.status(400).json({ error: 'Valid name and 10-digit mobile are required' })
    }

    const amount = Number(course.enrollmentFees) || 0
    if (amount <= 0) return res.status(400).json({ error: 'Invalid course fee' })

    const orderId = `nita-course-${Date.now()}`
    const amountPaise = Math.round(amount * 100)
    const rzOrder = await createRazorpayOrder({
      amountPaise,
      receipt: orderId,
      notes: {
        courseId: String(courseId).trim().toLowerCase(),
        studentName,
        mobile: phone,
      },
    })

    const orders = loadJson(ORDERS_PATH, [])
    const pending = {
      id: orderId,
      razorpayOrderId: rzOrder.id,
      courseId: String(courseId).trim().toLowerCase(),
      courseName: course.name,
      amount,
      amountPaise,
      studentName,
      mobile: phone,
      email: email ? String(email).trim() : '',
      referralCode: referralCode ? String(referralCode).trim().toUpperCase() : '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    orders.push(pending)
    saveJson(ORDERS_PATH, orders)

    res.json({
      success: true,
      keyId: getRazorpayKeyId(),
      order: pending,
      razorpayOrderId: rzOrder.id,
      amount: amountPaise,
      currency: 'INR',
    })
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to create payment order' })
  }
})

router.post('/payment/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body || {}

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ error: 'Payment verification data is incomplete' })
    }

    const valid = verifyRazorpayPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    })
    if (!valid) return res.status(400).json({ error: 'Invalid payment signature' })

    const result = await completePaidCourseOrder({
      razorpayOrderId,
      razorpayPaymentId,
      source: 'verify',
    })

    if (!result.ok) return res.status(404).json({ error: result.error })

    res.json({
      success: true,
      alreadyProcessed: result.alreadyProcessed || false,
      enrollment: result.enrollment,
      account: result.account
        ? {
            studentId: result.account.studentId,
            isNewAccount: result.account.isNewAccount,
            mobile: result.account.mobile,
            plainPassword: result.account.plainPassword,
          }
        : null,
    })
  } catch (e) {
    res.status(500).json({ error: e.message || 'Payment verification failed' })
  }
})

export default router
