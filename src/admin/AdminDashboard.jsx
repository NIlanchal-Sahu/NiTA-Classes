import { useEffect, useMemo, useState } from 'react'
import { academyApi } from '../api/adminAcademy'

function TinyBars({ data, color = 'bg-violet-500' }) {
  const entries = Object.entries(data || {}).sort((a, b) => a[0].localeCompare(b[0])).slice(-8)
  const max = Math.max(1, ...entries.map(([, v]) => Number(v) || 0))
  return (
    <div className="mt-4 space-y-2">
      {entries.map(([k, v]) => {
        const n = Number(v) || 0
        const pct = Math.max(4, Math.round((n / max) * 100))
        return (
          <div key={k}>
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span>{k}</span>
              <span>{n}</span>
            </div>
            <div className="mt-1 h-2 rounded bg-gray-700">
              <div className={`h-2 rounded ${color}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
      {entries.length === 0 && <div className="text-sm text-gray-500">No data yet.</div>}
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const courseRows = useMemo(() => Object.entries(data?.courseWiseStudents || {}).sort((a, b) => b[1] - a[1]), [data])
  const referralRows = useMemo(() => data?.admissionsAnalytics?.referralPerformance || [], [data])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const out = await academyApi.getDashboard()
        setData(out)
      } catch (e) {
        setError(e.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
      <p className="mt-1 text-gray-400">Student growth, revenue trend, and attendance performance.</p>

      {error && <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-200">{error}</div>}
      {loading && <div className="mt-6 text-gray-400">Loading...</div>}

      {data?.totals && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-gray-700 bg-gray-800 p-5">
            <div className="text-sm text-gray-400">Total Students</div>
            <div className="mt-1 text-2xl font-bold text-white">{data.totals.totalStudents}</div>
          </div>
          <div className="rounded-2xl border border-gray-700 bg-gray-800 p-5">
            <div className="text-sm text-gray-400">Active Batches</div>
            <div className="mt-1 text-2xl font-bold text-white">{data.totals.activeBatches}</div>
          </div>
          <div className="rounded-2xl border border-gray-700 bg-gray-800 p-5">
            <div className="text-sm text-gray-400">Revenue (Daily)</div>
            <div className="mt-1 text-2xl font-bold text-emerald-300">₹{data.totals.revenueDaily}</div>
          </div>
          <div className="rounded-2xl border border-gray-700 bg-gray-800 p-5">
            <div className="text-sm text-gray-400">Revenue (Monthly)</div>
            <div className="mt-1 text-2xl font-bold text-emerald-300">₹{data.totals.revenueMonthly}</div>
          </div>
          <div className="rounded-2xl border border-gray-700 bg-gray-800 p-5">
            <div className="text-sm text-gray-400">Attendance Rate</div>
            <div className="mt-1 text-2xl font-bold text-white">{data.totals.attendanceRate}%</div>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white">Student Growth 📈</h2>
          <TinyBars data={data?.studentGrowth || {}} color="bg-sky-500" />
        </div>
        <div className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white">Revenue Trend 💰</h2>
          <TinyBars data={data?.revenueTrend || {}} color="bg-emerald-500" />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Admissions Funnel & Conversion</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
            <div className="text-sm text-gray-400">Admissions Queue</div>
            <div className="mt-1 text-2xl font-bold text-white">{data?.admissionsAnalytics?.queueCount ?? 0}</div>
          </div>
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
            <div className="text-sm text-gray-400">Active Students</div>
            <div className="mt-1 text-2xl font-bold text-white">{data?.admissionsAnalytics?.activeStudents ?? 0}</div>
          </div>
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
            <div className="text-sm text-gray-400">Conversion Rate</div>
            <div className="mt-1 text-2xl font-bold text-emerald-300">{data?.admissionsAnalytics?.conversionRate ?? 0}%</div>
          </div>
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
            <div className="text-sm text-gray-400">Top Referral Code</div>
            <div className="mt-1 text-lg font-bold text-white">{referralRows[0]?.code || '—'}</div>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-gray-700 bg-gray-900 p-4">
          <h3 className="text-sm font-semibold text-white">Referral Performance</h3>
          <div className="mt-2 space-y-2">
            {referralRows.map((r) => (
              <div key={r.code} className="flex items-center justify-between text-sm text-gray-300">
                <span>{r.code}</span>
                <span className="font-semibold text-white">{r.count}</span>
              </div>
            ))}
            {referralRows.length === 0 && <p className="text-sm text-gray-500">No referral activity yet.</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Course-wise Students</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {courseRows.map(([course, count]) => (
            <div key={course} className="rounded-xl border border-gray-700 bg-gray-900 p-4">
              <div className="text-sm text-gray-400">{course}</div>
              <div className="mt-1 text-2xl font-bold text-white">{count}</div>
            </div>
          ))}
          {courseRows.length === 0 && <div className="text-sm text-gray-500">No course-wise data yet.</div>}
        </div>
      </div>
    </div>
  )
}

