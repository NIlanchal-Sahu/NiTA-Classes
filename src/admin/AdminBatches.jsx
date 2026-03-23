import { useEffect, useMemo, useState } from 'react'
import { academyApi } from '../api/adminAcademy'

const MODE_OPTIONS = [
  { value: 'online', label: 'Online' },
  { value: 'on-center', label: 'On-Center (Offline)' },
  { value: 'self-paced', label: 'Self-Paced (App-based)' },
]

function lifecycleStatus(batch) {
  const manual = String(batch?.status || '').toLowerCase()
  if (manual === 'completed' || manual === 'cancelled') return manual
  const today = new Date().toISOString().slice(0, 10)
  const start = String(batch?.startDate || '').slice(0, 10)
  const end = String(batch?.endDate || '').slice(0, 10)
  if (start && start > today) return 'upcoming'
  if (start && end && today >= start && today <= end) return 'active'
  if (end && today > end) return 'completed'
  return 'active'
}

function statusBadgeClass(status) {
  if (status === 'active') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  if (status === 'upcoming') return 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  if (status === 'completed') return 'bg-gray-600/30 text-gray-200 border-gray-500/40'
  return 'bg-rose-500/20 text-rose-300 border-rose-500/40'
}

export default function AdminBatches() {
  const [items, setItems] = useState([])
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [editingId, setEditingId] = useState('')
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [editStudentSearch, setEditStudentSearch] = useState('')
  const [form, setForm] = useState({
    name: '',
    courseId: '',
    timing: '',
    mode: 'online',
    startDate: '',
    endDate: '',
    teacherIds: ['NILanchal25'],
    studentIds: [],
  })
  const [submitting, setSubmitting] = useState(false)

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const [b, c, s, t] = await Promise.all([
        academyApi.getBatches(),
        academyApi.getCourses(),
        academyApi.getStudents(),
        academyApi.getTeachers(),
      ])
      setItems(b.batches || [])
      setCourses(c.courses || [])
      setStudents(s.students || [])
      setTeachers(t.teachers || [])
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

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase()
    if (!q) return students
    return students.filter((s) => String(s.name || '').toLowerCase().includes(q) || String(s.id || '').toLowerCase().includes(q))
  }, [studentSearch, students])

  const editFilteredStudents = useMemo(() => {
    if (!editing) return []
    const q = editStudentSearch.trim().toLowerCase()
    if (!q) return students
    return students.filter((s) => String(s.name || '').toLowerCase().includes(q) || String(s.id || '').toLowerCase().includes(q))
  }, [editStudentSearch, students, editing])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await academyApi.createBatch({
        name: form.name,
        monthYear: form.startDate ? form.startDate.slice(0, 7) : '',
        courseId: form.courseId,
        timing: form.timing,
        mode: form.mode,
        startDate: form.startDate,
        endDate: form.endDate,
        teacherIds: form.teacherIds,
        studentIds: form.studentIds,
      })
      setForm({
        name: '',
        courseId: '',
        timing: '',
        mode: 'online',
        startDate: '',
        endDate: '',
        teacherIds: ['NILanchal25'],
        studentIds: [],
      })
      await refresh()
    } catch (e) {
      setError(e.message || 'Create batch failed')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedStudents = students.filter((s) => form.studentIds.includes(s.id))

  const startEdit = (it) => {
    setEditingId(it.id)
    setEditStudentSearch('')
    setEditing({
      name: it.name || '',
      courseId: it.courseId || '',
      timing: it.timing || '',
      mode: it.mode || 'online',
      startDate: String(it.startDate || '').slice(0, 10),
      endDate: String(it.endDate || '').slice(0, 10),
      status: it.status || 'active',
      teacherIds: (Array.isArray(it.teacherIds) ? it.teacherIds : [it.teacherId || 'NILanchal25']).filter(Boolean),
      studentIds: Array.isArray(it.studentIds) ? it.studentIds : [],
    })
  }

  const saveEdit = async (id) => {
    if (!editing) return
    setSubmitting(true)
    setError('')
    try {
      await academyApi.updateBatch(id, {
        name: editing.name,
        courseId: editing.courseId,
        timing: editing.timing,
        mode: editing.mode,
        startDate: editing.startDate,
        endDate: editing.endDate,
        status: editing.status,
        teacherIds: editing.teacherIds,
        studentIds: editing.studentIds,
      })
      setEditingId('')
      setEditing(null)
      await refresh()
    } catch (e) {
      setError(e.message || 'Update batch failed')
    } finally {
      setSubmitting(false)
    }
  }

  const markCompleted = async (id) => {
    setSubmitting(true)
    setError('')
    try {
      await academyApi.markBatchCompleted(id)
      await refresh()
    } catch (e) {
      setError(e.message || 'Mark completed failed')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleTeacher = (list, teacherId) => {
    const id = String(teacherId || '').trim()
    if (!id) return list
    return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Batches & Timing</h1>
      <p className="mt-1 text-gray-400">Create/manage batches, assign multiple teachers, add/remove students, and mark completion.</p>

      {error && <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-200">{error}</div>}

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Create Batch</h2>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-300">Batch Name</label>
            <input className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required placeholder="Batch A" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Batch Mode</label>
            <select className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.mode} onChange={(e) => setForm((p) => ({ ...p, mode: e.target.value }))}>
              {MODE_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Course</label>
            <select className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.courseId} onChange={(e) => setForm((p) => ({ ...p, courseId: e.target.value }))} required>
              <option value="">Select course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Timing</label>
            <input className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.timing} onChange={(e) => setForm((p) => ({ ...p, timing: e.target.value }))} placeholder="7:00 PM - 8:00 PM" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Start Date</label>
            <input type="date" className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">End Date</label>
            <input type="date" className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} required />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-300">Teachers (multiple)</label>
            <div className="mt-1 max-h-32 overflow-auto rounded-lg border border-gray-700 bg-gray-900 p-2">
              {teachers.map((t) => {
                const selected = form.teacherIds.includes(t.id)
                return (
                  <label key={t.id} className="mb-1 flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs text-gray-300 hover:bg-gray-800">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => setForm((p) => ({ ...p, teacherIds: toggleTeacher(p.teacherIds, t.id) }))}
                    />
                    <span>{t.name} ({t.id})</span>
                  </label>
                )
              })}
            </div>
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-300">Search Student (name / ID)</label>
            <input className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} placeholder="Type student name or ID..." />
            <div className="mt-2 max-h-44 overflow-auto rounded-lg border border-gray-700 bg-gray-900 p-2">
              {filteredStudents.map((s) => {
                const selected = form.studentIds.includes(s.id)
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, studentIds: selected ? p.studentIds.filter((x) => x !== s.id) : [...p.studentIds, s.id] }))}
                    className={`mb-1 w-full rounded px-2 py-1 text-left text-xs ${selected ? 'bg-violet-600/40 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    {s.name} ({s.id}) · {s.phone}
                  </button>
                )
              })}
              {filteredStudents.length === 0 && <p className="text-xs text-gray-500">No students found.</p>}
            </div>
          </div>
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-300">Selected Students</label>
            <div className="mt-2 flex flex-wrap gap-2 rounded-lg border border-gray-700 bg-gray-900 p-2 min-h-[46px]">
              {selectedStudents.map((s) => (
                <span key={s.id} className="inline-flex items-center gap-2 rounded-full bg-violet-600/30 px-2 py-1 text-xs text-violet-100">
                  {s.name}
                  <button
                    type="button"
                    className="text-violet-200 hover:text-white"
                    onClick={() => setForm((p) => ({ ...p, studentIds: p.studentIds.filter((x) => x !== s.id) }))}
                  >
                    x
                  </button>
                </span>
              ))}
              {selectedStudents.length === 0 && <span className="text-xs text-gray-500">No students selected</span>}
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <button type="submit" disabled={submitting} className="btn-touch rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Saved batches</h2>
        {loading ? (
          <div className="mt-4 text-gray-400">Loading...</div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-gray-700 bg-gray-900 p-3 text-sm text-gray-300">
                Total Batches: <span className="text-white font-semibold">{items.length}</span>
              </div>
              <div className="rounded-xl border border-gray-700 bg-gray-900 p-3 text-sm text-emerald-300">
                Active: <span className="text-white font-semibold">{items.filter((x) => lifecycleStatus(x) === 'active').length}</span>
              </div>
              <div className="rounded-xl border border-gray-700 bg-gray-900 p-3 text-sm text-amber-300">
                Upcoming: <span className="text-white font-semibold">{items.filter((x) => lifecycleStatus(x) === 'upcoming').length}</span>
              </div>
              <div className="rounded-xl border border-gray-700 bg-gray-900 p-3 text-sm text-gray-300">
                Completed: <span className="text-white font-semibold">{items.filter((x) => lifecycleStatus(x) === 'completed').length}</span>
              </div>
            </div>
            <table className="min-w-full text-left text-sm">
              <thead className="text-gray-300">
                <tr>
                  <th className="px-3 py-3">Batch</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Course</th>
                  <th className="px-3 py-3">Mode</th>
                  <th className="px-3 py-3">Timing</th>
                  <th className="px-3 py-3">Teacher</th>
                  <th className="px-3 py-3">Start / End</th>
                  <th className="px-3 py-3">Batch Size</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-200 divide-y divide-gray-700">
                {items.map((it) => (
                  editingId === it.id && editing ? (
                    <tr key={it.id} className="bg-gray-900/40">
                      <td className="px-3 py-3" colSpan={9}>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editing.name} onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))} />
                          <select className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editing.courseId} onChange={(e) => setEditing((p) => ({ ...p, courseId: e.target.value }))}>
                            <option value="">Select course</option>
                            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                          <select className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editing.mode} onChange={(e) => setEditing((p) => ({ ...p, mode: e.target.value }))}>
                            {MODE_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                          </select>
                          <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editing.timing} onChange={(e) => setEditing((p) => ({ ...p, timing: e.target.value }))} />
                          <input type="date" className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editing.startDate} onChange={(e) => setEditing((p) => ({ ...p, startDate: e.target.value }))} />
                          <input type="date" className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editing.endDate} onChange={(e) => setEditing((p) => ({ ...p, endDate: e.target.value }))} />
                          <div className="rounded-lg border border-gray-700 bg-gray-900 p-2 sm:col-span-2">
                            <p className="mb-1 text-xs text-gray-400">Teachers (multiple)</p>
                            <div className="max-h-28 overflow-auto">
                              {teachers.map((t) => {
                                const selected = editing.teacherIds.includes(t.id)
                                return (
                                  <label key={t.id} className="mb-1 flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs text-gray-300 hover:bg-gray-800">
                                    <input
                                      type="checkbox"
                                      checked={selected}
                                      onChange={() => setEditing((p) => ({ ...p, teacherIds: toggleTeacher(p.teacherIds, t.id) }))}
                                    />
                                    <span>{t.name} ({t.id})</span>
                                  </label>
                                )
                              })}
                            </div>
                          </div>
                          <select className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editing.status} onChange={(e) => setEditing((p) => ({ ...p, status: e.target.value }))}>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        <div className="mt-3">
                          <input className="w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editStudentSearch} onChange={(e) => setEditStudentSearch(e.target.value)} placeholder="Search and add/remove students by name or ID" />
                          <div className="mt-2 max-h-36 overflow-auto rounded-lg border border-gray-700 bg-gray-900 p-2">
                            {editFilteredStudents.map((s) => {
                              const selected = editing.studentIds.includes(s.id)
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  className={`mb-1 w-full rounded px-2 py-1 text-left text-xs ${selected ? 'bg-violet-600/40 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                                  onClick={() =>
                                    setEditing((p) => ({
                                      ...p,
                                      studentIds: selected ? p.studentIds.filter((x) => x !== s.id) : [...p.studentIds, s.id],
                                    }))
                                  }
                                >
                                  {s.name} ({s.id})
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button type="button" className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700" onClick={() => saveEdit(it.id)} disabled={submitting}>Save</button>
                          <button type="button" className="rounded-lg border border-gray-600 px-3 py-2 text-xs text-gray-300 hover:bg-gray-800" onClick={() => { setEditingId(''); setEditing(null) }}>Cancel</button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={it.id} className="hover:bg-gray-900/30">
                      <td className="px-3 py-3">{it.name}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${statusBadgeClass(lifecycleStatus(it))}`}>
                          {lifecycleStatus(it)}
                        </span>
                      </td>
                      <td className="px-3 py-3">{it.courseId}</td>
                      <td className="px-3 py-3">{it.mode || 'online'}</td>
                      <td className="px-3 py-3">{it.timing}</td>
                      <td className="px-3 py-3">{(it.teacherNames || it.teacherIds || [it.teacherId]).filter(Boolean).join(', ') || 'NILanchal25'}</td>
                      <td className="px-3 py-3">{it.startDate || '—'} / {it.endDate || '—'}</td>
                      <td className="px-3 py-3">{it.batchSize ?? (it.studentIds?.length || 0)}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700" onClick={() => startEdit(it)}>
                            Edit
                          </button>
                          <button type="button" className="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700" onClick={() => markCompleted(it.id)} disabled={lifecycleStatus(it) === 'completed'}>
                            Mark as Completed
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-3 py-4 text-gray-500">
                      No batches found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

