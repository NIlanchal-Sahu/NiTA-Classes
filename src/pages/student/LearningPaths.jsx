import { useEffect, useMemo, useState } from 'react'
import { studentPortalApi } from '../../api/student'

function monthDays(month) {
  const [y, m] = String(month).split('-').map(Number)
  const total = new Date(y, m, 0).getDate()
  return Array.from({ length: total }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`)
}

function weekdayShort(dateStr) {
  const d = new Date(`${dateStr}T12:00:00.000Z`)
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()]
}

function holidayBadgeClass(type) {
  if (type === 'weekly') return 'bg-slate-700/60 border-slate-500 text-slate-300'
  if (type === 'public') return 'bg-rose-950/40 border-rose-500/50 text-rose-200'
  if (type === 'optional') return 'bg-amber-950/40 border-amber-500/40 text-amber-200'
  return 'bg-orange-950/40 border-orange-500/40 text-orange-200'
}

export default function LearningPaths() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [courseId, setCourseId] = useState('')
  const [data, setData] = useState(null)
  const [learnCourses, setLearnCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setCoursesLoading(true)
      try {
        const out = await studentPortalApi.getCoursesLearning()
        const enrolled =
          out.enrolledCourses || (out.allCourses || []).filter((c) => c.unlocked)
        const list = enrolled.filter((c) => String(c.id) !== 'trial-course')
        setLearnCourses(list)
      } catch {
        setLearnCourses([])
      } finally {
        setCoursesLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const out = await studentPortalApi.getAttendance(month, courseId)
        setData(out)
      } catch {
        setData({ attendance: [], holidays: [], monthlyPercentage: 0, month })
      }
    })()
  }, [month, courseId])

  const dailyStatus = useMemo(() => {
    const map = {}
    for (const r of data?.attendance || []) map[r.date] = r
    return map
  }, [data])

  const holidayByDate = useMemo(() => {
    const map = {}
    for (const h of data?.holidays || []) map[h.date] = h
    return map
  }, [data])

  const labelFor = (entry) => {
    if (entry?.holiday?.type === 'weekly') return 'Sunday'
    if (entry?.holiday) return 'Holiday'
    if (entry?.status === 'present') return 'Present'
    if (entry?.status === 'absent') return 'Absent'
    return '—'
  }

  const statusClass = (entry) => {
    if (entry?.holiday?.type === 'weekly') return 'text-slate-400'
    if (entry?.holiday) return 'text-orange-300'
    if (entry?.status === 'present') return 'text-emerald-300'
    if (entry?.status === 'absent') return 'text-red-300'
    return 'text-gray-500'
  }

  const calendarCellClass = (date, entry, holiday) => {
    if (holiday?.type === 'weekly') return 'bg-slate-800/80 border-slate-600'
    if (holiday) return `${holidayBadgeClass(holiday.type)} border`
    if (entry?.status === 'present') return 'bg-emerald-600/30 border-emerald-500'
    if (entry?.status === 'absent') return 'bg-red-600/30 border-red-500'
    return 'bg-gray-900 border-gray-700'
  }

  const monthHolidays = (data?.holidays || []).filter((h) => h.type !== 'weekly')

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Attendance Tracker</h1>
      <p className="mt-1 text-gray-400">
        Pay-for-class days count as present. Attendance % uses school days only — Sunday, Odisha public holidays, and
        festivals are excluded.
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-gray-400">
          Month
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-400">
          Course
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            disabled={coursesLoading}
            className="min-w-[12rem] rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white disabled:opacity-50"
          >
            <option value="">All courses (overall)</option>
            {learnCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || c.id}
              </option>
            ))}
          </select>
        </label>
        <div className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300">
          Monthly Attendance:{' '}
          <span className="font-semibold text-white">{data?.monthlyPercentage ?? 0}%</span>
          {data?.presentDaysCount != null && data?.schoolDaysDenominator != null && (
            <span className="ml-2 text-xs text-gray-500">
              ({data.presentDaysCount} / {data.schoolDaysDenominator} school days
              {data.schoolDaysInMonth != null ? ` · ${data.schoolDaysInMonth} total in month` : ''})
            </span>
          )}
        </div>
      </div>

      {monthHolidays.length > 0 && (
        <div className="mt-4 rounded-xl border border-orange-500/30 bg-orange-950/20 p-4">
          <h3 className="text-sm font-semibold text-orange-200">
            Odisha Holidays & Festivals — {month}
          </h3>
          <p className="mt-1 text-xs text-orange-200/70">
            Public holidays and regional festivals for this month (per Odisha government calendar). Classes are not
            expected on these days.
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {monthHolidays.map((h) => (
              <li
                key={`${h.date}-${h.name}`}
                className={`rounded-lg border px-3 py-2 text-xs ${holidayBadgeClass(h.type)}`}
              >
                <span className="font-semibold">{h.date.slice(-2)}</span>
                <span className="mx-1 text-gray-500">·</span>
                <span>{h.name}</span>
                {h.type === 'public' && (
                  <span className="ml-1 rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] uppercase">Public</span>
                )}
                {h.type === 'festival' && (
                  <span className="ml-1 rounded bg-orange-500/20 px-1.5 py-0.5 text-[10px] uppercase">Festival</span>
                )}
                {h.type === 'optional' && (
                  <span className="ml-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] uppercase">Optional</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-gray-700 bg-gray-800 p-4">
        <h3 className="font-semibold text-white">Calendar View</h3>
        <p className="mt-1 text-xs text-gray-400">
          Green = Present · Red = Absent · Orange = Holiday/Festival · Slate = Sunday · Gray = No record
        </p>
        <div className="mt-3 grid grid-cols-7 gap-2">
          {monthDays(month).map((d) => {
            const entry = dailyStatus[d]
            const holiday = holidayByDate[d] || entry?.holiday
            return (
              <div
                key={d}
                className={`rounded border p-2 text-center text-xs ${calendarCellClass(d, entry, holiday)}`}
                title={holiday?.name || undefined}
              >
                <div className="text-[10px] text-gray-500">{weekdayShort(d)}</div>
                <div className="text-gray-300">{d.slice(-2)}</div>
                <div className={`mt-1 text-[10px] leading-tight ${statusClass({ ...entry, holiday })}`}>
                  {holiday?.type === 'weekly'
                    ? 'Sun'
                    : holiday
                      ? holiday.name.length > 12
                        ? `${holiday.name.slice(0, 10)}…`
                        : holiday.name
                      : labelFor(entry)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-700 bg-gray-800 p-4">
        <h3 className="font-semibold text-white">Days with records</h3>
        <p className="mt-1 text-xs text-gray-400">Only dates where attendance was recorded appear below.</p>
        <div className="mt-3 space-y-2">
          {(data?.attendance || []).map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm"
            >
              <span className="text-gray-300">
                {r.date}
                {r.holiday && r.holiday.type !== 'weekly' && (
                  <span className="ml-2 text-xs text-orange-300">({r.holiday.name})</span>
                )}
              </span>
              <span className={statusClass(r)}>{labelFor(r)}</span>
            </div>
          ))}
          {(data?.attendance || []).length === 0 && (
            <p className="text-sm text-gray-500">No attendance records for selected filters.</p>
          )}
        </div>
      </div>

      {data?.calendarNote && (
        <p className="mt-4 text-xs text-gray-500">{data.calendarNote}</p>
      )}
    </>
  )
}
