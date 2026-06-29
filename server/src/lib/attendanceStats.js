import {
  addDays,
  computeSchoolDayStreak,
  computeSchoolDayStreakInMonth,
  getHolidayInfo,
  isNonClassDay,
  monthKey,
} from './odishaCalendar.js'

export function parseDateOnly(value) {
  return String(value || '').slice(0, 10)
}

export function normCourseId(courseId) {
  return String(courseId || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
}

export function isAdminOffDay(dateStr, adminOffDays = []) {
  const d = parseDateOnly(dateStr)
  return (adminOffDays || []).some((x) => parseDateOnly(x.date) === d)
}

/** Sunday, Odisha holiday/festival, or admin-marked off day. */
export function isExcludedClassDay(dateStr, adminOffDays = []) {
  if (isAdminOffDay(dateStr, adminOffDays)) return true
  return isNonClassDay(dateStr)
}

export function countSchoolDaysInRange(startDate, endDate, adminOffDays = []) {
  const start = parseDateOnly(startDate)
  const end = parseDateOnly(endDate)
  if (!start || !end || start > end) return 0
  let count = 0
  let cursor = start
  let guard = 0
  while (cursor <= end && guard < 2000) {
    guard += 1
    if (!isExcludedClassDay(cursor, adminOffDays)) count += 1
    cursor = addDays(cursor, 1)
  }
  return count
}

export function getStudentAdmissionDate(student, enrollments = []) {
  let fromEnrollments = null
  for (const e of enrollments || []) {
    if (String(e.studentId) !== String(student?.id)) continue
    if (normCourseId(e.courseId) === 'trial-course') continue
    const start = parseDateOnly(e.startDate || e.createdAt)
    if (start && (!fromEnrollments || start < fromEnrollments)) fromEnrollments = start
  }
  if (fromEnrollments) return fromEnrollments
  return parseDateOnly(student?.admissionDate || student?.createdAt || new Date().toISOString())
}

export function getCourseStartDate(student, enrollments = [], courseId) {
  const cid = normCourseId(courseId)
  if (cid === 'trial-course') return null
  const admission = getStudentAdmissionDate(student, enrollments)
  if (!cid) return admission
  let best = null
  for (const e of enrollments || []) {
    if (String(e.studentId) !== String(student?.id)) continue
    if (normCourseId(e.courseId) !== cid) continue
    const start = parseDateOnly(e.startDate || e.createdAt)
    if (start && (!best || start < best)) best = start
  }
  return best || admission
}

function resolveRange({ admissionDate, month, asOfDate }) {
  const today = parseDateOnly(asOfDate || new Date().toISOString())
  const admission = parseDateOnly(admissionDate) || today
  if (!month) {
    return {
      rangeStart: admission,
      rangeEnd: today,
    }
  }
  const [y, m] = String(month).split('-').map(Number)
  const monthStart = `${month}-01`
  const dim = new Date(y, m, 0).getDate()
  const monthEnd = `${month}-${String(dim).padStart(2, '0')}`
  const rangeStart = monthStart > admission ? monthStart : admission
  const rangeEnd = monthEnd < today ? monthEnd : today
  return { rangeStart, rangeEnd }
}

function tallyMarkedDays(
  records,
  { rangeStart, rangeEnd, month, adminOffDays, courseId = null, inferAbsentFromUnpaid = true },
) {
  const presentDates = new Set()
  const explicitAbsentDates = new Set()

  for (const r of records || []) {
    const cid = normCourseId(r.courseId)
    if (courseId && cid !== normCourseId(courseId)) continue
    const d = parseDateOnly(r.date)
    if (!d || d < rangeStart || d > rangeEnd) continue
    if (month && monthKey(d) !== month) continue
    if (isExcludedClassDay(d, adminOffDays)) continue
    if (String(r.status) === 'present') presentDates.add(d)
    if (String(r.status) === 'absent') explicitAbsentDates.add(d)
  }

  const absentDates = new Set(explicitAbsentDates)

  if (inferAbsentFromUnpaid) {
    let cursor = rangeStart
    let guard = 0
    while (cursor <= rangeEnd && guard < 2000) {
      guard += 1
      if (month && monthKey(cursor) !== month) {
        cursor = addDays(cursor, 1)
        continue
      }
      if (isExcludedClassDay(cursor, adminOffDays)) {
        cursor = addDays(cursor, 1)
        continue
      }
      if (!presentDates.has(cursor) && !explicitAbsentDates.has(cursor)) {
        absentDates.add(cursor)
      }
      cursor = addDays(cursor, 1)
    }
  }

  return { presentDates, absentDates, explicitAbsentDates }
}

/** Present-day streak from merged attendance (wallet + academy), aligned with attendance %. */
export function computeStudentStreak({
  student,
  attendanceRecords = [],
  enrollments = [],
  adminOffDays = [],
  asOfDate = null,
  month = null,
}) {
  const enrollStart = getStudentAdmissionDate(student, enrollments)
  const today = parseDateOnly(asOfDate || new Date().toISOString())
  const { presentDates } = tallyMarkedDays(attendanceRecords, {
    rangeStart: enrollStart,
    rangeEnd: today,
    month,
    adminOffDays,
    inferAbsentFromUnpaid: false,
  })
  const streakOpts = { adminOffDays, enrollStartDate: enrollStart }
  if (month) {
    return computeSchoolDayStreakInMonth([...presentDates], month, today, streakOpts)
  }
  return computeSchoolDayStreak([...presentDates], today, streakOpts)
}

export function computeStudentAttendanceStats({
  student,
  attendanceRecords = [],
  enrollments = [],
  adminOffDays = [],
  asOfDate = null,
  month = null,
  inferAbsentFromUnpaid = true,
}) {
  const admissionDate = getStudentAdmissionDate(student, enrollments)
  const { rangeStart, rangeEnd } = resolveRange({ admissionDate, month, asOfDate })
  const conducted =
    rangeStart <= rangeEnd ? countSchoolDaysInRange(rangeStart, rangeEnd, adminOffDays) : 0
  const { presentDates, absentDates } = tallyMarkedDays(attendanceRecords, {
    rangeStart,
    rangeEnd,
    month,
    adminOffDays,
    inferAbsentFromUnpaid,
  })
  const attended = presentDates.size
  const absent = absentDates.size
  const unmarked = Math.max(0, conducted - attended - absent)
  const percentage = conducted ? Math.round((attended / conducted) * 100) : 0

  const courseIds = new Set()
  for (const r of attendanceRecords) {
    const cid = normCourseId(r.courseId)
    if (cid) courseIds.add(cid)
  }
  for (const e of enrollments) {
    if (String(e.studentId) !== String(student.id)) continue
    const cid = normCourseId(e.courseId)
    if (cid && cid !== 'trial-course') courseIds.add(cid)
  }
  if (student.courseEnrolled) courseIds.add(normCourseId(student.courseEnrolled))

  const courses = [...courseIds].map((courseId) => {
    const courseAdmission = getCourseStartDate(student, enrollments, courseId)
    const courseRange = resolveRange({ admissionDate: courseAdmission, month, asOfDate })
    const courseConducted =
      courseRange.rangeStart <= courseRange.rangeEnd
        ? countSchoolDaysInRange(courseRange.rangeStart, courseRange.rangeEnd, adminOffDays)
        : 0
    const courseTally = tallyMarkedDays(attendanceRecords, {
      rangeStart: courseRange.rangeStart,
      rangeEnd: courseRange.rangeEnd,
      month,
      adminOffDays,
      courseId,
      inferAbsentFromUnpaid,
    })
    const courseAttended = courseTally.presentDates.size
    const courseAbsent = courseTally.absentDates.size
    return {
      courseId,
      conducted: courseConducted,
      attended: courseAttended,
      absent: courseAbsent,
      unmarked: Math.max(0, courseConducted - courseAttended - courseAbsent),
      percentage: courseConducted ? Math.round((courseAttended / courseConducted) * 100) : 0,
      startDate: courseAdmission,
    }
  })

  return {
    studentId: student.id,
    admissionDate,
    rangeStart,
    rangeEnd,
    conducted,
    attended,
    absent,
    unmarked,
    percentage,
    courses,
  }
}

export function aggregateAttendanceStats(studentStatsList) {
  const list = studentStatsList || []
  const conducted = list.reduce((sum, x) => sum + (Number(x.conducted) || 0), 0)
  const attended = list.reduce((sum, x) => sum + (Number(x.attended) || 0), 0)
  const absent = list.reduce((sum, x) => sum + (Number(x.absent) || 0), 0)
  const unmarked = list.reduce((sum, x) => sum + (Number(x.unmarked) || 0), 0)
  const percentage = conducted ? Math.round((attended / conducted) * 100) : 0
  return {
    studentCount: list.length,
    conducted,
    attended,
    absent,
    unmarked,
    percentage,
  }
}

export function buildMonthlyTrend(student, attendanceRecords, enrollments, adminOffDays, monthsBack = 6) {
  const today = parseDateOnly(new Date().toISOString())
  const ym = monthKey(today)
  const [y, m] = ym.split('-').map(Number)
  const rows = []
  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const dt = new Date(y, m - 1 - i, 1)
    const month = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
    const stats = computeStudentAttendanceStats({
      student,
      attendanceRecords,
      enrollments,
      adminOffDays,
      asOfDate: today,
      month,
    })
    rows.push({
      month,
      conducted: stats.conducted,
      attended: stats.attended,
      absent: stats.absent,
      percentage: stats.percentage,
    })
  }
  return rows
}

