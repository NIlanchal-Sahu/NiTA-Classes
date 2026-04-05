import { useEffect, useMemo, useState } from 'react'
import { academyApi } from '../api/adminAcademy'

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [batches, setBatches] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [profile, setProfile] = useState(null)
  const [studentView, setStudentView] = useState(null)
  const [detailTab, setDetailTab] = useState('profile')
  const [mobileSearch, setMobileSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [viewLoading, setViewLoading] = useState(false)
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
  const [resetId, setResetId] = useState('')
  const [resetPwd, setResetPwd] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMsg, setResetMsg] = useState('')
  const [removedMobile, setRemovedMobile] = useState('')
  const [removedRows, setRemovedRows] = useState([])
  const [removedLoading, setRemovedLoading] = useState(false)
  const [extBusyId, setExtBusyId] = useState('')
  const [extAddById, setExtAddById] = useState({})

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const [studentData, courseData, batchData] = await Promise.all([
        academyApi.getStudents(),
        academyApi.getCourses(),
        academyApi.getBatches(),
      ])
      setStudents(studentData.students || [])
      setCourses(courseData.courses || [])
      setBatches(batchData.batches || [])
    } catch (e) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  const courseMap = useMemo(
    () => new Map((courses || []).map((c) => [String(c.id), c.name || c.id])),
    [courses]
  )
  const batchMap = useMemo(
    () => new Map((batches || []).map((b) => [String(b.id), b.name || b.id])),
    [batches]
  )

  const normalizedMobileSearch = useMemo(() => String(mobileSearch || '').replace(/\D/g, ''), [mobileSearch])

  function feeBadge(status) {
    const s = String(status || '').toLowerCase()
    if (s === 'paid') return 'bg-emerald-600/20 text-emerald-300 border-emerald-600'
    if (s === 'discounted') return 'bg-amber-600/20 text-amber-200 border-amber-600'
    if (s === 'pending') return 'bg-red-600/20 text-red-200 border-red-600'
    return 'bg-gray-600/20 text-gray-200 border-gray-600'
  }

  function attendanceBadge(pct) {
    const n = Number(pct) || 0
    if (n >= 75) return 'bg-emerald-600/20 text-emerald-300 border-emerald-600'
    if (n >= 50) return 'bg-amber-600/20 text-amber-200 border-amber-600'
    return 'bg-red-600/20 text-red-200 border-red-600'
  }

  const filteredStudents = useMemo(() => {
    if (!normalizedMobileSearch) return students
    return (students || []).filter((s) => String(s.phone || '').includes(normalizedMobileSearch))
  }, [students, normalizedMobileSearch])
  const formatCourseNames = (student) => {
    const ids = Array.isArray(student?.selectedCourseIds)
      ? student.selectedCourseIds
      : student?.courseEnrolled
        ? [student.courseEnrolled]
        : []
    if (!ids.length) return '—'
    return ids.map((id) => courseMap.get(String(id)) || String(id)).join(', ')
  }

  const selectedStudent = useMemo(
    () => (profile?.student ? profile.student : students.find((s) => s.id === selectedId) || null),
    [profile, students, selectedId]
  )

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

  const resetStudentPassword = async (e) => {
    e.preventDefault()
    setResetMsg('')
    setError('')
    if (!resetId.trim() || !resetPwd.trim()) {
      setError('Enter Student ID or phone and new password')
      return
    }
    setResetLoading(true)
    try {
      await academyApi.resetStudentPassword({ studentIdOrPhone: resetId.trim(), newPassword: resetPwd })
      setResetMsg('Password reset successfully.')
      setResetPwd('')
    } catch (e1) {
      setError(e1.message || 'Reset failed')
    } finally {
      setResetLoading(false)
    }
  }

  const openProfile = async (id) => {
    setSelectedId(id)
    setDetailTab('profile')
    setProfile(null)
    setError('')
    try {
      const [out, dashboard] = await Promise.all([
        academyApi.getStudentProfile(id),
        academyApi.getStudentDashboardView(id),
      ])
      setProfile(out)
      setStudentView(dashboard)
    } catch (e) {
      setError(e.message || 'Failed to load profile')
    }
  }

  const updateFeeStatus = async (studentId, nextStatus) => {
    setError('')
    try {
      await academyApi.updateStudent(studentId, { enrollmentFeeStatus: nextStatus })
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, enrollmentFeeStatus: nextStatus } : s))
      )
      if (selectedId === studentId) {
        setProfile((prev) =>
          prev ? { ...prev, student: { ...(prev.student || {}), enrollmentFeeStatus: nextStatus } } : prev
        )
      }
    } catch (e) {
      setError(e.message || 'Failed to update fee status')
    }
  }

  const openStudentViewOnly = async (id) => {
    setSelectedId(id)
    setDetailTab('dashboard')
    setProfile(null)
    setViewLoading(true)
    setError('')
    try {
      const [out, dashboard] = await Promise.all([
        academyApi.getStudentProfile(id),
        academyApi.getStudentDashboardView(id),
      ])
      setProfile(out)
      setStudentView(dashboard)
    } catch (e) {
      setError(e.message || 'Failed to load student dashboard view')
    } finally {
      setViewLoading(false)
    }
  }

  const addEnrollmentExtensionDays = async (enrollmentId) => {
    const n = Number(extAddById[enrollmentId])
    if (!Number.isFinite(n) || n === 0) {
      setError('Enter a non-zero number of days to add (use negative to reduce).')
      return
    }
    setExtBusyId(enrollmentId)
    setError('')
    try {
      await academyApi.patchEnrollmentExtension(enrollmentId, { addValidityDays: Math.floor(n) })
      const out = await academyApi.getStudentProfile(selectedId)
      setProfile(out)
      setExtAddById((p) => ({ ...p, [enrollmentId]: '' }))
    } catch (e) {
      setError(e.message || 'Failed to update extension')
    } finally {
      setExtBusyId('')
    }
  }

  const removeEnrollmentRow = async (enrollmentId) => {
    if (
      !window.confirm(
        'Remove this enrollment row from LMS history? The student may lose access to that course if no other enrollment remains.',
      )
    ) {
      return
    }
    setExtBusyId(enrollmentId)
    setError('')
    try {
      await academyApi.deleteEnrollment(enrollmentId)
      const out = await academyApi.getStudentProfile(selectedId)
      setProfile(out)
    } catch (e) {
      setError(e.message || 'Failed to remove enrollment')
    } finally {
      setExtBusyId('')
    }
  }

  const lookupRemovedByMobile = async () => {
    const phone = String(removedMobile || '').replace(/\D/g, '').slice(-10)
    if (phone.length !== 10) {
      setError('Enter a valid 10-digit mobile number for removed student lookup')
      return
    }
    setRemovedLoading(true)
    setError('')
    try {
      const out = await academyApi.getRemovedStudents(phone)
      setRemovedRows(out.removedStudents || [])
    } catch (e) {
      setError(e.message || 'Failed to load removed students')
      setRemovedRows([])
    } finally {
      setRemovedLoading(false)
    }
  }

  const deleteRemovedRecord = async (recordId) => {
    if (!window.confirm('Delete this record from removed students list?')) return
    setRemovedLoading(true)
    setError('')
    try {
      await academyApi.deleteRemovedStudentRecord(recordId)
      await lookupRemovedByMobile()
    } catch (e) {
      setError(e.message || 'Failed to delete removed student record')
    } finally {
      setRemovedLoading(false)
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

      <div className="mt-6 rounded-2xl border border-amber-700/50 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Reset student password (LMS)</h2>
        <p className="mt-1 text-sm text-gray-400">
          Set a new password without the current password. Use Student ID (e.g. NITA20260321) or 10-digit phone.
        </p>
        <form onSubmit={resetStudentPassword} className="mt-4 flex flex-wrap items-end gap-3">
          <input
            className="min-w-[200px] flex-1 rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
            placeholder="Student ID or phone"
            value={resetId}
            onChange={(e) => setResetId(e.target.value)}
          />
          <input
            type="text"
            autoComplete="new-password"
            className="min-w-[180px] flex-1 rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
            placeholder="New password (min 6 chars)"
            value={resetPwd}
            onChange={(e) => setResetPwd(e.target.value)}
          />
          <button
            type="submit"
            disabled={resetLoading}
            className="btn-touch rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {resetLoading ? 'Saving…' : 'Reset password'}
          </button>
        </form>
        {resetMsg && <p className="mt-3 text-sm text-green-400">{resetMsg}</p>}
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Removed Students (Lookup by Mobile)</h2>
        <p className="mt-1 text-sm text-gray-400">
          View archived deleted students and permanently remove archive records if required.
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label className="block text-xs text-gray-400">Mobile Number</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              placeholder="10-digit mobile"
              value={removedMobile}
              onChange={(e) => setRemovedMobile(e.target.value)}
              inputMode="numeric"
              maxLength={10}
            />
          </div>
          <button
            type="button"
            onClick={lookupRemovedByMobile}
            disabled={removedLoading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {removedLoading ? 'Checking...' : 'Check Removed List'}
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {(removedRows || []).map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm">
              <div className="text-gray-200">
                <span className="font-semibold">{r?.student?.name || 'Student'}</span> - {r?.mobile || r?.student?.phone || '—'} - removed on{' '}
                {String(r?.removedAt || '').slice(0, 10)}
              </div>
              <button
                type="button"
                onClick={() => deleteRemovedRecord(r.id)}
                disabled={removedLoading}
                className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                Delete Record
              </button>
            </div>
          ))}
          {removedRows.length === 0 && <p className="text-sm text-gray-500">No removed student records found for this mobile.</p>}
        </div>
      </div>

      {error && <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-200">{error}</div>}
      {loading ? (
        <div className="mt-6 text-gray-400">Loading...</div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300">Search by Mobile Number</label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
                placeholder="Enter mobile (10-digit)"
                value={mobileSearch}
                onChange={(e) => setMobileSearch(e.target.value)}
              />
            </div>
            {mobileSearch && (
              <button
                type="button"
                className="btn-touch rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600"
                onClick={() => setMobileSearch('')}
              >
                Clear
              </button>
            )}
          </div>
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
              {filteredStudents.map((s) => (
                <tr key={s.id} className="border-t border-gray-800">
                  <td className="px-4 py-3 text-sm text-gray-100">{s.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-100">{s.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{s.phone || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{formatCourseNames(s)}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{batchMap.get(String(s.batchId || '')) || s.batchId || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    <select
                      className={`rounded border px-2 py-1 text-xs ${feeBadge(s.enrollmentFeeStatus || 'pending')}`}
                      value={s.enrollmentFeeStatus || 'pending'}
                      onChange={(e) => updateFeeStatus(s.id, e.target.value)}
                    >
                      <option value="paid">paid</option>
                      <option value="pending">pending</option>
                      <option value="discounted">discounted</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => openProfile(s.id)} className="rounded bg-gray-700 px-2 py-1 text-xs text-white hover:bg-gray-600">Profile</button>
                      <button onClick={() => openStudentViewOnly(s.id)} className="rounded bg-violet-700 px-2 py-1 text-xs text-white hover:bg-violet-600">View as Student</button>
                      <button onClick={() => removeStudent(s.id)} className="rounded bg-red-700 px-2 py-1 text-xs text-white hover:bg-red-600">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
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
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDetailTab('profile')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    detailTab === 'profile'
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('dashboard')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    detailTab === 'dashboard'
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Student Dashboard
                </button>
              </div>
              {detailTab === 'profile' ? (
                <>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
                      <div className="text-xs text-gray-400">Student Name</div>
                      <div className="mt-1 text-sm font-semibold text-white">{selectedStudent?.name || '—'}</div>
                    </div>
                    <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
                      <div className="text-xs text-gray-400">Mobile</div>
                      <div className="mt-1 text-sm font-semibold text-white">{selectedStudent?.phone || '—'}</div>
                    </div>
                    <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
                      <div className="text-xs text-gray-400">Courses Selected (Signup)</div>
                      <div className="mt-1 text-sm font-semibold text-white">
                        {formatCourseNames(selectedStudent)}
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
                      <div className="text-xs text-gray-400">Batch</div>
                      <div className="mt-1 text-sm font-semibold text-white">
                        {batchMap.get(String(selectedStudent?.batchId || '')) || selectedStudent?.batchId || '—'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
                      <div className="text-xs text-gray-400">Admission Date</div>
                      <div className="mt-1 text-sm font-semibold text-white">{selectedStudent?.admissionDate || '—'}</div>
                    </div>
                    <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
                      <div className="text-xs text-gray-400">Enrollment Fee Status</div>
                      <div className="mt-2">
                        <select
                          className={`rounded border px-2 py-1 text-xs ${feeBadge(selectedStudent?.enrollmentFeeStatus || 'pending')}`}
                          value={selectedStudent?.enrollmentFeeStatus || 'pending'}
                          onChange={(e) => selectedStudent?.id && updateFeeStatus(selectedStudent.id, e.target.value)}
                        >
                          <option value="paid">paid</option>
                          <option value="pending">pending</option>
                          <option value="discounted">discounted</option>
                        </select>
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
                      <div className="text-xs text-gray-400">Total Enrollments</div>
                      <div className="mt-1 text-sm font-semibold text-white">{profile.enrollments?.length || 0}</div>
                    </div>
                    <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
                      <div className="text-xs text-gray-400">Attendance Records</div>
                      <div className="mt-1 text-sm font-semibold text-white">{profile.attendance?.length || 0}</div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-300">
                    Enrollments: <span className="font-semibold text-white">{profile.enrollments?.length || 0}</span> | Payments:{' '}
                    <span className="font-semibold text-white">{profile.payments?.length || 0}</span> | Attendance Records:{' '}
                    <span className="font-semibold text-white">{profile.attendance?.length || 0}</span>
                  </div>
                  <div className="mt-4 rounded-xl border border-violet-700/30 bg-gray-900/50 p-4">
                    <h4 className="text-sm font-semibold text-white">LMS course enrollments &amp; access</h4>
                    <p className="mt-1 text-xs text-gray-400">
                      Student portal uses all rows for the same course (unlock, batch, renew). Access is at least 90 days or the course duration from each start date. Add extra validity days below if needed.
                    </p>
                    <div className="mt-3 space-y-3 text-xs text-gray-300">
                      {(profile.enrollments || []).map((e) => (
                        <div key={e.id} className="rounded-lg border border-gray-700 bg-gray-800 p-3">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="font-semibold text-white">
                                {courseMap.get(String(e.courseId || '')) || e.courseId || '—'}
                              </div>
                              <div className="mt-1 font-mono text-[11px] text-gray-500">ID: {e.id}</div>
                              <div className="mt-1">
                                Start: {String(e.startDate || '').slice(0, 10) || '—'} · Expires:{' '}
                                {String(e.expiresAt || '').slice(0, 10) || '—'}
                              </div>
                              <div>Status: {e.status || 'active'}</div>
                              <div>
                                Admin extra days (total):{' '}
                                <span className="font-semibold text-amber-200">{Number(e.validityExtensionDays) || 0}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                type="number"
                                placeholder="Days ±"
                                className="w-24 rounded border border-gray-600 bg-gray-900 px-2 py-1 text-white"
                                value={extAddById[e.id] ?? ''}
                                onChange={(ev) =>
                                  setExtAddById((p) => ({ ...p, [e.id]: ev.target.value }))
                                }
                              />
                              <button
                                type="button"
                                disabled={extBusyId === e.id}
                                onClick={() => addEnrollmentExtensionDays(e.id)}
                                className="rounded bg-violet-600 px-3 py-1 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                              >
                                {extBusyId === e.id ? '…' : 'Apply'}
                              </button>
                              <button
                                type="button"
                                disabled={extBusyId === e.id}
                                onClick={() => removeEnrollmentRow(e.id)}
                                className="rounded border border-red-500/60 bg-red-950/40 px-3 py-1 text-xs font-semibold text-red-200 hover:bg-red-900/50 disabled:opacity-50"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(profile.enrollments || []).length === 0 && <p className="text-gray-500">No enrollment records.</p>}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border border-gray-700 bg-gray-900 p-4 lg:col-span-1">
                      <h4 className="text-sm font-semibold text-white">Recent Payments</h4>
                      <div className="mt-2 space-y-2 text-xs text-gray-300">
                        {(profile.payments || []).slice(0, 5).map((p) => (
                          <div key={p.id} className="rounded border border-gray-700 bg-gray-800 p-2">
                            <div className="font-medium text-white">₹{Number(p.amount) || 0}</div>
                            <div>Date: {p.date || String(p.createdAt || '').slice(0, 10) || '—'}</div>
                            <div>Status: {p.feeStatus || '—'}</div>
                          </div>
                        ))}
                        {(profile.payments || []).length === 0 && <p className="text-gray-500">No payment records.</p>}
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-700 bg-gray-900 p-4 lg:col-span-1">
                      <h4 className="text-sm font-semibold text-white">Recent Attendance</h4>
                      <div className="mt-2 space-y-2 text-xs text-gray-300">
                        {(profile.attendance || []).slice(0, 5).map((a) => (
                          <div key={a.id} className="rounded border border-gray-700 bg-gray-800 p-2">
                            <div className="font-medium text-white">{a.date || '—'}</div>
                            <div>Course: {courseMap.get(String(a.courseId || '')) || a.courseId || '—'}</div>
                            <div>Status: {a.status || '—'}</div>
                          </div>
                        ))}
                        {(profile.attendance || []).length === 0 && <p className="text-gray-500">No attendance records.</p>}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-xl border border-violet-700/40 bg-violet-900/10 p-4">
                  <h3 className="text-sm font-semibold text-white">Student Dashboard View (Admin)</h3>
                  {viewLoading ? (
                    <p className="mt-2 text-sm text-gray-400">Loading dashboard...</p>
                  ) : (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
                        <p className="text-xs text-gray-400">Wallet Balance</p>
                        <p className="mt-1 text-lg font-semibold text-white">₹{studentView?.walletBalance ?? 0}</p>
                      </div>
                      <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
                        <p className="text-xs text-gray-400">Attendance %</p>
                      <p className={`mt-1 inline-flex items-center rounded border px-2 py-1 text-lg font-semibold ${attendanceBadge(studentView?.attendancePercentage ?? 0)}`}>
                        {studentView?.attendancePercentage ?? 0}%
                      </p>
                      </div>
                      <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
                        <p className="text-xs text-gray-400">Classes (Present/Conducted)</p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {studentView?.classesPresentCount ?? 0}/{studentView?.classesConductedCount ?? 0}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
                        <p className="text-xs text-gray-400">Total Classes Attended</p>
                        <p className="mt-1 text-lg font-semibold text-white">{studentView?.totalClassesAttended ?? 0}</p>
                      </div>
                    </div>
                  )}
                  {!viewLoading && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
                        <p className="text-xs text-gray-400">Monthly Attendance %</p>
                        <p className="mt-1 text-lg font-semibold text-white">{studentView?.monthlyAttendancePercentage ?? 0}%</p>
                      </div>
                      <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
                        <p className="text-xs text-gray-400">Fee Status</p>
                      <p className={`mt-1 inline-flex items-center rounded border px-2 py-1 text-lg font-semibold ${feeBadge(studentView?.feeStatus || 'pending')}`}>
                        {studentView?.feeStatus || 'pending'}
                      </p>
                      </div>
                      <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
                        <p className="text-xs text-gray-400">Course</p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          {courseMap.get(String(studentView?.courseId || '')) || studentView?.courseId || '—'}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
                        <p className="text-xs text-gray-400">Batch</p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          {batchMap.get(String(studentView?.batchId || '')) || studentView?.batchId || '—'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

