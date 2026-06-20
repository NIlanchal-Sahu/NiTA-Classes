import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { studentPortalApi } from '../../api/student'
import ChapterContentView from '../../components/student/ChapterContentView'
import CourseContentNav, { buildFlatChapterList } from '../../components/student/CourseContentNav'
import {
  isAnswerKeyChapter,
  isNotesChapter,
  isQuizChapter,
  shouldRenderInteractiveContent,
} from '../../lib/courseContentUtils'

/** Convert common video URLs to embed-friendly URLs (external hosts only). */
function toEmbedUrl(url) {
  const raw = String(url || '').trim()
  if (!raw) return ''
  let u = raw
  if (u.includes('youtube.com/watch?v=')) {
    const id = u.split('v=')[1]?.split('&')[0]
    return id ? `https://www.youtube.com/embed/${id}` : raw
  }
  if (u.includes('youtube.com/watch?') && u.includes('v=')) {
    const id = u.split('v=')[1]?.split('&')[0]
    return id ? `https://www.youtube.com/embed/${id}` : raw
  }
  if (u.includes('youtube.com/shorts/')) {
    const id = u.split('shorts/')[1]?.split('?')[0]?.split('/')[0]
    return id ? `https://www.youtube.com/embed/${id}` : raw
  }
  if (u.includes('youtu.be/')) {
    const id = u.split('youtu.be/')[1]?.split('?')[0]
    return id ? `https://www.youtube.com/embed/${id}` : raw
  }
  if (u.includes('youtube.com/embed/')) {
    return raw.startsWith('http') ? raw : `https:${raw}`
  }
  if (u.includes('drive.google.com/file/d/')) {
    const id = u.split('/file/d/')[1]?.split('/')[0]
    return id ? `https://drive.google.com/file/d/${id}/preview` : raw
  }
  if (u.includes('drive.google.com/open?id=')) {
    const id = u.split('id=')[1]?.split('&')[0]
    return id ? `https://drive.google.com/file/d/${id}/preview` : raw
  }
  if (u.includes('docs.google.com/presentation/d/')) {
    const id = u.split('/presentation/d/')[1]?.split('/')[0]
    return id ? `https://docs.google.com/presentation/d/${id}/embed` : raw
  }
  if (u.includes('vimeo.com/') && !u.includes('player.vimeo')) {
    const id = u.split('vimeo.com/')[1]?.split('?')[0]?.split('/').pop()
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : raw
  }
  return raw.startsWith('http') ? raw : ''
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return ''
  }
}

/** Only these can be safely embedded without loading our own SPA or broken full-page UIs. */
const IFRAME_ALLOWED_HOSTS = new Set([
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'm.youtube.com',
  'drive.google.com',
  'docs.google.com',
  'player.vimeo.com',
])

function isAllowedIframeHost(hostname) {
  if (!hostname) return false
  if (IFRAME_ALLOWED_HOSTS.has(hostname)) return true
  return hostname.endsWith('.google.com') && (hostname.startsWith('docs.') || hostname.startsWith('drive.'))
}

/**
 * Never embed same-origin URLs (prevents entire React app rendering inside iframe).
 * OneDrive / generic links open in new tab — they often show full site or login inside iframe.
 */
function getPlayerMode(rawUrl, resourceType) {
  const type = String(resourceType || 'video').toLowerCase()
  if (type === 'link' || type === 'pdf') {
    return { mode: 'external', href: String(rawUrl || '').trim(), reason: 'type' }
  }

  const url = String(rawUrl || '').trim()
  if (!url) return { mode: 'empty', href: '', reason: 'empty' }

  // Relative or path-only → never iframe (would load this app)
  if (url.startsWith('/') && !url.startsWith('//')) {
    return { mode: 'external', href: url, reason: 'relative-path' }
  }
  if (!/^https?:\/\//i.test(url)) {
    return { mode: 'external', href: url, reason: 'not-http-url' }
  }

  try {
    const pageOrigin = window.location.origin
    const target = new URL(url)
    if (target.origin === pageOrigin) {
      return { mode: 'external', href: url, reason: 'same-origin' }
    }
  } catch {
    return { mode: 'external', href: url, reason: 'invalid-url' }
  }

  const embed = toEmbedUrl(url)
  if (!embed || !/^https?:\/\//i.test(embed)) {
    return { mode: 'external', href: url, reason: 'no-embed' }
  }

  try {
    const embedHost = hostnameOf(embed)
    if (!isAllowedIframeHost(embedHost)) {
      return { mode: 'external', href: url, reason: 'host-not-embeddable' }
    }
    return { mode: 'iframe', src: embed }
  } catch {
    return { mode: 'external', href: url, reason: 'error' }
  }
}

