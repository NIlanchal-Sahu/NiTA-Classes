import { useMemo, useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FORM_ENDPOINT } from '../config'

const COURSE_OPTIONS = [
  { id: 'dca', label: 'DCA (Basic Computer Course) - Quick & Short Term' },
  { id: 'cca', label: 'CCA (Computer Application - PGDCA / O Level Equivalent)' },
  { id: 'spoken-english-mastery', label: 'Spoken English Mastery (Advance Level)' },
  { id: 'ai-associate', label: 'Artificial Intelligent Associate (AI Development Course with Python)' },
  { id: 'ai-video-creation', label: 'AI Video Creation Course' },
]
const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/G5HVGAshx7r7BYnz7PoeRs?mode=gi_t'

export default function Admission() {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    courses: [],
    highestQualification: '',
    villageCity: '',
    gender: '',
    fatherName: '',
    school: '',
    referralCode: '',
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [enrollmentResult, setEnrollmentResult] = useState(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [courseOpen, setCourseOpen] = useState(false)
  const [courseSearch, setCourseSearch] = useState('')
  const courseBoxRef = useRef(null)

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!courseBoxRef.current) return
      if (!courseBoxRef.current.contains(e.target)) setCourseOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.mobile.trim()) next.mobile = 'Mobile number is required'
    else if (!/^\d{10}$/.test(form.mobile.replace(/\s/g, ''))) next.mobile = 'Enter a valid 10-digit number'
    if (!Array.isArray(form.courses) || form.courses.length === 0) next.courses = 'Please select at least one course'
    if (!form.highestQualification.trim()) next.highestQualification = 'Highest qualification is required'
    if (!form.villageCity.trim()) next.villageCity = 'Village/City is required'
    if (!form.gender) next.gender = 'Gender is required'
    if (form.referralCode && !/^[a-z0-9-]{4,32}$/i.test(form.referralCode.trim())) next.referralCode = 'Enter a valid referral code'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleCoursesChange = (e) => {
    const selected = Array.from(e.target.selectedOptions || []).map((opt) => opt.value)
    setForm((prev) => ({ ...prev, courses: selected }))
    if (errors.courses) setErrors((prev) => ({ ...prev, courses: '' }))
  }

  const filteredCourseOptions = useMemo(() => {
    const q = courseSearch.trim().toLowerCase()
    if (!q) return COURSE_OPTIONS
    return COURSE_OPTIONS.filter(
      (c) => c.label.toLowerCase().includes(q) || c.id.toLowerCase().includes(q),
    )
  }, [courseSearch])

  const removeCourse = (id) => {
    setForm((prev) => ({ ...prev, courses: prev.courses.filter((x) => x !== id) }))
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
      setShowResultModal(true)

      await fetch(FORM_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }).catch(() => null)

      setStatus('success')
      setForm({
        name: '',
        mobile: '',
        courses: [],
        highestQualification: '',
        villageCity: '',
        gender: '',
        fatherName: '',
        school: '',
        referralCode: '',
      })
    } catch (err) {
      setStatus('error')
      setErrors((prev) => ({ ...prev, submit: err?.message || 'Failed to submit admission form.' }))
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
      <h2
        className="text-center text-4xl font-extrabold uppercase tracking-widest text-cyan-300 sm:text-5xl"
        style={{
          textShadow:
            '0 0 8px rgba(34,211,238,0.95), 0 0 18px rgba(34,211,238,0.8), 0 0 28px rgba(167,139,250,0.7)',
          animation: 'pulse 1.6s ease-in-out infinite',
        }}
      >
        Signup For Free
      </h2>
      <h1 className="text-3xl font-bold text-gray-900">Admission / Enrollment</h1>
      <p className="mt-2 text-gray-600">Fill the form below. We'll get in touch soon.</p>

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
          <label className="block text-sm font-medium text-gray-700">Class / Course * (Multi-select)</label>
          <div ref={courseBoxRef} className="relative mt-1">
            <button
              type="button"
              onClick={() => setCourseOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-left focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <span className="text-sm text-gray-700">
                {form.courses.length > 0 ? `${form.courses.length} course(s) selected` : 'Select one or more courses'}
              </span>
              <span className="text-gray-500">{courseOpen ? '▲' : '▼'}</span>
            </button>

            {courseOpen && (
              <div className="absolute z-20 mt-2 w-full rounded-lg border border-gray-300 bg-white shadow-lg">
                <div className="border-b border-gray-200 p-2">
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="Search course..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div className="max-h-64 overflow-auto p-2">
                  {filteredCourseOptions.map((opt) => (
                    <label key={opt.id} className="flex cursor-pointer items-start gap-2 rounded px-2 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={form.courses.includes(opt.id)}
                        onChange={(e) => {
                          const selected = e.target.checked
                            ? [...form.courses, opt.id]
                            : form.courses.filter((x) => x !== opt.id)
                          handleCoursesChange({ target: { selectedOptions: selected.map((v) => ({ value: v })) } })
                        }}
                        className="mt-0.5"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                  {filteredCourseOptions.length === 0 && (
                    <p className="px-2 py-2 text-sm text-gray-500">No matching courses.</p>
                  )}
                </div>
              </div>
            )}
          </div>
          {form.courses.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {form.courses.map((cid) => {
                const found = COURSE_OPTIONS.find((c) => c.id === cid)
                return (
                  <span
                    key={cid}
                    className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-xs text-primary-800"
                  >
                    {found?.label || cid}
                    <button
                      type="button"
                      onClick={() => removeCourse(cid)}
                      className="font-semibold hover:text-primary-900"
                      aria-label={`Remove ${cid}`}
                    >
                      ×
                    </button>
                  </span>
                )
              })}
            </div>
          )}
          {errors.courses && <p className="mt-1 text-sm text-red-600">{errors.courses}</p>}
        </div>

        <div>
          <label htmlFor="school" className="block text-sm font-medium text-gray-700">School / College</label>
          <input
            id="school"
            name="school"
            type="text"
            value={form.school}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            placeholder="School or college name"
          />
        </div>

        <div>
          <label htmlFor="highestQualification" className="block text-sm font-medium text-gray-700">Highest Qualification *</label>
          <select
            id="highestQualification"
            name="highestQualification"
            value={form.highestQualification}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            required
          >
            <option value="">Select qualification</option>
            <option value="10th">10th</option>
            <option value="+2">+2</option>
            <option value="+3">+3</option>
            <option value="B.Tech">B.Tech</option>
            <option value="Diploma">Diploma</option>
            <option value="Other">Other</option>
          </select>
          {errors.highestQualification && <p className="mt-1 text-sm text-red-600">{errors.highestQualification}</p>}
        </div>

        <div>
          <label htmlFor="villageCity" className="block text-sm font-medium text-gray-700">Village / City *</label>
          <input
            id="villageCity"
            name="villageCity"
            type="text"
            value={form.villageCity}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            placeholder="Your village or city"
            required
          />
          {errors.villageCity && <p className="mt-1 text-sm text-red-600">{errors.villageCity}</p>}
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender *</label>
          <select
            id="gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            required
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
        </div>

        <div>
          <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700">Father Name (optional)</label>
          <input
            id="fatherName"
            name="fatherName"
            type="text"
            value={form.fatherName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            placeholder="Father full name"
          />
          {errors.fatherName && <p className="mt-1 text-sm text-red-600">{errors.fatherName}</p>}
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
        {errors.submit && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errors.submit}
          </div>
        )}
        {status === 'error' && (
          <p className="text-sm text-gray-600">
            If this mobile number was already used, please contact WhatsApp support.
          </p>
        )}
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">*Terms & Conditions Apply</p>

      {showResultModal && status === 'success' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-primary-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-primary-900">Admission Submitted Successfully</h2>
              <button
                type="button"
                onClick={() => setShowResultModal(false)}
                className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {enrollmentResult?.credentials ? (
              <div className="mt-3">
                <p className="text-sm text-gray-700">
                  Use these to sign in to the student portal with <strong>Student ID</strong> or <strong>mobile number</strong>.
                </p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="font-medium text-gray-600">Student ID</dt>
                    <dd className="font-mono text-lg font-bold text-gray-900">{enrollmentResult.credentials.studentId}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-600">Password</dt>
                    <dd className="font-mono text-lg font-bold text-gray-900">{enrollmentResult.credentials.password}</dd>
                  </div>
                </dl>
                <p className="mt-2 text-sm text-gray-700">
                  Admission ID: <span className="font-semibold">{enrollmentResult?.enrollment?.admissionId || '—'}</span>
                </p>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900 text-sm">
                {enrollmentResult?.message ||
                  'You already have an account. Log in with your Student ID or mobile number and password.'}
                {enrollmentResult?.studentId && (
                  <p className="mt-2 font-mono font-semibold">Student ID: {enrollmentResult.studentId}</p>
                )}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/login"
                className="inline-flex btn-touch rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700"
              >
                Go to Login
              </Link>
              <a
                href={WHATSAPP_GROUP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex btn-touch rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
              >
                Join Batch Group and Continue
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
