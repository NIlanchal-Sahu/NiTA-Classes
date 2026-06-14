import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { studentPortalApi } from '../../api/student'

function AchievementCard({ a }) {
  const ratio = a.target
    ? Math.max(0, Math.min(100, Math.round((Number(a.progress || 0) / Number(a.target || 1)) * 100)))
    : 0
  const statusLabel = a.achieved ? 'Unlocked ✓' : a.locked ? 'Locked — complete previous tier' : 'Chasing…'
  const statusClass = a.achieved ? 'text-emerald-400' : a.locked ? 'text-gray-500' : 'text-amber-300'

  return (
    <div
      className={`rounded-xl border p-5 transition ${
        a.achieved
          ? 'border-emerald-500/40 bg-emerald-950/20'
          : a.locked
            ? 'border-gray-800 bg-gray-900/50 opacity-60'
            : 'border-violet-500/30 bg-gray-800'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-white">{a.title}</p>
            {a.tier && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                  a.tier === 'Gold'
                    ? 'bg-amber-500/20 text-amber-300'
                    : a.tier === 'Silver'
                      ? 'bg-gray-500/20 text-gray-300'
                      : 'bg-orange-700/20 text-orange-300'
                }`}
              >
                {a.tier}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-400">{a.description}</p>
          <p className="mt-1 text-[11px] font-medium text-violet-300/90">+{a.points} pts when unlocked</p>
        </div>
        <span className="text-2xl">{a.icon || '🏆'}</span>
      </div>
      {!a.locked && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Progress</span>
            <span>
              {a.progress}/{a.target} {a.unit || ''}
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-gray-700">
            <div
              className={`h-full rounded-full ${a.achieved ? 'bg-emerald-500' : 'bg-violet-600'}`}
              style={{ width: `${ratio}%` }}
            />
          </div>
        </div>
      )}
      <p className={`mt-2 text-xs font-semibold ${statusClass}`}>{statusLabel}</p>
    </div>
  )
}

