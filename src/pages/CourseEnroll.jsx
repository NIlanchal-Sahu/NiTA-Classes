import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getCourseById } from '../data/courseCatalog'
import CourseEmojiCover from '../components/courses/CourseEmojiCover'
import {
  createCoursePaymentOrder,
  getRazorpayKey,
  verifyCoursePayment,
} from '../api/publicCourses'

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay'))
    document.body.appendChild(script)
  })
}

export default function CourseEnroll() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const course = getCourseById(courseId)

  const [form, setForm] = useState({ name: '', mobile: '', email: '', referralCode: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const [razorpayReady, setRazorpayReady] = useState(false)
  const [razorpayConfigured, setRazorpayConfigured] = useState(false)

  useEffect(() => {
    if (!course || course.isVvip || course.isIncludedBenefit) return
    ;(async () => {
      try {
        const cfg = await getRazorpayKey()
        setRazorpayConfigured(Boolean(cfg.configured && cfg.keyId))
        if (cfg.configured) await loadRazorpayScript()
        setRazorpayReady(true)
      } catch {
        setRazorpayReady(true)
      }
    })()
  }, [course])

  useEffect(() => {
    if (course?.isVvip) navigate('/student/pay', { replace: true })
    if (course?.isIncludedBenefit) navigate('/courses#practical-computer-lab', { replace: true })
  }, [course, navigate])

  if (!course) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Course not found</h1>
        <Link to="/courses" className="mt-4 inline-block text-primary-600 hover:underline">
          ← Back to courses
        </Link>
      </div>
    )
  }

  if (course.isVvip || course.isIncludedBenefit) return null

  const handlePay = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (!razorpayConfigured) {
        throw new Error(
          'Online payment is not configured yet. Please use the free admission form or contact us on WhatsApp.',
        )
      }
      await loadRazorpayScript()

      const out = await createCoursePaymentOrder({
        courseId: course.id,
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        referralCode: form.referralCode,
      })

      const options = {
        key: out.keyId,
        amount: out.amount,
        currency: out.currency || 'INR',
        name: 'NITA Classes',
        description: `${course.name} — enrollment fee`,
        order_id: out.razorpayOrderId,
        prefill: {
          name: form.name,
          contact: form.mobile,
          email: form.email || undefined,
        },
        theme: { color: '#2563eb' },
        handler: async (response) => {
          try {
            const verified = await verifyCoursePayment({
              orderId: out.order.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            setSuccess({
              ...verified.enrollment,
              account: verified.account,
            })
          } catch (err) {
            setError(err.message || 'Payment verification failed')
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (resp) => {
        setLoading(false)
        setError(resp.error?.description || 'Payment failed')
      })
      rzp.open()
    } catch (err) {
      setError(err.message || 'Could not start payment')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <div className="text-4xl">✓</div>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Payment successful!</h1>
          <p className="mt-2 text-gray-700">
            Thank you, <strong>{success.studentName}</strong>. Your enrollment for{' '}
            <strong>{success.courseName}</strong> has been recorded.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Amount paid: ₹{success.amount}. Our team will contact you on {success.mobile} with next steps.
          </p>

          {success.account?.isNewAccount && success.account?.plainPassword && (
            <div className="mt-4 rounded-xl border border-primary-200 bg-white p-4 text-left text-sm text-gray-800">
              <p className="font-semibold text-primary-800">Your student portal login</p>
              <p className="mt-2">
                Student ID: <strong>{success.account.studentId}</strong>
              </p>
              <p>
                Mobile login: <strong>{success.mobile}</strong>
              </p>
              <p>
                Password: <strong>{success.account.plainPassword}</strong>
              </p>
              <p className="mt-2 text-xs text-gray-500">Save these details. Change your password after first login.</p>
            </div>
          )}

          {success.account && !success.account.isNewAccount && success.account.studentId && (
            <p className="mt-4 text-sm text-gray-600">
              Linked to your existing account: <strong>{success.account.studentId}</strong>
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/login"
              className="btn-touch rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Login to student portal
            </Link>
            <Link
              to="/courses"
              className="btn-touch rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Back to courses
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link to={`/courses#${course.id}`} className="text-sm font-medium text-primary-600 hover:underline">
        ← Back to course details
      </Link>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="relative aspect-[2.4/1] max-h-40 w-full bg-gray-100">
          <CourseEmojiCover course={course} className="h-full w-full" />
        </div>
        <div className="border-b border-gray-100 px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{course.shortTitle || course.name}</h1>
          <p className="text-sm text-gray-700">{course.level}</p>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Enrollment summary</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <dt className="text-gray-500">Enrollment fee</dt>
                <dd className="font-bold text-primary-700">₹{course.enrollmentFees}</dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <dt className="text-gray-500">Per class</dt>
                <dd className="font-semibold text-gray-900">{course.classFee}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Duration</dt>
                <dd className="text-gray-900">{course.certificationDuration}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-gray-500">
              Secure payment via Razorpay (UPI, cards, wallets). After payment, admin receives your online enrollment.
            </p>
            {!razorpayConfigured && razorpayReady && (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                Razorpay keys are not set on the server yet. Use{' '}
                <Link to="/admission" className="font-semibold underline">
                  free admission form
                </Link>{' '}
                until payment is enabled.
              </p>
            )}
          </div>

          <form onSubmit={handlePay} className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-800">Your details</h2>
            <div>
              <label className="block text-xs font-medium text-gray-600">Full name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Mobile (10 digits) *</label>
              <input
                required
                inputMode="numeric"
                maxLength={10}
                value={form.mobile}
                onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Email (optional)</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Referral code (optional)</label>
              <input
                value={form.referralCode}
                onChange={(e) => setForm((p) => ({ ...p, referralCode: e.target.value.toUpperCase() }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-touch w-full rounded-xl bg-primary-600 px-5 py-3.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {loading ? 'Processing…' : `Pay ₹${course.enrollmentFees} & Enroll`}
            </button>

            <p className="text-center text-xs text-gray-500">
              Prefer no online payment?{' '}
              <Link to="/admission" className="font-medium text-primary-600 hover:underline">
                Use free admission form
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
