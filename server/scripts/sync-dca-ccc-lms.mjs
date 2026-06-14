/**
 * Sync docs/ncvrt CCC content into academy_course_content.json for DCA.
 * Run: node server/scripts/sync-dca-ccc-lms.mjs
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
  return readFileSync(join(DOCS, rel), 'utf8')
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
  'practice/07-communication-collaboration-qa.md': 'practice/answer-keys/07-communication-collaboration-answers.md',
  'practice/08-digital-financial-services-qa.md': 'practice/answer-keys/08-digital-financial-services-answers.md',
  'practice/09-e-governance-services-qa.md': 'practice/answer-keys/09-e-governance-services-answers.md',
  'practice/10-cyber-security-qa.md': 'practice/answer-keys/10-cyber-security-answers.md',
  'practice/11-future-skills-qa.md': 'practice/answer-keys/11-future-skills-answers.md',
  'exam-prep/mock-test-01.md': 'exam-prep/answer-keys/mock-test-01-answers.md',
  'exam-prep/mock-test-02.md': 'exam-prep/answer-keys/mock-test-02-answers.md',
  'exam-prep/mock-test-03.md': 'exam-prep/answer-keys/mock-test-03-answers.md',
  'exam-prep/50-most-important-mcqs.md': 'exam-prep/answer-keys/50-most-important-mcqs-answers.md',
}

function ch(id, title, mdPath, order, desc = '') {
  const chapter = {
    id,
    title,
    heading: title,
    description: desc || 'NIELIT CCC · NITA DCA 90-hour course',
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
  } else if (/practical lab|study plan|exam pattern/i.test(title)) {
    chapter.interactiveType = 'guide'
  }

  return chapter
}

const MODULES = [
  {
    id: 'mod-ccc-01',
    title: 'Module 1 — Introduction to Computer (10 hrs)',
    order: 1,
    chapters: [
      ['ch-ccc-01-notes', 'Study Notes', 'notes/01-introduction-to-computer.md', 1],
      ['ch-ccc-01-practice', 'Practice MCQs & Labs', 'practice/01-introduction-to-computer-qa.md', 2],
      ['ch-ccc-01-answers', 'Answer Key (unlock after practice)', 'practice/answer-keys/01-introduction-to-computer-answers.md', 3],
    ],
  },
  {
    id: 'mod-ccc-02',
    title: 'Module 2 — Operating System (10 hrs)',
    order: 2,
    chapters: [
      ['ch-ccc-02-notes', 'Study Notes', 'notes/02-operating-system.md', 1],
      ['ch-ccc-02-practice', 'Practice MCQs & Labs', 'practice/02-operating-system-qa.md', 2],
      ['ch-ccc-02-answers', 'Answer Key (unlock after practice)', 'practice/answer-keys/02-operating-system-answers.md', 3],
    ],
  },
  {
    id: 'mod-ccc-03',
    title: 'Module 3 — Word Processing (12 hrs)',
    order: 3,
    chapters: [
      ['ch-ccc-03-notes', 'Study Notes', 'notes/03-word-processing.md', 1],
      ['ch-ccc-03-practice', 'Practice MCQs & Labs', 'practice/03-word-processing-qa.md', 2],
      ['ch-ccc-03-practice-labs', 'Practical Lab Pack — Word', 'practical/word-practical-labs.md', 3],
      ['ch-ccc-03-answers', 'Answer Key (unlock after practice)', 'practice/answer-keys/03-word-processing-answers.md', 4],
    ],
  },
  {
    id: 'mod-ccc-04',
    title: 'Module 4 — Spreadsheet (12 hrs)',
    order: 4,
    chapters: [
      ['ch-ccc-04-notes', 'Study Notes', 'notes/04-spreadsheet.md', 1],
      ['ch-ccc-04-practice', 'Practice MCQs & Labs', 'practice/04-spreadsheet-qa.md', 2],
      ['ch-ccc-04-practice-labs', 'Practical Lab Pack — Excel', 'practical/excel-practical-labs.md', 3],
      ['ch-ccc-04-answers', 'Answer Key (unlock after practice)', 'practice/answer-keys/04-spreadsheet-answers.md', 4],
    ],
  },
  {
    id: 'mod-ccc-05',
    title: 'Module 5 — Presentation (8 hrs)',
    order: 5,
    chapters: [
      ['ch-ccc-05-notes', 'Study Notes', 'notes/05-presentation.md', 1],
      ['ch-ccc-05-practice', 'Practice MCQs & Labs', 'practice/05-presentation-qa.md', 2],
      ['ch-ccc-05-practice-labs', 'Practical Lab Pack — PowerPoint', 'practical/ppt-practical-labs.md', 3],
      ['ch-ccc-05-answers', 'Answer Key (unlock after practice)', 'practice/answer-keys/05-presentation-answers.md', 4],
    ],
  },
  {
    id: 'mod-ccc-06',
    title: 'Module 6 — Internet & Web Browsing (8 hrs)',
    order: 6,
    chapters: [
      ['ch-ccc-06-notes', 'Study Notes', 'notes/06-internet-web-browsing.md', 1],
      ['ch-ccc-06-practice', 'Practice MCQs', 'practice/06-internet-web-browsing-qa.md', 2],
      ['ch-ccc-06-answers', 'Answer Key (unlock after practice)', 'practice/answer-keys/06-internet-web-browsing-answers.md', 3],
    ],
  },
  {
    id: 'mod-ccc-07',
    title: 'Module 7 — Communication & Collaboration (8 hrs)',
    order: 7,
    chapters: [
      ['ch-ccc-07-notes', 'Study Notes', 'notes/07-communication-collaboration.md', 1],
      ['ch-ccc-07-practice', 'Practice MCQs', 'practice/07-communication-collaboration-qa.md', 2],
      ['ch-ccc-07-answers', 'Answer Key (unlock after practice)', 'practice/answer-keys/07-communication-collaboration-answers.md', 3],
    ],
  },
  {
    id: 'mod-ccc-08',
    title: 'Module 8 — Digital Financial Services (6 hrs)',
    order: 8,
    chapters: [
      ['ch-ccc-08-notes', 'Study Notes', 'notes/08-digital-financial-services.md', 1],
      ['ch-ccc-08-practice', 'Practice MCQs', 'practice/08-digital-financial-services-qa.md', 2],
      ['ch-ccc-08-answers', 'Answer Key (unlock after practice)', 'practice/answer-keys/08-digital-financial-services-answers.md', 3],
    ],
  },
  {
    id: 'mod-ccc-09',
    title: 'Module 9 — E-Governance Services (6 hrs)',
    order: 9,
    chapters: [
      ['ch-ccc-09-notes', 'Study Notes', 'notes/09-e-governance-services.md', 1],
      ['ch-ccc-09-practice', 'Practice MCQs', 'practice/09-e-governance-services-qa.md', 2],
      ['ch-ccc-09-answers', 'Answer Key (unlock after practice)', 'practice/answer-keys/09-e-governance-services-answers.md', 3],
    ],
  },
  {
    id: 'mod-ccc-10',
    title: 'Module 10 — Cyber Security (6 hrs)',
    order: 10,
    chapters: [
      ['ch-ccc-10-notes', 'Study Notes', 'notes/10-cyber-security.md', 1],
      ['ch-ccc-10-practice', 'Practice MCQs', 'practice/10-cyber-security-qa.md', 2],
      ['ch-ccc-10-answers', 'Answer Key (unlock after practice)', 'practice/answer-keys/10-cyber-security-answers.md', 3],
    ],
  },
  {
    id: 'mod-ccc-11',
    title: 'Module 11 — Future Skills (4 hrs)',
    order: 11,
    chapters: [
      ['ch-ccc-11-notes', 'Study Notes', 'notes/11-future-skills.md', 1],
      ['ch-ccc-11-practice', 'Practice MCQs', 'practice/11-future-skills-qa.md', 2],
      ['ch-ccc-11-answers', 'Answer Key (unlock after practice)', 'practice/answer-keys/11-future-skills-answers.md', 3],
    ],
  },
  {
    id: 'mod-ccc-exam',
    title: 'Module 12 — CCC Exam Prep & Mock Tests',
    order: 12,
    chapters: [
      ['ch-ccc-exam-plan', '15-Day Study Plan', 'exam-prep/15-day-study-plan.md', 1],
      ['ch-ccc-exam-pattern', 'CCC Exam Pattern & Passing Criteria', 'exam-prep/ccc-exam-pattern.md', 2],
      ['ch-ccc-mock-01', 'Mock Test 1 — 100 MCQs (90 min)', 'exam-prep/mock-test-01.md', 3],
      ['ch-ccc-mock-01-key', 'Mock Test 1 — Answer Key', 'exam-prep/answer-keys/mock-test-01-answers.md', 4],
      ['ch-ccc-mock-02', 'Mock Test 2 — 100 MCQs (90 min)', 'exam-prep/mock-test-02.md', 5],
      ['ch-ccc-mock-02-key', 'Mock Test 2 — Answer Key', 'exam-prep/answer-keys/mock-test-02-answers.md', 6],
      ['ch-ccc-mock-03', 'Mock Test 3 — 100 MCQs (90 min)', 'exam-prep/mock-test-03.md', 7],
      ['ch-ccc-mock-03-key', 'Mock Test 3 — Answer Key', 'exam-prep/answer-keys/mock-test-03-answers.md', 8],
      ['ch-ccc-top50', '50 Most Important MCQs', 'exam-prep/50-most-important-mcqs.md', 9],
      ['ch-ccc-top50-key', '50 Important MCQs — Answer Key', 'exam-prep/answer-keys/50-most-important-mcqs-answers.md', 10],
    ],
  },
]

const dcaEntry = {
  courseId: 'dca',
  modules: MODULES.map((m) => ({
    id: m.id,
    title: m.title,
    order: m.order,
    chapters: m.chapters.map(([id, title, path, order]) => ch(id, title, path, order)),
    createdAt: '2026-06-09T00:00:00.000Z',
  })),
}

let tree = JSON.parse(readFileSync(CONTENT_PATH, 'utf8'))
const others = tree.filter((c) => String(c.courseId).toLowerCase() !== 'dca')
writeFileSync(CONTENT_PATH, `${JSON.stringify([...others, dcaEntry], null, 2)}\n`, 'utf8')

const chCount = dcaEntry.modules.reduce((n, m) => n + m.chapters.length, 0)
console.log(`DCA CCC LMS synced: ${dcaEntry.modules.length} modules, ${chCount} chapters`)
