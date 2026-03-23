import { useEffect, useMemo, useRef, useState } from 'react'

const COURSE_OPTIONS = [
  { id: 'dca', label: 'DCA (Basic Computer Course) - Quick & Short Term' },
  { id: 'cca', label: 'CCA (Computer Application - PGDCA / O Level Equivalent)' },
  { id: 'spoken-english-mastery', label: 'Spoken English Mastery (Advance Level)' },
  { id: 'ai-associate', label: 'Artificial Intelligent Associate (AI Development Course with Python)' },
  { id: 'ai-video-creation', label: 'AI Video Creation Course' },
]

const emptyForm = {
  name: '',
  mobile: '',
  courses: [],
  school: '',
  highestQualification: '',
  villageCity: '',
  gender: '',
  fatherName: '',
  referralCode: '',
}

function CourseMultiSelect({ value, onChange, options, placeholder = 'Select courses' }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const boxRef = useRef(null)

  useEffect(() => {
    const onDocClick = (e) => {
      if (!boxRef.current) return
      if (!boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q) || o.id.toLowerCase().includes(q))
  }, [options, search])

  const toggle = (id) => {
    const next = value.includes(id) ? value.filter((x) => x !== id) : [...value, id]
    onChange(next)
  }

  const remove = (id) => onChange(value.filter((x) => x !== id))

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-left text-white"
      >
        <span className="text-sm text-gray-300">{value.length ? `${value.length} selected` : placeholder}</span>
        <span className="text-xs text-gray-500">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 shadow-xl">
          <div className="border-b border-gray-700 p-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="max-h-52 overflow-auto p-2">
            {filtered.map((c) => (
              <label key={c.id} className="mb-1 flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs text-gray-300 hover:bg-gray-800">
                <input type="checkbox" checked={value.includes(c.id)} onChange={() => toggle(c.id)} />
                <span>{c.label}</span>
              </label>
            ))}
            {filtered.length === 0 && <p className="px-2 py-2 text-xs text-gray-500">No course found.</p>}
          </div>
        </div>
      )}
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.map((cid) => {
            const c = options.find((x) => x.id === cid)
            return (
              <span key={cid} className="inline-flex items-center gap-1 rounded-full bg-violet-600/20 px-2 py-1 text-[11px] text-violet-200">
                {c?.label || cid}
                <button type="button" onClick={() => remove(cid)} className="font-semibold hover:text-white">
                  ×
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AdminEnrollments() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [editing, setEditing] = useState(null)

  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('nita_token') || ''}` })

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/enrollments', { headers: authHeaders() })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Failed to load')
      setItems(json.enrollments || [])
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
      const res = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(form),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Submit failed')
      setForm(emptyForm)
      await refresh()
    } catch (e) {
      setError(e.message || 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditing({
      name: item.name || '',
      mobile: item.mobile || '',
      courses: Array.isArray(item.courseIds) ? item.courseIds : item.course ? [item.course] : [],
      school: item.school || '',
      highestQualification: item.highestQualification || '',
      villageCity: item.villageCity || '',
      gender: item.gender || '',
      fatherName: item.fatherName || '',
      referralCode: item.referralCode || '',
    })
  }

  const saveEdit = async (id) => {
    if (!editing) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/enrollments/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(editing),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Update failed')
      setEditingId('')
      setEditing(null)
      await refresh()
    } catch (e) {
      setError(e.message || 'Update failed')
    } finally {
      setSubmitting(false)
    }
  }

  const removeItem = async (id) => {
    if (!window.confirm('Delete this admission from queue?')) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/enrollments/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Delete failed')
      await refresh()
    } catch (e) {
      setError(e.message || 'Delete failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Admission / Enrollment Queue</h1>
      <p className="mt-1 text-gray-400">Unified admission pipeline: form submissions and manual entries are kept in one queue.</p>

      {error && <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-200">{error}</div>}

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Add / Save Admission (manual)</h2>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-300">Name *</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Mobile Number *</label>
            <input
              inputMode="numeric"
              maxLength={10}
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              value={form.mobile}
              onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300">Class / Course * (Multi-select)</label>
            <div className="mt-1">
              <CourseMultiSelect
                value={form.courses}
                options={COURSE_OPTIONS}
                onChange={(next) => {
                  setForm((p) => ({ ...p, courses: next }))
                  if (error) setError('')
                }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">School / College (optional)</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              value={form.school}
              onChange={(e) => setForm((p) => ({ ...p, school: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Highest Qualification *</label>
            <input className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.highestQualification} onChange={(e) => setForm((p) => ({ ...p, highestQualification: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Village / City *</label>
            <input className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.villageCity} onChange={(e) => setForm((p) => ({ ...p, villageCity: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Gender *</label>
            <input className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Father Name (optional)</label>
            <input className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.fatherName} onChange={(e) => setForm((p) => ({ ...p, fatherName: e.target.value }))} />
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
                  <th className="px-3 py-3">Admission ID</th>
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Mobile</th>
                  <th className="px-3 py-3">Course</th>
                  <th className="px-3 py-3">School</th>
                  <th className="px-3 py-3">Referral</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-200 divide-y divide-gray-700">
                {items.map((it) => (
                  editingId === it.id && editing ? (
                    <tr key={it.id} className="bg-gray-900/40">
                      <td className="px-3 py-3" colSpan={8}>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editing.name} onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))} />
                          <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editing.mobile} onChange={(e) => setEditing((p) => ({ ...p, mobile: e.target.value }))} />
                          <div className="sm:col-span-2 rounded-lg border border-gray-700 bg-gray-900 p-2">
                            <p className="mb-1 text-xs text-gray-400">Courses</p>
                            <CourseMultiSelect
                              value={editing.courses}
                              options={COURSE_OPTIONS}
                              onChange={(next) => setEditing((p) => ({ ...p, courses: next }))}
                            />
                          </div>
                          <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editing.school} onChange={(e) => setEditing((p) => ({ ...p, school: e.target.value }))} placeholder="School" />
                          <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editing.highestQualification} onChange={(e) => setEditing((p) => ({ ...p, highestQualification: e.target.value }))} placeholder="Qualification" />
                          <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editing.villageCity} onChange={(e) => setEditing((p) => ({ ...p, villageCity: e.target.value }))} placeholder="Village/City" />
                          <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editing.gender} onChange={(e) => setEditing((p) => ({ ...p, gender: e.target.value }))} placeholder="Gender" />
                          <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editing.fatherName} onChange={(e) => setEditing((p) => ({ ...p, fatherName: e.target.value }))} placeholder="Father Name" />
                          <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={editing.referralCode} onChange={(e) => setEditing((p) => ({ ...p, referralCode: e.target.value }))} placeholder="Referral Code" />
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button type="button" className="rounded bg-violet-600 px-2 py-1 text-xs text-white" onClick={() => saveEdit(it.id)} disabled={submitting}>Save</button>
                          <button type="button" className="rounded border border-gray-600 px-2 py-1 text-xs text-gray-300" onClick={() => { setEditingId(''); setEditing(null) }}>Cancel</button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={it.id} className="hover:bg-gray-900/30">
                      <td className="px-3 py-3">{it.admissionId || '—'}</td>
                      <td className="px-3 py-3">{it.name}</td>
                      <td className="px-3 py-3">{it.mobile}</td>
                      <td className="px-3 py-3">{(it.courseIds || [it.course]).filter(Boolean).join(', ')}</td>
                      <td className="px-3 py-3">{it.school || '—'}</td>
                      <td className="px-3 py-3">{it.referralCode || '—'}</td>
                      <td className="px-3 py-3">{String(it.createdAt).slice(0, 10)}</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <button type="button" className="rounded bg-blue-600 px-2 py-1 text-xs text-white" onClick={() => startEdit(it)}>Edit</button>
                          <button type="button" className="rounded bg-red-600 px-2 py-1 text-xs text-white" onClick={() => removeItem(it.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-4 text-gray-500">
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

