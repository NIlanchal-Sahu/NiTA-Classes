import { useEffect, useState } from 'react'
import { studentPortalApi } from '../../api/student'

export default function Achievements() {
  const [mini, setMini] = useState(null)
  const [certs, setCerts] = useState([])
  const [certReqs, setCertReqs] = useState([])
  const [courseName, setCourseName] = useState('')
  useEffect(() => {
    ;(async () => {
      try {
        const [out, c] = await Promise.all([studentPortalApi.getMiniDashboard(), studentPortalApi.getCertificates()])
        setMini(out)
        setCerts(c.certificates || [])
        setCertReqs(c.requests || [])
      } catch {
        // ignore
      }
    })()
  }, [])
  return (
    <>
      <h1 className="text-2xl font-bold text-white">Achievements</h1>
      <p className="mt-1 text-gray-400">Track performance, unlock badges, and compete on leaderboard.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-xs text-gray-400">Attendance %</p>
          <p className="text-xl font-bold text-white">{mini?.attendancePercentage ?? 0}%</p>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-xs text-gray-400">Course Progress</p>
          <p className="text-xl font-bold text-white">{mini?.courseProgress ?? 0}%</p>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-xs text-gray-400">Rewards</p>
          <p className="text-xl font-bold text-white">₹{mini?.rewards ?? 0}</p>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-xs text-gray-400">Earned by Referring</p>
          <p className="text-xl font-bold text-white">₹{mini?.earnedByReferring ?? 0}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-xs text-gray-400">Competition Score</p>
          <p className="text-xl font-bold text-violet-300">{mini?.competitionScore ?? 0}</p>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-xs text-gray-400">Your Rank</p>
          <p className="text-xl font-bold text-white">{mini?.rank ? `#${mini.rank}` : '—'}</p>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-xs text-gray-400">Current Streak</p>
          <p className="text-xl font-bold text-amber-300">{mini?.currentStreak ?? 0} days</p>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-xs text-gray-400">Courses (Enrolled/Completed)</p>
          <p className="text-xl font-bold text-white">
            {mini?.enrolledCourseCount ?? 0}/{mini?.completedCourseCount ?? 0}
          </p>
        </div>
      </div>
      <div className="mt-3 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-300">
        Attendance Calculation: <span className="text-white">{mini?.classesPresentCount ?? 0}</span> present out of{' '}
        <span className="text-white">{mini?.classesConductedCount ?? 0}</span> classes conducted since course unlock.
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(mini?.achievementCards || []).map((a) => {
          const ratio = a.target ? Math.max(0, Math.min(100, Math.round((Number(a.progress || 0) / Number(a.target || 1)) * 100))) : 0
          return (
            <div key={a.id} className="rounded-xl border border-gray-700 bg-gray-800 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{a.title}</p>
                  <p className="mt-1 text-xs text-gray-400">{a.description}</p>
                </div>
                <span className="text-2xl">{a.icon || '🏆'}</span>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Progress</span>
                  <span>
                    {a.progress}/{a.target} {a.unit || ''}
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-gray-700">
                  <div className="h-full rounded-full bg-violet-600" style={{ width: `${ratio}%` }} />
                </div>
                <p className={`mt-2 text-xs ${a.achieved ? 'text-emerald-400' : 'text-amber-300'}`}>
                  {a.achieved ? 'Unlocked' : 'In Progress'}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 rounded-xl border border-gray-700 bg-gray-800 p-5">
        <h3 className="font-semibold text-white">Student Competition Leaderboard</h3>
        <p className="mt-1 text-sm text-gray-400">Compete by attending classes, completing courses, and maintaining streaks.</p>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="px-2 py-2">Rank</th>
                <th className="px-2 py-2">Student</th>
                <th className="px-2 py-2">Score</th>
                <th className="px-2 py-2">Classes</th>
                <th className="px-2 py-2">Attendance</th>
                <th className="px-2 py-2">Courses</th>
              </tr>
            </thead>
            <tbody>
              {(mini?.leaderboard || []).map((row) => (
                <tr key={row.userId} className="border-t border-gray-700 text-gray-300">
                  <td className="px-2 py-2 font-semibold text-violet-300">#{row.rank}</td>
                  <td className="px-2 py-2 text-white">{row.name}</td>
                  <td className="px-2 py-2">{row.points}</td>
                  <td className="px-2 py-2">{row.totalClasses}</td>
                  <td className="px-2 py-2">{row.attendancePct}%</td>
                  <td className="px-2 py-2">{row.enrolledCount}/{row.completedCount}</td>
                </tr>
              ))}
              {(mini?.leaderboard || []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-2 py-3 text-gray-500">
                    Leaderboard will appear as students attend classes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-gray-700 bg-gray-800 p-5">
        <h3 className="font-semibold text-white">Certificates</h3>
        <p className="mt-1 text-sm text-gray-400">Request certificate generation and download once generated.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="Completed course name"
            className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white"
          />
          <button
            type="button"
            onClick={async () => {
              if (!courseName.trim()) return
              await studentPortalApi.requestCertificate({ courseName: courseName.trim() })
              const c = await studentPortalApi.getCertificates()
              setCerts(c.certificates || [])
              setCertReqs(c.requests || [])
              setCourseName('')
            }}
            className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            Request Certificate
          </button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-gray-300">Completed / Generated</h4>
            <div className="mt-2 space-y-2">
              {certs.map((c) => (
                <div key={c.id} className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-sm">
                  <div className="text-white">{c.courseName}</div>
                  <div className="text-xs text-gray-400">Completed: {c.completionDate}</div>
                  <a href={c.pdfUrl} className="mt-1 inline-block text-xs text-violet-300 hover:underline">
                    Download PDF
                  </a>
                </div>
              ))}
              {certs.length === 0 && <p className="text-sm text-gray-500">No generated certificates yet.</p>}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-300">Requests</h4>
            <div className="mt-2 space-y-2">
              {certReqs.map((r) => (
                <div key={r.id} className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-sm">
                  <div className="text-white">{r.courseName}</div>
                  <div className="text-xs text-gray-400">Status: {r.status}</div>
                </div>
              ))}
              {certReqs.length === 0 && <p className="text-sm text-gray-500">No requests submitted.</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
