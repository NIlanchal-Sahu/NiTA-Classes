import { useEffect, useState } from 'react'

export default function AdminNotifications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    message: '',
    courseId: '',
    batchId: '',
    sendTo: 'all-students',
  })
  const [submitting, setSubmitting] = useState(false)

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('nita_token') || ''}` },
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Failed to load')
      setItems(json.notifications || [])
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
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('nita_token') || ''}`,
        },
        body: JSON.stringify(form),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Create notification failed')
      setForm({ title: '', message: '', courseId: '', batchId: '', sendTo: 'all-students' })
      await refresh()
    } catch (e) {
      setError(e.message || 'Create notification failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Notifications & Offers</h1>
      <p className="mt-1 text-gray-400">MVP: queue messages (reminder/offer). Actual WhatsApp sending needs an external sender service.</p>

      {error && <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-200">{error}</div>}

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Queue a notification</h2>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300">Title</label>
            <input className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300">Message</label>
            <textarea className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} required rows={4} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Send to</label>
            <select className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.sendTo} onChange={(e) => setForm((p) => ({ ...p, sendTo: e.target.value }))}>
              <option value="all-students">All students</option>
              <option value="course">By course</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Course ID (optional)</label>
            <input className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.courseId} onChange={(e) => setForm((p) => ({ ...p, courseId: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300">Batch ID (optional)</label>
            <input className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.batchId} onChange={(e) => setForm((p) => ({ ...p, batchId: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={submitting} className="btn-touch rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
              {submitting ? 'Queuing...' : 'Queue Notification'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Queued notifications</h2>
        {loading ? (
          <div className="mt-4 text-gray-400">Loading...</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-gray-300">
                <tr>
                  <th className="px-3 py-3">Title</th>
                  <th className="px-3 py-3">SendTo</th>
                  <th className="px-3 py-3">Course</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="text-gray-200 divide-y divide-gray-700">
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-gray-900/30">
                    <td className="px-3 py-3">{it.title}</td>
                    <td className="px-3 py-3">{it.sendTo}</td>
                    <td className="px-3 py-3">{it.courseId}</td>
                    <td className="px-3 py-3">{it.status}</td>
                    <td className="px-3 py-3">{String(it.createdAt).slice(0, 10)}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-gray-500">
                      No queued notifications.
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

