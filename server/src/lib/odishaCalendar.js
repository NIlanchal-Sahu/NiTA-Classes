/**
 * Odisha school calendar — Sundays, state public holidays, and major festivals.
 * Used for attendance %, streak counting, and the student Attendance Tracker.
 */

/** @type {Record<string, Array<{ date: string, name: string, type: 'public' | 'festival' | 'optional' }>>} */
const ODISHA_HOLIDAYS_BY_YEAR = {
  '2025': [
    { date: '2025-01-14', name: 'Makar Sankranti', type: 'festival' },
    { date: '2025-01-23', name: 'Subhas Chandra Bose Jayanti / Vir Surendra Sai Jayanti', type: 'public' },
    { date: '2025-01-26', name: 'Republic Day', type: 'public' },
    { date: '2025-02-26', name: 'Maha Shivaratri', type: 'festival' },
    { date: '2025-03-14', name: 'Holi / Dola Purnima', type: 'festival' },
    { date: '2025-03-31', name: 'Id-ul-Fitr', type: 'public' },
    { date: '2025-04-01', name: 'Utkal Divas (Odisha Day)', type: 'public' },
    { date: '2025-04-06', name: 'Rama Navami', type: 'festival' },
    { date: '2025-04-18', name: 'Good Friday', type: 'public' },
    { date: '2025-04-14', name: 'Ambedkar Jayanti / Maha Vishuba Sankranti', type: 'public' },
    { date: '2025-05-01', name: 'May Day / Buddha Purnima', type: 'public' },
    { date: '2025-06-06', name: 'Raja Sankranti', type: 'festival' },
    { date: '2025-06-07', name: 'Raja Festival (2nd day)', type: 'festival' },
    { date: '2025-06-27', name: 'Rath Yatra', type: 'festival' },
    { date: '2025-08-15', name: 'Independence Day', type: 'public' },
    { date: '2025-08-16', name: 'Janmashtami', type: 'festival' },
    { date: '2025-08-27', name: 'Nuakhai', type: 'festival' },
    { date: '2025-09-07', name: 'Ganesh Chaturthi', type: 'festival' },
    { date: '2025-10-02', name: 'Gandhi Jayanti', type: 'public' },
    { date: '2025-10-02', name: 'Mahalaya', type: 'festival' },
    { date: '2025-10-06', name: 'Mahasaptami', type: 'festival' },
    { date: '2025-10-07', name: 'Maha Ashtami', type: 'festival' },
    { date: '2025-10-08', name: 'Maha Navami', type: 'festival' },
    { date: '2025-10-09', name: 'Vijaya Dasami', type: 'festival' },
    { date: '2025-10-20', name: 'Kumar Purnima', type: 'festival' },
    { date: '2025-11-01', name: 'Diwali', type: 'festival' },
    { date: '2025-12-25', name: 'Christmas', type: 'public' },
  ],
  '2026': [
    { date: '2026-01-14', name: 'Makar Sankranti', type: 'festival' },
    { date: '2026-01-23', name: 'Subhas Chandra Bose Jayanti / Vir Surendra Sai Jayanti / Basanta Panchami', type: 'public' },
    { date: '2026-01-26', name: 'Republic Day', type: 'public' },
    { date: '2026-03-04', name: 'Holi / Dola Purnima', type: 'festival' },
    { date: '2026-03-21', name: 'Id-ul-Fitr', type: 'public' },
    { date: '2026-03-27', name: 'Rama Navami', type: 'festival' },
    { date: '2026-04-01', name: 'Utkal Divas (Odisha Day)', type: 'public' },
    { date: '2026-04-03', name: 'Good Friday', type: 'public' },
    { date: '2026-04-14', name: 'Ambedkar Jayanti / Maha Vishuba Sankranti', type: 'public' },
    { date: '2026-05-01', name: 'Buddha Purnima / Pandit Raghunath Murmu Jayanti', type: 'public' },
    { date: '2026-05-16', name: 'Sabitri Amavasya', type: 'festival' },
    { date: '2026-05-27', name: 'Id-ul-Zuha (Bakrid)', type: 'public' },
    { date: '2026-06-15', name: 'Raja Sankranti', type: 'festival' },
    { date: '2026-06-16', name: 'Raja Festival (2nd day)', type: 'festival' },
    { date: '2026-06-26', name: 'Muharram', type: 'public' },
    { date: '2026-07-16', name: 'Rath Yatra', type: 'festival' },
    { date: '2026-07-24', name: 'Bahuda Yatra', type: 'optional' },
    { date: '2026-08-15', name: 'Independence Day', type: 'public' },
    { date: '2026-08-26', name: 'Birthday of Prophet Muhammad', type: 'public' },
    { date: '2026-08-27', name: 'Jhulan Purnima', type: 'festival' },
    { date: '2026-09-04', name: 'Janmashtami', type: 'festival' },
    { date: '2026-09-14', name: 'Ganesh Puja', type: 'festival' },
    { date: '2026-09-15', name: 'Nuakhai', type: 'festival' },
    { date: '2026-09-16', name: 'Nuakhai (next day)', type: 'festival' },
    { date: '2026-10-02', name: 'Gandhi Jayanti', type: 'public' },
    { date: '2026-10-17', name: 'Mahasaptami', type: 'festival' },
    { date: '2026-10-19', name: 'Mahanavami', type: 'festival' },
    { date: '2026-10-20', name: 'Vijaya Dasami', type: 'festival' },
    { date: '2026-11-24', name: 'Rasa Purnima', type: 'festival' },
    { date: '2026-12-25', name: 'Christmas', type: 'public' },
  ],
  '2027': [
    { date: '2027-01-14', name: 'Makar Sankranti', type: 'festival' },
    { date: '2027-01-23', name: 'Subhas Chandra Bose Jayanti / Vir Surendra Sai Jayanti', type: 'public' },
    { date: '2027-01-26', name: 'Republic Day', type: 'public' },
    { date: '2027-03-22', name: 'Holi / Dola Purnima', type: 'festival' },
    { date: '2027-03-21', name: 'Id-ul-Fitr', type: 'public' },
    { date: '2027-04-01', name: 'Utkal Divas (Odisha Day)', type: 'public' },
    { date: '2027-04-14', name: 'Ambedkar Jayanti / Good Friday', type: 'public' },
    { date: '2027-05-01', name: 'May Day / Buddha Purnima', type: 'public' },
    { date: '2027-06-05', name: 'Raja Sankranti', type: 'festival' },
    { date: '2027-07-05', name: 'Rath Yatra', type: 'festival' },
    { date: '2027-08-15', name: 'Independence Day', type: 'public' },
    { date: '2027-08-25', name: 'Janmashtami', type: 'festival' },
    { date: '2027-08-26', name: 'Nuakhai', type: 'festival' },
    { date: '2027-10-02', name: 'Gandhi Jayanti', type: 'public' },
    { date: '2027-10-09', name: 'Vijaya Dasami', type: 'festival' },
    { date: '2027-12-25', name: 'Christmas', type: 'public' },
  ],
};

