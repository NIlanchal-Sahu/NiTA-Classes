import { useEffect, useState } from 'react'

export default function AdminEnrollments() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({ name: '', mobile: '', course: '', school: '', referralCode: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/admin/enrollments', {
          headers: { Authorization: `Bearer ${localStorage.getItem('nita_token') || ''}` },
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.error || 'Failed to load')
        setItems(json.enrollments || [])
      } catch (e) {
        setError(e.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('nita_token') || ''}`,
        },
        body: JSON.stringify(form),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Submit failed')
      // Optimistic refresh
      setForm({ name: '', mobile: '', course: '', school: '', referralCode: '' })
      const refreshed = await fetch('/api/admin/enrollments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('nita_token') || ''}` },
      }).then((r) => r.json())
      setItems(refreshed.enrollments || [])
    } catch (e) {
      setError(e.message || 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Enrollments</h1>
      <p className="mt-1 text-gray-400">MVP: stored in local JSON until you connect Google Sheets/DB.</p>

      {error && <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-200">{error}</div>}

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Add / Save enrollment (manual)</h2>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-300">Name</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Mobile</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              value={form.mobile}
              onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Course ID</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              value={form.course}
              onChange={(e) => setForm((p) => ({ ...p, course: e.target.value }))}
              placeholder="dca, cca, spoken-english-mastery, ai-associate, ai-video-creation"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">School/College</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              value={form.school}
              onChange={(e) => setForm((p) => ({ ...p, school: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300">Referral Code (optional)</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              value={form.referralCode}
              onChange={(e) => setForm((p) => ({ ...p, referralCode: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={submitting} className="btn-touch rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
              {submitting ? 'Saving...' : 'Save Enrollment'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Saved enrollments</h2>
        {loading ? (
          <div className="mt-4 text-gray-400">Loading...</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-gray-300">
                <tr>
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Mobile</th>
                  <th className="px-3 py-3">Course</th>
                  <th className="px-3 py-3">School</th>
                  <th className="px-3 py-3">Referral</th>
                  <th className="px-3 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="text-gray-200 divide-y divide-gray-700">
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-gray-900/30">
                    <td className="px-3 py-3">{it.name}</td>
                    <td className="px-3 py-3">{it.mobile}</td>
                    <td className="px-3 py-3">{it.course}</td>
                    <td className="px-3 py-3">{it.school}</td>
                    <td className="px-3 py-3">{it.referralCode || '—'}</td>
                    <td className="px-3 py-3">{String(it.createdAt).slice(0, 10)}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-gray-500">
                      No enrollments found.
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

