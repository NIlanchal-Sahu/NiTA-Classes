export function isQuizChapter(ch) {
  return (
    ch?.interactiveType === 'quiz' ||
    (ch?.quizData?.questions?.length > 0 && /practice|mock|important mcq/i.test(String(ch?.title || '')))
  )
}

export function isNotesChapter(ch) {
  return (
    ch?.interactiveType === 'notes' ||
    /study notes/i.test(String(ch?.title || '')) ||
    /-notes$/.test(String(ch?.id || ''))
  )
}

export function isAnswerKeyChapter(ch) {
  return /answer key/i.test(String(ch?.title || '')) || /-answers$/.test(String(ch?.id || ''))
}

export function getChapterKind(ch) {
  if (isQuizChapter(ch)) return 'quiz'
  if (isNotesChapter(ch)) return 'notes'
  if (isAnswerKeyChapter(ch)) return 'answer-key'
  if (ch?.contentType === 'video' || (ch?.videoUrl && !ch?.contentHtml)) return 'video'
  if (ch?.contentType === 'document' || ch?.documentUrl || ch?.documentFileId) return 'document'
  if (ch?.contentType === 'text' || ch?.contentHtml) return 'text'
  return 'other'
}

export function shouldRenderInteractiveContent(ch) {
  if (!ch) return false
  if (ch.quizData?.questions?.length) return true
  if (['quiz', 'answer-key', 'notes'].includes(ch.interactiveType)) return true
  if (String(ch.contentHtml || '').trim()) return true
  return false
}

export const CHAPTER_KIND = {
  quiz: {
    label: 'Practice Quiz',
    short: 'Quiz',
    icon: '❓',
    ring: 'ring-violet-500/40',
    bg: 'bg-violet-500/10',
    text: 'text-violet-200',
    filter: 'quiz',
  },
  notes: {
    label: 'Study Notes',
    short: 'Notes',
    icon: '📝',
    ring: 'ring-sky-500/40',
    bg: 'bg-sky-500/10',
    text: 'text-sky-200',
    filter: 'notes',
  },
  'answer-key': {
    label: 'Answer Key',
    short: 'Key',
    icon: '🔑',
    ring: 'ring-gray-500/40',
    bg: 'bg-gray-500/10',
    text: 'text-gray-300',
    filter: 'other',
  },
  video: {
    label: 'Video Lesson',
    short: 'Video',
    icon: '🎬',
    ring: 'ring-emerald-500/40',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-200',
    filter: 'video',
  },
  document: {
    label: 'Document',
    short: 'Doc',
    icon: '📄',
    ring: 'ring-amber-500/40',
    bg: 'bg-amber-500/10',
    text: 'text-amber-200',
    filter: 'other',
  },
  text: {
    label: 'Text Content',
    short: 'Text',
    icon: '📋',
    ring: 'ring-indigo-500/40',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-200',
    filter: 'other',
  },
  other: {
    label: 'Chapter',
    short: 'Other',
    icon: '📁',
    ring: 'ring-gray-500/40',
    bg: 'bg-gray-500/10',
    text: 'text-gray-300',
    filter: 'other',
  },
}

export const CONTENT_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'notes', label: 'Study Notes' },
  { id: 'quiz', label: 'Practice Quizzes' },
  { id: 'video', label: 'Videos' },
  { id: 'other', label: 'Other' },
]

export function summarizeModule(mod) {
  const chapters = mod?.chapters || []
  let notes = 0
  let quizzes = 0
  let mcqs = 0
  let videos = 0
  for (const ch of chapters) {
    const kind = getChapterKind(ch)
    if (kind === 'notes') notes += 1
    if (kind === 'quiz') {
      quizzes += 1
      mcqs += ch?.quizData?.questions?.length || 0
    }
    if (kind === 'video') videos += 1
  }
  return { notes, quizzes, mcqs, videos, total: chapters.length }
}

export function summarizeCourse(course) {
  const modules = course?.modules || []
  return modules.reduce(
    (acc, mod) => {
      const s = summarizeModule(mod)
      acc.modules += 1
      acc.notes += s.notes
      acc.quizzes += s.quizzes
      acc.mcqs += s.mcqs
      acc.videos += s.videos
      acc.chapters += s.total
      return acc
    },
    { modules: 0, notes: 0, quizzes: 0, mcqs: 0, videos: 0, chapters: 0 },
  )
}

export function chapterMatchesFilter(ch, filterId) {
  if (!filterId || filterId === 'all') return true
  const kind = getChapterKind(ch)
  const meta = CHAPTER_KIND[kind] || CHAPTER_KIND.other
  return meta.filter === filterId
}

export function findLinkedPracticeChapter(module, answerKeyChapter) {
  if (!module?.chapters?.length) return null
  return (
    module.chapters.find((ch) => isQuizChapter(ch) && String(ch.title || '').toLowerCase().includes('practice')) ||
    module.chapters.find((ch) => isQuizChapter(ch)) ||
    null
  )
}