/** Fixed national holidays (fallback when year table has no entry). */
const FIXED_PUBLIC_HOLIDAYS = {
  '01-26': 'Republic Day',
  '04-01': 'Utkal Divas (Odisha Day)',
  '08-15': 'Independence Day',
  '10-02': 'Gandhi Jayanti',
  '12-25': 'Christmas',
};

const holidayByDate = new Map();

function rebuildHolidayIndex() {
  holidayByDate.clear();
  for (const rows of Object.values(ODISHA_HOLIDAYS_BY_YEAR)) {
    for (const row of rows) {
      const existing = holidayByDate.get(row.date);
      if (!existing || row.type === 'public') {
        holidayByDate.set(row.date, row);
      }
    }
  }
}
rebuildHolidayIndex();

export function addDays(dateStr, delta) {
  const d = new Date(`${String(dateStr).slice(0, 10)}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

export function monthKey(dateStr) {
  return String(dateStr || '').slice(0, 7);
}

export function isSunday(dateStr) {
  const d = new Date(`${String(dateStr).slice(0, 10)}T12:00:00.000Z`);
  return d.getUTCDay() === 0;
}

export function getHolidayInfo(dateStr) {
  const date = String(dateStr || '').slice(0, 10);
  if (!date) return null;
  if (isSunday(date)) {
    return { date, name: 'Sunday (Weekly Holiday)', type: 'weekly' };
  }
  const fromYear = holidayByDate.get(date);
  if (fromYear) return { ...fromYear, date };
  const mmdd = date.slice(5);
  const fixed = FIXED_PUBLIC_HOLIDAYS[mmdd];
  if (fixed) return { date, name: fixed, type: 'public' };
  return null;
}

/** Sunday, public holiday, or Odisha festival day — no class expected. */
export function isNonClassDay(dateStr) {
  const info = getHolidayInfo(dateStr);
  if (!info) return false;
  if (info.type === 'weekly') return true;
  return info.type === 'public' || info.type === 'festival' || info.type === 'optional';
}

export function getHolidaysForMonth(ym) {
  const year = String(ym).slice(0, 4);
  const yearRows = ODISHA_HOLIDAYS_BY_YEAR[year] || [];
  const inMonth = yearRows.filter((h) => monthKey(h.date) === ym);
  const seen = new Set(inMonth.map((h) => h.date));

  const [y, m] = String(ym).split('-').map(Number);
  const dim = new Date(y, m, 0).getDate();
  const extras = [];
  for (let day = 1; day <= dim; day += 1) {
    const date = `${ym}-${String(day).padStart(2, '0')}`;
    if (seen.has(date)) continue;
    const info = getHolidayInfo(date);
    if (info && info.type === 'weekly') {
      extras.push({ date, name: info.name, type: 'weekly' });
    } else if (info && !seen.has(date)) {
      extras.push({ date, name: info.name, type: info.type });
    }
  }

  return [...inMonth, ...extras].sort((a, b) => a.date.localeCompare(b.date));
}

export function countSchoolDaysInMonth(ym, untilDate = null) {
  const [y, m] = String(ym).split('-').map(Number);
  const dim = new Date(y, m, 0).getDate();
  const until =
    untilDate && monthKey(untilDate) === ym
      ? Math.min(dim, Number(String(untilDate).slice(8, 10)))
      : dim;
  let count = 0;
  for (let day = 1; day <= until; day += 1) {
    const date = `${ym}-${String(day).padStart(2, '0')}`;
    if (!isNonClassDay(date)) count += 1;
  }
  return count;
}

/**
 * School-day streak: consecutive class days attended; Sundays & Odisha holidays do not break the streak.
 */
export function computeSchoolDayStreak(attendedDates, asOfDate) {
  const attended = new Set(
    (attendedDates || []).map((d) => String(d || '').slice(0, 10)).filter(Boolean),
  );
  if (attended.size === 0) return 0;

  let cursor = String(asOfDate || '').slice(0, 10);
  if (!cursor) return 0;

  if (!isNonClassDay(cursor) && !attended.has(cursor)) {
    cursor = addDays(cursor, -1);
  }

  let streak = 0;
  let guard = 0;
  while (cursor && guard < 400) {
    guard += 1;
    if (isNonClassDay(cursor)) {
      cursor = addDays(cursor, -1);
      continue;
    }
    if (attended.has(cursor)) {
      streak += 1;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }
  return streak;
}

/** Longest school-day streak within a calendar month. */
export function computeSchoolDayStreakInMonth(attendedDates, ym, asOfDate) {
  const attended = new Set(
    (attendedDates || [])
      .map((d) => String(d || '').slice(0, 10))
      .filter((d) => monthKey(d) === ym),
  );
  if (attended.size === 0) return 0;

  const [y, m] = String(ym).split('-').map(Number);
  const dim = new Date(y, m, 0).getDate();
  const monthEnd = `${ym}-${String(dim).padStart(2, '0')}`;
  let end = String(asOfDate || '').slice(0, 10);
  if (monthKey(end) !== ym || end > monthEnd) end = monthEnd;
  if (monthKey(end) !== ym) end = monthEnd;

  return computeSchoolDayStreak([...attended], end);
}

export function walletDatesForUser(walletRows, userId, month = null) {
  return Array.from(
    new Set(
      walletRows
        .filter(
          (x) =>
            x.studentId === userId &&
            (Number(x.classesCount) || 0) > 0 &&
            (!month || monthKey(x.date) === month),
        )
        .map((x) => String(x.date || '').slice(0, 10))
        .filter(Boolean),
    ),
  );
}
