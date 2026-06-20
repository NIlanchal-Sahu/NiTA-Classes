import { useMemo, useState } from 'react'

function slugify(text) {
  return String(text)
    .replace(/<[^>]+>/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function youtubeEmbed(url) {
  const raw = String(url || '').trim()
  if (!raw) return ''
  let id = ''
  if (raw.includes('youtube.com/watch?v=')) id = raw.split('v=')[1]?.split('&')[0]
  else if (raw.includes('youtu.be/')) id = raw.split('youtu.be/')[1]?.split('?')[0]
  else if (raw.includes('youtube.com/embed/')) return raw
  return id ? `https://www.youtube.com/embed/${id}` : ''
}

function ReferenceIcon({ type }) {
  if (type === 'book') return '📚'
  if (type === 'video') return '🎬'
  if (type === 'pdf') return '📄'
  return '🔗'
}

function SectionNav({ sections, activeSection, onSelect, className = '' }) {
  if (sections.length <= 2) return null
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">On this page</p>
      <ul className="mt-2 max-h-[32vh] space-y-1 overflow-y-auto text-xs xl:max-h-[50vh]">
        {sections.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onSelect(s.id)}
              className={`w-full rounded-lg px-2 py-1.5 text-left transition ${
                activeSection === s.id
                  ? 'bg-violet-600/30 text-violet-200'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              {s.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

const articleClasses = `study-notes-html w-full max-w-full overflow-x-hidden break-words rounded-xl border border-gray-700 bg-gradient-to-b from-gray-900/90 to-gray-900/50 p-4 sm:p-5 text-sm leading-relaxed text-gray-200
  [&_h1]:mb-4 [&_h1]:text-xl [&_h1]:sm:text-2xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:break-words
  [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:scroll-mt-24 [&_h2]:border-b [&_h2]:border-violet-500/30 [&_h2]:pb-2 [&_h2]:text-base [&_h2]:sm:text-lg [&_h2]:font-semibold [&_h2]:text-violet-100 [&_h2]:break-words
  [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-sm [&_h3]:sm:text-base [&_h3]:font-semibold [&_h3]:text-indigo-200
  [&_p]:my-2 [&_p]:break-words [&_li]:my-1
  [&_ul]:my-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5
  [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5
  [&_table]:my-4 [&_table]:w-full [&_table]:min-w-0 [&_table]:table-auto
  [&_th]:bg-violet-900/40 [&_th]:px-2 [&_th]:py-2 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:text-violet-100
  [&_td]:border-t [&_td]:border-gray-700 [&_td]:px-2 [&_td]:py-2 [&_td]:text-xs [&_td]:break-words
  [&_code]:break-all [&_code]:rounded [&_code]:bg-gray-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-violet-300
  [&_strong]:text-white [&_a]:break-all [&_a]:text-violet-300 [&_a]:underline
  [&_blockquote]:my-3 [&_blockquote]:rounded-lg [&_blockquote]:border-l-4 [&_blockquote]:border-violet-500 [&_blockquote]:bg-violet-500/10 [&_blockquote]:px-4 [&_blockquote]:py-2
  [&_img]:max-w-full [&_img]:h-auto`

export default function StudyNotesView({
  html,
  title,
  extraReferences = [],
  videoUrl = '',
  fullFrame = false,
}) {
  const [activeSection, setActiveSection] = useState('')
  const [tocOpen, setTocOpen] = useState(false)
  const refs = Array.isArray(extraReferences) ? extraReferences : []
  const embed = youtubeEmbed(videoUrl)

  const { sections, enrichedHtml } = useMemo(() => {
    if (!html) return { sections: [], enrichedHtml: '' }

    const headingRegex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi
    const secs = []
    let match
    while ((match = headingRegex.exec(html)) !== null) {
      const label = match[1].replace(/<[^>]+>/g, '').trim()
      if (label) secs.push({ id: slugify(label), label })
    }

    let enriched = html
    for (const sec of secs) {
      enriched = enriched.replace(
        new RegExp(`(<h2[^>]*>)(${sec.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(</h2>)`, 'i'),
        `$1<span id="${sec.id}"></span>$2$3`,
      )
    }

    return { sections: secs, enrichedHtml: enriched }
  }, [html])

  const scrollTo = (id) => {
    setActiveSection(id)
    setTocOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const showToc = sections.length > 2
  const hideSideToc = fullFrame

  const sectionPicker = showToc && (
    <>
      {!hideSideToc && (
        <div className="mb-4 xl:hidden">
          <button
            type="button"
            onClick={() => setTocOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-gray-700 bg-gray-900/90 px-4 py-3 text-sm font-medium text-violet-200"
          >
            <span>Jump to section ({sections.length})</span>
            <span>{tocOpen ? '▾' : '▸'}</span>
          </button>
          {tocOpen && (
            <div className="mt-2 flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-xl border border-gray-700 bg-gray-900/90 p-3">
              {sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => scrollTo(s.id)}
                  className={`rounded-full px-3 py-1.5 text-xs ${
                    activeSection === s.id
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {s.label.length > 28 ? `${s.label.slice(0, 26)}…` : s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {hideSideToc && (
        <div className="fixed bottom-5 right-5 z-[110] flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => setTocOpen((v) => !v)}
            className="rounded-full border border-violet-500/50 bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-violet-700"
          >
            {tocOpen ? 'Close sections' : `Sections (${sections.length})`}
          </button>
          {tocOpen && (
            <div className="max-h-[min(50vh,420px)] w-[min(92vw,360px)] overflow-y-auto rounded-xl border border-gray-600 bg-gray-900 p-3 shadow-2xl">
              <SectionNav sections={sections} activeSection={activeSection} onSelect={scrollTo} />
            </div>
          )}
        </div>
      )}
    </>
  )

  const articleFrameClass = fullFrame
    ? `${articleClasses} border-0 bg-transparent p-0 sm:p-0 lg:text-base`
    : articleClasses

  return (
    <div className={`w-full min-w-0 max-w-full overflow-x-hidden ${fullFrame ? '' : ''}`}>
      {sectionPicker}

      <div className={`flex min-w-0 flex-col gap-4 ${hideSideToc ? '' : 'xl:flex-row'}`}>
        {(showToc || refs.length > 0) && !hideSideToc && (
          <nav className="hidden min-w-0 shrink-0 xl:block xl:w-44 2xl:w-52">
            <div className="sticky top-20 space-y-3">
              {showToc && (
                <div className="rounded-xl border border-gray-700 bg-gray-900/90 p-3">
                  <SectionNav sections={sections} activeSection={activeSection} onSelect={scrollTo} />
                </div>
              )}
              {refs.length > 0 && (
                <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">References</p>
                  <ul className="mt-2 space-y-1 text-xs">
                    {refs.map((r) => (
                      <li key={r.id}>
                        {r.url ? (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block break-words rounded-lg px-2 py-1.5 text-sky-200 hover:bg-sky-500/10"
                          >
                            {ReferenceIcon({ type: r.type })} {r.title}
                          </a>
                        ) : (
                          <span className="block break-words px-2 py-1.5 text-gray-400">
                            {ReferenceIcon({ type: r.type })} {r.title}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </nav>
        )}

        <div className="min-w-0 flex-1 space-y-4 overflow-x-hidden">
          {embed && (
            <div className="overflow-hidden rounded-xl border border-gray-700 bg-black">
              <p className="border-b border-gray-700 bg-gray-800/80 px-4 py-2 text-xs font-semibold text-violet-200">
                Chapter video
              </p>
              <div className="aspect-video w-full">
                <iframe
                  src={embed}
                  title={title || 'Chapter video'}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          <div className="study-notes-table-wrap w-full min-w-0 overflow-x-auto">
            <article className={articleFrameClass} dangerouslySetInnerHTML={{ __html: enrichedHtml }} />
          </div>

          {refs.length > 0 && (
            <section
              className={`rounded-xl border border-sky-500/30 bg-sky-500/5 p-4 ${hideSideToc ? '' : 'xl:hidden'}`}
            >
              <h3 className="text-sm font-semibold text-sky-200">Recommended books & resources</h3>
              <ul className="mt-3 space-y-3">
                {refs.map((r) => (
                  <li key={r.id} className="rounded-lg border border-gray-700 bg-gray-900/60 p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{ReferenceIcon({ type: r.type })}</span>
                      <div className="min-w-0 flex-1">
                        {r.url ? (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-words font-medium text-sky-200 underline hover:text-sky-100"
                          >
                            {r.title}
                          </a>
                        ) : (
                          <span className="break-words font-medium text-white">{r.title}</span>
                        )}
                        {r.author && <p className="text-xs text-gray-400">{r.author}</p>}
                        {r.note && <p className="mt-1 text-sm text-gray-300">{r.note}</p>}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {title && sections.length === 0 && <p className="sr-only">{title}</p>}
    </div>
  )
}
