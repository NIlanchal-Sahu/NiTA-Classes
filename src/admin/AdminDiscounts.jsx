import { useEffect, useState } from 'react'
import { academyApi } from '../api/adminAcademy'

export default function AdminDiscounts() {
  const [items, setItems] = useState([])
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    type: 'percent',
    value: '',
    validity: '',
    applyToType: 'student',
    applyToId: '',
    note: '',
  })

  const refresh = async () => {
    setError('')
    try {
      const [d, c, s] = await Promise.all([academyApi.getDiscounts(), academyApi.getCourses(), academyApi.getStudents()])
      setItems(d.discounts || [])
      setCourses(c.courses || [])
      setStudents(s.students || [])
    } catch (e) {
      setError(e.message || 'Failed to load discounts')
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
      await academyApi.createDiscount({ ...form, value: Number(form.value) || 0 })
      setForm({ type: 'percent', value: '', validity: '', applyToType: 'student', applyToId: '', note: '' })
      await refresh()
    } catch (e1) {
      setError(e1.message || 'Failed to create discount')
    } finally {
      setSaving(false)
    }
  }

  const targetOptions = form.applyToType === 'student' ? students.map((s) => ({ id: s.id, label: `${s.name} (${s.id})` })) : courses.map((c) => ({ id: c.id, label: c.name }))

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Discount Management</h1>
      <p className="mt-1 text-gray-400">Create fixed or percentage discounts for students or courses.</p>
      {error && <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-200">{error}</div>}

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <select className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
            <option value="percent">Percent (%)</option>
            <option value="fixed">Fixed (₹)</option>
          </select>
          <input type="number" min="0" className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Value" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))} required />
          <input type="date" className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.validity} onChange={(e) => setForm((p) => ({ ...p, validity: e.target.value }))} required />
          <select className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.applyToType} onChange={(e) => setForm((p) => ({ ...p, applyToType: e.target.value, applyToId: '' }))}>
            <option value="student">Apply to Student</option>
            <option value="course">Apply to Course</option>
          </select>
          <select className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.applyToId} onChange={(e) => setForm((p) => ({ ...p, applyToId: e.target.value }))} required>
            <option value="">Select target</option>
            {targetOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
          <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Note" value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} />
          <div className="sm:col-span-2 lg:col-span-3">
            <button disabled={saving} className="btn-touch rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Create Discount'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Discounts</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-gray-300">
              <tr>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Value</th>
                <th className="px-3 py-3">Validity</th>
                <th className="px-3 py-3">Target</th>
              </tr>
            </thead>
            <tbody className="text-gray-200 divide-y divide-gray-700">
              {items.map((d) => (
                <tr key={d.id}>
                  <td className="px-3 py-3">{d.type}</td>
                  <td className="px-3 py-3">{d.type === 'percent' ? `${d.value}%` : `₹${d.value}`}</td>
                  <td className="px-3 py-3">{d.validity}</td>
                  <td className="px-3 py-3">{d.applyToType}: {d.applyToId}</td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={4} className="px-3 py-4 text-gray-500">No discounts yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

