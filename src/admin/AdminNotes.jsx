import { useEffect, useMemo, useState } from 'react'
import { academyApi } from '../api/adminAcademy'

export default function AdminNotes() {
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [courseForm, setCourseForm] = useState({ name: '', description: '', duration: '', status: 'active' })
  const [moduleForm, setModuleForm] = useState({ title: '', order: 1 })
  const [chapterForm, setChapterForm] = useState({
    moduleId: '',
    title: '',
    heading: '',
    description: '',
    videoUrl: '',
    resourceType: 'video',
    order: 1,
  })

  const refresh = async () => {
    setError('')
    try {
      const out = await academyApi.getContentCourses()
      const list = out.courses || []
      setCourses(list)
      setSelectedCourseId((prev) => prev || list[0]?.id || '')
    } catch (e) {
      setError(e.message || 'Failed to load course content')
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const selectedCourse = useMemo(
    () => courses.find((c) => String(c.id) === String(selectedCourseId)) || null,
    [courses, selectedCourseId]
  )

  const createCourse = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await academyApi.createCourse(courseForm)
      setCourseForm({ name: '', description: '', duration: '', status: 'active' })
      await refresh()
    } catch (err) {
      setError(err.message || 'Failed to create course')
    } finally {
      setSaving(false)
    }
  }

  const createModule = async (e) => {
    e.preventDefault()
    if (!selectedCourseId) return
    setSaving(true)
    setError('')
    try {
      await academyApi.createModule(selectedCourseId, moduleForm)
      setModuleForm({ title: '', order: (selectedCourse?.modules?.length || 0) + 1 })
      await refresh()
    } catch (err) {
      setError(err.message || 'Failed to add module')
    } finally {
      setSaving(false)
    }
  }

  const createChapter = async (e) => {
    e.preventDefault()
    if (!selectedCourseId || !chapterForm.moduleId) return
    setSaving(true)
    setError('')
    try {
      await academyApi.createChapter(selectedCourseId, chapterForm.moduleId, chapterForm)
      setChapterForm((p) => ({ ...p, title: '', heading: '', description: '', videoUrl: '' }))
      await refresh()
    } catch (err) {
      setError(err.message || 'Failed to add chapter')
    } finally {
      setSaving(false)
    }
  }

  const moveModule = async (moduleId, dir) => {
    if (!selectedCourse) return
    const list = [...(selectedCourse.modules || [])].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
    const idx = list.findIndex((m) => String(m.id) === String(moduleId))
    const swap = idx + dir
    if (idx < 0 || swap < 0 || swap >= list.length) return
    const tmp = list[idx]
    list[idx] = list[swap]
    list[swap] = tmp
    const orders = list.map((m, i) => ({ id: m.id, order: i + 1 }))
    await academyApi.reorderModules(selectedCourse.id, orders)
    await refresh()
  }

  const moveChapter = async (moduleId, chapterId, dir) => {
    if (!selectedCourse) return
    const mod = (selectedCourse.modules || []).find((m) => String(m.id) === String(moduleId))
    if (!mod) return
    const list = [...(mod.chapters || [])].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
    const idx = list.findIndex((c) => String(c.id) === String(chapterId))
    const swap = idx + dir
    if (idx < 0 || swap < 0 || swap >= list.length) return
    const tmp = list[idx]
    list[idx] = list[swap]
    list[swap] = tmp
    const orders = list.map((c, i) => ({ id: c.id, order: i + 1 }))
    await academyApi.reorderChapters(selectedCourse.id, moduleId, orders)
    await refresh()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Course Content Management</h1>
      <p className="mt-1 text-gray-400">Manage course - modules - chapters for student learning flow.</p>
      {error && <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-200">{error}</div>}

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Create Course</h2>
        <form onSubmit={createCourse} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <input value={courseForm.name} onChange={(e) => setCourseForm((p) => ({ ...p, name: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Course title" required />
          <input value={courseForm.description} onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Description" />
          <input value={courseForm.duration} onChange={(e) => setCourseForm((p) => ({ ...p, duration: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Duration (e.g. 12 weeks)" />
          <select value={courseForm.status} onChange={(e) => setCourseForm((p) => ({ ...p, status: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white">
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
          <button disabled={saving} className="btn-touch rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Create Course'}
          </button>
        </form>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold text-white">Course Tree</h2>
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value)
              setChapterForm((p) => ({ ...p, moduleId: '' }))
            }}
            className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white"
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.status || 'active'})
              </option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <form onSubmit={createModule} className="rounded-xl border border-gray-700 bg-gray-900 p-4">
                <h3 className="font-semibold text-white">Add Module</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input value={moduleForm.title} onChange={(e) => setModuleForm((p) => ({ ...p, title: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white" placeholder="Module title" required />
                  <input type="number" min="1" value={moduleForm.order} onChange={(e) => setModuleForm((p) => ({ ...p, order: Number(e.target.value) || 1 }))} className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white" placeholder="Order" />
                  <button disabled={saving} className="btn-touch rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
                    Add Module
                  </button>
                </div>
              </form>

              <form onSubmit={createChapter} className="rounded-xl border border-gray-700 bg-gray-900 p-4">
                <h3 className="font-semibold text-white">Add Chapter</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <select value={chapterForm.moduleId} onChange={(e) => setChapterForm((p) => ({ ...p, moduleId: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white" required>
                    <option value="">Select Module</option>
                    {(selectedCourse.modules || []).map((m) => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                  <input value={chapterForm.title} onChange={(e) => setChapterForm((p) => ({ ...p, title: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white" placeholder="Chapter title" required />
                  <input value={chapterForm.heading} onChange={(e) => setChapterForm((p) => ({ ...p, heading: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white" placeholder="Heading (optional)" />
                  <input value={chapterForm.videoUrl} onChange={(e) => setChapterForm((p) => ({ ...p, videoUrl: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white" placeholder="YouTube / cloud URL" required />
                  <input value={chapterForm.description} onChange={(e) => setChapterForm((p) => ({ ...p, description: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white" placeholder="Description" />
                  <select value={chapterForm.resourceType} onChange={(e) => setChapterForm((p) => ({ ...p, resourceType: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white">
                    <option value="video">Video</option>
                    <option value="youtube">YouTube</option>
                    <option value="gdrive">Google Drive</option>
                    <option value="onedrive">OneDrive</option>
                    <option value="link">Link</option>
                  </select>
                  <input type="number" min="1" value={chapterForm.order} onChange={(e) => setChapterForm((p) => ({ ...p, order: Number(e.target.value) || 1 }))} className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white" placeholder="Order" />
                  <button disabled={saving} className="btn-touch rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
                    Add Chapter
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-6 space-y-4">
              {(selectedCourse.modules || [])
                .slice()
                .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
                .map((m) => (
                  <div key={m.id} className="rounded-xl border border-gray-700 bg-gray-900 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-semibold text-white">
                        Module {m.order}: {m.title}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <button type="button" onClick={() => moveModule(m.id, -1)} className="rounded border border-gray-600 px-2 py-1 text-xs text-gray-200 hover:bg-gray-800">Up</button>
                        <button type="button" onClick={() => moveModule(m.id, 1)} className="rounded border border-gray-600 px-2 py-1 text-xs text-gray-200 hover:bg-gray-800">Down</button>
                        <button
                          type="button"
                          onClick={async () => {
                            const t = window.prompt('Rename module', m.title)
                            if (t == null || !String(t).trim()) return
                            await academyApi.updateModule(selectedCourse.id, m.id, { title: String(t).trim() })
                            await refresh()
                          }}
                          className="rounded border border-sky-500/50 px-2 py-1 text-xs text-sky-200 hover:bg-sky-500/10"
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await academyApi.deleteModule(selectedCourse.id, m.id)
                            await refresh()
                          }}
                          className="rounded border border-red-500/50 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      {(m.chapters || [])
                        .slice()
                        .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
                        .map((ch) => (
                          <div key={ch.id} className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2">
                            <div>
                              <div className="text-sm font-semibold text-white">Chapter {ch.order}: {ch.title}</div>
                              {ch.heading ? <div className="text-xs text-violet-200">Heading: {ch.heading}</div> : null}
                              <div className="text-xs text-gray-400">{ch.description || 'No description'}</div>
                              {ch.videoUrl ? <div className="mt-1 break-all text-[11px] text-gray-500">{ch.videoUrl}</div> : null}
                            </div>
                            <div className="flex max-w-[min(100%,360px)] flex-row flex-wrap justify-end gap-1">
                              <button type="button" onClick={() => moveChapter(m.id, ch.id, -1)} className="rounded border border-gray-600 px-2 py-1 text-xs text-gray-200 hover:bg-gray-700">Up</button>
                              <button type="button" onClick={() => moveChapter(m.id, ch.id, 1)} className="rounded border border-gray-600 px-2 py-1 text-xs text-gray-200 hover:bg-gray-700">Down</button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const title = window.prompt('Chapter title (sidebar)', ch.title)
                                  if (title == null || !String(title).trim()) return
                                  await academyApi.updateChapter(selectedCourse.id, m.id, ch.id, { title: String(title).trim() })
                                  await refresh()
                                }}
                                className="rounded border border-sky-500/50 px-2 py-1 text-xs text-sky-200 hover:bg-sky-500/10"
                              >
                                Rename title
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const h = window.prompt('Heading (above video)', ch.heading || ch.title || '')
                                  if (h == null) return
                                  await academyApi.updateChapter(selectedCourse.id, m.id, ch.id, { heading: String(h).trim() })
                                  await refresh()
                                }}
                                className="rounded border border-violet-500/50 px-2 py-1 text-xs text-violet-200 hover:bg-violet-500/10"
                              >
                                Set heading
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!window.confirm('Clear heading text?')) return
                                  await academyApi.updateChapter(selectedCourse.id, m.id, ch.id, { heading: '' })
                                  await refresh()
                                }}
                                className="rounded border border-amber-500/50 px-2 py-1 text-xs text-amber-200 hover:bg-amber-500/10"
                              >
                                Clear heading
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const u = window.prompt('Video URL', ch.videoUrl || '')
                                  if (u == null || !String(u).trim()) return
                                  await academyApi.updateChapter(selectedCourse.id, m.id, ch.id, { videoUrl: String(u).trim() })
                                  await refresh()
                                }}
                                className="rounded border border-emerald-500/50 px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-500/10"
                              >
                                Edit video
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!window.confirm('Delete this chapter?')) return
                                  await academyApi.deleteChapter(selectedCourse.id, m.id, ch.id)
                                  await refresh()
                                }}
                                className="rounded border border-red-500/50 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      {(m.chapters || []).length === 0 && <div className="text-sm text-gray-500">No chapters yet.</div>}
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

