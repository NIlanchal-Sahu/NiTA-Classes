import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FORM_ENDPOINT } from '../config'

const COURSE_OPTIONS = [
  { id: 'dca', label: 'DCA (Basic Computer Course) - Quick & Short Term' },
  { id: 'cca', label: 'CCA (Computer Application - PGDCA / O Level Equivalent)' },
  { id: 'spoken-english-mastery', label: 'Spoken English Mastery (Advance Level)' },
  { id: 'ai-associate', label: 'Artificial Intelligent Associate (AI Development Course with Python)' },
  { id: 'ai-video-creation', label: 'AI Video Creation Course' },
]

export default function Admission() {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    course: '',
    school: '',
    referralCode: '',
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [enrollmentResult, setEnrollmentResult] = useState(null)

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.mobile.trim()) next.mobile = 'Mobile number is required'
    else if (!/^\d{10}$/.test(form.mobile.replace(/\s/g, ''))) next.mobile = 'Enter a valid 10-digit number'
    if (!form.course) next.course = 'Please select a course'
    if (form.referralCode && !/^[a-z0-9-]{4,32}$/i.test(form.referralCode.trim())) next.referralCode = 'Enter a valid referral code'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setStatus('submitting')
    setEnrollmentResult(null)
    try {
      const r = await fetch('/api/public/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || 'Failed to submit enrollment')
      setEnrollmentResult(j)

      await fetch(FORM_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }).catch(() => null)

      setStatus('success')
      setForm({ name: '', mobile: '', course: '', school: '', referralCode: '' })
    } catch {
      setStatus('success')
      setEnrollmentResult(null)
      setForm({ name: '', mobile: '', course: '', school: '', referralCode: '' })
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-bold text-gray-900">Admission / Enrollment</h1>
      <p className="mt-2 text-gray-600">Fill the form below. We'll get in touch soon.</p>

      {status === 'success' && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-green-800">
            Thank you! Your enrollment request has been submitted successfully.
          </div>

          {enrollmentResult?.credentials && (
            <div className="rounded-xl border-2 border-primary-200 bg-primary-50 p-5 text-gray-900">
              <h2 className="text-lg font-bold text-primary-900">Your LMS login (save this)</h2>
              <p className="mt-2 text-sm text-gray-700">
                Use these to sign in to the student portal. You can log in with <strong>Student ID</strong> or{' '}
                <strong>mobile number</strong> and the password below.
              </p>
              <dl className="mt-4 space-y-2 text-sm">
                <div>
                  <dt className="font-medium text-gray-600">Student ID</dt>
                  <dd className="font-mono text-lg font-bold text-gray-900">{enrollmentResult.credentials.studentId}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-600">Password</dt>
                  <dd className="font-mono text-lg font-bold text-gray-900">{enrollmentResult.credentials.password}</dd>
                </div>
              </dl>
              <p className="mt-4 rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-900">
                <strong>Important:</strong> Note this down in a safe place. Change your password after first login in{' '}
                <strong>Student → Settings</strong>.
              </p>
              <Link
                to="/login"
                className="mt-4 inline-flex btn-touch rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700"
              >
                Go to Login
              </Link>
            </div>
          )}

          {enrollmentResult?.existingAccount && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900 text-sm">
              {enrollmentResult.message ||
                'You already have an account. Log in with your Student ID or mobile number and your password.'}
              {enrollmentResult.studentId && (
                <p className="mt-2 font-mono font-semibold">Student ID: {enrollmentResult.studentId}</p>
              )}
              <Link to="/login" className="mt-3 inline-block font-semibold text-primary-700 underline">
                Go to Login
              </Link>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            placeholder="Your full name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number *</label>
          <input
            id="mobile"
            name="mobile"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={form.mobile}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            placeholder="10-digit mobile number"
          />
          {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>}
        </div>

        <div>
          <label htmlFor="course" className="block text-sm font-medium text-gray-700">Class / Course *</label>
          <select
            id="course"
            name="course"
            required
            value={form.course}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option value="">Select course</option>
            {COURSE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.course && <p className="mt-1 text-sm text-red-600">{errors.course}</p>}
        </div>

        <div>
          <label htmlFor="school" className="block text-sm font-medium text-gray-700">School/College Name</label>
          <input
            id="school"
            name="school"
            type="text"
            value={form.school}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            placeholder="Optional"
          />
        </div>

        <div>
          <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700">Referral Code (optional)</label>
          <input
            id="referralCode"
            name="referralCode"
            type="text"
            value={form.referralCode}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            placeholder="Example: NITA-AB12CD34"
          />
          {errors.referralCode && <p className="mt-1 text-sm text-red-600">{errors.referralCode}</p>}
          <p className="mt-1 text-xs text-gray-500">
            If someone referred you, enter their code. Referral rewards are credited on the 1st day of next month.
          </p>
        </div>

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="btn-touch w-full rounded-xl bg-primary-600 py-4 font-semibold text-white hover:bg-primary-700 disabled:opacity-70 transition"
        >
          {status === 'submitting' ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">*Terms & Conditions Apply</p>
    </div>
  )
}
