import { useCallback, useMemo, useState } from 'react'

const LETTERS = ['a', 'b', 'c', 'd']

function OptionButton({ opt, index, selected, correctIndex, revealed, onSelect, disabled }) {
  const isSelected = selected === index
  const isCorrect = index === correctIndex
  let style =
    'w-full rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 '

  if (!revealed) {
    style += isSelected
      ? 'border-violet-400 bg-violet-500/20 text-white ring-2 ring-violet-400/50'
      : 'border-gray-600 bg-gray-800/80 text-gray-100 hover:border-violet-500/60 hover:bg-gray-750'
  } else if (isCorrect) {
    style += 'border-emerald-500 bg-emerald-500/15 text-emerald-50 ring-2 ring-emerald-500/40'
  } else if (isSelected && !isCorrect) {
    style += 'border-red-500 bg-red-500/15 text-red-50'
  } else {
    style += 'border-gray-700 bg-gray-900/50 text-gray-500 opacity-60'
  }

  return (
    <button
      type="button"
      disabled={disabled || revealed}
      onClick={() => onSelect(index)}
      className={style}
    >
      <span className="mr-2 font-semibold text-violet-300">{LETTERS[index]})</span>
      {opt.text}
      {revealed && isCorrect && <span className="ml-2 text-emerald-400">✓</span>}
      {revealed && isSelected && !isCorrect && <span className="ml-2 text-red-400">✗</span>}
    </button>
  )
}

function FeedbackPanel({ item, isCorrect, selectedIndex }) {
  const correctText = item.options[item.correctIndex]?.text
  const letter = LETTERS[item.correctIndex]

  return (
    <div
      className={`mt-4 animate-fade-in rounded-xl border p-4 ${
        isCorrect ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-amber-500/40 bg-amber-500/10'
      }`}
    >
      <p className={`text-sm font-semibold ${isCorrect ? 'text-emerald-300' : 'text-amber-200'}`}>
        {isCorrect ? '✓ Correct — well done!' : '✗ That is not correct.'}
      </p>
      {!isCorrect && selectedIndex !== undefined && (
        <p className="mt-2 text-sm text-red-200/90">
          You chose {LETTERS[selectedIndex]}) {item.options[selectedIndex]?.text}
        </p>
      )}
      <p className="mt-2 text-sm font-medium text-emerald-300">
        Right answer: {letter}) {correctText}
      </p>
      <div className="mt-3 border-t border-white/10 pt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-300/90">Why this is correct</p>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-200">{item.explanation}</p>
      </div>
    </div>
  )
}

