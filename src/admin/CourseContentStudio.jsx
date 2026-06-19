import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { academyApi } from '../api/adminAcademy'
import CourseChapterRichText from './CourseChapterRichText'
import QuizQuestionEditor from './QuizQuestionEditor'
import ChapterReferencesEditor from './ChapterReferencesEditor'
import {
  CHAPTER_KIND,
  CONTENT_FILTERS,
  chapterMatchesFilter,
  findLinkedPracticeChapter,
  getChapterKind,
  isAnswerKeyChapter,
  isNotesChapter,
  isQuizChapter,
  summarizeCourse,
  summarizeModule,
} from '../lib/courseContentUtils'

function ctNeedsVideo(ct) {
  return ct === 'video' || ct === 'mixed'
}

function ctNeedsDoc(ct) {
  return ct === 'document' || ct === 'mixed'
}

function ctNeedsText(ct) {
  return ct === 'text'
}

const CHAPTER_TEMPLATES = [
  { id: 'notes', label: 'Study Notes', icon: '📝', interactiveType: 'notes', contentType: 'text' },
  { id: 'quiz', label: 'Practice Quiz', icon: '❓', interactiveType: 'quiz', contentType: 'text' },
  { id: 'video', label: 'Video Lesson', icon: '🎬', interactiveType: '', contentType: 'video' },
  { id: 'document', label: 'Document', icon: '📄', interactiveType: '', contentType: 'document' },
  { id: 'text', label: 'Text Chapter', icon: '📋', interactiveType: '', contentType: 'text' },
]

function confirmAction(message) {
  return window.confirm(message)
}

