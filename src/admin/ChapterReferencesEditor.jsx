const TYPES = [
  { id: 'book', label: 'Book / PDF' },
  { id: 'video', label: 'Video (YouTube / link)' },
  { id: 'link', label: 'Website link' },
  { id: 'pdf', label: 'PDF document' },
]

function emptyRef() {
  return {
    id: `ref-${Date.now()}`,
    type: 'book',
    title: '',
    author: '',
    url: '',
    note: '',
  }
}

export default function ChapterReferencesEditor({ references = [], onChange, chapterVideoUrl, onVideoUrlChange }) {
  const list = Array.isArray(references) ? references : []

  const update = (next) => onChange(next)

  const updateItem = (index, patch) => {
    update(list.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  const remove = (index) => {
    update(list.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4 rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
      <div>
        <h4 className="font-semibold text-sky-200">Extra references for students</h4>
        <p className="text-xs text-gray-400">Add recommended books, videos, or links shown below the study notes.</p>
      </div>

      {onVideoUrlChange && (
        <div>
          <label className="text-xs text-gray-400">Main chapter video (optional)</label>
          <input
            value={chapterVideoUrl || ''}
            onChange={(e) => onVideoUrlChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
            placeholder="https://youtube.com/watch?v=... or Drive link"
          />
        </div>
      )}

      {list.map((ref, i) => (
        <div key={ref.id || i} className="rounded-lg border border-gray-600 bg-gray-800/80 p-3">
          <div className="flex items-center justify-between gap-2">
            <select
              value={ref.type || 'link'}
              onChange={(e) => updateItem(i, { type: e.target.value })}
              className="rounded border border-gray-600 bg-gray-900 px-2 py-1 text-sm text-white"
            >
              {TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => remove(i)}
              className="rounded border border-red-500/40 px-2 py-0.5 text-xs text-red-300 hover:bg-red-500/10"
            >
              Remove
            </button>
          </div>
          <input
            value={ref.title || ''}
            onChange={(e) => updateItem(i, { title: e.target.value })}
            className="mt-2 w-full rounded border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white"
            placeholder="Title (e.g. NCERT Class 10 IT Book)"
          />
          <input
            value={ref.author || ''}
            onChange={(e) => updateItem(i, { author: e.target.value })}
            className="mt-2 w-full rounded border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white"
            placeholder="Author / publisher (optional)"
          />
          <input
            value={ref.url || ''}
            onChange={(e) => updateItem(i, { url: e.target.value })}
            className="mt-2 w-full rounded border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white"
            placeholder="URL (YouTube, PDF, website)"
          />
          <input
            value={ref.note || ''}
            onChange={(e) => updateItem(i, { note: e.target.value })}
            className="mt-2 w-full rounded border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white"
            placeholder="Short note for students (optional)"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => update([...list, emptyRef()])}
        className="rounded-lg border border-sky-500/50 bg-sky-600/20 px-4 py-2 text-sm font-semibold text-sky-100 hover:bg-sky-600/30"
      >
        + Add book / video / link
      </button>
    </div>
  )
}
