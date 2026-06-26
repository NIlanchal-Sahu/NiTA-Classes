/**
 * Sync shared foundation content (modules 1–6) into academy_course_content.json for CCA.
 * Uses the same docs/ncvrt markdown as DCA/CCC; CCA-specific modules can be added later.
 * Run: node server/scripts/sync-cca-lms.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { marked } from 'marked'
import { parseQuizFromMarkdown } from './lib/parse-mcq-quiz.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')
const DOCS = join(ROOT, 'docs', 'ncvrt')
const CONTENT_PATH = join(__dirname, '..', 'src', 'data', 'academy_course_content.json')

marked.setOptions({ gfm: true, breaks: false })

function readMd(rel) {
  return readFileSync(join(DOCS, rel), 'utf8').replace(/^\uFEFF/, '')
}

function mdToHtml(md) {
  return marked.parse(md)
}

const QUIZ_ANSWER_MAP = {
  'practice/01-introduction-to-computer-qa.md': 'practice/answer-keys/01-introduction-to-computer-answers.md',
  'practice/02-operating-system-qa.md': 'practice/answer-keys/02-operating-system-answers.md',
  'practice/03-word-processing-qa.md': 'practice/answer-keys/03-word-processing-answers.md',
  'practice/04-spreadsheet-qa.md': 'practice/answer-keys/04-spreadsheet-answers.md',
  'practice/05-presentation-qa.md': 'practice/answer-keys/05-presentation-answers.md',
  'practice/06-internet-web-browsing-qa.md': 'practice/answer-keys/06-internet-web-browsing-answers.md',
}

function ch(id, title, mdPath, order, desc = '') {
  const chapter = {
    id,
    title,
    heading: title,
    description: desc || 'NITA CCA · Foundation modules (shared study pack)',
    videoUrl: '',
    resourceType: 'link',
    contentType: 'text',
    contentHtml: mdToHtml(readMd(mdPath)),
    noteText: '',
    order,
    createdAt: '2026-06-09T00:00:00.000Z',
  }

  if (/-notes$/.test(id) || /study notes/i.test(title)) {
    chapter.interactiveType = 'notes'
  } else if (QUIZ_ANSWER_MAP[mdPath]) {
    chapter.interactiveType = 'quiz'
    chapter.quizData = parseQuizFromMarkdown(readMd(mdPath), readMd(QUIZ_ANSWER_MAP[mdPath]))
  } else if (/answer key|— answer key/i.test(title)) {
    chapter.interactiveType = 'answer-key'
    const md = readMd(mdPath)
    chapter.quizData = parseQuizFromMarkdown(md, md)
  } else if (/practical lab/i.test(title)) {
    chapter.interactiveType = 'guide'
  }

  return chapter
}

const MODULES = [
  {
    id: 'mod-cca-01',
    title: 'Module 1 — Introduction to Computer',
    order: 1,
    chapters: [
      ['ch-cca-01-notes', 'Study Notes', 'notes/01-introduction-to-computer.md', 1],
      ['ch-cca-01-practice', 'Practice MCQs & Labs', 'practice/01-introduction-to-computer-qa.md', 2],
      ['ch-cca-01-answers', 'Answer Key (unlock after practice)', 'practice/answer-keys/01-introduction-to-computer-answers.md', 3],
    ],
  },
  {
    id: 'mod-cca-02',
    title: 'Module 2 — Operating System',
    order: 2,
    chapters: [
      ['ch-cca-02-notes', 'Study Notes', 'notes/02-operating-system.md', 1],
      ['ch-cca-02-practice', 'Practice MCQs & Labs', 'practice/02-operating-system-qa.md', 2],
      ['ch-cca-02-answers', 'Answer Key (unlock after practice)', 'practice/answer-keys/02-operating-system-answers.md', 3],
    ],
  },
  {
    id: 'mod-cca-03',
    title: 'Module 3 — Word Processing',
    order: 3,
    chapters: [
      ['ch-cca-03-notes', 'Study Notes', 'notes/03-word-processing.md', 1],
      ['ch-cca-03-practice', 'Practice MCQs & Labs', 'practice/03-word-processing-qa.md', 2],
      ['ch-cca-03-practice-labs', 'Practical Lab Pack — Word', 'practical/word-practical-labs.md', 3],
      ['ch-cca-03-answers', 'Answer Key (unlock after practice)', 'practice/answer-keys/03-word-processing-answers.md', 4],
    ],
  },
  {
    id: 'mod-cca-04',
    title: 'Module 4 — Spreadsheet',
    order: 4,
    chapters: [
      ['ch-cca-04-notes', 'Study Notes', 'notes/04-spreadsheet.md', 1],
      ['ch-cca-04-practice', 'Practice MCQs & Labs', 'practice/04-spreadsheet-qa.md', 2],
      ['ch-cca-04-practice-labs', 'Practical Lab Pack — Excel', 'practical/excel-practical-labs.md', 3],
      ['ch-cca-04-answers', 'Answer Key (unlock after practice)', 'practice/answer-keys/04-spreadsheet-answers.md', 4],
    ],
  },
  {
    id: 'mod-cca-05',
    title: 'Module 5 — Presentation',
    order: 5,
    chapters: [
      ['ch-cca-05-notes', 'Study Notes', 'notes/05-presentation.md', 1],
      ['ch-cca-05-practice', 'Practice MCQs & Labs', 'practice/05-presentation-qa.md', 2],
      ['ch-cca-05-practice-labs', 'Practical Lab Pack — PowerPoint', 'practical/ppt-practical-labs.md', 3],
      ['ch-cca-05-answers', 'Answer Key (unlock after practice)', 'practice/answer-keys/05-presentation-answers.md', 4],
    ],
  },
  {
    id: 'mod-cca-06',
    title: 'Module 6 — Internet & Web Browsing',
    order: 6,
    chapters: [
      ['ch-cca-06-notes', 'Study Notes', 'notes/06-internet-web-browsing.md', 1],
      ['ch-cca-06-practice', 'Practice MCQs', 'practice/06-internet-web-browsing-qa.md', 2],
      ['ch-cca-06-answers', 'Answer Key (unlock after practice)', 'practice/answer-keys/06-internet-web-browsing-answers.md', 3],
    ],
  },
]

const ccaEntry = {
  courseId: 'cca',
  modules: MODULES.map((m) => ({
    id: m.id,
    title: m.title,
    order: m.order,
    chapters: m.chapters.map(([id, title, path, order]) => ch(id, title, path, order)),
    createdAt: '2026-06-09T00:00:00.000Z',
  })),
}

let tree = JSON.parse(readFileSync(CONTENT_PATH, 'utf8'))
const others = tree.filter((c) => String(c.courseId).toLowerCase() !== 'cca')
writeFileSync(CONTENT_PATH, `${JSON.stringify([...others, ccaEntry], null, 2)}\n`, 'utf8')

const chCount = ccaEntry.modules.reduce((n, m) => n + m.chapters.length, 0)
console.log(`CCA LMS synced: ${ccaEntry.modules.length} modules, ${chCount} chapters`)
