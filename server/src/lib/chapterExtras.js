/** Sanitize quiz + reference payloads stored on LMS chapters. */

export function sanitizeQuizData(raw) {
  if (!raw || typeof raw !== 'object') return null
  const title = String(raw.title || 'Practice Quiz').trim().slice(0, 200)
  const questions = Array.isArray(raw.questions) ? raw.questions : []
  const out = []

  for (let i = 0; i < questions.length && out.length < 200; i += 1) {
    const q = questions[i]
    if (!q || typeof q !== 'object') continue
    const question = String(q.question || '').trim().slice(0, 500)
    if (!question) continue

    const optionsIn = Array.isArray(q.options) ? q.options : []
    const options = []
    for (let j = 0; j < Math.min(4, optionsIn.length); j += 1) {
      const text = String(optionsIn[j]?.text ?? optionsIn[j] ?? '').trim().slice(0, 300)
      if (!text) continue
      options.push({ id: String.fromCharCode(97 + options.length), text })
    }
    if (options.length < 2) continue

    let correctIndex = Number(q.correctIndex)
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
      correctIndex = 0
    }

    out.push({
      id: out.length + 1,
      question,
      options,
      correctIndex,
      explanation: String(q.explanation || '').trim().slice(0, 2000),
    })
  }

  return { title, questions: out }
}

export function sanitizeReferences(raw) {
  if (!Array.isArray(raw)) return []
  const out = []
  for (let i = 0; i < raw.length && out.length < 30; i += 1) {
    const r = raw[i]
    if (!r || typeof r !== 'object') continue
    const type = ['book', 'video', 'link', 'pdf'].includes(String(r.type).toLowerCase())
      ? String(r.type).toLowerCase()
      : 'link'
    const title = String(r.title || '').trim().slice(0, 200)
    if (!title) continue
    out.push({
      id: String(r.id || `ref-${Date.now()}-${i}`).slice(0, 64),
      type,
      title,
      author: String(r.author || '').trim().slice(0, 120),
      url: String(r.url || '').trim().slice(0, 500),
      note: String(r.note || '').trim().slice(0, 500),
    })
  }
  return out
}

export function findAnswerKeyChapter(module, practiceChapterId) {
  const chapters = (module?.chapters || []).slice().sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
  const practiceIdx = chapters.findIndex((c) => String(c.id) === String(practiceChapterId))
  if (practiceIdx >= 0) {
    const after = chapters.slice(practiceIdx + 1).find(
      (c) =>
        c.interactiveType === 'answer-key' ||
        /answer key/i.test(String(c.title || ''))
    )
    if (after) return after
  }
  return chapters.find(
    (c) => c.interactiveType === 'answer-key' || /answer key/i.test(String(c.title || ''))
  )
}
