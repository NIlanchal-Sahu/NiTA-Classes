import { useEffect, useMemo, useState } from 'react'
import { academyApi } from '../api/adminAcademy'

function monthDays(month) {
  const [y, m] = String(month).split('-').map(Number)
  const total = new Date(y, m, 0).getDate()
  return Array.from({ length: total }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`)
}

function chartMax(rows, key) {
  return Math.max(1, ...rows.map((x) => Number(x[key]) || 0))
}

export default function AdminAttendance() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [courseId, setCourseId] = useState('')
  const [batchId, setBatchId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [mobileSearch, setMobileSearch] = useState('')
  const [unlockedOnly, setUnlockedOnly] = useState(false)
  const [calendarStudentId, setCalendarStudentId] = useState('')
  const [status, setStatus] = useState('present')
  const [report, setReport] = useState([])
  const [records, setRecords] = useState([])
  const [batches, setBatches] = useState([])
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s])), [students])
  const batchMap = useMemo(() => new Map(batches.map((b) => [b.id, b])), [batches])
  const courseMap = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses])

  const markStudents = useMemo(
    () => (batchId ? students.filter((s) => s.batchId === batchId) : students),
    [students, batchId]
  )

  const searchResults = useMemo(() => {
    const m = String(mobileSearch || '').replace(/\D/g, '').slice(-10)
    if (!m) return []
    return students.filter((s) => String(s.phone || '').replace(/\D/g, '').slice(-10).includes(m))
  }, [students, mobileSearch])

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const q = [
        `month=${encodeURIComponent(month)}`,
        date ? `date=${encodeURIComponent(date)}` : '',
        courseId ? `courseId=${encodeURIComponent(courseId)}` : '',
        batchId ? `batchId=${encodeURIComponent(batchId)}` : '',
        mobileSearch ? `mobile=${encodeURIComponent(mobileSearch)}` : '',
        `unlockedOnly=${unlockedOnly ? 'true' : 'false'}`,
      ]
        .filter(Boolean)
        .join('&')
      const monthlyQ = [
        `month=${encodeURIComponent(month)}`,
        courseId ? `courseId=${encodeURIComponent(courseId)}` : '',
        batchId ? `batchId=${encodeURIComponent(batchId)}` : '',
        mobileSearch ? `mobile=${encodeURIComponent(mobileSearch)}` : '',
        `unlockedOnly=${unlockedOnly ? 'true' : 'false'}`,
      ]
        .filter(Boolean)
        .join('&')
      const [att, rep, b, s, c] = await Promise.all([
        academyApi.getAttendance(q),
        academyApi.getMonthlyAttendanceReport(monthlyQ),
        academyApi.getBatches(),
        academyApi.getStudents(),
        academyApi.getCourses(),
      ])
      setRecords(att.attendance || [])
      setReport(rep.report || [])
      setBatches(b.batches || [])
      setStudents(s.students || [])
      setCourses(c.courses || [])
      if (!calendarStudentId) setCalendarStudentId(studentId || '')
    } catch (e) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, date, courseId, batchId, mobileSearch, unlockedOnly])

  const mark = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await academyApi.markAttendance({ date, batchId, studentId, status })
      setCalendarStudentId(studentId)
      await refresh()
    } catch (e1) {
      setError(e1.message || 'Failed to mark attendance')
    } finally {
      setSaving(false)
    }
  }

  const dailyTrend = useMemo(() => {
    const byDay = {}
    for (const d of monthDays(month)) byDay[d] = { date: d, present: 0, absent: 0 }
    for (const r of records) {
      const d = String(r.date || '').slice(0, 10)
      if (!byDay[d]) continue
      byDay[d][r.status] = (byDay[d][r.status] || 0) + 1
    }
    return Object.values(byDay)
  }, [records, month])

  const courseTrend = useMemo(() => {
    const map = {}
    for (const r of records) {
      const cid = String(r.courseId || batchMap.get(r.batchId)?.courseId || 'unassigned')
      if (!map[cid]) map[cid] = { courseId: cid, present: 0, absent: 0, total: 0 }
      map[cid].total += 1
      map[cid][r.status] = (map[cid][r.status] || 0) + 1
    }
    return Object.values(map).map((x) => ({
      ...x,
      percentage: x.total ? Math.round((x.present / x.total) * 100) : 0,
    }))
  }, [records, batchMap])

  const calendarStatus = useMemo(() => {
    const m = {}
    if (!calendarStudentId) return m
    for (const r of records) {
      if (String(r.studentId) !== String(calendarStudentId)) continue
      m[String(r.date).slice(0, 10)] = r.status
    }
    return m
  }, [records, calendarStudentId])

  const lowAttendance = useMemo(() => report.filter((r) => r.percentage < 75), [report])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Attendance Management</h1>
      <p className="mt-1 text-gray-400">View all attendance in one place with course/month/batch/mobile filters and trends.</p>
      {error && <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-200">{error}</div>}
      {loading && <div className="mt-6 text-gray-400">Loading...</div>}

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Filters Panel</h2>
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
            <select className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              <option value="">All courses</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Batch</label>
            <select className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={batchId} onChange={(e) => setBatchId(e.target.value)}>
              <option value="">All batches</option>
              {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Student Mobile</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              placeholder="Search by mobile number"
            />
          </div>
          <label className="mt-7 inline-flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={unlockedOnly} onChange={(e) => setUnlockedOnly(e.target.checked)} />
            Unlocked courses only
          </label>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Student Search</h2>
        <p className="mt-1 text-xs text-gray-400">Search by mobile number and pick a student for calendar view.</p>
        <div className="mt-3 grid gap-2">
          {searchResults.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCalendarStudentId(s.id)}
              className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
            >
              {s.name} ({s.id}) · {s.phone}
            </button>
          ))}
          {mobileSearch && searchResults.length === 0 && <p className="text-sm text-gray-500">No students found for this mobile search.</p>}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Mark Daily Attendance</h2>
        <form onSubmit={mark} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <input type="date" className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={date} onChange={(e) => setDate(e.target.value)} required />
          <select className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={batchId} onChange={(e) => setBatchId(e.target.value)} required>
            <option value="">Select batch</option>
            {batches.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.monthYear})</option>)}
          </select>
          <select className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
            <option value="">Select student</option>
            {markStudents.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
          </select>
          <select className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
          <button disabled={saving} className="btn-touch rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Mark'}
          </button>
        </form>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Daily Records</h2>
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
            <tbody className="text-gray-200 divide-y divide-gray-700">
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-3">{r.date}</td>
                  <td className="px-3 py-3">{courseMap.get(r.courseId)?.name || r.courseId || batchMap.get(r.batchId)?.courseId || '—'}</td>
                  <td className="px-3 py-3">{batchMap.get(r.batchId)?.name || r.batchId}</td>
                  <td className="px-3 py-3">{studentMap.get(r.studentId)?.name || r.studentId}</td>
                  <td className="px-3 py-3">{studentMap.get(r.studentId)?.phone || '—'}</td>
                  <td className="px-3 py-3">{r.status}</td>
                </tr>
              ))}
              {records.length === 0 && <tr><td colSpan={6} className="px-3 py-4 text-gray-500">No records for selected filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Attendance Calendar</h2>
          <select className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" value={calendarStudentId} onChange={(e) => setCalendarStudentId(e.target.value)}>
            <option value="">Select student for calendar</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.phone})
              </option>
            ))}
          </select>
        </div>
        <p className="mt-1 text-xs text-gray-400">Green = Present, Red = Absent, Gray = Not marked</p>
        <div className="mt-3 grid grid-cols-7 gap-2">
          {monthDays(month).map((d) => {
            const s = calendarStatus[d]
            const color =
              s === 'present'
                ? 'bg-emerald-600/30 border-emerald-500'
                : s === 'absent'
                  ? 'bg-red-600/30 border-red-500'
                  : 'bg-gray-900 border-gray-700'
            return (
              <div key={d} className={`rounded border p-2 text-center text-xs ${color}`}>
                <div className="text-gray-300">{d.slice(-2)}</div>
                <div className="mt-1 text-[10px] text-white">{s || '—'}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Graph Section</h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
            <h3 className="text-sm font-semibold text-white">Daily Attendance Trend</h3>
            <div className="mt-3 space-y-2">
              {dailyTrend.map((d) => (
                <div key={d.date}>
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>{d.date.slice(-2)}</span>
                    <span>P:{d.present} A:{d.absent}</span>
                  </div>
                  <div className="mt-1 h-2 rounded bg-gray-800">
                    <div className="h-2 rounded bg-emerald-500" style={{ width: `${(d.present / chartMax(dailyTrend, 'present')) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
            <h3 className="text-sm font-semibold text-white">Course-wise Attendance Trend</h3>
            <div className="mt-3 space-y-2">
              {courseTrend.map((c) => (
                <div key={c.courseId}>
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>{courseMap.get(c.courseId)?.name || c.courseId}</span>
                    <span>{c.percentage}%</span>
                  </div>
                  <div className="mt-1 h-2 rounded bg-gray-800">
                    <div className="h-2 rounded bg-violet-500" style={{ width: `${c.percentage}%` }} />
                  </div>
                </div>
              ))}
              {courseTrend.length === 0 && <p className="text-xs text-gray-500">No course trend data for selected filters.</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Monthly Attendance Report</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-gray-300">
              <tr>
                <th className="px-3 py-3">Student</th>
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">Present</th>
                <th className="px-3 py-3">Absent</th>
                <th className="px-3 py-3">Total</th>
                <th className="px-3 py-3">Attendance %</th>
              </tr>
            </thead>
            <tbody className="text-gray-200 divide-y divide-gray-700">
              {report.map((r) => (
                <tr key={r.studentId}>
                  <td className="px-3 py-3">{r.name || r.studentId}</td>
                  <td className="px-3 py-3">{r.phone || '—'}</td>
                  <td className="px-3 py-3">{r.present}</td>
                  <td className="px-3 py-3">{r.absent}</td>
                  <td className="px-3 py-3">{r.total}</td>
                  <td className={`px-3 py-3 ${r.percentage < 75 ? 'text-rose-300' : ''}`}>{r.percentage}%</td>
                </tr>
              ))}
              {report.length === 0 && <tr><td colSpan={6} className="px-3 py-4 text-gray-500">No monthly data.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-rose-700/40 bg-rose-900/10 p-6">
        <h2 className="text-lg font-semibold text-rose-200">Students Below 75% Attendance</h2>
        <div className="mt-3 space-y-2">
          {lowAttendance.map((s) => (
            <div key={s.studentId} className="rounded-lg border border-rose-700/30 bg-gray-900 px-3 py-2 text-sm text-gray-200">
              {s.name || s.studentId} · {s.phone || '—'} · {s.percentage}%
            </div>
          ))}
          {lowAttendance.length === 0 && <p className="text-sm text-gray-400">No students below 75% for current filters.</p>}
        </div>
      </div>
    </div>
  )
}