function applyYoutubeEmbedRestrictions(src) {
  const s = String(src || '')
  if (!s.includes('youtube.com/embed') && !s.includes('youtube-nocookie.com/embed')) return s
  try {
    const u = new URL(s.startsWith('//') ? `https:${s}` : s)
    u.searchParams.set('controls', '0')
    u.searchParams.set('modestbranding', '1')
    u.searchParams.set('rel', '0')
    return u.toString()
  } catch {
    return s
  }
}

function normalizeContentType(ch) {
  let ct = String(ch?.contentType || '').toLowerCase()
  if (!ct) {
    if (String(ch?.contentHtml || '').trim()) ct = 'text'
    else if (ch?.documentFileId || ch?.documentUrl) ct = ch?.videoUrl ? 'mixed' : 'document'
    else ct = 'video'
  }
  if (!['video', 'document', 'mixed', 'text'].includes(ct)) ct = 'video'
  return ct
}

function documentPreviewSrc(ch) {
  if (ch?.documentFileId) return `https://drive.google.com/file/d/${ch.documentFileId}/preview`
  const u = String(ch?.documentUrl || '').trim()
  if (!u) return ''
  if (u.includes('/preview')) return u
  const m = u.match(/\/file\/d\/([^/]+)/)
  return m ? `https://drive.google.com/file/d/${m[1]}/preview` : u
}

/** Deterrent-only: blocks right-click/copy on wrapper; does not secure cross-origin iframe content. */
function ProtectedBlock({ children, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const block = (e) => {
      e.preventDefault()
      return false
    }
    el.addEventListener('contextmenu', block)
    el.addEventListener('copy', block)
    const keys = (e) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key))) e.preventDefault()
    }
    window.addEventListener('keydown', keys)
    return () => {
      el.removeEventListener('contextmenu', block)
      el.removeEventListener('copy', block)
      window.removeEventListener('keydown', keys)
    }
  }, [])
  return (
    <div ref={ref} className={`select-none ${className}`} style={{ userSelect: 'none' }} tabIndex={-1}>
      {children}
    </div>
  )
}

