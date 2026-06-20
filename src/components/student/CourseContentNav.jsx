import { useEffect, useMemo, useState } from 'react'
import { CHAPTER_KIND, getChapterKind } from '../../lib/courseContentUtils'

export function buildFlatChapterList(modules = []) {
  const rows = []
  for (const mod of modules) {
    for (const ch of mod.chapters || []) {
      rows.push({ module: mod, chapter: ch })
    }
  }
  return rows
}

export default function CourseContentNav({
  modules = [],
  selectedChapterId,
  onSelectChapter,
  onClose,
  compact = false,
}) {
  const flat = useMemo(() => buildFlatChapterList(modules), [modules])
  const selectedModuleId = flat.find((r) => String(r.chapter.id) === String(selectedChapterId))?.module?.id

  const [expandedModules, setExpandedModules] = useState(() => new Set())

  useEffect(() => {
    if (!selectedModuleId) return
    setExpandedModules((prev) => new Set(prev).add(String(selectedModuleId)))
  }, [selectedModuleId])

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      const key = String(moduleId)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const jumpModule = (moduleId) => {
    if (!moduleId) return
    setExpandedModules((prev) => new Set(prev).add(String(moduleId)))
    const first = flat.find(
      (r) => String(r.module.id) === String(moduleId) && r.chapter.unlocked,
    )
    if (first) onSelectChapter(first.chapter.id)
  }

  return (
    <div className={`flex h-full flex-col ${compact ? '' : 'min-h-0'}`}>
      {!compact && (
        <div className="border-b border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-white">Course outline</h3>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white lg:hidden"
                aria-label="Close menu"
              >
                ✕
              </button>
            )}
          </div>
          <label className="mt-3 block text-[11px] text-gray-500">Jump to module</label>
          <select
            value={selectedModuleId || ''}
            onChange={(e) => jumpModule(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-2 py-2 text-sm text-white"
          >
            <option value="">Select module…</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.order ? `${m.order}. ` : ''}{m.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={`flex-1 overflow-y-auto p-3 ${compact ? 'pt-0' : ''}`}>
        <div className="space-y-2">
          {modules.map((m) => {
            const open = expandedModules.has(String(m.id))
            const chapters = m.chapters || []
            const doneCount = chapters.filter((c) => c.completed).length
            return (
              <div key={m.id} className="rounded-xl border border-gray-700 bg-gray-900/50">
                <button
                  type="button"
                  onClick={() => toggleModule(m.id)}
                  className="flex w-full items-start justify-between gap-2 px-3 py-2.5 text-left"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-snug text-violet-300 line-clamp-2">
                      {m.order ? `${m.order}. ` : ''}{m.title}
                    </p>
                    <p className="mt-0.5 text-[10px] text-gray-500">
                      {doneCount}/{chapters.length} done
                    </p>
                  </div>
                  <span className="shrink-0 text-gray-500">{open ? '▾' : '▸'}</span>
                </button>
                {open && (
                  <div className="space-y-1 border-t border-gray-700/80 p-2">
                    {chapters.map((c) => {
                      const active = String(selectedChapterId) === String(c.id)
                      const kind = getChapterKind(c)
                      const meta = CHAPTER_KIND[kind] || CHAPTER_KIND.other
                      return (
                        <button
                          key={c.id}
                          type="button"
                          disabled={!c.unlocked}
                          onClick={() => {
                            onSelectChapter(c.id)
                            onClose?.()
                          }}
                          className={`w-full rounded-lg px-2.5 py-2 text-left text-xs transition ${
                            !c.unlocked
                              ? 'cursor-not-allowed text-gray-600'
                              : active
                                ? 'bg-violet-600/25 text-white ring-1 ring-violet-500/50'
                                : 'text-gray-300 hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="min-w-0 break-words leading-snug">{c.title}</span>
                            <span className="flex shrink-0 flex-col items-end gap-0.5">
                              <span title={meta.label}>{meta.icon}</span>
                              <span
                                className={`text-[9px] ${
                                  c.completed ? 'text-emerald-400' : c.unlocked ? 'text-violet-300' : 'text-gray-600'
                                }`}
                              >
                                {c.completed ? '✓' : c.unlocked ? 'Open' : '🔒'}
                              </span>
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {modules.length === 0 && (
          <p className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-sm text-gray-500">
            No content added yet.
          </p>
        )}
      </div>
    </div>
  )
}