function LeaderboardTable({ rows }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400">
            <th className="px-2 py-2">Rank</th>
            <th className="px-2 py-2">Student</th>
            <th className="px-2 py-2">Score</th>
            <th className="px-2 py-2">Badges</th>
            <th className="px-2 py-2">Classes</th>
            <th className="px-2 py-2">Attendance</th>
            <th className="px-2 py-2">Streak</th>
            <th className="px-2 py-2">Referrals</th>
            <th className="px-2 py-2">Courses</th>
          </tr>
        </thead>
        <tbody>
          {(rows || []).map((row) => (
            <tr key={row.userId} className="border-t border-gray-700 text-gray-300">
              <td className="px-2 py-2 font-semibold text-violet-300">#{row.rank}</td>
              <td className="px-2 py-2 text-white">{row.name}</td>
              <td className="px-2 py-2 font-semibold text-violet-200">{row.points}</td>
              <td className="px-2 py-2">
                <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs text-gray-200">
                  {row.achievementCount ?? row.badges?.length ?? 0}
                </span>
                {row.badges?.length > 0 && (
                  <span className="ml-1 text-[10px] text-gray-500" title={row.badges.join(', ')}>
                    {row.badges.slice(0, 2).join(', ')}
                    {row.badges.length > 2 ? '…' : ''}
                  </span>
                )}
              </td>
              <td className="px-2 py-2">{row.totalClasses}</td>
              <td className="px-2 py-2">{row.attendancePct}%</td>
              <td className="px-2 py-2">{row.streak ?? 0}d</td>
              <td className="px-2 py-2">{row.referralsCount ?? 0}</td>
              <td className="px-2 py-2">
                {row.enrolledCount}/{row.completedCount}
              </td>
            </tr>
          ))}
          {(rows || []).length === 0 && (
            <tr>
              <td colSpan={9} className="px-2 py-3 text-gray-500">
                Leaderboard will appear as students unlock achievements.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default function Achievements() {
  const [mini, setMini] = useState(null)
  const [certs, setCerts] = useState([])
  const [certReqs, setCertReqs] = useState([])
  const [courseName, setCourseName] = useState('')
  const [period, setPeriod] = useState('all')

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

  const isMonth = period === 'month'
  const cards = isMonth ? mini?.achievementCardsMonth || [] : mini?.achievementCards || []
  const scoreBreakdown = isMonth ? mini?.scoreBreakdownMonth || [] : mini?.scoreBreakdown || []
  const leaderboard = isMonth ? mini?.leaderboardMonth || [] : mini?.leaderboard || []
  const competitionScore = isMonth ? mini?.competitionScoreMonth ?? 0 : mini?.competitionScore ?? 0
  const rank = isMonth ? mini?.rankMonth : mini?.rank
  const unlocked = isMonth ? mini?.achievementsUnlockedMonth ?? 0 : mini?.achievementsUnlocked ?? 0

  const monthTabLabel = mini?.currentMonthLabel ? `This Month (${mini.currentMonthLabel})` : 'This Month'

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Achievements</h1>
      <p className="mt-1 text-gray-400">
        One active goal per category — complete Bronze to unlock Silver, then Gold. Points stack for each tier earned.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setPeriod('all')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            !isMonth ? 'bg-violet-600 text-white' : 'border border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All Time
        </button>
        <button
          type="button"
          onClick={() => setPeriod('month')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            isMonth ? 'bg-violet-600 text-white' : 'border border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {monthTabLabel}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-violet-500/30 bg-violet-950/30 p-4">
          <p className="text-xs text-gray-400">{isMonth ? 'Monthly Score' : 'All-Time Score'}</p>
          <p className="text-2xl font-bold text-violet-300">{competitionScore}</p>
          <p className="mt-1 text-[11px] text-gray-500">
            {unlocked} tiers completed · {cards.length} goals in chase
          </p>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-xs text-gray-400">{isMonth ? 'Monthly Rank' : 'All-Time Rank'}</p>
          <p className="text-2xl font-bold text-white">{rank ? `#${rank}` : '—'}</p>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-xs text-gray-400">Attendance</p>
          <p className="text-2xl font-bold text-white">
            {isMonth ? mini?.attendancePercentageMonth ?? 0 : mini?.attendancePercentage ?? 0}%
          </p>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-xs text-gray-400">Class Streak</p>
          <p className="text-2xl font-bold text-amber-300">
            {isMonth ? mini?.currentStreakMonth ?? 0 : mini?.currentStreak ?? 0}
          </p>
          <p className="text-[10px] text-gray-500">school days (Sun & Odisha holidays excluded)</p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-xs text-gray-400">Classes attended</p>
          <p className="text-xl font-bold text-white">
            {isMonth ? mini?.totalClassesAttendedMonth ?? 0 : mini?.totalClassesAttended ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-xs text-gray-400">Courses (enrolled / done)</p>
          <p className="text-xl font-bold text-white">
            {mini?.enrolledCourseCount ?? 0}/{mini?.completedCourseCount ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-xs text-gray-400">Friends referred</p>
          <p className="text-xl font-bold text-emerald-300">
            {isMonth ? mini?.referralsCountMonth ?? 0 : mini?.referralsCount ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
          <p className="text-xs text-gray-400">Referral rewards</p>
          <p className="text-xl font-bold text-white">₹{mini?.earnedByReferring ?? 0}</p>
        </div>
      </div>

      {!isMonth && (
        <div className="mt-3 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-300">
          Attendance: <span className="text-white">{mini?.classesPresentCount ?? 0}</span> present out of{' '}
          <span className="text-white">{mini?.classesConductedCount ?? 0}</span> classes since course unlock.
          {' · '}
          <Link to="/student/referrals" className="text-violet-300 hover:underline">
            Refer friends to earn Growth Guide badges →
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((a) => (
          <AchievementCard key={a.id} a={a} />
        ))}
        {cards.length === 0 && (
          <p className="text-sm text-gray-500">Achievement goals will appear once you start learning.</p>
        )}
      </div>

      {scoreBreakdown.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-700 bg-gray-800/60 p-4">
          <h3 className="text-sm font-semibold text-white">How your score is calculated</h3>
          <p className="mt-1 text-xs text-gray-400">
            Full points per tier when unlocked; up to 25% partial credit on your active chase tier only; small activity
            bonuses for classes, streaks, and referrals.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {scoreBreakdown.map((row) => (
              <span
                key={row.id}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  row.achieved
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : row.locked
                      ? 'bg-gray-800 text-gray-600'
                      : 'bg-gray-700 text-gray-400'
                }`}
              >
                {row.title}: +{row.earned}/{row.points}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-xl border border-gray-700 bg-gray-800 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-white">Student Competition Leaderboard</h3>
            <p className="mt-1 text-sm text-gray-400">
              {isMonth
                ? `Rankings for ${mini?.currentMonthLabel || 'this month'} — same tier rules, monthly progress.`
                : 'All-time rankings — tier badges stack as you hit each milestone.'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPeriod('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                !isMonth ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => setPeriod('month')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                isMonth ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              This Month
            </button>
          </div>
        </div>
        <LeaderboardTable rows={leaderboard} />
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