export default function InteractiveQuiz({ quizData, onAllAttempted }) {
  const questions = quizData?.questions || []
  const total = questions.length
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [revealed, setRevealed] = useState({})
  const [mode, setMode] = useState('step')
  const [showSummary, setShowSummary] = useState(false)

  const q = questions[current]
  const selected = answers[q?.id]
  const isRevealed = Boolean(revealed[q?.id])

  const stats = useMemo(() => {
    let attempted = 0
    let correct = 0
    for (const item of questions) {
      if (answers[item.id] !== undefined) {
        attempted += 1
        if (answers[item.id] === item.correctIndex) correct += 1
      }
    }
    return { attempted, correct, wrong: attempted - correct }
  }, [answers, questions])

  const handleSelect = useCallback(
    (optionIndex) => {
      if (!q || isRevealed) return
      setAnswers((prev) => ({ ...prev, [q.id]: optionIndex }))
      setRevealed((prev) => ({ ...prev, [q.id]: true }))
    },
    [q, isRevealed]
  )

  const goNext = () => {
    if (current < total - 1) setCurrent((c) => c + 1)
    else setShowSummary(true)
  }

  const goPrev = () => {
    if (showSummary) setShowSummary(false)
    else if (current > 0) setCurrent((c) => c - 1)
  }

  if (!total) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
        No quiz questions found for this chapter.
      </div>
    )
  }

  if (showSummary) {
    const pct = total ? Math.round((stats.correct / total) * 100) : 0
    const passed = pct >= 50
    if (stats.attempted >= total && onAllAttempted) onAllAttempted(stats)

    return (
      <div className="animate-fade-in space-y-4">
        <div
          className={`rounded-2xl border p-6 text-center ${
            passed
              ? 'border-emerald-500/40 bg-emerald-500/10'
              : 'border-amber-500/40 bg-amber-500/10'
          }`}
        >
          <div className="text-4xl font-bold text-white">{stats.correct}/{total}</div>
          <div className="mt-1 text-lg text-gray-200">{pct}% correct</div>
          <p className="mt-3 text-sm text-gray-300">
            {passed
              ? 'Great work! CCC pass mark is 50% — review any wrong answers below.'
              : 'Keep going! Read the explanations for wrong answers, then try again. CCC pass mark is 50%.'}
          </p>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
          {questions.map((item, i) => {
            const a = answers[item.id]
            const ok = a === item.correctIndex
            const done = a !== undefined
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setShowSummary(false)
                  setMode('list')
                  setCurrent(i)
                }}
                className={`rounded-lg py-2 text-xs font-semibold transition ${
                  !done
                    ? 'bg-gray-700 text-gray-400'
                    : ok
                      ? 'bg-emerald-600/30 text-emerald-300 ring-1 ring-emerald-500/50'
                      : 'bg-red-600/20 text-red-300 ring-1 ring-red-500/40'
                }`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            setShowSummary(false)
            setCurrent(0)
            setMode('step')
          }}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
        >
          Review questions
        </button>
      </div>
    )
  }

  const progress = ((stats.attempted / total) * 100).toFixed(0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-semibold text-violet-200">{quizData.title}</h4>
          <p className="text-xs text-gray-400">
            Question {current + 1} of {total} · Score {stats.correct}/{stats.attempted} answered
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode((m) => (m === 'step' ? 'list' : 'step'))}
            className="rounded-lg border border-gray-600 px-3 py-1.5 text-xs text-gray-300 hover:border-violet-500"
          >
            {mode === 'step' ? 'List view' : 'One by one'}
          </button>
          {stats.attempted >= total && (
            <button
              type="button"
              onClick={() => setShowSummary(true)}
              className="rounded-lg bg-emerald-600/80 px-3 py-1.5 text-xs font-semibold text-white"
            >
              See results
            </button>
          )}
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {mode === 'list' ? (
        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {questions.map((item, idx) => (
            <QuestionCard
              key={item.id}
              item={item}
              index={idx}
              selected={answers[item.id]}
              revealed={revealed[item.id]}
              onSelect={(optIdx) => {
                setAnswers((prev) => ({ ...prev, [item.id]: optIdx }))
                setRevealed((prev) => ({ ...prev, [item.id]: true }))
              }}
            />
          ))}
        </div>
      ) : (
        <>
          <QuestionCard
            item={q}
            index={current}
            selected={selected}
            revealed={isRevealed}
            onSelect={handleSelect}
            showFeedback={false}
          />

          {isRevealed && (
            <FeedbackPanel item={q} isCorrect={selected === q.correctIndex} selectedIndex={selected} />
          )}

          <div className="flex justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={current === 0}
              className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 disabled:opacity-40 hover:border-gray-500"
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!isRevealed}
              className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40 hover:bg-violet-500"
            >
              {current >= total - 1 ? 'Finish quiz →' : 'Next →'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function QuestionCard({ item, index, selected, revealed, onSelect, showFeedback = true }) {
  const isCorrect = selected === item.correctIndex

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900/60 p-4 shadow-sm">
      <p className="text-sm font-medium text-white">
        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-600/30 text-xs text-violet-300">
          {index + 1}
        </span>
        {item.question}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {item.options.map((opt, i) => (
          <OptionButton
            key={opt.id}
            opt={opt}
            index={i}
            selected={selected}
            correctIndex={item.correctIndex}
            revealed={revealed}
            onSelect={onSelect}
            disabled={false}
          />
        ))}
      </div>
      {revealed && showFeedback && (
        <FeedbackPanel item={item} isCorrect={isCorrect} selectedIndex={selected} />
      )}
    </div>
  )
}
