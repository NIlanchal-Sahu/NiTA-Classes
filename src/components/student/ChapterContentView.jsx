import InteractiveQuiz from './InteractiveQuiz'
import StudyNotesView from './StudyNotesView'
import { isAnswerKeyChapter, isNotesChapter, isQuizChapter } from '../../lib/courseContentUtils'

function AnswerKeyReview({ quizData, fullFrame = false }) {
  const letters = ['a', 'b', 'c', 'd']
  return (
    <div className={`space-y-3 ${fullFrame ? '' : 'mt-4'}`}>
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
        Answer key — each question shows the correct option and a clear explanation.
      </div>
      {quizData.questions.map((item, idx) => (
        <div key={item.id} className="rounded-xl border border-gray-700 bg-gray-900/60 p-4">
          <p className="text-sm font-medium text-white">
            <span className="mr-2 text-violet-400">{idx + 1}.</span>
            {item.question}
          </p>
          <p className="mt-2 text-sm font-semibold text-emerald-300">
            ✓ Right answer: {letters[item.correctIndex]}) {item.options[item.correctIndex]?.text}
          </p>
          <div className="mt-2 border-t border-gray-700 pt-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-300/80">Explanation</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-300">{item.explanation}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ChapterContentView({ chapter, onQuizComplete, fullFrame = false }) {
  const quizData = chapter?.quizData
  const html = String(chapter?.contentHtml || '').trim()
  const interactiveType = chapter?.interactiveType || ''

  if ((interactiveType === 'answer-key' || isAnswerKeyChapter(chapter)) && quizData?.questions?.length) {
    return <AnswerKeyReview quizData={quizData} fullFrame={fullFrame} />
  }

  if (isQuizChapter(chapter) && quizData?.questions?.length) {
    return (
      <div className={fullFrame ? '' : 'mt-4'}>
        <div className="mb-4 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-100">
          <strong className="text-violet-200">Interactive practice</strong> — Tap an option to check your answer
          instantly. Wrong answers show the correct choice with an explanation.
        </div>
        <InteractiveQuiz quizData={quizData} onAllAttempted={onQuizComplete} />
      </div>
    )
  }

  if (isNotesChapter(chapter) && html) {
    return (
      <div className={fullFrame ? '' : 'mt-4'}>
        <StudyNotesView
          html={html}
          title={chapter?.title}
          extraReferences={chapter?.extraReferences}
          videoUrl={chapter?.videoUrl}
          fullFrame={fullFrame}
        />
      </div>
    )
  }

  if (html) {
    return (
      <div className="study-notes-table-wrap mt-4 w-full min-w-0 overflow-x-auto">
        <div
          className="study-notes-html max-w-full break-words rounded-xl border border-gray-700 bg-gray-900/80 p-4 text-sm leading-relaxed text-gray-200
            [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-2 [&_h3]:font-semibold
            [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5
            [&_table]:w-full [&_th]:bg-gray-800 [&_th]:p-2 [&_td]:border [&_td]:border-gray-700 [&_td]:p-2 [&_td]:break-words
            [&_a]:break-all [&_a]:text-violet-300"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    )
  }

  return null
}
