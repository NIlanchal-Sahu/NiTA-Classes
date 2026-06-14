const LETTERS = ['a', 'b', 'c', 'd']

function emptyQuestion(id) {
  return {
    id,
    question: '',
    options: LETTERS.map((l) => ({ id: l, text: '' })),
    correctIndex: 0,
    explanation: '',
  }
}

export default function QuizQuestionEditor({ quizData, onChange }) {
  const data = quizData || { title: 'Practice Quiz', questions: [] }
  const questions = data.questions || []

  const update = (nextQuestions) => {
    onChange({
      ...data,
      questions: nextQuestions.map((q, i) => ({ ...q, id: i + 1 })),
    })
  }

  const updateQuestion = (index, patch) => {
    const next = questions.map((q, i) => (i === index ? { ...q, ...patch } : q))
    update(next)
  }

  const updateOption = (qIndex, optIndex, text) => {
    const q = questions[qIndex]
    const options = (q.options || []).map((o, i) => (i === optIndex ? { ...o, text } : o))
    updateQuestion(qIndex, { options })
  }

  const addQuestion = () => {
    update([...questions, emptyQuestion(questions.length + 1)])
  }

  const removeQuestion = (index) => {
    if (!window.confirm('Remove this question from practice?')) return
    update(questions.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4 rounded-xl border border-violet-500/30 bg-violet-500/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-semibold text-violet-200">Practice MCQ questions</h4>
          <p className="text-xs text-gray-400">
            Add, edit, or remove questions. Saving updates the answer key chapter automatically.
          </p>
        </div>
        <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300">{questions.length} questions</span>
      </div>

      <input
        value={data.title || ''}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white"
        placeholder="Quiz title shown to students"
      />

      <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-1">
        {questions.map((q, qi) => (
          <div key={q.id ?? qi} className="rounded-lg border border-gray-600 bg-gray-800/80 p-3">
            <div className="flex items-start justify-between gap-2">
              <label className="text-xs font-semibold text-violet-300">Question {qi + 1}</label>
              <button
                type="button"
                onClick={() => removeQuestion(qi)}
                className="rounded border border-red-500/40 px-2 py-0.5 text-xs text-red-300 hover:bg-red-500/10"
              >
                Remove
              </button>
            </div>
            <textarea
              value={q.question || ''}
              onChange={(e) => updateQuestion(qi, { question: e.target.value })}
              rows={2}
              className="mt-2 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white"
              placeholder="Question text"
            />
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(q.options || LETTERS.map((l) => ({ id: l, text: '' }))).slice(0, 4).map((opt, oi) => (
                <div key={opt.id || oi} className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400">{LETTERS[oi]})</span>
                  <input
                    value={opt.text || ''}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                    className="min-w-0 flex-1 rounded border border-gray-600 bg-gray-900 px-2 py-1.5 text-sm text-white"
                    placeholder={`Option ${LETTERS[oi]}`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <label className="text-xs text-gray-400">Correct answer</label>
              <select
                value={q.correctIndex ?? 0}
                onChange={(e) => updateQuestion(qi, { correctIndex: Number(e.target.value) })}
                className="rounded border border-gray-600 bg-gray-900 px-2 py-1 text-sm text-white"
              >
                {LETTERS.slice(0, (q.options || []).length || 4).map((l, i) => (
                  <option key={l} value={i}>
                    {l}) {(q.options || [])[i]?.text || `Option ${l}`}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={q.explanation || ''}
              onChange={(e) => updateQuestion(qi, { explanation: e.target.value })}
              rows={3}
              className="mt-2 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white"
              placeholder="Explanation shown when student answers (required for good learning)"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addQuestion}
        className="rounded-lg border border-violet-500/50 bg-violet-600/20 px-4 py-2 text-sm font-semibold text-violet-100 hover:bg-violet-600/30"
      >
        + Add question
      </button>
    </div>
  )
}