export function buildDailyTrendForMonth(
  month,
  student,
  attendanceRecords,
  adminOffDays,
  { rangeStart, rangeEnd, inferAbsentFromUnpaid = true } = {},
) {
  const [y, m] = String(month).split('-').map(Number)
  const dim = new Date(y, m, 0).getDate()
  const start = rangeStart || `${month}-01`
  const end = rangeEnd || `${month}-${String(dim).padStart(2, '0')}`
  const { presentDates, absentDates } = tallyMarkedDays(attendanceRecords, {
    rangeStart: start,
    rangeEnd: end,
    month,
    adminOffDays,
    inferAbsentFromUnpaid,
  })
  const rows = []
  for (let day = 1; day <= dim; day += 1) {
    const date = `${month}-${String(day).padStart(2, '0')}`
    const holiday = getHolidayInfo(date)
    const adminOff = isAdminOffDay(date, adminOffDays)
    const offDay = adminOff
      ? { type: 'admin', name: adminOffDays.find((x) => parseDateOnly(x.date) === date)?.note || 'Admin off day' }
      : holiday
    const excluded = isExcludedClassDay(date, adminOffDays)
    let status = 'unmarked'
    if (excluded) status = 'off'
    else if (presentDates.has(date)) status = 'present'
    else if (absentDates.has(date)) status = 'absent'
    else if (inferAbsentFromUnpaid && date >= start && date <= end) status = 'absent'

    const dayRecords = (attendanceRecords || []).filter((r) => parseDateOnly(r.date) === date)
    rows.push({
      date,
      status,
      excluded,
      holiday: offDay,
      sources: dayRecords.map((r) => r.source || 'academy').filter(Boolean),
    })
  }
  return rows
}

export function searchStudents(students, query) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return []
  const digits = q.replace(/\D/g, '')
  return (students || []).filter((s) => {
    const name = String(s.name || '').toLowerCase()
    const phone = String(s.phone || '').replace(/\D/g, '')
    const id = String(s.id || '').toLowerCase()
    if (name.includes(q) || id.includes(q)) return true
    if (digits.length >= 3 && phone.includes(digits)) return true
    return false
  })
}