export default function CourseContent() {
  const { courseId } = useParams()
  const [data, setData] = useState(null)
  const [selectedChapterId, setSelectedChapterId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [readingMode, setReadingMode] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const out = await studentPortalApi.getCourseContent(courseId)
      setData(out)
      const firstUnlocked =
        (out.modules || []).flatMap((m) => m.chapters || []).find((c) => c.unlocked) || null
      setSelectedChapterId((prev) => prev || firstUnlocked?.id || '')
    } catch (e) {
      setError(e.message || 'Failed to load course content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      await load()
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  const allChapters = useMemo(
    () => (data?.modules || []).flatMap((m) => m.chapters || []),
    [data],
  )
  const flatRows = useMemo(() => buildFlatChapterList(data?.modules || []), [data])
  const selected = allChapters.find((c) => String(c.id) === String(selectedChapterId)) || allChapters[0] || null
  const selectedIndex = flatRows.findIndex((r) => String(r.chapter.id) === String(selected?.id))
  const prevRow = selectedIndex > 0 ? flatRows[selectedIndex - 1] : null
  const nextRow = selectedIndex >= 0 && selectedIndex < flatRows.length - 1 ? flatRows[selectedIndex + 1] : null
  const selectedModule = selectedIndex >= 0 ? flatRows[selectedIndex]?.module : null

  const selectChapter = (chapterId) => {
    setSelectedChapterId(chapterId)
    setNavOpen(false)
  }

  const contentType = useMemo(() => (selected ? normalizeContentType(selected) : 'video'), [selected])

  const player = useMemo(() => {
    if (!selected) return { mode: 'empty', href: '', reason: '', src: '' }
    const ct = normalizeContentType(selected)
    if (ct === 'document' || ct === 'text') {
      return { mode: 'empty', href: '', reason: 'content-type', src: '' }
    }
    const v = String(selected.videoUrl || selected.url || '').trim()
    if (!v) return { mode: 'empty', href: '', reason: 'no-url', src: '' }
    return getPlayerMode(v, selected.resourceType)
  }, [selected])

  const iframeSrc = useMemo(() => {
    if (player.mode !== 'iframe' || !player.src) return ''
    return applyYoutubeEmbedRestrictions(player.src)
  }, [player])

  const docSrc = useMemo(() => (selected ? documentPreviewSrc(selected) : ''), [selected])
  const showInteractiveBlock = selected && shouldRenderInteractiveContent(selected)
  const showVideoBlock =
    selected &&
    !isQuizChapter(selected) &&
    (contentType === 'video' || contentType === 'mixed') &&
    String(selected.videoUrl || selected.url || '').trim()
  const showDocBlock =
    selected &&
    !showInteractiveBlock &&
    (contentType === 'document' || contentType === 'mixed') &&
    Boolean(docSrc)
  const isInteractiveQuiz = selected && isQuizChapter(selected)
  const isStudyNotes = selected && isNotesChapter(selected)
  const isAnswerKey = selected && isAnswerKeyChapter(selected)
  const supportsFocusMode =
    selected &&
    (isStudyNotes || isInteractiveQuiz || isAnswerKey) &&
    shouldRenderInteractiveContent(selected)

  useEffect(() => {
    if (!supportsFocusMode) setReadingMode(false)
  }, [supportsFocusMode, selectedChapterId])

  useEffect(() => {
    if (!readingMode) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setNavOpen(false)
        setReadingMode(false)
      }
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [readingMode])

  const markChapterComplete = async () => {
    if (!selected || selected.completed) return
    setActionLoading(true)
    setError('')
    try {
      await studentPortalApi.completeChapter(courseId, selected.id)
      await load()
    } catch (e) {
      setError(e.message || 'Failed to mark chapter complete')
    } finally {
      setActionLoading(false)
    }
  }

  const displayHeading = selected?.heading || selected?.title

  return (
    <div className="mx-auto w-full max-w-7xl overflow-x-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-white sm:text-2xl">Course Content</h1>
          <p className="mt-1 break-words text-sm text-gray-400">
            {data?.course?.name || courseId}
          </p>
        </div>
        <Link
          to="/student/my-courses"
          className="shrink-0 text-sm font-semibold text-violet-300 hover:text-violet-200"
        >
          ← My Courses
        </Link>
      </div>

      {data && (
        <div className="mt-4 rounded-xl border border-gray-700 bg-gray-800/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-gray-300">
              Progress: <span className="font-semibold text-white">{data.progressPercent ?? 0}%</span>
            </span>
            <span className="text-gray-500">
              {data.completedCount ?? 0} / {data.totalChapters ?? 0} chapters
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-900">
            <div
              className="h-full rounded-full bg-violet-600 transition-all"
              style={{ width: `${Math.min(100, data.progressPercent ?? 0)}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}
      {loading && <div className="mt-4 text-gray-400">Loading content…</div>}

      {!loading && (data?.modules || []).length > 0 && (
        <>
          <div className="sticky top-0 z-20 mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-gray-700 bg-gray-900/95 p-2 backdrop-blur lg:hidden">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white"
            >
              ☰ Outline
            </button>
            <select
              value={selectedChapterId}
              onChange={(e) => selectChapter(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-gray-600 bg-gray-800 px-2 py-2 text-xs text-white"
            >
              {flatRows.map(({ module, chapter }) => (
                <option key={chapter.id} value={chapter.id} disabled={!chapter.unlocked}>
                  {module.title?.slice(0, 24)} — {chapter.title}
                </option>
              ))}
            </select>
          </div>

          <div className="relative mt-4 flex min-w-0 gap-0 lg:mt-6 lg:gap-6">
            {navOpen && (
              <button
                type="button"
                className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                aria-label="Close outline"
                onClick={() => setNavOpen(false)}
              />
            )}

            <aside
              className={`fixed inset-y-0 left-0 z-50 flex w-[min(100vw,320px)] flex-col border-r border-gray-700 bg-gray-800 shadow-xl transition-transform lg:static lg:z-0 lg:w-72 lg:shrink-0 lg:rounded-xl lg:border lg:shadow-none ${
                navOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
              }`}
            >
              <CourseContentNav
                modules={data?.modules || []}
                selectedChapterId={selectedChapterId}
                onSelectChapter={selectChapter}
                onClose={() => setNavOpen(false)}
              />
            </aside>

            <main className="min-w-0 flex-1 overflow-hidden">
              {selected && selected.unlocked ? (
                <div className="rounded-xl border border-gray-700 bg-gray-800 lg:p-1">
                  <div className="border-b border-gray-700 px-3 py-3 sm:px-5">
                    {selectedModule && (
                      <p className="text-[11px] font-medium uppercase tracking-wide text-violet-400">
                        {selectedModule.title}
                      </p>
                    )}
                    <h2 className="mt-1 break-words text-lg font-semibold text-white sm:text-xl">{displayHeading}</h2>
                    {isInteractiveQuiz && (
                      <p className="mt-1 text-sm text-gray-400">Practice MCQs · Tap an option for instant feedback</p>
                    )}
                    {isStudyNotes && !isInteractiveQuiz && (
                      <p className="mt-1 text-sm text-gray-400">Study notes · Use outline or jump menu for sections</p>
                    )}
                    {isAnswerKey && (
                      <p className="mt-1 text-sm text-gray-400">Answer key · Review correct answers and explanations</p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      {supportsFocusMode && (
                        <button
                          type="button"
                          onClick={() => {
                            setNavOpen(false)
                            setReadingMode(true)
                          }}
                          className="rounded-lg border border-violet-500/50 bg-violet-600/20 px-3 py-1.5 text-xs font-semibold text-violet-200 hover:bg-violet-600/30"
                          title="Expand content to full screen for easier reading"
                        >
                          ⛶ Full width reading
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={!prevRow?.chapter?.unlocked}
                        onClick={() => prevRow && selectChapter(prevRow.chapter.id)}
                        className="rounded-lg border border-gray-600 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 disabled:opacity-40"
                      >
                        ← Previous
                      </button>
                      <button
                        type="button"
                        disabled={!nextRow?.chapter?.unlocked}
                        onClick={() => nextRow && selectChapter(nextRow.chapter.id)}
                        className="rounded-lg border border-gray-600 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 disabled:opacity-40"
                      >
                        Next →
                      </button>
                    </div>
                  </div>

                  <div className="min-w-0 overflow-x-hidden px-3 py-4 sm:px-5 sm:py-5">
                    {showVideoBlock && (
                      <>
                        {player.mode === 'iframe' && iframeSrc ? (
                          <ProtectedBlock className="mt-1">
                            <div className="aspect-video w-full overflow-hidden rounded-lg border border-gray-700 bg-black">
                              <iframe
                                src={iframeSrc}
                                title={displayHeading || 'Video'}
                                className="h-full w-full"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                allowFullScreen
                                referrerPolicy="strict-origin-when-cross-origin"
                              />
                            </div>
                          </ProtectedBlock>
                        ) : (
                          <div className="mt-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                            <p className="font-medium text-amber-50">Video opens in a new tab or is not set</p>
                            {player.href ? (
                              <a
                                href={player.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                              >
                                Open video / resource
                              </a>
                            ) : null}
                          </div>
                        )}
                      </>
                    )}

                    {showDocBlock && (
                      <ProtectedBlock className="mt-4">
                        <div className="text-sm font-medium text-gray-200">Notes (preview)</div>
                        <div className="relative mt-2 w-full overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
                          <iframe title="Document preview" src={docSrc} className="h-[min(60vh,640px)] w-full" />
                        </div>
                      </ProtectedBlock>
                    )}

                    {showInteractiveBlock &&
                      (isInteractiveQuiz || isStudyNotes ? (
                        <ChapterContentView chapter={selected} />
                      ) : (
                        <ProtectedBlock>
                          <ChapterContentView chapter={selected} />
                        </ProtectedBlock>
                      ))}

                    {selected.description ? (
                      <p className="mt-4 break-words text-sm text-gray-300">{selected.description}</p>
                    ) : null}
                    {selected.noteText ? (
                      <div className="mt-3 break-words rounded-lg border border-gray-700 bg-gray-900 p-3 text-sm text-gray-300">
                        {selected.noteText}
                      </div>
                    ) : null}

                    <div className="mt-6 border-t border-gray-700 pt-4">
                      {!selected.completed ? (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={markChapterComplete}
                          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 sm:w-auto"
                        >
                          {actionLoading ? 'Saving…' : 'Mark as Completed'}
                        </button>
                      ) : (
                        <div className="text-sm font-semibold text-emerald-300">Chapter completed ✓</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : selected && !selected.unlocked ? (
                <div className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-6 text-sm text-gray-400">
                  This chapter is locked. Complete the previous chapter first.
                </div>
              ) : (
                <div className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-6 text-sm text-gray-400">
                  Select a chapter from the outline to start learning.
                </div>
              )}
            </main>
          </div>
        </>
      )}

      {!loading && (data?.modules || []).length === 0 && (
        <div className="mt-6 rounded-xl border border-gray-700 bg-gray-800 p-5 text-sm text-gray-400">
          No chapter/content added yet for this course.
        </div>
      )}

      {readingMode && supportsFocusMode && selected?.unlocked && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-gray-900">
          <header className="sticky top-0 z-10 shrink-0 border-b border-gray-700 bg-gray-900/95 px-3 py-3 backdrop-blur sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                {selectedModule && (
                  <p className="truncate text-[11px] font-medium uppercase tracking-wide text-violet-400">
                    {selectedModule.title}
                  </p>
                )}
                <h2 className="truncate text-base font-semibold text-white sm:text-lg">{displayHeading}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNavOpen(false)
                  setReadingMode(false)
                }}
                className="shrink-0 rounded-lg border border-gray-600 px-3 py-1.5 text-xs font-semibold text-gray-200 hover:bg-gray-800"
              >
                Exit focus
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setNavOpen((v) => !v)}
                className={`rounded-lg border px-3 py-1.5 text-xs ${
                  navOpen
                    ? 'border-violet-500/50 bg-violet-600/20 text-violet-200'
                    : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
              >
                {navOpen ? '✕ Close outline' : '☰ Outline'}
              </button>
              <button
                type="button"
                disabled={!prevRow?.chapter?.unlocked}
                onClick={() => prevRow && selectChapter(prevRow.chapter.id)}
                className="rounded-lg border border-gray-600 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 disabled:opacity-40"
              >
                ← Previous
              </button>
              <button
                type="button"
                disabled={!nextRow?.chapter?.unlocked}
                onClick={() => nextRow && selectChapter(nextRow.chapter.id)}
                className="rounded-lg border border-gray-600 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 disabled:opacity-40"
              >
                Next →
              </button>
              {!selected.completed ? (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={markChapterComplete}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Saving…' : 'Mark complete'}
                </button>
              ) : (
                <span className="self-center px-2 text-xs font-semibold text-emerald-300">Completed ✓</span>
              )}
            </div>
          </header>

          <div className="flex min-h-0 flex-1 overflow-hidden">
            {navOpen && (
              <aside className="flex w-[min(100vw,320px)] shrink-0 flex-col overflow-hidden border-r border-gray-700 bg-gray-800">
                <CourseContentNav
                  modules={data?.modules || []}
                  selectedChapterId={selectedChapterId}
                  onSelectChapter={selectChapter}
                  onClose={() => setNavOpen(false)}
                />
              </aside>
            )}

            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-none px-4 py-6 sm:px-8 lg:px-16 xl:px-24">
                <ChapterContentView chapter={selected} fullFrame />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
