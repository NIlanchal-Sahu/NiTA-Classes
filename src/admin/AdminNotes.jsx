import { useEffect, useState } from 'react'
import { academyApi } from '../api/adminAcademy'

export default function AdminNotes() {
  const [notes, setNotes] = useState([])
  const [courses, setCourses] = useState([])
  const [batches, setBatches] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    resourceType: 'pdf',
    url: '',
    courseId: '',
    batchId: '',
  })

  const refresh = async () => {
    setError('')
    try {
      const [n, c, b] = await Promise.all([academyApi.getNotes(), academyApi.getCourses(), academyApi.getBatches()])
      setNotes(n.notes || [])
      setCourses(c.courses || [])
      setBatches(b.batches || [])
    } catch (e) {
      setError(e.message || 'Failed to load notes')
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
      await academyApi.createNote(form)
      setForm({ title: '', resourceType: 'pdf', url: '', courseId: '', batchId: '' })
      await refresh()
    } catch (e1) {
      setError(e1.message || 'Failed to save note')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Notes & Content Distribution</h1>
      <p className="mt-1 text-gray-400">Upload links and map materials to course/batch.</p>
      {error && <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-200">{error}</div>}

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Title" required />
          <select value={form.resourceType} onChange={(e) => setForm((p) => ({ ...p, resourceType: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white">
            <option value="pdf">PDF</option>
            <option value="video">Video</option>
            <option value="link">Link</option>
          </select>
          <input value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Resource URL" required />
          <select value={form.courseId} onChange={(e) => setForm((p) => ({ ...p, courseId: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white">
            <option value="">Assign Course (optional)</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={form.batchId} onChange={(e) => setForm((p) => ({ ...p, batchId: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white">
            <option value="">Assign Batch (optional)</option>
            {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <div>
            <button disabled={saving} className="btn-touch rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Upload/Save'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Materials</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-gray-300">
              <tr>
                <th className="px-3 py-3">Title</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Course</th>
                <th className="px-3 py-3">Batch</th>
                <th className="px-3 py-3">Link</th>
              </tr>
            </thead>
            <tbody className="text-gray-200 divide-y divide-gray-700">
              {notes.map((n) => (
                <tr key={n.id}>
                  <td className="px-3 py-3">{n.title}</td>
                  <td className="px-3 py-3">{n.resourceType}</td>
                  <td className="px-3 py-3">{n.courseId || '—'}</td>
                  <td className="px-3 py-3">{n.batchId || '—'}</td>
                  <td className="px-3 py-3"><a className="text-sky-300 hover:underline" href={n.url} target="_blank" rel="noreferrer">Open</a></td>
                </tr>
              ))}
              {notes.length === 0 && <tr><td colSpan={5} className="px-3 py-4 text-gray-500">No notes yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

