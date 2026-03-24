import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { academyApi } from '../api/adminAcademy'

function thisMonth() {
  return new Date().toISOString().slice(0, 7)
}

export default function AdminTeachers() {
  const { user } = useAuth()
  const isTeacher = user?.role === 'teacher'
  const [tab, setTab] = useState('all')
  const [month, setMonth] = useState(thisMonth())
  const [courseId, setCourseId] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [teachers, setTeachers] = useState([])
  const [courses, setCourses] = useState([])
  const [batches, setBatches] = useState([])
  const [teacherAttendance, setTeacherAttendance] = useState([])
  const [attendanceRequests, setAttendanceRequests] = useState([])
  const [teacherPayments, setTeacherPayments] = useState([])
  const [paymentSummary, setPaymentSummary] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [newTeacher, setNewTeacher] = useState({
    name: '',
    mobile: '',
    email: '',
    qualification: '',
    expertise: '',
    assignedCourseIds: [],
    username: '',
    password: '',
    profilePhotoUrl: '',
    perClassRate: 0,
  })
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [attendanceForm, setAttendanceForm] = useState({ teacherId: '', batchId: '', date: new Date().toISOString().slice(0, 10), status: 'present' })
  const [requestForm, setRequestForm] = useState({ batchId: '', date: new Date().toISOString().slice(0, 10), status: 'present', note: '' })
  const [paymentForm, setPaymentForm] = useState({ teacherId: '', batchId: '', date: new Date().toISOString().slice(0, 10), classesCount: 1, rate: '', bonus: 0, note: '' })

  const teacherMap = useMemo(() => new Map(teachers.map((t) => [t.id, t])), [teachers])
  const batchMap = useMemo(() => new Map(batches.map((b) => [b.id, b])), [batches])
  const courseMap = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses])
  const meTeacher = useMemo(() => teachers.find((t) => t.id === user?.id) || null, [teachers, user?.id])

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const [t, b, c] = await Promise.all([academyApi.getTeachers(), academyApi.getBatches(), academyApi.getCourses()])
      const teacherRows = (t.teachers || []).filter((x) => x.id !== 'NILanchal25')
      setTeachers(teacherRows)
      setBatches(b.batches || [])
      setCourses(c.courses || [])
      const effectiveTeacher = isTeacher ? user?.id || '' : selectedTeacherId
      const attendanceQs = [`month=${encodeURIComponent(month)}`, effectiveTeacher ? `teacherId=${encodeURIComponent(effectiveTeacher)}` : '', courseId ? `courseId=${encodeURIComponent(courseId)}` : ''].filter(Boolean).join('&')
      const paymentQs = [`month=${encodeURIComponent(month)}`, effectiveTeacher ? `teacherId=${encodeURIComponent(effectiveTeacher)}` : '', courseId ? `courseId=${encodeURIComponent(courseId)}` : ''].filter(Boolean).join('&')
      const requestQs = [`month=${encodeURIComponent(month)}`, effectiveTeacher ? `teacherId=${encodeURIComponent(effectiveTeacher)}` : '', isTeacher ? '' : 'status=pending'].filter(Boolean).join('&')
      const [att, reqs, pay] = await Promise.all([
        academyApi.getTeacherAttendance(attendanceQs),
        academyApi.getTeacherAttendanceRequests(requestQs),
        academyApi.getTeacherPayments(paymentQs),
      ])
      setTeacherAttendance(att.attendance || [])
      setAttendanceRequests(reqs.requests || [])
      setTeacherPayments(pay.payments || [])
      setPaymentSummary(pay.summary || [])
      if (!selectedTeacherId && teacherRows[0] && !isTeacher) setSelectedTeacherId(teacherRows[0].id)
      if (isTeacher) {
        setSelectedTeacherId(user?.id || '')
        setAttendanceForm((p) => ({ ...p, teacherId: user?.id || '' }))
        setPaymentForm((p) => ({ ...p, teacherId: user?.id || '' }))
      }
    } catch (e) {
      setError(e.message || 'Failed to load teacher module')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, courseId, selectedTeacherId, isTeacher, user?.id])

  const selectedTeacher = useMemo(
    () => teacherMap.get(isTeacher ? user?.id || '' : selectedTeacherId) || null,
    [teacherMap, isTeacher, user?.id, selectedTeacherId],
  )

  const assignedBatches = useMemo(() => {
    const tid = isTeacher ? user?.id || '' : selectedTeacherId
    return batches.filter((b) => (b.teacherIds || [b.teacherId]).filter(Boolean).includes(tid))
  }, [batches, isTeacher, user?.id, selectedTeacherId])
  const filteredAssignedBatches = useMemo(() => {
    return assignedBatches.filter((b) => (!courseId || b.courseId === courseId))
  }, [assignedBatches, courseId])

  const monthlyClassesTaken = useMemo(
    () => teacherAttendance.filter((a) => a.status === 'present').length,
    [teacherAttendance],
  )
  const monthlyEarnings = useMemo(
    () => teacherPayments.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0),
    [teacherPayments],
  )

  const createTeacher = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await academyApi.createTeacher(newTeacher)
      setNewTeacher({
        name: '',
        mobile: '',
        email: '',
        qualification: '',
        expertise: '',
        assignedCourseIds: [],
        username: '',
        password: '',
        profilePhotoUrl: '',
        perClassRate: 0,
      })
      setTab('all')
      await refresh()
    } catch (e1) {
      setError(e1.message || 'Failed to create teacher')
    } finally {
      setSaving(false)
    }
  }

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const fr = new FileReader()
      fr.onload = () => resolve(String(fr.result || ''))
      fr.onerror = reject
      fr.readAsDataURL(file)
    })

  const toggleCourseAssign = (course) => {
    setNewTeacher((p) => ({
      ...p,
      assignedCourseIds: p.assignedCourseIds.includes(course)
        ? p.assignedCourseIds.filter((x) => x !== course)
        : [...p.assignedCourseIds, course],
    }))
  }

  const markTeacherAttendance = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await academyApi.markTeacherAttendance(attendanceForm)
      await refresh()
    } catch (e1) {
      setError(e1.message || 'Failed to mark teacher attendance')
    } finally {
      setSaving(false)
    }
  }

  const submitAttendanceRequest = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await academyApi.createTeacherAttendanceRequest(requestForm)
      setRequestForm((p) => ({ ...p, note: '' }))
      await refresh()
    } catch (e1) {
      setError(e1.message || 'Failed to submit attendance request')
    } finally {
      setSaving(false)
    }
  }

  const approveRequest = async (id) => {
    setSaving(true)
    setError('')
    try {
      await academyApi.approveTeacherAttendanceRequest(id)
      await refresh()
    } catch (e) {
      setError(e.message || 'Failed to approve request')
    } finally {
      setSaving(false)
    }
  }

  const rejectRequest = async (id) => {
    const note = window.prompt('Optional rejection note:', '') || ''
    setSaving(true)
    setError('')
    try {
      await academyApi.rejectTeacherAttendanceRequest(id, note)
      await refresh()
    } catch (e) {
      setError(e.message || 'Failed to reject request')
    } finally {
      setSaving(false)
    }
  }

  const addTeacherPayment = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await academyApi.addTeacherPayment(paymentForm)
      await refresh()
    } catch (e1) {
      setError(e1.message || 'Failed to add payment entry')
    } finally {
      setSaving(false)
    }
  }

  const setTeacherStatus = async (id, status) => {
    setSaving(true)
    setError('')
    try {
      await academyApi.updateTeacherStatus(id, status)
      await refresh()
    } catch (e) {
      setError(e.message || 'Failed to update teacher status')
    } finally {
      setSaving(false)
    }
  }

  const removeTeacher = async (id) => {
    if (!window.confirm('Delete this teacher? If linked to batches, it will be deactivated.')) return
    setSaving(true)
    setError('')
    try {
      await academyApi.deleteTeacher(id)
      await refresh()
    } catch (e) {
      setError(e.message || 'Delete failed')
    } finally {
      setSaving(false)
    }
  }

  const startEditTeacher = (t) => {
    setEditingTeacher({
      id: t.id,
      name: t.name || '',
      mobile: t.mobile || '',
      email: t.email || '',
      qualification: t.qualification || '',
      expertise: t.expertise || '',
      assignedCourseIds: Array.isArray(t.assignedCourseIds) ? t.assignedCourseIds : [],
      username: t.username || '',
      password: '',
      profilePhotoUrl: t.profilePhotoUrl || '',
      perClassRate: t.perClassRate || 0,
      status: t.status || 'active',
    })
  }

  const saveEditTeacher = async (e) => {
    e.preventDefault()
    if (!editingTeacher) return
    setSaving(true)
    setError('')
    try {
      await academyApi.updateTeacher(editingTeacher.id, editingTeacher)
      setEditingTeacher(null)
      await refresh()
    } catch (e1) {
      setError(e1.message || 'Failed to update teacher')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">{isTeacher ? 'Teacher Dashboard' : 'Teacher Management'}</h1>
      <p className="mt-1 text-gray-400">Manage teachers, assigned batches, attendance, payments, and earnings insights.</p>
      {error && <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-700 bg-gray-800 p-4">
          <div className="text-sm text-gray-400">Total Batches Assigned</div>
          <div className="mt-1 text-2xl font-bold text-white">{assignedBatches.length}</div>
        </div>
        <div className="rounded-2xl border border-gray-700 bg-gray-800 p-4">
          <div className="text-sm text-gray-400">Active Batches</div>
          <div className="mt-1 text-2xl font-bold text-emerald-300">
            {assignedBatches.filter((b) => String(b.status) === 'active').length}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-700 bg-gray-800 p-4">
          <div className="text-sm text-gray-400">Total Classes Taken ({month})</div>
          <div className="mt-1 text-2xl font-bold text-white">{monthlyClassesTaken}</div>
        </div>
        <div className="rounded-2xl border border-gray-700 bg-gray-800 p-4">
          <div className="text-sm text-gray-400">Total Earnings ({month})</div>
          <div className="mt-1 text-2xl font-bold text-emerald-300">₹{monthlyEarnings}</div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button className={`rounded-lg px-3 py-1.5 text-sm ${tab === 'all' ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-300'}`} onClick={() => setTab('all')}>All Teachers</button>
        {!isTeacher && <button className={`rounded-lg px-3 py-1.5 text-sm ${tab === 'add' ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-300'}`} onClick={() => setTab('add')}>Add Teacher</button>}
        <button className={`rounded-lg px-3 py-1.5 text-sm ${tab === 'payments' ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-300'}`} onClick={() => setTab('payments')}>Payments</button>
        <button className={`rounded-lg px-3 py-1.5 text-sm ${tab === 'attendance' ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-300'}`} onClick={() => setTab('attendance')}>Attendance</button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" />
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white">
          <option value="">All courses</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {!isTeacher && (
          <select value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(e.target.value)} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white">
            <option value="">All teachers</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.id})</option>)}
          </select>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Assigned Batches / Classes</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-gray-300">
              <tr>
                <th className="px-3 py-2">Batch Name</th>
                <th className="px-3 py-2">Course</th>
                <th className="px-3 py-2">Timing</th>
                <th className="px-3 py-2">Mode</th>
                <th className="px-3 py-2">Students</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-gray-200">
              {filteredAssignedBatches.map((b) => (
                <tr key={b.id}>
                  <td className="px-3 py-2">{b.name}</td>
                  <td className="px-3 py-2">{courseMap.get(b.courseId)?.name || b.courseId}</td>
                  <td className="px-3 py-2">{b.timing || '—'}</td>
                  <td className="px-3 py-2">{b.mode || 'online'}</td>
                  <td className="px-3 py-2">{b.batchSize ?? (b.studentIds || []).length}</td>
                  <td className="px-3 py-2">{b.status}</td>
                </tr>
              ))}
              {filteredAssignedBatches.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-3 text-gray-500">No assigned batches for selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {tab === 'all' && (
        <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white">All Teachers</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-gray-300">
                <tr>
                  <th className="px-3 py-2">Teacher</th>
                  <th className="px-3 py-2">Mobile</th>
                  <th className="px-3 py-2">Courses</th>
                  <th className="px-3 py-2">Per Class ₹</th>
                  <th className="px-3 py-2">Status</th>
                  {!isTeacher && <th className="px-3 py-2">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 text-gray-200">
                {teachers
                  .filter((t) => !statusFilter || t.status === statusFilter)
                  .map((t) => (
                    <tr key={t.id}>
                      <td className="px-3 py-2">{t.name} ({t.id})</td>
                      <td className="px-3 py-2">{t.mobile || '—'}</td>
                      <td className="px-3 py-2">{(t.assignedCourseIds || []).join(', ') || '—'}</td>
                      <td className="px-3 py-2">{t.perClassRate || 0}</td>
                      <td className="px-3 py-2">{t.status}</td>
                      {!isTeacher && (
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <button className="rounded bg-blue-600 px-2 py-1 text-xs text-white" onClick={() => startEditTeacher(t)}>Edit</button>
                            <button className="rounded bg-amber-600 px-2 py-1 text-xs text-white" onClick={() => setTeacherStatus(t.id, t.status === 'active' ? 'inactive' : 'active')}>{t.status === 'active' ? 'Deactivate' : 'Activate'}</button>
                            <button className="rounded bg-red-600 px-2 py-1 text-xs text-white" onClick={() => removeTeacher(t.id)}>Delete</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <label className="text-xs text-gray-400">Filter status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="ml-2 rounded border border-gray-600 bg-gray-900 px-2 py-1 text-xs text-white">
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      )}

      {editingTeacher && !isTeacher && (
        <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white">Edit Teacher Profile</h2>
          <form onSubmit={saveEditTeacher} className="mt-4 grid gap-4 sm:grid-cols-2">
            <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editingTeacher.name} onChange={(e) => setEditingTeacher((p) => ({ ...p, name: e.target.value }))} />
            <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editingTeacher.mobile} onChange={(e) => setEditingTeacher((p) => ({ ...p, mobile: e.target.value }))} />
            <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editingTeacher.email} onChange={(e) => setEditingTeacher((p) => ({ ...p, email: e.target.value }))} />
            <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editingTeacher.qualification} onChange={(e) => setEditingTeacher((p) => ({ ...p, qualification: e.target.value }))} />
            <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editingTeacher.expertise} onChange={(e) => setEditingTeacher((p) => ({ ...p, expertise: e.target.value }))} />
            <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editingTeacher.username} onChange={(e) => setEditingTeacher((p) => ({ ...p, username: e.target.value }))} />
            <input type="number" className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editingTeacher.perClassRate} onChange={(e) => setEditingTeacher((p) => ({ ...p, perClassRate: e.target.value }))} />
            <select className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editingTeacher.status} onChange={(e) => setEditingTeacher((p) => ({ ...p, status: e.target.value }))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="sm:col-span-2 rounded-lg border border-gray-700 bg-gray-900 p-2">
              <label className="mb-1 block text-xs text-gray-400">Profile Photo Upload</label>
              <input
                type="file"
                accept="image/*"
                className="text-xs text-gray-300"
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  try {
                    const dataUrl = await fileToDataUrl(f)
                    setEditingTeacher((p) => ({ ...p, profilePhotoUrl: dataUrl }))
                  } catch {
                    setError('Failed to read selected image')
                  }
                }}
              />
              {editingTeacher.profilePhotoUrl && (
                <img src={editingTeacher.profilePhotoUrl} alt="" className="mt-2 h-12 w-12 rounded-full object-cover" />
              )}
            </div>
            <input type="password" className="sm:col-span-2 rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editingTeacher.password} onChange={(e) => setEditingTeacher((p) => ({ ...p, password: e.target.value }))} placeholder="Set new password (optional)" />
            <div className="sm:col-span-2 rounded-lg border border-gray-700 bg-gray-900 p-3">
              <p className="mb-2 text-xs text-gray-400">Courses assigned</p>
              <div className="grid gap-1 sm:grid-cols-2">
                {courses.map((c) => (
                  <label key={c.id} className="text-xs text-gray-300">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={editingTeacher.assignedCourseIds.includes(c.id)}
                      onChange={() =>
                        setEditingTeacher((p) => ({
                          ...p,
                          assignedCourseIds: p.assignedCourseIds.includes(c.id)
                            ? p.assignedCourseIds.filter((x) => x !== c.id)
                            : [...p.assignedCourseIds, c.id],
                        }))
                      }
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button disabled={saving} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white">{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300" onClick={() => setEditingTeacher(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {tab === 'add' && !isTeacher && (
        <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white">Add Teacher</h2>
          <form onSubmit={createTeacher} className="mt-4 grid gap-4 sm:grid-cols-2">
            <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Full Name" value={newTeacher.name} onChange={(e) => setNewTeacher((p) => ({ ...p, name: e.target.value }))} required />
            <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Mobile Number" value={newTeacher.mobile} onChange={(e) => setNewTeacher((p) => ({ ...p, mobile: e.target.value }))} required />
            <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Email (optional)" value={newTeacher.email} onChange={(e) => setNewTeacher((p) => ({ ...p, email: e.target.value }))} />
            <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Qualification / Expertise" value={newTeacher.qualification} onChange={(e) => setNewTeacher((p) => ({ ...p, qualification: e.target.value }))} />
            <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Username (auto if blank)" value={newTeacher.username} onChange={(e) => setNewTeacher((p) => ({ ...p, username: e.target.value }))} />
            <div className="flex gap-2">
              <input type={showPassword ? 'text' : 'password'} className="w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Password" value={newTeacher.password} onChange={(e) => setNewTeacher((p) => ({ ...p, password: e.target.value }))} required />
              <button type="button" className="rounded bg-gray-700 px-3 text-xs text-white" onClick={() => setShowPassword((v) => !v)}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>
            <input type="number" min="0" className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Per-class rate (₹)" value={newTeacher.perClassRate} onChange={(e) => setNewTeacher((p) => ({ ...p, perClassRate: e.target.value }))} />
            <div className="rounded-lg border border-gray-700 bg-gray-900 p-2">
              <label className="mb-1 block text-xs text-gray-400">Profile Photo Upload</label>
              <input
                type="file"
                accept="image/*"
                className="text-xs text-gray-300"
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  try {
                    const dataUrl = await fileToDataUrl(f)
                    setNewTeacher((p) => ({ ...p, profilePhotoUrl: dataUrl }))
                  } catch {
                    setError('Failed to read selected image')
                  }
                }}
              />
              {newTeacher.profilePhotoUrl && (
                <img src={newTeacher.profilePhotoUrl} alt="" className="mt-2 h-12 w-12 rounded-full object-cover" />
              )}
            </div>
            <div className="sm:col-span-2 rounded-lg border border-gray-700 bg-gray-900 p-3">
              <p className="mb-2 text-xs text-gray-400">Subjects / Courses they can teach</p>
              <div className="grid gap-1 sm:grid-cols-2">
                {courses.map((c) => (
                  <label key={c.id} className="text-xs text-gray-300">
                    <input type="checkbox" checked={newTeacher.assignedCourseIds.includes(c.id)} onChange={() => toggleCourseAssign(c.id)} className="mr-2" />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <button disabled={saving} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white">{saving ? 'Saving...' : 'Create Teacher'}</button>
            </div>
          </form>
        </div>
      )}

      {tab === 'attendance' && (
        <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white">Teacher Attendance</h2>
          {isTeacher ? (
            <form onSubmit={submitAttendanceRequest} className="mt-4 grid gap-3 sm:grid-cols-5">
              <select required value={requestForm.batchId} onChange={(e) => setRequestForm((p) => ({ ...p, batchId: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white">
                <option value="">Batch</option>
                {batches
                  .filter((b) => (b.teacherIds || [b.teacherId]).filter(Boolean).includes(user?.id))
                  .map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <input type="date" required value={requestForm.date} onChange={(e) => setRequestForm((p) => ({ ...p, date: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" />
              <select value={requestForm.status} onChange={(e) => setRequestForm((p) => ({ ...p, status: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white">
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
              <input value={requestForm.note} onChange={(e) => setRequestForm((p) => ({ ...p, note: e.target.value }))} placeholder="Note (optional)" className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" />
              <button disabled={saving} className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white">{saving ? 'Submitting...' : 'Submit Request'}</button>
            </form>
          ) : (
            <form onSubmit={markTeacherAttendance} className="mt-4 grid gap-3 sm:grid-cols-5">
              <select required value={attendanceForm.teacherId} onChange={(e) => setAttendanceForm((p) => ({ ...p, teacherId: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white">
                <option value="">Teacher</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <select required value={attendanceForm.batchId} onChange={(e) => setAttendanceForm((p) => ({ ...p, batchId: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white">
                <option value="">Batch</option>
                {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <input type="date" required value={attendanceForm.date} onChange={(e) => setAttendanceForm((p) => ({ ...p, date: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" />
              <select value={attendanceForm.status} onChange={(e) => setAttendanceForm((p) => ({ ...p, status: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white">
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
              <button disabled={saving} className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white">{saving ? 'Saving...' : 'Mark'}</button>
            </form>
          )}
          {!isTeacher && (
            <div className="mt-4 rounded-xl border border-gray-700 bg-gray-900 p-4">
              <h3 className="font-semibold text-white">Pending Teacher Requests</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-gray-300">
                    <tr>
                      <th className="px-2 py-1">Date</th>
                      <th className="px-2 py-1">Teacher</th>
                      <th className="px-2 py-1">Batch</th>
                      <th className="px-2 py-1">Requested</th>
                      <th className="px-2 py-1">Note</th>
                      <th className="px-2 py-1">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700 text-gray-200">
                    {attendanceRequests
                      .filter((r) => r.status === 'pending')
                      .map((r) => (
                        <tr key={r.id}>
                          <td className="px-2 py-1">{r.date}</td>
                          <td className="px-2 py-1">{teacherMap.get(r.teacherId)?.name || r.teacherId}</td>
                          <td className="px-2 py-1">{batchMap.get(r.batchId)?.name || r.batchId}</td>
                          <td className="px-2 py-1">{r.attendanceStatus}</td>
                          <td className="px-2 py-1">{r.note || '—'}</td>
                          <td className="px-2 py-1">
                            <div className="flex gap-2">
                              <button type="button" className="rounded bg-emerald-600 px-2 py-1 text-xs text-white" onClick={() => approveRequest(r.id)}>Approve</button>
                              <button type="button" className="rounded bg-red-600 px-2 py-1 text-xs text-white" onClick={() => rejectRequest(r.id)}>Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {attendanceRequests.filter((r) => r.status === 'pending').length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-2 py-2 text-gray-500">No pending requests.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {isTeacher && (
            <div className="mt-4 rounded-xl border border-gray-700 bg-gray-900 p-4">
              <h3 className="font-semibold text-white">My Attendance Requests</h3>
              <div className="mt-2 space-y-2 text-sm text-gray-200">
                {attendanceRequests.map((r) => (
                  <div key={r.id} className="rounded border border-gray-700 px-3 py-2">
                    {r.date} · {batchMap.get(r.batchId)?.name || r.batchId} · {r.attendanceStatus} ·{' '}
                    <span className={r.status === 'approved' ? 'text-emerald-300' : r.status === 'rejected' ? 'text-red-300' : 'text-amber-300'}>
                      {r.status}
                    </span>
                  </div>
                ))}
                {attendanceRequests.length === 0 && <p className="text-gray-500">No requests submitted yet.</p>}
              </div>
            </div>
          )}
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-gray-300">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Batch</th>
                  <th className="px-3 py-2">Course</th>
                  <th className="px-3 py-2">Teacher</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 text-gray-200">
                {teacherAttendance.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2">{r.date}</td>
                    <td className="px-3 py-2">{batchMap.get(r.batchId)?.name || r.batchId}</td>
                    <td className="px-3 py-2">{courseMap.get(r.courseId)?.name || r.courseId}</td>
                    <td className="px-3 py-2">{teacherMap.get(r.teacherId)?.name || r.teacherId}</td>
                    <td className="px-3 py-2">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'payments' && (
        <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white">Per Class Payments</h2>
          {!isTeacher && (
            <form onSubmit={addTeacherPayment} className="mt-4 grid gap-3 sm:grid-cols-7">
              <select required value={paymentForm.teacherId} onChange={(e) => setPaymentForm((p) => ({ ...p, teacherId: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-2 py-2 text-white">
                <option value="">Teacher</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <select required value={paymentForm.batchId} onChange={(e) => setPaymentForm((p) => ({ ...p, batchId: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-2 py-2 text-white">
                <option value="">Batch</option>
                {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <input type="date" required value={paymentForm.date} onChange={(e) => setPaymentForm((p) => ({ ...p, date: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-2 py-2 text-white" />
              <input type="number" min="1" value={paymentForm.classesCount} onChange={(e) => setPaymentForm((p) => ({ ...p, classesCount: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-2 py-2 text-white" placeholder="Classes" />
              <input type="number" min="0" value={paymentForm.rate} onChange={(e) => setPaymentForm((p) => ({ ...p, rate: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-2 py-2 text-white" placeholder="Rate ₹" />
              <input type="number" min="0" value={paymentForm.bonus} onChange={(e) => setPaymentForm((p) => ({ ...p, bonus: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-2 py-2 text-white" placeholder="Bonus ₹" />
              <button disabled={saving} className="rounded-lg bg-violet-600 px-2 py-2 text-sm font-semibold text-white">{saving ? 'Saving...' : 'Add Payment Entry'}</button>
            </form>
          )}
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-gray-300">
                <tr>
                  <th className="px-3 py-2">Teacher</th>
                  <th className="px-3 py-2">Batch</th>
                  <th className="px-3 py-2">Classes</th>
                  <th className="px-3 py-2">Rate</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Month</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 text-gray-200">
                {teacherPayments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2">{teacherMap.get(p.teacherId)?.name || p.teacherId}</td>
                    <td className="px-3 py-2">{batchMap.get(p.batchId)?.name || p.batchId}</td>
                    <td className="px-3 py-2">{p.classesCount}</td>
                    <td className="px-3 py-2">₹{p.rate}</td>
                    <td className="px-3 py-2">₹{p.totalAmount}</td>
                    <td className="px-3 py-2">{String(p.date).slice(0, 7)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-xl border border-gray-700 bg-gray-900 p-4">
            <h3 className="font-semibold text-white">Monthly Salary Summary</h3>
            <div className="mt-2 space-y-1 text-sm text-gray-300">
              {paymentSummary.map((s) => (
                <div key={s.teacherId} className="flex justify-between">
                  <span>{teacherMap.get(s.teacherId)?.name || s.teacherId}</span>
                  <span>{s.classes} classes · ₹{s.amount}</span>
                </div>
              ))}
              {paymentSummary.length === 0 && <p className="text-gray-500">No salary data for selected filters.</p>}
            </div>
          </div>
        </div>
      )}

      {!loading && selectedTeacher && (
        <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white">Teacher Profile</h2>
          <p className="mt-2 text-sm text-gray-300">{selectedTeacher.name} · {selectedTeacher.mobile || 'No mobile'} · {selectedTeacher.email || 'No email'}</p>
          <p className="mt-1 text-xs text-gray-500">Assigned batches can be managed from Batch module.</p>
        </div>
      )}
    </div>
  )
}

