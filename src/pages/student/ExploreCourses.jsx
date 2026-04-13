import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { studentPortalApi } from '../../api/student'

/** Renders academy course description: section titles 【】, bullets •, paragraphs. */
function CourseDescriptionBody({ text }) {
  const lines = text.split('\n')
  const nodes = []
  let bulletAcc = []
  let key = 0
  const flushBullets = () => {
    if (bulletAcc.length === 0) return
    nodes.push(
      <ul key={`ul-${key++}`} className="mt-2 list-disc space-y-1.5 pl-5 text-gray-300">
        {bulletAcc.map((item, j) => (
          <li key={j}>{item}</li>
        ))}
      </ul>
    )
    bulletAcc = []
  }
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim()
    if (!t) continue
    if (t.startsWith('【')) {
      flushBullets()
      nodes.push(
        <p key={`sec-${key++}`} className="mt-4 font-semibold text-violet-200 first:mt-0">
          {t}
        </p>
      )
    } else if (t.startsWith('•')) {
      bulletAcc.push(t.replace(/^•\s*/, ''))
    } else {
      flushBullets()
      nodes.push(
        <p key={`p-${key++}`} className="mt-3 text-gray-300 first:mt-0">
          {t}
        </p>
      )
    }
  }
  flushBullets()
  return <div className="space-y-0">{nodes}</div>
}

export default function ExploreCourses() {
  const { user, refreshUser } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [unlockModal, setUnlockModal] = useState(null) // { id, name, unlockFee }
  const [infoModal, setInfoModal] = useState(null) // course object for details popup
  const walletBalance = Number(user?.walletBalance) || 0

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const out = await studentPortalApi.getCoursesLearning()
      setCourses(out.allCourses || [])
    } catch (e) {
      setError(e.message || 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const confirmUnlock = async () => {
    if (!unlockModal) return
    setError('')
    try {
      await studentPortalApi.unlockCourse(unlockModal.id, true)
      setUnlockModal(null)
      await refreshUser()
      await load()
    } catch (e) {
      setError(e.message || 'Unlock failed')
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Explore Courses</h1>
      <p className="mt-1 text-gray-400">Unlock courses using wallet balance.</p>
      <div className="mt-3 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-300">
        Wallet balance: <span className="font-semibold text-white">₹{walletBalance}</span>
      </div>
      {error && <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <div
            key={c.id}
            className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 transition hover:border-gray-600"
          >
            <div className="relative aspect-video bg-gray-700">
              {c.image ? (
                <img src={c.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-700/90 to-violet-900/95 text-5xl">
                  ✨
                </div>
              )}
              <span
                className={`absolute left-2 top-2 rounded px-2 py-1 text-xs font-medium text-white ${
                  c.unlocked ? 'bg-emerald-600/90' : 'bg-red-600/90'
                }`}
              >
                {c.unlocked ? 'UNLOCKED' : 'LOCKED'}
              </span>
              <button
                type="button"
                onClick={() => setInfoModal(c)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-gray-900/80 text-sm font-bold text-white shadow hover:bg-violet-600/90"
                aria-label={`Course info: ${c.name || c.title || c.id}`}
                title="Course info"
              >
                i
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-white line-clamp-2">{c.name || c.title}</h3>
              <div className="mt-1 text-sm text-gray-300">
                Unlock fee: <span className="font-semibold text-white">₹{Number(c.unlockFee) || 0}</span>
              </div>
              {!c.unlocked || c.status === 'locked' ? (
                <button
                  type="button"
                  onClick={() => setUnlockModal({ id: c.id, name: c.name || c.title, unlockFee: Number(c.unlockFee) || 0 })}
                  className="mt-3 inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
                >
                  Unlock
                </button>
              ) : c.status === 'completed' ? (
                <button
                  type="button"
                  onClick={async () => {
                    setError('')
                    try {
                      await studentPortalApi.renewCourse(c.id)
                      await refreshUser()
                      await load()
                    } catch (e) {
                      setError(e.message || 'Renewal failed')
                    }
                  }}
                  className="mt-3 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                >
                  Renew at 40% Off
                </button>
              ) : (
                <Link
                  to={`/student/course/${c.id}`}
                  className="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Open Course
                </Link>
              )}
            </div>
          </div>
        ))}
        {!loading && courses.length === 0 && (
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-4 text-sm text-gray-400">
            No courses available right now.
          </div>
        )}
      </div>

      {infoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">{infoModal.name || infoModal.title || 'Course'}</h3>
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="rounded-lg px-2 py-1 text-sm text-gray-400 hover:bg-gray-700 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-sm text-violet-300">
              Unlock fee: <span className="font-semibold text-white">₹{Number(infoModal.unlockFee) || 0}</span>
            </p>
            <div className="mt-4 text-sm leading-relaxed">
              {infoModal.description ? (
                <CourseDescriptionBody text={infoModal.description} />
              ) : (
                <p className="text-gray-300">Course details will appear here when provided by the academy.</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setInfoModal(null)}
              className="mt-6 w-full rounded-lg border border-gray-600 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700 sm:w-auto sm:px-6"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {unlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white">Unlock course?</h3>
            <p className="mt-2 text-sm text-gray-300">
              <span className="font-semibold text-white">{unlockModal.name}</span>
            </p>
            <p className="mt-2 text-sm text-amber-300">
              Course unlock fee ₹{unlockModal.unlockFee} will be deducted from wallet.
            </p>
            {walletBalance < unlockModal.unlockFee && (
              <p className="mt-2 text-sm text-red-300">
                Insufficient wallet balance. Please add balance first.
              </p>
            )}
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setUnlockModal(null)} className="flex-1 rounded-lg border border-gray-600 py-2.5 font-medium text-gray-300 hover:bg-gray-700">
                Cancel
              </button>
              {walletBalance < unlockModal.unlockFee ? (
                <Link
                  to="/student/pay"
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 text-center font-medium text-white hover:bg-blue-700"
                >
                  Add Balance
                </Link>
              ) : (
                <button type="button" onClick={confirmUnlock} className="flex-1 rounded-lg bg-violet-600 py-2.5 font-medium text-white hover:bg-violet-700">
                  Confirm Unlock
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

