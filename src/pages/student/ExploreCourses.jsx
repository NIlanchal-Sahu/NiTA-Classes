import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { studentPortalApi } from '../../api/student'

export default function ExploreCourses() {
  const { user, refreshUser } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [unlockModal, setUnlockModal] = useState(null) // { id, name, unlockFee }
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
              <img src={c.image} alt="" className="h-full w-full object-cover" />
              <span
                className={`absolute left-2 top-2 rounded px-2 py-1 text-xs font-medium text-white ${
                  c.unlocked ? 'bg-emerald-600/90' : 'bg-red-600/90'
                }`}
              >
                {c.unlocked ? 'UNLOCKED' : 'LOCKED'}
              </span>
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