function ChapterKindBadge({ chapter, size = 'sm' }) {
  const kind = getChapterKind(chapter)
  const meta = CHAPTER_KIND[kind] || CHAPTER_KIND.other
  const cls = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${meta.bg} ${meta.text} ${cls}`}>
      <span>{meta.icon}</span>
      {meta.short}
    </span>
  )
}

export default function CourseContentStudio({ initialCourseId = '' }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId || searchParams.get('course') || '')
  const [selectedModuleId, setSelectedModuleId] = useState('')
  const [selectedChapterKey, setSelectedChapterKey] = useState('')
  const [draftChapter, setDraftChapter] = useState(null)
  const [contentFilter, setContentFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState('structure')
  const [moduleDialog, setModuleDialog] = useState(null)
  const [chapterDialog, setChapterDialog] = useState(null)
  const [busyAction, setBusyAction] = useState('')
  const [showAddMenu, setShowAddMenu] = useState(false)

  const refresh = async () => {
    setRefreshing(true)
    setError('')
    try {
      const out = await academyApi.getContentCourses()
      const list = out.courses || []
      setCourses(list)
      setSelectedCourseId((prev) => {
        const fromUrl = searchParams.get('course')
        if (fromUrl && list.some((c) => String(c.id) === fromUrl)) return fromUrl
        if (prev && list.some((c) => String(c.id) === prev)) return prev
        return list[0]?.id || ''
      })
    } catch (e) {
      setError(e.message || 'Failed to load course content')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (initialCourseId) setSelectedCourseId(initialCourseId)
  }, [initialCourseId])

  useEffect(() => {
    if (selectedCourseId) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set('course', selectedCourseId)
        return next
      }, { replace: true })
    }
  }, [selectedCourseId, setSearchParams])

  const selectedCourse = useMemo(
    () => courses.find((c) => String(c.id) === String(selectedCourseId)) || null,
    [courses, selectedCourseId],
  )

  const sortedModules = useMemo(() => {
    return [...(selectedCourse?.modules || [])].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
  }, [selectedCourse])

  useEffect(() => {
    if (!sortedModules.length) {
      setSelectedModuleId('')
      return
    }
    if (!sortedModules.some((m) => String(m.id) === String(selectedModuleId))) {
      setSelectedModuleId(sortedModules[0].id)
    }
  }, [sortedModules, selectedModuleId])

  const selectedModule = useMemo(
    () => sortedModules.find((m) => String(m.id) === String(selectedModuleId)) || null,
    [sortedModules, selectedModuleId],
  )

  const filteredChapters = useMemo(() => {
    const q = search.trim().toLowerCase()
    return [...(selectedModule?.chapters || [])]
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
      .filter((ch) => chapterMatchesFilter(ch, contentFilter))
      .filter((ch) => !q || String(ch.title || '').toLowerCase().includes(q))
  }, [selectedModule, contentFilter, search])

  const courseStats = useMemo(() => (selectedCourse ? summarizeCourse(selectedCourse) : null), [selectedCourse])
  const moduleStats = useMemo(() => (selectedModule ? summarizeModule(selectedModule) : null), [selectedModule])

  const openChapter = (moduleId, chapter) => {
    const key = `${moduleId}:${chapter.id}`
    setSelectedChapterKey(key)
    setDraftChapter({ moduleId, chapter: { ...chapter } })
    setSuccess('')
    setError('')
  }

  const closeEditor = () => {
    setSelectedChapterKey('')
    setDraftChapter(null)
  }

  const saveChapter = async () => {
    if (!draftChapter || !selectedCourseId) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      let chapterPayload = { ...draftChapter.chapter }
      if (isQuizChapter(chapterPayload)) {
        chapterPayload = { ...chapterPayload, contentType: 'text', interactiveType: 'quiz' }
      } else if (isNotesChapter(chapterPayload)) {
        chapterPayload = { ...chapterPayload, contentType: 'text', interactiveType: 'notes' }
      }
      await academyApi.updateChapter(selectedCourseId, draftChapter.moduleId, chapterPayload.id, chapterPayload)
      setSuccess('Saved successfully.')
      await refresh()
      const mod = sortedModules.find((m) => String(m.id) === String(draftChapter.moduleId))
      const updated = mod?.chapters?.find((c) => String(c.id) === String(draftChapter.chapter.id))
      if (updated) {
        setDraftChapter({ moduleId: draftChapter.moduleId, chapter: { ...updated } })
      }
    } catch (err) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const jumpToPracticeFromAnswerKey = () => {
    if (!draftChapter || !selectedModule) return
    const practice = findLinkedPracticeChapter(selectedModule, draftChapter.chapter)
    if (practice) openChapter(draftChapter.moduleId, practice)
  }

  const allCourseChapters = useMemo(() => {
    const rows = []
    for (const mod of sortedModules) {
      for (const ch of [...(mod.chapters || [])].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))) {
        rows.push({ module: mod, chapter: ch })
      }
    }
    const q = search.trim().toLowerCase()
    return rows
      .filter(({ chapter }) => chapterMatchesFilter(chapter, contentFilter))
      .filter(({ chapter, module }) => {
        if (!q) return true
        return (
          String(chapter.title || '').toLowerCase().includes(q) ||
          String(module.title || '').toLowerCase().includes(q)
        )
      })
  }, [sortedModules, contentFilter, search])

  const submitModuleDialog = async () => {
    if (!moduleDialog || !selectedCourseId) return
    const title = String(moduleDialog.title || '').trim()
    if (!title) {
      setError('Module title is required')
      return
    }
    setBusyAction('module')
    setError('')
    setSuccess('')
    try {
      if (moduleDialog.mode === 'add') {
        await academyApi.createModule(selectedCourseId, {
          title,
          order: Number(moduleDialog.order) || sortedModules.length + 1,
        })
        setSuccess('Module created.')
      } else {
        await academyApi.updateModule(selectedCourseId, moduleDialog.moduleId, {
          title,
          order: Number(moduleDialog.order) || moduleDialog.order,
        })
        setSuccess('Module updated.')
      }
      setModuleDialog(null)
      await refresh()
    } catch (err) {
      setError(err.message || 'Module save failed')
    } finally {
      setBusyAction('')
    }
  }

  const deleteModule = async (moduleId, moduleTitle) => {
    if (!selectedCourseId) return
    if (
      !confirmAction(
        `Delete module "${moduleTitle}" and ALL its chapters/quizzes? This cannot be undone.`,
      )
    ) {
      return
    }
    setBusyAction(`del-mod-${moduleId}`)
    setError('')
    setSuccess('')
    try {
      await academyApi.deleteModule(selectedCourseId, moduleId)
      if (String(selectedModuleId) === String(moduleId)) {
        setSelectedModuleId('')
        closeEditor()
      }
      setSuccess('Module deleted.')
      await refresh()
    } catch (err) {
      setError(err.message || 'Failed to delete module')
    } finally {
      setBusyAction('')
    }
  }

  const submitChapterDialog = async () => {
    if (!chapterDialog || !selectedCourseId || !selectedModuleId) return
    const title = String(chapterDialog.title || '').trim()
    if (!title) {
      setError('Chapter title is required')
      return
    }
    const template = CHAPTER_TEMPLATES.find((t) => t.id === chapterDialog.kind) || CHAPTER_TEMPLATES[0]
    setBusyAction('chapter')
    setError('')
    setSuccess('')
    try {
      const body = {
        title,
        heading: title,
        description: chapterDialog.description || '',
        order: Number(chapterDialog.order) || (selectedModule?.chapters?.length || 0) + 1,
        contentType: template.contentType,
        interactiveType: template.interactiveType,
        contentHtml:
          template.interactiveType === 'notes'
            ? '<p>Add your study notes here.</p>'
            : template.interactiveType === 'quiz'
              ? '<p>Interactive practice quiz</p>'
              : template.contentType === 'text'
                ? '<p>Chapter content</p>'
                : '',
        quizData:
          template.interactiveType === 'quiz'
            ? { title, questions: [] }
            : undefined,
        extraReferences: template.interactiveType === 'notes' ? [] : undefined,
      }
      const out = await academyApi.createChapter(selectedCourseId, selectedModuleId, body)
      setChapterDialog(null)
      setSuccess(
        template.interactiveType === 'quiz'
          ? 'Practice quiz and answer key created.'
          : 'Chapter created.',
      )
      await refresh()
      if (out.chapter) openChapter(selectedModuleId, out.chapter)
    } catch (err) {
      setError(err.message || 'Failed to create chapter')
    } finally {
      setBusyAction('')
    }
  }

  const deleteChapter = async (moduleId, chapter, { closeAfter = false } = {}) => {
    if (!selectedCourseId || !chapter?.id) return
    if (isAnswerKeyChapter(chapter)) {
      setError('Answer keys are auto-managed. Delete the linked practice quiz instead.')
      return
    }
    const extra =
      isQuizChapter(chapter) ? ' Its answer key will also be removed.' : ''
    if (!confirmAction(`Delete "${chapter.title}"?${extra} This cannot be undone.`)) return
    setBusyAction(`del-ch-${chapter.id}`)
    setError('')
    setSuccess('')
    try {
      await academyApi.deleteChapter(selectedCourseId, moduleId, chapter.id)
      if (closeAfter) closeEditor()
      setSuccess('Chapter deleted.')
      await refresh()
    } catch (err) {
      setError(err.message || 'Failed to delete chapter')
    } finally {
      setBusyAction('')
    }
  }

  const moveModule = async (moduleId, direction) => {
    const idx = sortedModules.findIndex((m) => String(m.id) === String(moduleId))
    if (idx < 0) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sortedModules.length) return
    const orders = sortedModules.map((m, i) => {
      if (i === idx) return { id: m.id, order: swapIdx + 1 }
      if (i === swapIdx) return { id: m.id, order: idx + 1 }
      return { id: m.id, order: i + 1 }
    })
    setBusyAction(`move-mod-${moduleId}`)
    try {
      await academyApi.reorderModules(selectedCourseId, orders)
      await refresh()
    } catch (err) {
      setError(err.message || 'Failed to reorder modules')
    } finally {
      setBusyAction('')
    }
  }

  if (loading) {
    return <div className="rounded-2xl border border-gray-700 bg-gray-800 p-8 text-gray-400">Loading course content…</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Content & Quiz Studio</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-400">
            View all course modules, study notes, and practice quizzes. Add, edit, or delete content from one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={refreshing}
            onClick={() => refresh()}
            className="rounded-xl border border-gray-600 bg-gray-900 px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-50"
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value)
              setSelectedModuleId('')
              closeEditor()
            }}
            className="min-w-[220px] rounded-xl border border-gray-600 bg-gray-900 px-4 py-2.5 text-sm font-medium text-white"
          >
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedCourse && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setViewMode('structure')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              viewMode === 'structure' ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Module structure
          </button>
          <button
            type="button"
            onClick={() => setViewMode('browse')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              viewMode === 'browse' ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Browse all content
          </button>
        </div>
      )}

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">{success}</div>}

      {selectedCourse && courseStats && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: 'Modules', value: courseStats.modules },
            { label: 'Chapters', value: courseStats.chapters },
            { label: 'Study notes', value: courseStats.notes },
            { label: 'Practice quizzes', value: courseStats.quizzes },
            { label: 'Total MCQs', value: courseStats.mcqs },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-gray-700 bg-gray-800/80 px-4 py-3">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {!selectedCourse ? (
        <div className="rounded-2xl border border-dashed border-gray-600 bg-gray-800/50 p-12 text-center text-gray-400">
          Select a course to manage content and quizzes.
        </div>
      ) : viewMode === 'browse' ? (
        <div className="rounded-2xl border border-gray-700 bg-gray-800">
          <div className="border-b border-gray-700 px-4 py-3 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-white">All content — {selectedCourse.name}</h2>
                <p className="text-xs text-gray-500">{allCourseChapters.length} chapters · click to edit</p>
              </div>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search modules or chapters…"
              className="w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white"
            />
            <div className="flex flex-wrap gap-1">
              {CONTENT_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setContentFilter(f.id)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                    contentFilter === f.id
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-900 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="max-h-[calc(100vh-14rem)] overflow-y-auto p-3 space-y-2">
            {allCourseChapters.map(({ module, chapter }) => (
              <div
                key={`${module.id}:${chapter.id}`}
                className="flex items-start justify-between gap-2 rounded-xl border border-gray-700 bg-gray-900/60 px-3 py-3"
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedModuleId(module.id)
                    setViewMode('structure')
                    openChapter(module.id, chapter)
                  }}
                  className="min-w-0 flex-1 text-left hover:opacity-90"
                >
                  <div className="text-[11px] text-gray-500">
                    Module {module.order}: {module.title}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white">{chapter.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <ChapterKindBadge chapter={chapter} size="xs" />
                    {isQuizChapter(chapter) && (
                      <span className="text-xs text-violet-300">
                        {chapter.quizData?.questions?.length || 0} MCQs
                      </span>
                    )}
                  </div>
                </button>
                {!isAnswerKeyChapter(chapter) && (
                  <button
                    type="button"
                    disabled={busyAction === `del-ch-${chapter.id}`}
                    onClick={() => deleteChapter(module.id, chapter)}
                    className="shrink-0 rounded-lg border border-red-500/40 px-2 py-1 text-[11px] text-red-300 hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
            {allCourseChapters.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-500">
                No content yet. Switch to Module structure to add modules and chapters.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid min-h-[560px] gap-4 lg:grid-cols-12">
          {/* Module list */}
          <aside className="lg:col-span-3">
            <div className="sticky top-4 max-h-[calc(100vh-10rem)] overflow-y-auto rounded-2xl border border-gray-700 bg-gray-800">
              <div className="border-b border-gray-700 px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Modules</h2>
                    <p className="text-xs text-gray-500">{sortedModules.length} in this course</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setModuleDialog({
                        mode: 'add',
                        title: '',
                        order: sortedModules.length + 1,
                      })
                    }
                    className="rounded-lg bg-violet-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-violet-700"
                  >
                    + Add
                  </button>
                </div>
              </div>
              <div className="p-2 space-y-1">
                {sortedModules.map((m, modIdx) => {
                  const stats = summarizeModule(m)
                  const active = String(m.id) === String(selectedModuleId)
                  return (
                    <div
                      key={m.id}
                      className={`rounded-xl transition ${
                        active ? 'bg-violet-600/20 ring-1 ring-violet-500/50' : 'hover:bg-gray-700/60'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedModuleId(m.id)
                          closeEditor()
                        }}
                        className="w-full px-3 py-3 text-left"
                      >
                        <div className="text-sm font-semibold text-white line-clamp-2">
                          {m.order}. {m.title}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-gray-400">
                          {stats.total} chapters
                          {stats.notes > 0 && <span>· {stats.notes} notes</span>}
                          {stats.quizzes > 0 && <span>· {stats.quizzes} quiz</span>}
                        </div>
                      </button>
                      <div className="flex flex-wrap gap-1 border-t border-gray-700/60 px-2 py-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setModuleDialog({
                              mode: 'edit',
                              moduleId: m.id,
                              title: m.title,
                              order: m.order,
                            })
                          }
                          className="rounded px-2 py-0.5 text-[10px] text-gray-300 hover:bg-gray-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={modIdx === 0 || busyAction === `move-mod-${m.id}`}
                          onClick={() => moveModule(m.id, 'up')}
                          className="rounded px-2 py-0.5 text-[10px] text-gray-300 hover:bg-gray-700 disabled:opacity-40"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={modIdx === sortedModules.length - 1 || busyAction === `move-mod-${m.id}`}
                          onClick={() => moveModule(m.id, 'down')}
                          className="rounded px-2 py-0.5 text-[10px] text-gray-300 hover:bg-gray-700 disabled:opacity-40"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          disabled={busyAction === `del-mod-${m.id}`}
                          onClick={() => deleteModule(m.id, m.title)}
                          className="rounded px-2 py-0.5 text-[10px] text-red-300 hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                })}
                {sortedModules.length === 0 && (
                  <div className="p-4 text-center text-xs text-gray-500">
                    No modules yet.
                    <button
                      type="button"
                      onClick={() =>
                        setModuleDialog({ mode: 'add', title: '', order: 1 })
                      }
                      className="mt-2 block w-full rounded-lg border border-dashed border-gray-600 py-2 text-violet-300 hover:bg-gray-700/40"
                    >
                      + Create first module
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Chapter list */}
          <section className="lg:col-span-4">
            <div className="flex h-full flex-col rounded-2xl border border-gray-700 bg-gray-800">
              <div className="border-b border-gray-700 px-4 py-3 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-white">{selectedModule?.title || 'Select a module'}</h2>
                    {moduleStats && (
                      <p className="text-xs text-gray-500">
                        {moduleStats.total} chapters · {moduleStats.mcqs} MCQs in this module
                      </p>
                    )}
                  </div>
                  {selectedModuleId && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowAddMenu((v) => !v)}
                        className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
                      >
                        + Add content
                      </button>
                      {showAddMenu && (
                        <div className="absolute right-0 z-20 mt-1 min-w-[180px] rounded-xl border border-gray-600 bg-gray-900 p-1 shadow-xl">
                          {CHAPTER_TEMPLATES.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                setShowAddMenu(false)
                                setChapterDialog({
                                  kind: t.id,
                                  title: '',
                                  description: '',
                                  order: (selectedModule?.chapters?.length || 0) + 1,
                                })
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
                            >
                              <span>{t.icon}</span>
                              {t.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search chapters…"
                  className="w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white"
                />
                <div className="flex flex-wrap gap-1">
                  {CONTENT_FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setContentFilter(f.id)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                        contentFilter === f.id
                          ? 'bg-violet-600 text-white'
                          : 'bg-gray-900 text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-2 space-y-2">
                {filteredChapters.map((ch) => {
                  const key = `${selectedModuleId}:${ch.id}`
                  const active = selectedChapterKey === key
                  const kind = getChapterKind(ch)
                  const meta = CHAPTER_KIND[kind] || CHAPTER_KIND.other
                  return (
                    <div
                      key={ch.id}
                      className={`rounded-xl border transition ${
                        active
                          ? `border-violet-500/60 bg-violet-500/10 ring-1 ${meta.ring}`
                          : 'border-gray-700 bg-gray-900/60 hover:border-gray-600 hover:bg-gray-900'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => openChapter(selectedModuleId, ch)}
                        className="w-full px-3 py-3 text-left"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white line-clamp-2">
                              {ch.order}. {ch.title}
                            </div>
                            {kind === 'quiz' && ch.quizData?.questions?.length ? (
                              <div className="mt-1 text-xs text-violet-300">{ch.quizData.questions.length} questions</div>
                            ) : null}
                            {kind === 'notes' && ch.extraReferences?.length ? (
                              <div className="mt-1 text-xs text-sky-300">{ch.extraReferences.length} references</div>
                            ) : null}
                            {kind === 'video' && ch.videoUrl ? (
                              <div className="mt-1 truncate text-[11px] text-gray-500">{ch.videoUrl}</div>
                            ) : null}
                          </div>
                          <ChapterKindBadge chapter={ch} size="xs" />
                        </div>
                      </button>
                      {!isAnswerKeyChapter(ch) && (
                        <div className="border-t border-gray-700/50 px-2 py-1">
                          <button
                            type="button"
                            disabled={busyAction === `del-ch-${ch.id}`}
                            onClick={() => deleteChapter(selectedModuleId, ch)}
                            className="rounded px-2 py-0.5 text-[10px] text-red-300 hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
                {filteredChapters.length === 0 && (
                  <div className="p-6 text-center text-sm text-gray-500">No chapters match this filter.</div>
                )}
              </div>
            </div>
          </section>

          {/* Editor panel */}
          <section className="lg:col-span-5">
            <div className="sticky top-4 max-h-[calc(100vh-10rem)] overflow-y-auto rounded-2xl border border-gray-700 bg-gray-900">
              {!draftChapter ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
                  <div className="text-4xl">👈</div>
                  <p className="mt-3 text-sm font-medium text-white">Select a chapter to edit</p>
                  <p className="mt-1 max-w-xs text-xs text-gray-500">
                    Choose Study Notes to edit content and references, or Practice Quiz to add/edit MCQs with explanations.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="border-b border-gray-700 px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <ChapterKindBadge chapter={draftChapter.chapter} />
                        <h3 className="mt-2 text-lg font-bold text-white">{draftChapter.chapter.title}</h3>
                        {isQuizChapter(draftChapter.chapter) && (
                          <p className="mt-1 text-xs text-violet-300">Saving syncs the matching answer key automatically.</p>
                        )}
                        {isAnswerKeyChapter(draftChapter.chapter) && (
                          <p className="mt-1 text-xs text-gray-400">
                            Answer keys are auto-updated from practice quizzes. Edit the practice quiz instead.
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={closeEditor}
                        className="rounded-lg border border-gray-600 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 p-4">
                    {isAnswerKeyChapter(draftChapter.chapter) ? (
                      <div className="rounded-xl border border-gray-600 bg-gray-800/50 p-4">
                        <p className="text-sm text-gray-300">
                          This chapter is read-only for teachers. Update questions in the linked{' '}
                          <strong className="text-violet-200">Practice Quiz</strong> chapter.
                        </p>
                        <button
                          type="button"
                          onClick={jumpToPracticeFromAnswerKey}
                          className="mt-3 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                        >
                          Open practice quiz editor
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className="text-xs text-gray-400">Chapter title (sidebar)</label>
                            <input
                              value={draftChapter.chapter.title || ''}
                              onChange={(e) =>
                                setDraftChapter((prev) => ({
                                  ...prev,
                                  chapter: { ...prev.chapter, title: e.target.value },
                                }))
                              }
                              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">Heading</label>
                            <input
                              value={draftChapter.chapter.heading || ''}
                              onChange={(e) =>
                                setDraftChapter((prev) => ({
                                  ...prev,
                                  chapter: { ...prev.chapter, heading: e.target.value },
                                }))
                              }
                              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">Description</label>
                            <input
                              value={draftChapter.chapter.description || ''}
                              onChange={(e) =>
                                setDraftChapter((prev) => ({
                                  ...prev,
                                  chapter: { ...prev.chapter, description: e.target.value },
                                }))
                              }
                              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                            />
                          </div>
                        </div>

                        {isQuizChapter(draftChapter.chapter) && (
                          <QuizQuestionEditor
                            quizData={
                              draftChapter.chapter.quizData || {
                                title: draftChapter.chapter.title,
                                questions: [],
                              }
                            }
                            onChange={(quizData) =>
                              setDraftChapter((prev) => ({
                                ...prev,
                                chapter: { ...prev.chapter, quizData, interactiveType: 'quiz' },
                              }))
                            }
                          />
                        )}

                        {isNotesChapter(draftChapter.chapter) && (
                          <>
                            <div>
                              <div className="mb-2 text-sm font-medium text-sky-200">Study notes content</div>
                              <CourseChapterRichText
                                value={draftChapter.chapter.contentHtml || ''}
                                onChange={(html) =>
                                  setDraftChapter((prev) => ({
                                    ...prev,
                                    chapter: { ...prev.chapter, contentHtml: html, contentType: 'text', interactiveType: 'notes' },
                                  }))
                                }
                              />
                            </div>
                            <ChapterReferencesEditor
                              references={draftChapter.chapter.extraReferences || []}
                              onChange={(refs) =>
                                setDraftChapter((prev) => ({
                                  ...prev,
                                  chapter: { ...prev.chapter, extraReferences: refs },
                                }))
                              }
                              chapterVideoUrl={draftChapter.chapter.videoUrl || ''}
                              onVideoUrlChange={(url) =>
                                setDraftChapter((prev) => ({
                                  ...prev,
                                  chapter: {
                                    ...prev.chapter,
                                    videoUrl: url,
                                    resourceType: prev.chapter.resourceType || 'youtube',
                                  },
                                }))
                              }
                            />
                          </>
                        )}

                        {!isQuizChapter(draftChapter.chapter) && !isNotesChapter(draftChapter.chapter) && (
                          <>
                            <div>
                              <label className="text-xs text-gray-400">Content type</label>
                              <select
                                value={draftChapter.chapter.contentType || 'video'}
                                onChange={(e) =>
                                  setDraftChapter((prev) => ({
                                    ...prev,
                                    chapter: { ...prev.chapter, contentType: e.target.value },
                                  }))
                                }
                                className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                              >
                                <option value="video">Video</option>
                                <option value="document">Document</option>
                                <option value="mixed">Video + document</option>
                                <option value="text">Text</option>
                              </select>
                            </div>
                            {ctNeedsVideo(draftChapter.chapter.contentType) && (
                              <div>
                                <label className="text-xs text-gray-400">Video URL</label>
                                <input
                                  value={draftChapter.chapter.videoUrl || ''}
                                  onChange={(e) =>
                                    setDraftChapter((prev) => ({
                                      ...prev,
                                      chapter: { ...prev.chapter, videoUrl: e.target.value },
                                    }))
                                  }
                                  className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                                  placeholder="YouTube or Drive link"
                                />
                              </div>
                            )}
                            {ctNeedsText(draftChapter.chapter.contentType) && (
                              <CourseChapterRichText
                                value={draftChapter.chapter.contentHtml || ''}
                                onChange={(html) =>
                                  setDraftChapter((prev) => ({
                                    ...prev,
                                    chapter: { ...prev.chapter, contentHtml: html },
                                  }))
                                }
                              />
                            )}
                            {ctNeedsDoc(draftChapter.chapter.contentType) && (
                              <div className="rounded-lg border border-gray-600 bg-gray-800/50 p-3">
                                <div className="text-sm text-gray-300">Upload document</div>
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx,application/pdf"
                                  disabled={uploading}
                                  onChange={async (e) => {
                                    const f = e.target.files?.[0]
                                    if (!f || !selectedCourseId) return
                                    setUploading(true)
                                    setError('')
                                    try {
                                      const out = await academyApi.uploadChapterNotes(
                                        selectedCourseId,
                                        draftChapter.moduleId,
                                        draftChapter.chapter.id,
                                        f,
                                      )
                                      setDraftChapter((prev) => ({
                                        ...prev,
                                        chapter: {
                                          ...prev.chapter,
                                          documentFileId: out.fileId || '',
                                          documentUrl: out.previewUrl || '',
                                          documentMime: out.mimeType || '',
                                          documentName: out.fileName || f.name,
                                        },
                                      }))
                                    } catch (err) {
                                      setError(err.message || 'Upload failed')
                                    } finally {
                                      setUploading(false)
                                    }
                                    e.target.value = ''
                                  }}
                                  className="mt-2 text-sm text-gray-300 file:mr-2 file:rounded file:bg-violet-600 file:px-2 file:py-1 file:text-white"
                                />
                                {draftChapter.chapter.documentName && (
                                  <div className="mt-2 text-xs text-emerald-300">Current: {draftChapter.chapter.documentName}</div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {!isAnswerKeyChapter(draftChapter.chapter) && (
                    <div className="sticky bottom-0 border-t border-gray-700 bg-gray-900/95 px-4 py-3 backdrop-blur">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={saveChapter}
                          className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                        >
                          {saving ? 'Saving…' : 'Save changes'}
                        </button>
                        <button
                          type="button"
                          onClick={closeEditor}
                          className="rounded-lg border border-gray-600 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={busyAction === `del-ch-${draftChapter.chapter.id}`}
                          onClick={() =>
                            deleteChapter(draftChapter.moduleId, draftChapter.chapter, { closeAfter: true })
                          }
                          className="ml-auto rounded-lg border border-red-500/40 px-4 py-2.5 text-sm text-red-300 hover:bg-red-500/10"
                        >
                          Delete chapter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {moduleDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-600 bg-gray-900 p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-white">
              {moduleDialog.mode === 'add' ? 'Add module' : 'Edit module'}
            </h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-gray-400">Module title</label>
                <input
                  value={moduleDialog.title}
                  onChange={(e) => setModuleDialog((p) => ({ ...p, title: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                  placeholder="e.g. Module 1: Introduction"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Order</label>
                <input
                  type="number"
                  min={1}
                  value={moduleDialog.order}
                  onChange={(e) => setModuleDialog((p) => ({ ...p, order: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busyAction === 'module'}
                onClick={submitModuleDialog}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {busyAction === 'module' ? 'Saving…' : 'Save module'}
              </button>
              <button
                type="button"
                onClick={() => setModuleDialog(null)}
                className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {chapterDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-600 bg-gray-900 p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-white">
              Add {CHAPTER_TEMPLATES.find((t) => t.id === chapterDialog.kind)?.label || 'chapter'}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Module: {selectedModule?.title || '—'}
              {chapterDialog.kind === 'quiz' && ' · Answer key will be created automatically.'}
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-gray-400">Chapter title</label>
                <input
                  value={chapterDialog.title}
                  onChange={(e) => setChapterDialog((p) => ({ ...p, title: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                  placeholder={
                    chapterDialog.kind === 'quiz'
                      ? 'Module 1 — Practice Quiz'
                      : chapterDialog.kind === 'notes'
                        ? 'Module 1 — Study Notes'
                        : 'Chapter title'
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Short description (optional)</label>
                <input
                  value={chapterDialog.description || ''}
                  onChange={(e) => setChapterDialog((p) => ({ ...p, description: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busyAction === 'chapter'}
                onClick={submitChapterDialog}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {busyAction === 'chapter' ? 'Creating…' : 'Create chapter'}
              </button>
              <button
                type="button"
                onClick={() => setChapterDialog(null)}
                className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
