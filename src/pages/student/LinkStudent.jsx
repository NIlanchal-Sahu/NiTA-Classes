import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { studentPortalApi } from '../../api/student'
import { useAuth } from '../../context/AuthContext'

export default function LinkStudent() {
  const { refreshUser, user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [options, setOptions] = useState([])
  const [studentId, setStudentId] = useState('')

  useEffect(() => {
    ;(async () => {
      setError('')
      try {
        const out = await studentPortalApi.getClaimOptions()
        setOptions(out?.claimOptions || [])
      } catch (e) {
        // it's okay if options are empty; user can still type manually
      }
    })()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const id = studentId.trim()
    if (!id) return setError('Please enter Student ID')

    setLoading(true)
    try {
      await studentPortalApi.claimStudent(id)
      await refreshUser()
      navigate('/student', { replace: true })
    } catch (e) {
      setError(e.message || 'Failed to link student')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-bold text-gray-900">Link Your Student ID</h1>
      <p className="mt-2 text-sm text-gray-600">
        Your portal needs a permanent link between your login account and your academy Student ID.
      </p>

      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
        <div className="text-sm text-gray-600">Logged in as</div>
        <div className="mt-1 text-gray-900 font-semibold">{user?.email || user?.name || '—'}</div>
      </div>

      {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>}

      <form onSubmit={submit} className="mt-6 space-y-5">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900">Select from matching IDs (optional)</h2>
          <p className="mt-1 text-sm text-gray-600">If your phone/email matches, your IDs will appear here.</p>

          <div className="mt-4">
            {options.length === 0 ? (
              <p className="text-sm text-gray-500">No auto-matching Student IDs found. Enter manually below.</p>
            ) : (
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
              >
                <option value="">Select Student ID</option>
                {options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.id} {o.courseEnrolled ? `- ${o.courseEnrolled}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
            Student ID (required)
          </label>
          <input
            id="studentId"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="e.g. nilanchal-1234"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
          />
          <p className="mt-2 text-xs text-gray-500">
            Student ID is auto-generated when admin adds a student (first name + last 4 digits of phone).
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-touch w-full rounded-xl bg-primary-600 px-4 py-4 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {loading ? 'Linking...' : 'Link Student ID'}
        </button>
      </form>

      <div className="mt-6 text-xs text-gray-500">
        After linking, your profile, attendance, fees, notes, referral rewards, and certificates will show correctly.
      </div>
    </div>
  )
}

