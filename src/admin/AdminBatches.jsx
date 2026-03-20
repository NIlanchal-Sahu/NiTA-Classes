import { useEffect, useState } from 'react'
import { academyApi } from '../api/adminAcademy'

export default function AdminBatches() {
  const [items, setItems] = useState([])
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    monthYear: '',
    courseId: '',
    timing: '',
    teacherId: '',
    studentIdsCsv: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const [b, c, s] = await Promise.all([academyApi.getBatches(), academyApi.getCourses(), academyApi.getStudents()])
      setItems(b.batches || [])
      setCourses(c.courses || [])
      setStudents(s.students || [])
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await academyApi.createBatch({
        name: form.name,
        monthYear: form.monthYear,
        courseId: form.courseId,
        timing: form.timing,
        teacherId: form.teacherId,
        studentIds: form.studentIdsCsv
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean),
      })
      setForm({
        name: '',
        monthYear: '',
        courseId: '',
        timing: '',
        teacherId: '',
        studentIdsCsv: '',
      })
      await refresh()
    } catch (e) {
      setError(e.message || 'Create batch failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Batches & Timing</h1>
      <p className="mt-1 text-gray-400">Create month-year batches, assign course, timing, teacher, and students.</p>

      {error && <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-200">{error}</div>}

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Create Batch</h2>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-300">Batch Name</label>
            <input className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required placeholder="Batch A" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Month & Year</label>
            <input className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.monthYear} onChange={(e) => setForm((p) => ({ ...p, monthYear: e.target.value }))} required placeholder="March 2026" />
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
            <label className="block text-sm font-medium text-gray-300">Teacher ID</label>
            <input className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.teacherId} onChange={(e) => setForm((p) => ({ ...p, teacherId: e.target.value }))} placeholder="teacher-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Student IDs (comma separated)</label>
            <input className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.studentIdsCsv} onChange={(e) => setForm((p) => ({ ...p, studentIdsCsv: e.target.value }))} placeholder={students.slice(0, 2).map((s) => s.id).join(', ')} />
          </div>
          <div className="sm:col-span-2">
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
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-gray-300">
                <tr>
                  <th className="px-3 py-3">Batch</th>
                  <th className="px-3 py-3">Month</th>
                  <th className="px-3 py-3">Course</th>
                  <th className="px-3 py-3">Timing</th>
                  <th className="px-3 py-3">Teacher</th>
                  <th className="px-3 py-3">Batch Size</th>
                </tr>
              </thead>
              <tbody className="text-gray-200 divide-y divide-gray-700">
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-gray-900/30">
                    <td className="px-3 py-3">{it.name}</td>
                    <td className="px-3 py-3">{it.monthYear}</td>
                    <td className="px-3 py-3">{it.courseId}</td>
                    <td className="px-3 py-3">{it.timing}</td>
                    <td className="px-3 py-3">{it.teacherId || '—'}</td>
                    <td className="px-3 py-3">{it.batchSize ?? (it.studentIds?.length || 0)}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-gray-500">
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

