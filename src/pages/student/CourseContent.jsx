import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { studentPortalApi } from '../../api/student'

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
    [data]
  )
  const selected = allChapters.find((c) => String(c.id) === String(selectedChapterId)) || allChapters[0] || null

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
  const showVideoBlock = (contentType === 'video' || contentType === 'mixed') && selected
  const showDocBlock =
    selected && (contentType === 'document' || contentType === 'mixed') && Boolean(docSrc)
  const showTextBlock = contentType === 'text' && String(selected?.contentHtml || '').trim()

  const displayHeading = selected?.heading || selected?.title

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Course Content</h1>
      <p className="mt-1 text-gray-400">
        {data?.course?.name || courseId} · Progress: {data?.progressPercent ?? 0}% ({data?.completedCount ?? 0}/
        {data?.totalChapters ?? 0})
      </p>
      {error && (
        <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}
      {loading && <div className="mt-4 text-gray-400">Loading content...</div>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px,1fr]">
        <aside className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <h3 className="font-semibold text-white">Modules & Chapters</h3>
          <div className="mt-4 space-y-4">
            {(data?.modules || []).map((m) => (
              <div key={m.id}>
                <div className="text-sm font-semibold text-violet-300">{m.title}</div>
                <div className="mt-2 space-y-2">
                  {(m.chapters || []).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      disabled={!c.unlocked}
                      onClick={() => setSelectedChapterId(c.id)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                        !c.unlocked
                          ? 'cursor-not-allowed border-gray-700 bg-gray-900 text-gray-500'
                          : String(selectedChapterId) === String(c.id)
                            ? 'border-violet-500 bg-violet-900/20 text-white'
                            : 'border-gray-700 bg-gray-900 text-gray-200 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate">{c.title}</span>
                        <span
                          className={`text-[10px] ${
                            c.completed ? 'text-emerald-400' : c.unlocked ? 'text-violet-300' : 'text-gray-500'
                          }`}
                        >
                          {c.completed ? 'Completed' : c.unlocked ? 'Unlocked' : 'Locked'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {!loading && (data?.modules || []).length === 0 && (
              <div className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-sm text-gray-400">
                No content added yet.
              </div>
            )}
          </div>
        </aside>

        <section className="rounded-xl border border-gray-700 bg-gray-800 p-5">
          {selected && selected.unlocked ? (
            <>
              <h3 className="text-lg font-semibold text-white">{displayHeading}</h3>
              <p className="mt-1 text-xs text-gray-400">
                Content: {contentType}
                {selected.resourceType ? ` · Player: ${selected.resourceType}` : ''}
              </p>

              {showVideoBlock && (
                <>
                  {player.mode === 'iframe' && iframeSrc ? (
                    <ProtectedBlock className="mt-3">
                      <div className="aspect-video overflow-hidden rounded-lg border border-gray-700 bg-black">
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
                    <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                      <p className="font-medium text-amber-50">Video opens in a new tab or is not set</p>
                      <p className="mt-1 text-xs text-amber-200/90">
                        Use an embeddable YouTube, Vimeo, or Google Drive preview link for in-page playback where supported.
                      </p>
                      {player.href ? (
                        <a
                          href={player.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                        >
                          Open video / resource
                        </a>
                      ) : (
                        <p className="mt-2 text-xs text-gray-400">No video URL for this chapter.</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {showDocBlock && (
                <ProtectedBlock className="mt-4">
                  <div className="text-sm font-medium text-gray-200">Notes (preview)</div>
                  <div className="relative mt-2 min-h-[480px] overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
                    <iframe title="Document preview" src={docSrc} className="h-[min(70vh,720px)] w-full" />
                  </div>
                </ProtectedBlock>
              )}

              {showTextBlock && (
                <ProtectedBlock className="mt-4">
                  <div
                    className="chapter-html max-w-none rounded-lg border border-gray-700 bg-gray-900/80 p-4 text-sm leading-relaxed text-gray-200 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mt-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-2 [&_h3]:text-base [&_h3]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-violet-300"
                    dangerouslySetInnerHTML={{ __html: selected.contentHtml }}
                  />
                </ProtectedBlock>
              )}

              <p className="mt-3 text-sm text-gray-300">{selected.description || 'No description provided.'}</p>
              {selected.noteText ? (
                <div className="mt-3 rounded-lg border border-gray-700 bg-gray-900 p-3 text-sm text-gray-300">
                  {selected.noteText}
                </div>
              ) : null}
              {!selected.completed ? (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={async () => {
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
                  }}
                  className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Saving…' : 'Mark as Completed'}
                </button>
              ) : (
                <div className="mt-4 text-sm font-semibold text-emerald-300">Chapter completed</div>
              )}
            </>
          ) : selected && !selected.unlocked ? (
            <div className="rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-sm text-gray-400">
              This chapter is locked. Complete the previous chapter first.
            </div>
          ) : (
            <div className="text-sm text-gray-400">Select an unlocked chapter to start learning.</div>
          )}
        </section>
      </div>

      {!loading && (data?.modules || []).length === 0 && (
        <div className="mt-6 rounded-xl border border-gray-700 bg-gray-800 p-5 text-sm text-gray-400">
          No chapter/content added yet for this course.
        </div>
      )}

      <div className="mt-6">
        <Link to="/student/my-courses" className="text-sm font-semibold text-violet-300 hover:text-violet-200">
          ← Back to My Courses
        </Link>
      </div>
    </>
  )
}
