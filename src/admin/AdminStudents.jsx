import { useEffect, useState } from 'react'
import { academyApi } from '../api/adminAcademy'

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    courseEnrolled: '',
    batchId: '',
    admissionDate: '',
    enrollmentFeeStatus: 'pending',
  })

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await academyApi.getStudents()
      setStudents(data.students || [])
    } catch (e) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const createStudent = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await academyApi.createStudent(form)
      setForm({ name: '', phone: '', courseEnrolled: '', batchId: '', admissionDate: '', enrollmentFeeStatus: 'pending' })
      await refresh()
    } catch (e1) {
      setError(e1.message || 'Failed to create student')
    } finally {
      setSaving(false)
    }
  }

  const removeStudent = async (id) => {
    if (!window.confirm('Delete this student?')) return
    setError('')
    try {
      await academyApi.deleteStudent(id)
      if (selectedId === id) {
        setSelectedId('')
        setProfile(null)
      }
      await refresh()
    } catch (e) {
      setError(e.message || 'Failed to delete')
    }
  }

  const openProfile = async (id) => {
    setSelectedId(id)
    setProfile(null)
    setError('')
    try {
      const out = await academyApi.getStudentProfile(id)
      setProfile(out)
    } catch (e) {
      setError(e.message || 'Failed to load profile')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Student Lifecycle Management</h1>
      <p className="mt-1 text-gray-400">Add, edit, delete, profile view, and enrollment history.</p>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Add Student</h2>
        <form onSubmit={createStudent} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Phone (10-digit)" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} required />
          <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Course Enrolled" value={form.courseEnrolled} onChange={(e) => setForm((p) => ({ ...p, courseEnrolled: e.target.value }))} />
          <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Batch ID" value={form.batchId} onChange={(e) => setForm((p) => ({ ...p, batchId: e.target.value }))} />
          <input type="date" className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.admissionDate} onChange={(e) => setForm((p) => ({ ...p, admissionDate: e.target.value }))} />
          <select className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.enrollmentFeeStatus} onChange={(e) => setForm((p) => ({ ...p, enrollmentFeeStatus: e.target.value }))}>
            <option value="paid">Enrollment Fee Paid</option>
            <option value="pending">Enrollment Fee Pending</option>
            <option value="discounted">Enrollment Fee Discounted</option>
          </select>
          <div className="sm:col-span-2 lg:col-span-3">
            <button disabled={saving} className="btn-touch rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Create Student'}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-200">{error}</div>}
      {loading ? (
        <div className="mt-6 text-gray-400">Loading...</div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border border-gray-700 rounded-xl">
            <thead className="bg-gray-800 text-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Student ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Course</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Batch</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Fee Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-900">
              {students.map((s) => (
                <tr key={s.id} className="border-t border-gray-800">
                  <td className="px-4 py-3 text-sm text-gray-100">{s.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-100">{s.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{s.phone || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{s.courseEnrolled || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{s.batchId || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{s.enrollmentFeeStatus || '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => openProfile(s.id)} className="rounded bg-gray-700 px-2 py-1 text-xs text-white hover:bg-gray-600">Profile</button>
                      <button onClick={() => removeStudent(s.id)} className="rounded bg-red-700 px-2 py-1 text-xs text-white hover:bg-red-600">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-sm text-gray-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedId && (
        <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white">Student Profile: {selectedId}</h2>
          {!profile ? (
            <div className="mt-3 text-gray-400">Loading profile...</div>
          ) : (
            <>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
                  <div className="text-xs text-gray-400">Name</div>
                  <div className="mt-1 text-sm text-white">{profile.student?.name}</div>
                </div>
                <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
                  <div className="text-xs text-gray-400">Admission Date</div>
                  <div className="mt-1 text-sm text-white">{profile.student?.admissionDate || '—'}</div>
                </div>
                <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
                  <div className="text-xs text-gray-400">Enrollment Fee Status</div>
                  <div className="mt-1 text-sm text-white">{profile.student?.enrollmentFeeStatus || '—'}</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-300">
                Enrollments: <span className="font-semibold text-white">{profile.enrollments?.length || 0}</span> | Payments:{' '}
                <span className="font-semibold text-white">{profile.payments?.length || 0}</span> | Attendance Records:{' '}
                <span className="font-semibold text-white">{profile.attendance?.length || 0}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

