import { useEffect, useMemo, useState } from 'react'
import { Fragment } from 'react'
import { academyApi } from '../api/adminAcademy'

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [contentCourses, setContentCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    duration: '',
    status: 'active',
    priceType: 'perClass10',
    price: 10,
  })
  const [saving, setSaving] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState('')
  const [expandedCourseId, setExpandedCourseId] = useState('')
  const [moduleForms, setModuleForms] = useState({})
  const [chapterForms, setChapterForms] = useState({})
  const [successMsg, setSuccessMsg] = useState('')
  const [chapterBusy, setChapterBusy] = useState({})

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const [out, content] = await Promise.all([academyApi.getCourses(), academyApi.getContentCourses()])
      setCourses(out.courses || [])
      setContentCourses(content.courses || [])
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
      if (editingCourseId) {
        await academyApi.updateCourse(editingCourseId, form)
        setEditingCourseId('')
      } else {
        await academyApi.createCourse(form)
      }
      setForm({
        name: '',
        description: '',
        duration: '',
        status: 'active',
        priceType: 'perClass10',
        price: 10,
      })
      await refresh()
    } catch (e1) {
      setError(e1.message || 'Failed to save course')
    } finally {
      setSaving(false)
    }
  }

  const contentMap = useMemo(() => {
    const map = new Map()
    for (const c of contentCourses) map.set(String(c.id), c)
    return map
  }, [contentCourses])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Course Management</h1>
      <p className="mt-1 text-gray-400">List and edit courses, then add modules and chapter video content.</p>
      {successMsg && (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">{successMsg}</div>
      )}
      {error && <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-200">{error}</div>}

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">{editingCourseId ? 'Edit Course' : 'Create Course'}</h2>
        <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Course name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <input className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Duration (e.g. 3 Months)" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} />
          <textarea className="sm:col-span-2 rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          <select className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
          <select className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.priceType} onChange={(e) => setForm((p) => ({ ...p, priceType: e.target.value }))}>
            <option value="perClass10">₹10 per class</option>
            <option value="custom">Custom</option>
          </select>
          <input type="number" min="0" className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) || 0 }))} />
          <div className="sm:col-span-2">
            <button disabled={saving} className="btn-touch rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
              {saving ? 'Saving...' : editingCourseId ? 'Update Course' : 'Create Course'}
            </button>
            {editingCourseId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingCourseId('')
                  setForm({
                    name: '',
                    description: '',
                    duration: '',
                    status: 'active',
                    priceType: 'perClass10',
                    price: 10,
                  })
                }}
                className="ml-3 rounded-lg border border-gray-600 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-700"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="mt-6 flex max-h-[min(85vh,calc(100vh-7rem))] flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-800">
        <div className="shrink-0 border-b border-gray-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Courses</h2>
          <p className="mt-1 text-xs text-gray-500">Scroll inside this panel — sidebar stays fixed.</p>
        </div>
        {loading ? (
          <div className="p-6 text-gray-400">Loading...</div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto px-4 pb-4 pt-2 lg:px-6">
            <table className="min-w-full text-left text-sm">
              <thead className="text-gray-300">
                <tr>
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Duration</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Price Type</th>
                  <th className="px-3 py-3">Price</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-200 divide-y divide-gray-700">
                {courses.map((c) => (
                  <Fragment key={c.id}>
                    <tr>
                      <td className="px-3 py-3">{c.name}</td>
                      <td className="px-3 py-3">{c.duration || '—'}</td>
                      <td className="px-3 py-3">{c.status || 'active'}</td>
                      <td className="px-3 py-3">{c.priceType}</td>
                      <td className="px-3 py-3">₹{c.price}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCourseId(c.id)
                              setForm({
                                name: c.name || '',
                                description: c.description || '',
                                duration: c.duration || '',
                                status: c.status || 'active',
                                priceType: c.priceType || 'perClass10',
                                price: Number(c.price) || 0,
                              })
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            className="rounded border border-sky-500/50 px-2 py-1 text-xs text-sky-200 hover:bg-sky-500/10"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedCourseId((prev) => (prev === c.id ? '' : c.id))}
                            className="rounded border border-violet-500/50 px-2 py-1 text-xs text-violet-200 hover:bg-violet-500/10"
                          >
                            {expandedCourseId === c.id ? 'Hide Content' : 'Manage Modules'}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedCourseId === c.id ? (
                      <tr key={`${c.id}-content`}>
                        <td className="px-3 py-4 bg-gray-900/60" colSpan={6}>
                          <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
                            <h3 className="text-sm font-semibold text-white">Add Module</h3>
                            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                              <input
                                className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                                placeholder="Module name"
                                value={moduleForms[c.id]?.title || ''}
                                onChange={(e) =>
                                  setModuleForms((prev) => ({
                                    ...prev,
                                    [c.id]: { ...(prev[c.id] || { order: 1 }), title: e.target.value },
                                  }))
                                }
                              />
                              <input
                                type="number"
                                min="1"
                                className="w-28 rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                                value={moduleForms[c.id]?.order || 1}
                                onChange={(e) =>
                                  setModuleForms((prev) => ({
                                    ...prev,
                                    [c.id]: { ...(prev[c.id] || { title: '' }), order: Number(e.target.value) || 1 },
                                  }))
                                }
                              />
                              <button
                                type="button"
                                className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700"
                                onClick={async () => {
                                  const payload = moduleForms[c.id] || {}
                                  if (!payload.title?.trim()) {
                                    setError('Enter a module name.')
                                    return
                                  }
                                  setError('')
                                  try {
                                    await academyApi.createModule(c.id, payload)
                                    setModuleForms((prev) => ({ ...prev, [c.id]: { title: '', order: 1 } }))
                                    setSuccessMsg('Module added.')
                                    await refresh()
                                  } catch (err) {
                                    setError(err.message || 'Could not add module')
                                  }
                                }}
                              >
                                Add Module
                              </button>
                            </div>

                            <div className="mt-4 space-y-3">
                              {((contentMap.get(String(c.id))?.modules || []).slice().sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))).map((m) => (
                                <div key={m.id} className="rounded-lg border border-gray-700 bg-gray-800 p-3">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="text-sm font-semibold text-violet-300">
                                      Module {m.order}: {m.title}
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      <button
                                        type="button"
                                        className="rounded border border-sky-500/40 px-2 py-0.5 text-[10px] text-sky-200 hover:bg-sky-500/10"
                                        onClick={async () => {
                                          const t = window.prompt('Rename module', m.title)
                                          if (t == null || !String(t).trim()) return
                                          await academyApi.updateModule(c.id, m.id, { title: String(t).trim() })
                                          await refresh()
                                        }}
                                      >
                                        Rename module
                                      </button>
                                      <button
                                        type="button"
                                        className="rounded border border-red-500/40 px-2 py-0.5 text-[10px] text-red-300 hover:bg-red-500/10"
                                        onClick={async () => {
                                          if (!window.confirm('Delete this module and all its chapters?')) return
                                          await academyApi.deleteModule(c.id, m.id)
                                          await refresh()
                                        }}
                                      >
                                        Delete module
                                      </button>
                                    </div>
                                  </div>

                                  <div className="mt-2 space-y-2">
                                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                      <input
                                        className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-xs text-white"
                                        placeholder="Chapter title (sidebar) *"
                                        value={chapterForms[m.id]?.title || ''}
                                        onChange={(e) =>
                                          setChapterForms((prev) => ({
                                            ...prev,
                                            [m.id]: {
                                              ...(prev[m.id] || {
                                                heading: '',
                                                videoUrl: '',
                                                description: '',
                                                noteText: '',
                                                order: 1,
                                              }),
                                              title: e.target.value,
                                            },
                                          }))
                                        }
                                      />
                                      <input
                                        className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-xs text-white"
                                        placeholder="Heading (above video)"
                                        value={chapterForms[m.id]?.heading || ''}
                                        onChange={(e) =>
                                          setChapterForms((prev) => ({
                                            ...prev,
                                            [m.id]: {
                                              ...(prev[m.id] || {
                                                title: '',
                                                videoUrl: '',
                                                description: '',
                                                noteText: '',
                                                order: 1,
                                              }),
                                              heading: e.target.value,
                                            },
                                          }))
                                        }
                                      />
                                      <input
                                        className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-xs text-white"
                                        placeholder="Video URL * (YouTube / Drive)"
                                        value={chapterForms[m.id]?.videoUrl || ''}
                                        onChange={(e) =>
                                          setChapterForms((prev) => ({
                                            ...prev,
                                            [m.id]: {
                                              ...(prev[m.id] || {
                                                title: '',
                                                heading: '',
                                                description: '',
                                                noteText: '',
                                                order: 1,
                                              }),
                                              videoUrl: e.target.value,
                                            },
                                          }))
                                        }
                                      />
                                    </div>
                                    <textarea
                                      className="w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-xs text-white"
                                      rows={2}
                                      placeholder="Description (optional)"
                                      value={chapterForms[m.id]?.description || ''}
                                      onChange={(e) =>
                                        setChapterForms((prev) => ({
                                          ...prev,
                                          [m.id]: { ...(prev[m.id] || { order: 1 }), description: e.target.value },
                                        }))
                                      }
                                    />
                                    <textarea
                                      className="w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-xs text-white"
                                      rows={2}
                                      placeholder="Notes for students (optional)"
                                      value={chapterForms[m.id]?.noteText || ''}
                                      onChange={(e) =>
                                        setChapterForms((prev) => ({
                                          ...prev,
                                          [m.id]: { ...(prev[m.id] || { order: 1 }), noteText: e.target.value },
                                        }))
                                      }
                                    />
                                    <div className="flex flex-wrap items-center gap-2">
                                      <input
                                        type="number"
                                        min="1"
                                        className="w-20 rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-xs text-white"
                                        title="Order"
                                        value={chapterForms[m.id]?.order || 1}
                                        onChange={(e) =>
                                          setChapterForms((prev) => ({
                                            ...prev,
                                            [m.id]: {
                                              ...(prev[m.id] || {
                                                title: '',
                                                heading: '',
                                                videoUrl: '',
                                                description: '',
                                                noteText: '',
                                              }),
                                              order: Number(e.target.value) || 1,
                                            },
                                          }))
                                        }
                                      />
                                      <button
                                        type="button"
                                        disabled={chapterBusy[m.id]}
                                        className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                        onClick={async () => {
                                          const payload = chapterForms[m.id] || {}
                                          if (!String(payload.title || '').trim() || !String(payload.videoUrl || '').trim()) {
                                            setError('Chapter title and video URL are required.')
                                            return
                                          }
                                          setError('')
                                          setChapterBusy((b) => ({ ...b, [m.id]: true }))
                                          try {
                                            await academyApi.createChapter(c.id, m.id, {
                                              title: String(payload.title).trim(),
                                              heading: String(payload.heading || payload.title).trim(),
                                              videoUrl: String(payload.videoUrl).trim(),
                                              description: String(payload.description || ''),
                                              noteText: String(payload.noteText || ''),
                                              resourceType: 'video',
                                              order: payload.order || 1,
                                            })
                                            setChapterForms((prev) => ({
                                              ...prev,
                                              [m.id]: {
                                                title: '',
                                                heading: '',
                                                videoUrl: '',
                                                description: '',
                                                noteText: '',
                                                order: 1,
                                              },
                                            }))
                                            setSuccessMsg('Chapter added successfully.')
                                            await refresh()
                                          } catch (err) {
                                            setError(err.message || 'Could not add chapter. Check login and try again.')
                                          } finally {
                                            setChapterBusy((b) => ({ ...b, [m.id]: false }))
                                          }
                                        }}
                                      >
                                        {chapterBusy[m.id] ? 'Saving…' : 'Add Chapter'}
                                      </button>
                                    </div>
                                  </div>

                                  <div className="mt-2 space-y-2">
                                    {((m.chapters || []).slice().sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))).map((ch) => (
                                      <div key={ch.id} className="rounded border border-gray-700 bg-gray-900 px-3 py-2 text-xs text-gray-200">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                          <div>
                                            <div className="font-semibold text-white">Chapter {ch.order}: {ch.title}</div>
                                            {ch.heading && ch.heading !== ch.title ? (
                                              <div className="text-violet-200/90">Heading: {ch.heading}</div>
                                            ) : null}
                                            <div className="mt-0.5 break-all text-gray-400">{ch.videoUrl}</div>
                                            {ch.description ? (
                                              <div className="mt-1 text-gray-400">Desc: {ch.description}</div>
                                            ) : null}
                                            {ch.noteText ? (
                                              <div className="mt-1 text-gray-500">Notes: {ch.noteText}</div>
                                            ) : null}
                                          </div>
                                          <div className="flex min-w-[140px] flex-row flex-wrap justify-end gap-1">
                                            <button
                                              type="button"
                                              className="rounded border border-sky-500/40 px-2 py-0.5 text-[10px] text-sky-200 hover:bg-sky-500/10"
                                              onClick={async () => {
                                                const t = window.prompt('Rename chapter (title in sidebar)', ch.title)
                                                if (t == null || !String(t).trim()) return
                                                await academyApi.updateChapter(c.id, m.id, ch.id, { title: String(t).trim() })
                                                await refresh()
                                              }}
                                            >
                                              Rename title
                                            </button>
                                            <button
                                              type="button"
                                              className="rounded border border-violet-500/40 px-2 py-0.5 text-[10px] text-violet-200 hover:bg-violet-500/10"
                                              onClick={async () => {
                                                const t = window.prompt('Heading (above video)', ch.heading || ch.title || '')
                                                if (t == null) return
                                                await academyApi.updateChapter(c.id, m.id, ch.id, { heading: String(t).trim() })
                                                await refresh()
                                              }}
                                            >
                                              Set heading
                                            </button>
                                            <button
                                              type="button"
                                              className="rounded border border-amber-500/40 px-2 py-0.5 text-[10px] text-amber-200 hover:bg-amber-500/10"
                                              onClick={async () => {
                                                if (!window.confirm('Remove heading text? (video and chapter stay)')) return
                                                await academyApi.updateChapter(c.id, m.id, ch.id, { heading: '' })
                                                await refresh()
                                              }}
                                            >
                                              Clear heading
                                            </button>
                                            <button
                                              type="button"
                                              className="rounded border border-emerald-500/40 px-2 py-0.5 text-[10px] text-emerald-200 hover:bg-emerald-500/10"
                                              onClick={async () => {
                                                const t = window.prompt('Video URL (YouTube or Google Drive file link)', ch.videoUrl || '')
                                                if (t == null || !String(t).trim()) return
                                                try {
                                                  await academyApi.updateChapter(c.id, m.id, ch.id, { videoUrl: String(t).trim() })
                                                  setSuccessMsg('Video URL updated.')
                                                  await refresh()
                                                } catch (err) {
                                                  setError(err.message || 'Update failed')
                                                }
                                              }}
                                            >
                                              Edit video URL
                                            </button>
                                            <button
                                              type="button"
                                              className="rounded border border-gray-500/40 px-2 py-0.5 text-[10px] text-gray-200 hover:bg-gray-500/10"
                                              onClick={async () => {
                                                const t = window.prompt('Description (optional)', ch.description || '')
                                                if (t == null) return
                                                try {
                                                  await academyApi.updateChapter(c.id, m.id, ch.id, { description: String(t) })
                                                  setSuccessMsg('Description saved.')
                                                  await refresh()
                                                } catch (err) {
                                                  setError(err.message || 'Update failed')
                                                }
                                              }}
                                            >
                                              Edit description
                                            </button>
                                            <button
                                              type="button"
                                              className="rounded border border-gray-500/40 px-2 py-0.5 text-[10px] text-gray-200 hover:bg-gray-500/10"
                                              onClick={async () => {
                                                const t = window.prompt('Notes for students (optional)', ch.noteText || '')
                                                if (t == null) return
                                                try {
                                                  await academyApi.updateChapter(c.id, m.id, ch.id, { noteText: String(t) })
                                                  setSuccessMsg('Notes saved.')
                                                  await refresh()
                                                } catch (err) {
                                                  setError(err.message || 'Update failed')
                                                }
                                              }}
                                            >
                                              Edit notes
                                            </button>
                                            <button
                                              type="button"
                                              className="rounded border border-red-500/40 px-2 py-0.5 text-[10px] text-red-300 hover:bg-red-500/10"
                                              onClick={async () => {
                                                if (!window.confirm('Delete this chapter (heading + video + notes)?')) return
                                                await academyApi.deleteChapter(c.id, m.id, ch.id)
                                                await refresh()
                                              }}
                                            >
                                              Delete chapter
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    {(m.chapters || []).length === 0 ? <div className="text-xs text-gray-500">No chapters yet.</div> : null}
                                  </div>
                                </div>
                              ))}
                              {(contentMap.get(String(c.id))?.modules || []).length === 0 ? (
                                <div className="text-xs text-gray-500">No modules yet for this course.</div>
                              ) : null}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
                {courses.length === 0 && <tr><td colSpan={6} className="px-3 py-4 text-gray-500">No courses found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

