import { useCallback, useEffect, useMemo, useState } from 'react'
import { academyApi } from '../api/adminAcademy'

function StatCard({ label, value, sub, accent = 'violet' }) {
  const ring =
    accent === 'emerald'
      ? 'border-emerald-500/30 bg-emerald-500/10'
      : accent === 'amber'
        ? 'border-amber-500/30 bg-amber-500/10'
        : accent === 'rose'
          ? 'border-rose-500/30 bg-rose-500/10'
          : 'border-violet-500/30 bg-violet-500/10'
  return (
    <div className={`rounded-xl border p-4 ${ring}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {sub ? <p className="mt-1 text-xs text-gray-400">{sub}</p> : null}
    </div>
  )
}

function BarChart({ rows, labelKey, valueKey, maxValue, barClass = 'bg-violet-500', suffix = '' }) {
  const max = maxValue || Math.max(1, ...rows.map((r) => Number(r[valueKey]) || 0))
  return (
    <div className="space-y-2">
      {rows.map((row) => {
        const val = Number(row[valueKey]) || 0
        const width = max ? Math.round((val / max) * 100) : 0
        return (
          <div key={String(row[labelKey]) + String(row.month || '')}>
            <div className="flex justify-between text-[11px] text-gray-400">
              <span className="truncate pr-2">{row[labelKey]}</span>
              <span>
                {val}
                {suffix}
              </span>
            </div>
            <div className="mt-1 h-2 rounded bg-gray-800">
              <div className={`h-2 rounded ${barClass}`} style={{ width: `${width}%` }} />
            </div>
          </div>
        )
      })}
      {rows.length === 0 && <p className="text-xs text-gray-500">No data yet.</p>}
    </div>
  )
}

function dayCellClass(status) {
  if (status === 'present') return 'bg-emerald-600/30 border-emerald-500'
  if (status === 'absent') return 'bg-red-600/30 border-red-500'
  if (status === 'off') return 'bg-amber-600/20 border-amber-500/60'
  return 'bg-gray-900 border-gray-700'
}

export default function AdminAttendance() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [courseId, setCourseId] = useState('')
  const [batchId, setBatchId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [status, setStatus] = useState('present')
  const [unlockedOnly, setUnlockedOnly] = useState(false)

  const [dashboard, setDashboard] = useState(null)
  const [report, setReport] = useState([])
  const [records, setRecords] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [offDays, setOffDays] = useState([])
  const [batches, setBatches] = useState([])
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])

  const [holidayDate, setHolidayDate] = useState(new Date().toISOString().slice(0, 10))
  const [holidayNote, setHolidayNote] = useState('')

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s])), [students])
  const batchMap = useMemo(() => new Map(batches.map((b) => [b.id, b])), [batches])
  const courseMap = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses])

  const markStudents = useMemo(
    () => (batchId ? students.filter((s) => (s.batchIds || [s.batchId]).filter(Boolean).includes(batchId) || s.batchId === batchId) : students),
    [students, batchId],
  )

  const batchStats = useMemo(() => {
    if (!batchId || !dashboard?.batchBreakdown) return null
    return dashboard.batchBreakdown.find((b) => String(b.batchId) === String(batchId)) || null
  }, [dashboard, batchId])

  const selectedStudentStats = useMemo(() => {
    if (!selectedStudentId || !dashboard?.studentStats) return null
    return dashboard.studentStats.find((s) => String(s.studentId) === String(selectedStudentId)) || null
  }, [dashboard, selectedStudentId])

  const filterQuery = useMemo(() => {
    return [
      `month=${encodeURIComponent(month)}`,
      courseId ? `courseId=${encodeURIComponent(courseId)}` : '',
      batchId ? `batchId=${encodeURIComponent(batchId)}` : '',
      selectedStudentId ? `studentId=${encodeURIComponent(selectedStudentId)}` : '',
      unlockedOnly ? 'unlockedOnly=true' : '',
    ]
      .filter(Boolean)
      .join('&')
  }, [month, courseId, batchId, selectedStudentId, unlockedOnly])

  const loadCore = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const listQ = [
        `month=${encodeURIComponent(month)}`,
        date ? `date=${encodeURIComponent(date)}` : '',
        courseId ? `courseId=${encodeURIComponent(courseId)}` : '',
        batchId ? `batchId=${encodeURIComponent(batchId)}` : '',
        unlockedOnly ? 'unlockedOnly=true' : '',
      ]
        .filter(Boolean)
        .join('&')

      const [dash, rep, att, b, s, c, off] = await Promise.all([
        academyApi.getAttendanceDashboard(filterQuery),
        academyApi.getMonthlyAttendanceReport(filterQuery),
        academyApi.getAttendance(listQ),
        academyApi.getBatches(),
        academyApi.getStudents(),
        academyApi.getCourses(),
        academyApi.getAttendanceOffDays(`month=${encodeURIComponent(month)}`),
      ])
      setDashboard(dash)
      setReport(rep.report || [])
      setRecords(att.attendance || [])
      setBatches(b.batches || [])
      setStudents(s.students || [])
      setCourses(c.courses || [])
      setOffDays(off.offDays || [])
    } catch (e) {
      setError(e.message || 'Failed to load attendance data')
    } finally {
      setLoading(false)
    }
  }, [month, date, courseId, batchId, unlockedOnly, filterQuery])

  const loadAnalytics = useCallback(async (id) => {
    if (!id) {
      setAnalytics(null)
      return
    }
    try {
      const out = await academyApi.getStudentAttendanceAnalytics(id, `month=${encodeURIComponent(month)}`)
      setAnalytics(out)
    } catch (e) {
      setError(e.message || 'Failed to load student analytics')
    }
  }, [month])

  useEffect(() => {
    loadCore()
  }, [loadCore])

  useEffect(() => {
    loadAnalytics(selectedStudentId)
  }, [selectedStudentId, loadAnalytics])

  useEffect(() => {
    const q = studentSearch.trim()
    if (q.length < 2) {
      setSearchResults([])
      return undefined
    }
    const timer = setTimeout(async () => {
      try {
        const out = await academyApi.searchAttendanceStudents(q)
        setSearchResults(out.students || [])
      } catch {
        setSearchResults([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [studentSearch])

  const mark = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await academyApi.markAttendance({ date, batchId, studentId, status })
      setSelectedStudentId(studentId)
      await loadCore()
      await loadAnalytics(studentId)
    } catch (e1) {
      setError(e1.message || 'Failed to mark attendance')
    } finally {
      setSaving(false)
    }
  }

  const markHoliday = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await academyApi.markAttendanceOffDay({ date: holidayDate, note: holidayNote })
      setHolidayNote('')
      await loadCore()
      if (selectedStudentId) await loadAnalytics(selectedStudentId)
    } catch (e1) {
      setError(e1.message || 'Failed to mark holiday')
    } finally {
      setSaving(false)
    }
  }

  const removeHoliday = async (d) => {
    setSaving(true)
    setError('')
    try {
      await academyApi.deleteAttendanceOffDay(d)
      await loadCore()
      if (selectedStudentId) await loadAnalytics(selectedStudentId)
    } catch (e1) {
      setError(e1.message || 'Failed to remove holiday')
    } finally {
      setSaving(false)
    }
  }

  const lowAttendance = useMemo(() => report.filter((r) => r.percentage < 75), [report])

  const overall = dashboard?.overall || {
    studentCount: 0,
    conducted: 0,
    attended: 0,
    absent: 0,
    percentage: 0,
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Attendance Dashboard</h1>
      <p className="mt-1 text-gray-400">
        Attendance % uses school days since admission — excluding Sundays, Odisha holidays, and admin off days.
        Paying for class/LAB (₹10 wallet or VVIP) marks present automatically; unpaid school days count as absent.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true)
            setError('')
            try {
              const out = await academyApi.syncWalletAttendance()
              await loadCore()
              if (selectedStudentId) await loadAnalytics(selectedStudentId)
              setError('')
              alert(`Wallet sync done. ${out.synced ?? 0} present record(s) updated.`)
            } catch (e) {
              setError(e.message || 'Sync failed')
            } finally {
              setSaving(false)
            }
          }}
          className="rounded-lg border border-violet-500/40 bg-violet-950/40 px-3 py-1.5 text-xs font-semibold text-violet-200 hover:bg-violet-900/50 disabled:opacity-50"
        >
          Sync wallet payments → academy records
        </button>
      </div>
      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>
      )}
      {loading && <div className="mt-4 text-gray-400">Loading…</div>}

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Filters</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="block text-sm font-medium text-gray-300">Month</label>
            <input
              type="month"
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Course</label>
            <select
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">All courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Batch</label>
            <select
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
            >
              <option value="">All batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Focus student</label>
            <select
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">All students</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.phone || s.id})
                </option>
              ))}
            </select>
          </div>
          <label className="mt-7 inline-flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={unlockedOnly} onChange={(e) => setUnlockedOnly(e.target.checked)} />
            Unlocked courses only
          </label>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={selectedStudentId ? 'Student attendance %' : batchId ? 'Batch attendance %' : 'Overall attendance %'}
          value={`${selectedStudentStats?.percentage ?? batchStats?.percentage ?? overall.percentage}%`}
          sub={`${selectedStudentStats?.attended ?? batchStats?.attended ?? overall.attended} attended / ${selectedStudentStats?.conducted ?? batchStats?.conducted ?? overall.conducted} class days`}
          accent="emerald"
        />
        <StatCard
          label="Classes conducted"
          value={selectedStudentStats?.conducted ?? batchStats?.conducted ?? overall.conducted}
          sub="Eligible school days in period"
        />
        <StatCard
          label="Classes attended"
          value={selectedStudentStats?.attended ?? batchStats?.attended ?? overall.attended}
          sub="Marked present"
          accent="emerald"
        />
        <StatCard
          label="Absent / unmarked"
          value={`${selectedStudentStats?.absent ?? batchStats?.absent ?? overall.absent} / ${selectedStudentStats?.unmarked ?? batchStats?.unmarked ?? overall.unmarked}`}
          sub={`${selectedStudentStats ? 1 : batchStats?.studentCount ?? overall.studentCount} student(s) in view`}
          accent="rose"
        />
      </div>

      {!batchId && !selectedStudentId && (dashboard?.batchBreakdown || []).length > 0 && (
        <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white">Batch-wise summary</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-gray-300">
                <tr>
                  <th className="px-3 py-3">Batch</th>
                  <th className="px-3 py-3">Students</th>
                  <th className="px-3 py-3">Conducted</th>
                  <th className="px-3 py-3">Attended</th>
                  <th className="px-3 py-3">Absent</th>
                  <th className="px-3 py-3">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 text-gray-200">
                {dashboard.batchBreakdown.map((b) => (
                  <tr key={b.batchId}>
                    <td className="px-3 py-3">{b.batchName}</td>
                    <td className="px-3 py-3">{b.studentCount}</td>
                    <td className="px-3 py-3">{b.conducted}</td>
                    <td className="px-3 py-3">{b.attended}</td>
                    <td className="px-3 py-3">{b.absent}</td>
                    <td className={`px-3 py-3 ${b.percentage < 75 ? 'text-rose-300' : 'text-emerald-300'}`}>
                      {b.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white">Search student</h2>
          <p className="mt-1 text-xs text-gray-400">Search by name or contact number to view detailed attendance.</p>
          <input
            className="mt-3 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            placeholder="Name or mobile number…"
          />
          <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
            {searchResults.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSelectedStudentId(s.id)
                  setStudentSearch(`${s.name} (${s.phone || s.id})`)
                }}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-left text-sm text-gray-200 hover:border-violet-500/40 hover:bg-gray-700"
              >
                <span className="font-medium text-white">{s.name}</span>
                <span className="text-gray-400"> · {s.phone || '—'} · Admitted {String(s.admissionDate || '').slice(0, 10)}</span>
              </button>
            ))}
            {studentSearch.trim().length >= 2 && searchResults.length === 0 && (
              <p className="text-sm text-gray-500">No students found.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-900/10 p-6">
          <h2 className="text-lg font-semibold text-white">Mark admin off day</h2>
          <p className="mt-1 text-xs text-gray-400">Excluded from class-day count along with Sundays and Odisha holidays.</p>
          <form onSubmit={markHoliday} className="mt-4 space-y-3">
            <input
              type="date"
              className="w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              value={holidayDate}
              onChange={(e) => setHolidayDate(e.target.value)}
              required
            />
            <input
              className="w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              value={holidayNote}
              onChange={(e) => setHolidayNote(e.target.value)}
              placeholder="Note (e.g. Institute closed — exam duty)"
              required
            />
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              Mark as holiday
            </button>
          </form>
          <div className="mt-4 space-y-2">
            {offDays.map((d) => (
              <div
                key={d.date}
                className="flex items-start justify-between gap-2 rounded-lg border border-amber-500/20 bg-gray-900 px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium text-amber-200">{d.date}</span>
                  <span className="text-gray-300"> — {d.note}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeHoliday(d.date)}
                  className="shrink-0 text-xs text-red-300 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
            {offDays.length === 0 && <p className="text-xs text-gray-500">No admin off days this month.</p>}
          </div>
        </div>
      </div>

      {analytics && (
        <div className="mt-6 rounded-2xl border border-violet-500/30 bg-violet-950/20 p-6">
          <h2 className="text-lg font-semibold text-white">
            {analytics.student.name} — attendance profile
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Admitted {analytics.lifetime.admissionDate} · Phone {analytics.student.phone || '—'}
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Lifetime %"
              value={`${analytics.lifetime.percentage}%`}
              sub={`${analytics.lifetime.attended}/${analytics.lifetime.conducted} class days`}
              accent="emerald"
            />
            <StatCard
              label={`${month} %`}
              value={`${analytics.monthly?.percentage ?? 0}%`}
              sub={`${analytics.monthly?.attended ?? 0}/${analytics.monthly?.conducted ?? 0} this month`}
            />
            <StatCard label="Lifetime absent" value={analytics.lifetime.absent} accent="rose" />
            <StatCard label="Unmarked days" value={analytics.lifetime.unmarked} accent="amber" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
              <h3 className="text-sm font-semibold text-white">6-month attendance %</h3>
              <div className="mt-3">
                <BarChart
                  rows={(analytics.monthlyTrend || []).map((r) => ({
                    month: r.month,
                    label: r.month,
                    pct: r.percentage,
                  }))}
                  labelKey="label"
                  valueKey="pct"
                  barClass="bg-emerald-500"
                  suffix="%"
                />
              </div>
            </div>
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
              <h3 className="text-sm font-semibold text-white">Course-wise attendance</h3>
              <div className="mt-3">
                <BarChart
                  rows={(analytics.courses || []).map((c) => ({
                    label: c.courseName || c.courseId,
                    attended: c.attended,
                    conducted: c.conducted,
                    pct: c.percentage,
                  }))}
                  labelKey="label"
                  valueKey="pct"
                  barClass="bg-violet-500"
                  suffix="%"
                />
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="text-gray-400">
                    <tr>
                      <th className="px-2 py-2">Course</th>
                      <th className="px-2 py-2">Conducted</th>
                      <th className="px-2 py-2">Attended</th>
                      <th className="px-2 py-2">%</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-200">
                    {(analytics.courses || []).map((c) => (
                      <tr key={c.courseId}>
                        <td className="px-2 py-2">{c.courseName || c.courseId}</td>
                        <td className="px-2 py-2">{c.conducted}</td>
                        <td className="px-2 py-2">{c.attended}</td>
                        <td className="px-2 py-2">{c.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-gray-700 bg-gray-900 p-4">
            <h3 className="text-sm font-semibold text-white">Calendar — {month}</h3>
            <p className="mt-1 text-xs text-gray-400">
              Green = present · Red = absent · Amber = holiday/off · Gray = before admission or future
            </p>
            <div className="mt-3 grid grid-cols-7 gap-2">
              {(analytics.dailyTrend || []).map((d) => (
                <div
                  key={d.date}
                  title={d.holiday?.name || d.status}
                  className={`rounded border p-2 text-center text-xs ${dayCellClass(d.status)}`}
                >
                  <div className="text-gray-300">{d.date.slice(-2)}</div>
                  <div className="mt-1 text-[10px] capitalize text-white">
                    {d.status === 'off' ? 'off' : d.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Mark daily attendance</h2>
        <form onSubmit={mark} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="date"
            className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <select
            className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            required
          >
            <option value="">Select batch</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.monthYear})
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          >
            <option value="">Select student</option>
            {markStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.id})
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
          <button
            disabled={saving}
            className="btn-touch rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Mark'}
          </button>
        </form>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Monthly report (school-day based)</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-gray-300">
              <tr>
                <th className="px-3 py-3">Student</th>
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">Conducted</th>
                <th className="px-3 py-3">Attended</th>
                <th className="px-3 py-3">Absent</th>
                <th className="px-3 py-3">Unmarked</th>
                <th className="px-3 py-3">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-gray-200">
              {report.map((r) => (
                <tr key={r.studentId}>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      className="text-left text-violet-300 hover:underline"
                      onClick={() => setSelectedStudentId(r.studentId)}
                    >
                      {r.name || r.studentId}
                    </button>
                  </td>
                  <td className="px-3 py-3">{r.phone || '—'}</td>
                  <td className="px-3 py-3">{r.conducted ?? r.total}</td>
                  <td className="px-3 py-3">{r.attended ?? r.present}</td>
                  <td className="px-3 py-3">{r.absent}</td>
                  <td className="px-3 py-3">{r.unmarked ?? '—'}</td>
                  <td className={`px-3 py-3 ${r.percentage < 75 ? 'text-rose-300' : ''}`}>{r.percentage}%</td>
                </tr>
              ))}
              {report.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-gray-500">
                    No students in scope for this month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Daily records</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-gray-300">
              <tr>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Course</th>
                <th className="px-3 py-3">Batch</th>
                <th className="px-3 py-3">Student</th>
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-gray-200">
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-3">{r.date}</td>
                  <td className="px-3 py-3">
                    {courseMap.get(r.courseId)?.name || r.courseId || batchMap.get(r.batchId)?.courseId || '—'}
                  </td>
                  <td className="px-3 py-3">{batchMap.get(r.batchId)?.name || r.batchId}</td>
                  <td className="px-3 py-3">{studentMap.get(r.studentId)?.name || r.studentId}</td>
                  <td className="px-3 py-3">{studentMap.get(r.studentId)?.phone || '—'}</td>
                  <td className="px-3 py-3">{r.status}</td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-gray-500">
                    No records for selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-rose-700/40 bg-rose-900/10 p-6">
        <h2 className="text-lg font-semibold text-rose-200">Students below 75%</h2>
        <div className="mt-3 space-y-2">
          {lowAttendance.map((s) => (
            <button
              key={s.studentId}
              type="button"
              onClick={() => setSelectedStudentId(s.studentId)}
              className="block w-full rounded-lg border border-rose-700/30 bg-gray-900 px-3 py-2 text-left text-sm text-gray-200 hover:border-rose-500/50"
            >
              {s.name || s.studentId} · {s.phone || '—'} · {s.percentage}% ({s.attended}/{s.conducted})
            </button>
          ))}
          {lowAttendance.length === 0 && (
            <p className="text-sm text-gray-400">No students below 75% for current filters.</p>
          )}
        </div>
      </div>
    </div>
  )
}
