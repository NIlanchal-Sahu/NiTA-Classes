import { useEffect, useState } from 'react'
import { academyApi } from '../api/adminAcademy'

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', description: '', duration: '', priceType: 'perClass10', price: 10 })
  const [saving, setSaving] = useState(false)

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const out = await academyApi.getCourses()
      setCourses(out.courses || [])
    } catch (e) {
      setError(e.message || 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await academyApi.createCourse(form)
      setForm({ name: '', description: '', duration: '', priceType: 'perClass10', price: 10 })
      await refresh()
    } catch (e1) {
      setError(e1.message || 'Failed to create course')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Course Management</h1>
      <p className="mt-1 text-gray-400">Create course, duration and pricing model.</p>
      {error && <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-200">{error}</div>}

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Create Course</h2>
        <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Course name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Duration (e.g. 3 Months)" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} />
          <textarea className="sm:col-span-2 rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          <select className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.priceType} onChange={(e) => setForm((p) => ({ ...p, priceType: e.target.value }))}>
            <option value="perClass10">₹10 per class</option>
            <option value="custom">Custom</option>
          </select>
          <input type="number" min="0" className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) || 0 }))} />
          <div className="sm:col-span-2">
            <button disabled={saving} className="btn-touch rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Courses</h2>
        {loading ? <div className="mt-4 text-gray-400">Loading...</div> : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-gray-300">
                <tr>
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Duration</th>
                  <th className="px-3 py-3">Price Type</th>
                  <th className="px-3 py-3">Price</th>
                </tr>
              </thead>
              <tbody className="text-gray-200 divide-y divide-gray-700">
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td className="px-3 py-3">{c.name}</td>
                    <td className="px-3 py-3">{c.duration || '—'}</td>
                    <td className="px-3 py-3">{c.priceType}</td>
                    <td className="px-3 py-3">₹{c.price}</td>
                  </tr>
                ))}
                {courses.length === 0 && <tr><td colSpan={4} className="px-3 py-4 text-gray-500">No courses found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

