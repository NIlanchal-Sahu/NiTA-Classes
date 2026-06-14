import { Router } from "express";
import { verifyToken, getUserById } from "../auth.js";
import { getUsers, saveUsers } from "../auth.js";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  getValidCourseId,
  getAttendanceFor,
  recordClassAndDeduct,
  getTotalClassesFromWallet,
  isVvipActive,
  purchaseUnlimitedMonth,
} from "../student.js";
import {
  LAB_COURSE_ID,
  studentQualifiesForLab,
  getQualifyingCourseIdsForStudent,
} from "../labAccess.js";
import { readJsonSync, writeJsonSync } from "../services/sheetsJsonStore.js";
import {
  computeSchoolDayStreak,
  computeSchoolDayStreakInMonth,
  countSchoolDaysInMonth,
  getHolidaysForMonth,
  getHolidayInfo,
  isNonClassDay,
  walletDatesForUser,
} from "../lib/odishaCalendar.js";

const router = Router();
const PRICE_PER_CLASS = 10;
const __dirname = dirname(fileURLToPath(import.meta.url));
const ACADEMY_STUDENTS_PATH = join(__dirname, "..", "data", "students.json");
const ACADEMY_COURSES_PATH = join(__dirname, "..", "data", "academy_courses.json");
const ACADEMY_BATCHES_PATH = join(__dirname, "..", "data", "academy_batches.json");
const ACADEMY_ATTENDANCE_PATH = join(__dirname, "..", "data", "academy_attendance.json");
/** Wallet / Pay-for-class attendance (auth user id) — same file as `recordClassAndDeduct` in student.js */
const WALLET_ATTENDANCE_PATH = join(__dirname, "..", "data", "attendance.json");
const ACADEMY_FEES_PATH = join(__dirname, "..", "data", "academy_fees.json");
const ACADEMY_NOTES_PATH = join(__dirname, "..", "data", "academy_notes.json");
const ACADEMY_CERTIFICATES_PATH = join(__dirname, "..", "data", "academy_certificates.json");
const ACADEMY_CONTENT_PATH = join(__dirname, "..", "data", "academy_course_content.json");
const STUDENT_PROGRESS_PATH = join(__dirname, "..", "data", "academy_student_progress.json");
const PAYMENT_REQUESTS_PATH = join(__dirname, "..", "data", "payment_requests.json");
const CERTIFICATE_REQUESTS_PATH = join(__dirname, "..", "data", "certificate_requests.json");
const REFERRAL_LINKS_PATH = join(__dirname, "..", "data", "referral_links.json");
const REFERRAL_PAYOUTS_PATH = join(__dirname, "..", "data", "referral_payouts.json");
const ENROLLMENTS_HISTORY_PATH = join(__dirname, "..", "data", "student_enrollments.json");
const ADMISSIONS_QUEUE_PATH = join(__dirname, "..", "data", "enrollments.json");
const ADMIN_ALERTS_PATH = join(__dirname, "..", "data", "admin_alerts.json");
const STUDENT_NOTIFICATIONS_PATH = join(__dirname, "..", "data", "student_notifications.json");
const COURSE_UNLOCK_FEES = {
  dca: 499,
  cca: 999,
  "spoken-english-mastery": 499,
  "ai-associate": 1499,
  "ai-video-creation": 499,
  "ai-vibe-coding": 999,
};
const COURSE_DURATION_DAYS = {
  dca: 90,
  cca: 180,
  "spoken-english-mastery": 90,
  "ai-associate": 180,
  "ai-video-creation": 60,
  "ai-vibe-coding": 60,
};

function loadJson(path) {
  return readJsonSync(path, []);
}

function saveJson(path, data) {
  writeJsonSync(path, data);
}

function digits(input) {
  return String(input || "").replace(/\D/g, "");
}

function monthKey(dateStr) {
  return String(dateStr || "").slice(0, 7);
}

function computeBatchLifecycleStatus(batch) {
  const manual = String(batch?.status || "").toLowerCase();
  if (manual === "completed" || manual === "cancelled") return manual;
  const now = today();
  const start = String(batch?.startDate || "").slice(0, 10);
  const end = String(batch?.endDate || "").slice(0, 10);
  if (start && start > now) return "upcoming";
  if (start && end && now >= start && now <= end) return "active";
  if (end && now > end) return "completed";
  return "active";
}

function resolveStudentRecord(authUser) {
  const students = loadJson(ACADEMY_STUDENTS_PATH);
  const emailDigits = digits(authUser?.email).slice(-10);
  return (
    students.find((s) => s.accountUserId === authUser?.id) ||
    students.find((s) => digits(s.phone).slice(-10) === emailDigits) ||
    students.find((s) => String(s.name || "").toLowerCase() === String(authUser?.name || "").toLowerCase()) ||
    null
  );
}

function getClaimOptionsForAuth(authUser) {
  const students = loadJson(ACADEMY_STUDENTS_PATH);
  const emailDigits = digits(authUser?.email).slice(-10);
  if (!emailDigits) return [];
  return students
    .filter((s) => digits(s.phone).slice(-10) === emailDigits)
    .map((s) => ({ id: s.id, name: s.name, phone: s.phone, courseEnrolled: s.courseEnrolled, batchId: s.batchId, admissionDate: s.admissionDate }));
}

const studentAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  const payload = verifyToken(token);
  if (!payload)
    return res.status(401).json({ error: "Invalid or expired token" });
  if (payload.role !== "student")
    return res.status(403).json({ error: "Student access only" });
  req.auth = payload;
  next();
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeCourseId(input) {
  return String(input || "").trim().toLowerCase();
}

function normalizePhone(input) {
  return String(input || "").replace(/\D/g, "").slice(-10);
}

function removeAdmissionQueueByPhone(phone) {
  const p = normalizePhone(phone);
  if (!p) return;
  const rows = loadJson(ADMISSIONS_QUEUE_PATH);
  const next = rows.filter((r) => normalizePhone(r.mobile) !== p);
  if (next.length !== rows.length) saveJson(ADMISSIONS_QUEUE_PATH, next);
}

function getCourseCatalog() {
  const academy = loadJson(ACADEMY_COURSES_PATH);
  const fromAcademy = academy
    .filter((c) => String(c.status || "active").toLowerCase() !== "draft")
    .map((c) => {
    const id = normalizeCourseId(c.id);
    const image = typeof c.image === "string" ? c.image.trim() : "";
    const isIncludedBenefit = !!c.isIncludedBenefit || id === LAB_COURSE_ID;
    return {
      id,
      name: c.name || id,
      description: c.description || "",
      duration: c.duration || "",
      image,
      unlockFee: isIncludedBenefit ? 0 : Number(COURSE_UNLOCK_FEES[id] ?? c.price ?? 499),
      isIncludedBenefit,
    };
  });
  if (fromAcademy.length > 0) return fromAcademy;
  return [
    { id: "dca", name: "DCA (Basic Computer Course)", unlockFee: 499 },
    { id: "cca", name: "CCA (Computer Application)", unlockFee: 999 },
    { id: "spoken-english-mastery", name: "Spoken English Mastery", unlockFee: 499 },
    { id: "ai-associate", name: "AI Associate (Python)", unlockFee: 1499 },
    { id: "ai-video-creation", name: "AI Video Creation Course", unlockFee: 499 },
    { id: "ai-vibe-coding", name: "AI Vibe Coding", unlockFee: 999 },
    {
      id: LAB_COURSE_ID,
      name: "Practical Classes - Computer LAB",
      unlockFee: 0,
      isIncludedBenefit: true,
      description: "Hands-on LAB practice included with all courses except Spoken English.",
    },
  ];
}

function parseIsoDate(v) {
  return String(v || "").slice(0, 10);
}

function addDays(isoDate, days) {
  const d = new Date(`${parseIsoDate(isoDate)}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + Number(days || 0));
  return d.toISOString().slice(0, 10);
}

function daysLeftUntil(isoDate) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const start = new Date(`${todayStr}T00:00:00.000Z`).getTime();
  const end = new Date(`${parseIsoDate(isoDate)}T00:00:00.000Z`).getTime();
  return Math.max(0, Math.ceil((end - start) / 86400000));
}

/** Minimum LMS access: 90 days or catalog course duration, whichever is larger. */
function minAccessDaysForCourse(courseId) {
  const cid = normalizeCourseId(courseId);
  const d = COURSE_DURATION_DAYS[cid] ?? 90;
  return Math.max(90, d);
}

/**
 * Merge all enrollment rows for a course (wallet + batch + renew) so one bad row cannot
 * shorten access. Enforces min access from each row's start and from first join date.
 */
function computeCourseAccessFromEnrollments(studentId, courseId, enrollmentRows) {
  const cid = normalizeCourseId(courseId);
  const list = (enrollmentRows || []).filter(
    (e) =>
      String(e.studentId) === String(studentId) &&
      normalizeCourseId(e.courseId) === cid &&
      normalizeCourseId(e.courseId) !== "trial-course",
  );
  if (list.length === 0) return null;

  let earliest = null;
  let maxEnd = null;
  const minDays = minAccessDaysForCourse(cid);

  for (const e of list) {
    const s = parseIsoDate(e.startDate || e.createdAt || today());
    if (!earliest || s < earliest) earliest = s;
    const expRaw = e.expiresAt
      ? parseIsoDate(e.expiresAt)
      : addDays(s, COURSE_DURATION_DAYS[cid] || 90);
    const policyFromRow = addDays(s, minDays);
    const rowEnd = expRaw > policyFromRow ? expRaw : policyFromRow;
    if (!maxEnd || rowEnd > maxEnd) maxEnd = rowEnd;
  }

  const policyFromFirst = addDays(earliest, minDays);
  let effectiveEnd = maxEnd > policyFromFirst ? maxEnd : policyFromFirst;

  let extSum = 0;
  for (const e of list) {
    extSum += Number(e.validityExtensionDays) || 0;
  }
  if (extSum > 0) effectiveEnd = addDays(effectiveEnd, extSum);

  const left = daysLeftUntil(effectiveEnd);
  const completed = left === 0;
  return { startDate: earliest, endDate: effectiveEnd, daysLeft: left, completed };
}

function isCourseUnlockedForStudent(studentId, courseId) {
  const cid = normalizeCourseId(courseId);
  if (cid === LAB_COURSE_ID) {
    const enrollments = loadJson(ENROLLMENTS_HISTORY_PATH);
    const student = loadJson(ACADEMY_STUDENTS_PATH).find((s) => String(s.id) === String(studentId));
    const batches = loadJson(ACADEMY_BATCHES_PATH);
    return studentQualifiesForLab(studentId, enrollments, student, batches);
  }
  const enrollments = loadJson(ENROLLMENTS_HISTORY_PATH);
  return enrollments.some(
    (e) => e.studentId === studentId && normalizeCourseId(e.courseId) === cid
  );
}

function studentBatchIdsForPortal(student) {
  const legacy = student?.batchId ? [String(student.batchId)] : [];
  const extra = Array.isArray(student?.batchIds) ? student.batchIds.map(String) : [];
  return [...new Set([...extra, ...legacy].filter(Boolean))];
}

function isCourseAccessibleForAuthUser(authUser, student, courseId) {
  const target = normalizeCourseId(courseId);
  if (!target) return false;
  if (target === LAB_COURSE_ID) {
    const enrollments = loadJson(ENROLLMENTS_HISTORY_PATH);
    const batches = loadJson(ACADEMY_BATCHES_PATH);
    return student?.id
      ? studentQualifiesForLab(student.id, enrollments, student, batches)
      : false;
  }
  if (student?.id && isCourseUnlockedForStudent(student.id, target)) return true;
  const batches = loadJson(ACADEMY_BATCHES_PATH);
  for (const bid of studentBatchIdsForPortal(student)) {
    const batch = batches.find((b) => b.id === bid);
    if (normalizeCourseId(batch?.courseId) === target) return true;
  }
  return false;
}

function appendStudentNotification(userId, message, opts = {}) {
  if (!userId) return;
  const list = loadJson(STUDENT_NOTIFICATIONS_PATH);
  list.push({
    id: `stu-notif-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    userId,
    message: String(message),
    read: false,
    createdAt: new Date().toISOString(),
    ...(opts.type ? { type: opts.type } : {}),
    ...(opts.popup != null ? { popup: opts.popup } : {}),
    ...(opts.title ? { title: opts.title } : {}),
    ...(opts.fromAdmin ? { fromAdmin: true } : {}),
  });
  saveJson(STUDENT_NOTIFICATIONS_PATH, list);
}

function getFlatChapterOrder(courseNode) {
  const modules = (courseNode?.modules || []).slice().sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  const ids = [];
  for (const m of modules) {
    const chapters = (m.chapters || []).slice().sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    for (const c of chapters) ids.push(String(c.id));
  }
  return ids;
}

/** Default contentType for legacy chapters (migration in-memory). */
function normalizeChapterForStudent(ch) {
  if (!ch || typeof ch !== "object") return ch;
  let contentType = String(ch.contentType || "").toLowerCase();
  if (!contentType) {
    if (ch.quizData?.questions?.length || ch.interactiveType === "quiz" || ch.interactiveType === "answer-key") {
      contentType = "text";
    } else if (String(ch.contentHtml || "").trim() || ch.interactiveType === "notes") {
      contentType = "text";
    } else if (ch.documentFileId || ch.documentUrl) {
      contentType = ch.videoUrl ? "mixed" : "document";
    } else {
      contentType = "video";
    }
  }
  if (!["video", "document", "mixed", "text"].includes(contentType)) contentType = "video";
  const out = { ...ch, contentType };
  if (ch.quizData && typeof ch.quizData === "object") out.quizData = ch.quizData;
  if (ch.interactiveType) out.interactiveType = ch.interactiveType;
  if (Array.isArray(ch.extraReferences)) out.extraReferences = ch.extraReferences;
  return out;
}

function sumWalletClassesByUser(rows) {
  const map = new Map();
  for (const r of rows) {
    const uid = String(r.studentId || "");
    if (!uid) continue;
    const cnt = Number(r.classesCount) || 0;
    map.set(uid, (map.get(uid) || 0) + cnt);
  }
  return map;
}

function monthlyAttendancePctForUser(rows, userId, month) {
  const dim = daysInMonthString(month);
  const uniqueDays = new Set(
    rows
      .filter((x) => x.studentId === userId && monthKey(x.date) === month && (Number(x.classesCount) || 0) > 0)
      .map((x) => String(x.date || "").slice(0, 10)),
  ).size;
  return {
    presentDays: uniqueDays,
    percentage: dim ? Math.round((uniqueDays / dim) * 100) : 0,
  };
}

function computeCurrentStreak(walletRows, userId) {
  const dates = walletDatesForUser(walletRows, userId);
  return computeSchoolDayStreak(dates, today());
}

function computeStreakInMonth(walletRows, userId, month) {
  const dates = walletDatesForUser(walletRows, userId);
  return computeSchoolDayStreakInMonth(dates, month, today());
}

function computeMonthlyConductedAttendance({ attendanceRows, enrollments, studentId, month }) {
  const unlockStartByCourse = getUnlockStartByCourse(enrollments, studentId);
  if (unlockStartByCourse.size === 0) {
    return { percentage: 0, conductedCount: 0, presentCount: 0 };
  }
  const conductedSet = new Set();
  const presentSet = new Set();
  for (const row of attendanceRows) {
    const courseId = normalizeCourseId(row.courseId);
    const unlockStart = unlockStartByCourse.get(courseId);
    if (!unlockStart) continue;
    const date = String(row.date || '').slice(0, 10);
    if (!date || date < unlockStart || monthKey(date) !== month) continue;
    const key = `${courseId}|${date}`;
    conductedSet.add(key);
    if (String(row.studentId || '') === String(studentId) && String(row.status || '').toLowerCase() === 'present') {
      presentSet.add(key);
    }
  }
  const conductedCount = conductedSet.size;
  const presentCount = presentSet.size;
  const percentage = conductedCount ? Math.round((presentCount / conductedCount) * 100) : 0;
  return { percentage, conductedCount, presentCount };
}

function countReferralsByUser(referralLinks, month = null) {
  const map = new Map();
  for (const link of referralLinks) {
    if (month && monthKey(link.createdAt) !== month) continue;
    const uid = String(link.referrerUserId || '');
    if (!uid) continue;
    map.set(uid, (map.get(uid) || 0) + 1);
  }
  return map;
}

/** Tiered achievement tracks — basic tier unlocks the next tier in the same segment. */
function getAchievementTracks(period = 'all') {
  if (period === 'month') {
    return [
      {
        segment: 'attendance',
        label: 'Attendance Star',
        icon: '⭐',
        unit: '%',
        value: (m) => Number(m.attendancePct) || 0,
        tiers: [
          { id: 'm-att-b', tier: 'Bronze', target: 60, points: 70, description: '60%+ attendance this month' },
          { id: 'm-att-s', tier: 'Silver', target: 75, points: 55, description: '75%+ attendance this month' },
          { id: 'm-att-g', tier: 'Gold', target: 90, points: 75, description: '90%+ attendance this month' },
        ],
      },
      {
        segment: 'classes',
        label: 'Class Warrior',
        icon: '🔥',
        unit: 'classes',
        value: (m) => Number(m.totalClasses) || 0,
        tiers: [
          { id: 'm-cls-b', tier: 'Bronze', target: 2, points: 50, description: '2 classes this month' },
          { id: 'm-cls-s', tier: 'Silver', target: 5, points: 80, description: '5 classes this month' },
          { id: 'm-cls-g', tier: 'Gold', target: 10, points: 110, description: '10 classes this month' },
        ],
      },
      {
        segment: 'courses',
        label: 'Course Explorer',
        icon: '📘',
        unit: 'courses',
        value: (m) => Number(m.enrolledCount) || 0,
        tiers: [
          { id: 'm-crs-b', tier: 'Bronze', target: 1, points: 45, description: 'Unlock 1 course this month' },
          { id: 'm-crs-s', tier: 'Silver', target: 2, points: 65, description: 'Unlock 2 courses this month' },
        ],
      },
      {
        segment: 'completion',
        label: 'Course Finisher',
        icon: '🏁',
        unit: 'courses',
        value: (m) => Number(m.completedCount) || 0,
        tiers: [
          { id: 'm-cmp-b', tier: 'Bronze', target: 1, points: 70, description: 'Complete 1 course this month' },
        ],
      },
      {
        segment: 'streak',
        label: 'Streak Champion',
        icon: '⚡',
        unit: 'school days',
        value: (m) => Number(m.streak) || 0,
        tiers: [
          { id: 'm-str-b', tier: 'Bronze', target: 3, points: 50, description: '3-day school streak this month (Sun & holidays excluded)' },
          { id: 'm-str-s', tier: 'Silver', target: 6, points: 75, description: '6-day school streak this month' },
          { id: 'm-str-g', tier: 'Gold', target: 12, points: 100, description: '12-day school streak this month' },
        ],
      },
      {
        segment: 'referral',
        label: 'Growth Guide',
        icon: '🌱',
        unit: 'referrals',
        value: (m) => Number(m.referralsCount) || 0,
        tiers: [
          { id: 'm-ref-b', tier: 'Bronze', target: 1, points: 70, description: 'Refer 1 friend this month' },
          { id: 'm-ref-s', tier: 'Silver', target: 2, points: 90, description: 'Refer 2 friends this month' },
        ],
      },
    ];
  }

  return [
    {
      segment: 'attendance',
      label: 'Attendance Star',
      icon: '⭐',
      unit: '%',
      value: (m) => Number(m.attendancePct) || 0,
      tiers: [
        { id: 'att-b', tier: 'Bronze', target: 75, points: 80, description: 'Reach 75% overall attendance' },
        { id: 'att-s', tier: 'Silver', target: 85, points: 60, description: 'Reach 85% overall attendance' },
        { id: 'att-g', tier: 'Gold', target: 95, points: 90, description: 'Reach 95% overall attendance' },
      ],
    },
    {
      segment: 'classes',
      label: 'Class Warrior',
      icon: '🔥',
      unit: 'classes',
      value: (m) => Number(m.totalClasses) || 0,
      tiers: [
        { id: 'cls-b', tier: 'Bronze', target: 10, points: 60, description: 'Attend 10 paid classes (all time)' },
        { id: 'cls-s', tier: 'Silver', target: 25, points: 90, description: 'Attend 25 paid classes (all time)' },
        { id: 'cls-g', tier: 'Gold', target: 50, points: 130, description: 'Attend 50 paid classes (all time)' },
      ],
    },
    {
      segment: 'courses',
      label: 'Course Explorer',
      icon: '📘',
      unit: 'courses',
      value: (m) => Number(m.enrolledCount) || 0,
      tiers: [
        { id: 'crs-b', tier: 'Bronze', target: 1, points: 50, description: 'Unlock 1 course' },
        { id: 'crs-s', tier: 'Silver', target: 2, points: 70, description: 'Unlock 2 courses' },
        { id: 'crs-g', tier: 'Gold', target: 3, points: 100, description: 'Unlock 3 courses' },
      ],
    },
    {
      segment: 'completion',
      label: 'Course Finisher',
      icon: '🏁',
      unit: 'courses',
      value: (m) => Number(m.completedCount) || 0,
      tiers: [
        { id: 'cmp-b', tier: 'Bronze', target: 1, points: 80, description: 'Complete 1 course' },
        { id: 'cmp-s', tier: 'Silver', target: 2, points: 100, description: 'Complete 2 courses' },
      ],
    },
    {
      segment: 'streak',
      label: 'Streak Champion',
      icon: '⚡',
      unit: 'school days',
      value: (m) => Number(m.streak) || 0,
      tiers: [
        { id: 'str-b', tier: 'Bronze', target: 6, points: 70, description: '6-day school streak — 1 week of classes (Sunday is holiday)' },
        { id: 'str-s', tier: 'Silver', target: 12, points: 100, description: '12-day school streak — 2 weeks of classes' },
        { id: 'str-g', tier: 'Gold', target: 25, points: 140, description: '25-day school streak — ~1 month (excl. Sun, public holidays & Odisha festivals)' },
      ],
    },
    {
      segment: 'referral',
      label: 'Growth Guide',
      icon: '🌱',
      unit: 'referrals',
      value: (m) => Number(m.referralsCount) || 0,
      tiers: [
        { id: 'ref-b', tier: 'Bronze', target: 1, points: 80, description: 'Refer 1 friend who joins' },
        { id: 'ref-s', tier: 'Silver', target: 3, points: 100, description: 'Refer 3 friends who join' },
        { id: 'ref-g', tier: 'Gold', target: 5, points: 140, description: 'Refer 5 friends who join' },
      ],
    },
  ];
}

function buildStudentCompetitionMetrics({
  userId,
  linkedStudent,
  walletRows,
  academyAttendanceRows,
  allEnrollments,
  referralsCount = 0,
  referralRewards = 0,
  month = null,
}) {
  const isMonthly = Boolean(month);
  const enrs = allEnrollments.filter(
    (e) => e.studentId === linkedStudent?.id && normalizeCourseId(e.courseId) !== 'trial-course',
  );

  let enrolledCount;
  let completedCount;
  if (isMonthly) {
    enrolledCount = enrs.filter((e) => monthKey(e.createdAt || e.startDate) === month).length;
    completedCount = enrs.filter(
      (e) =>
        String(e.status || '').toLowerCase() === 'completed' &&
        monthKey(e.completedAt || e.updatedAt || e.createdAt) === month,
    ).length;
  } else {
    enrolledCount = new Set(enrs.map((e) => normalizeCourseId(e.courseId))).size;
    completedCount = enrs.filter((e) => String(e.status || '').toLowerCase() === 'completed').length;
  }

  let attendancePct;
  let conductedCount;
  let presentCount;
  if (isMonthly) {
    const acc = computeMonthlyConductedAttendance({
      attendanceRows: academyAttendanceRows,
      enrollments: allEnrollments,
      studentId: linkedStudent?.id,
      month,
    });
    attendancePct = acc.percentage;
    conductedCount = acc.conductedCount;
    presentCount = acc.presentCount;
  } else {
    const acc = computeAttendanceFromConductedClasses({
      attendanceRows: academyAttendanceRows,
      enrollments: allEnrollments,
      studentId: linkedStudent?.id,
    });
    attendancePct = acc.percentage;
    conductedCount = acc.conductedCount;
    presentCount = acc.presentCount;
  }

  const totalClasses = isMonthly
    ? walletRows
        .filter((r) => r.studentId === userId && monthKey(r.date) === month)
        .reduce((s, r) => s + (Number(r.classesCount) || 0), 0)
    : getTotalClassesFromWallet(userId);

  const streak = isMonthly
    ? computeStreakInMonth(walletRows, userId, month)
    : computeCurrentStreak(walletRows, userId);

  return {
    userId,
    period: isMonthly ? 'month' : 'all',
    month: month || null,
    totalClasses,
    attendancePct,
    enrolledCount,
    completedCount,
    streak,
    referralsCount: Number(referralsCount) || 0,
    referralRewards: Number(referralRewards) || 0,
    conductedCount,
    presentCount,
  };
}

function buildAchievementCards(metrics, period = 'all') {
  const tracks = getAchievementTracks(period);
  const cards = [];
  for (const track of tracks) {
    const value = track.value(metrics);
    let prevTierAchieved = true;
    for (let i = 0; i < track.tiers.length; i += 1) {
      const tier = track.tiers[i];
      const achieved = value >= tier.target;
      const locked = i > 0 && !prevTierAchieved;
      cards.push({
        id: tier.id,
        segment: track.segment,
        title: `${track.label} — ${tier.tier}`,
        description: tier.description,
        icon: track.icon,
        tier: tier.tier,
        tierOrder: i,
        target: tier.target,
        unit: track.unit,
        points: tier.points,
        progress: Math.min(tier.target, value),
        achieved,
        locked,
        activeChase: !achieved && !locked,
      });
      prevTierAchieved = achieved;
    }
  }
  return cards;
}

/** Show only the tier currently being chased (hide locked future tiers). */
function filterChaseVisibleCards(cards) {
  const bySegment = new Map();
  for (const c of cards) {
    if (!bySegment.has(c.segment)) bySegment.set(c.segment, []);
    bySegment.get(c.segment).push(c);
  }
  const segmentOrder = ['attendance', 'classes', 'courses', 'completion', 'streak', 'referral'];
  const visible = [];
  for (const segment of segmentOrder) {
    const segCards = bySegment.get(segment);
    if (!segCards?.length) continue;
    const sorted = [...segCards].sort((a, b) => a.tierOrder - b.tierOrder);
    const chasing = sorted.find((c) => c.activeChase);
    if (chasing) {
      visible.push(chasing);
    } else {
      const achieved = sorted.filter((c) => c.achieved);
      if (achieved.length) visible.push(achieved[achieved.length - 1]);
    }
  }
  return visible;
}

function scoreBreakdownFromCards(cards) {
  return cards.map((c) => ({
    id: c.id,
    title: c.title,
    points: c.points,
    achieved: c.achieved,
    locked: c.locked,
    earned: c.achieved
      ? c.points
      : c.locked
        ? 0
        : Math.floor(c.points * 0.25 * Math.min(1, (c.progress || 0) / (c.target || 1))),
  }));
}

/** Score = sum of tier points (each tier adds when achieved) + partial on active chase tier only. */
function computeCompetitionScore(metrics, period = 'all') {
  const cards = buildAchievementCards(metrics, period);
  let score = 0;
  let unlockedCount = 0;
  for (const c of cards) {
    if (c.achieved) {
      score += c.points;
      unlockedCount += 1;
    } else if (c.activeChase) {
      const ratio = c.target > 0 ? Math.min(1, c.progress / c.target) : 0;
      score += Math.floor(c.points * 0.25 * ratio);
    }
  }
  score += Math.min(period === 'month' ? 25 : 50, (Number(metrics.totalClasses) || 0) * 2);
  score += Math.min(period === 'month' ? 20 : 35, (Number(metrics.streak) || 0) * 5);
  score += Math.min(period === 'month' ? 15 : 30, (Number(metrics.referralsCount) || 0) * 8);
  return { score, unlockedCount };
}

function buildAchievementsList(cards) {
  return cards.filter((c) => c.achieved).map((c) => c.title);
}

function buildLeaderboardRows({
  users,
  studentByUser,
  walletRows,
  academyAttendanceRows,
  allEnrollments,
  referralsByUser,
  payoutByUser,
  month,
  period,
}) {
  return users
    .filter((u) => studentByUser.has(String(u.id)))
    .map((u) => {
      const linkedStudent = studentByUser.get(String(u.id)) || null;
      const referralsCount = referralsByUser.get(String(u.id)) || 0;
      const metrics = buildStudentCompetitionMetrics({
        userId: u.id,
        linkedStudent,
        walletRows,
        academyAttendanceRows,
        allEnrollments,
        referralsCount,
        referralRewards: payoutByUser.get(String(u.id)) || 0,
        month: period === 'month' ? month : null,
      });
      const cards = buildAchievementCards(metrics, period);
      const { score: points, unlockedCount: achievementCount } = computeCompetitionScore(metrics, period);
      return {
        userId: u.id,
        name: u.name || String(u.email || '').split('@')[0] || 'Student',
        points,
        achievementCount,
        badges: buildAchievementsList(cards),
        totalClasses: metrics.totalClasses,
        attendancePct: metrics.attendancePct,
        streak: metrics.streak,
        referralsCount: metrics.referralsCount,
        enrolledCount: metrics.enrolledCount,
        completedCount: metrics.completedCount,
      };
    });
}

function rankLeaderboard(rows) {
  return rows
    .sort((a, b) => b.points - a.points || b.achievementCount - a.achievementCount)
    .map((x, i) => ({ ...x, rank: i + 1 }));
}

function getUnlockStartByCourse(enrollments, studentId) {
  const out = new Map();
  for (const e of enrollments) {
    if (e.studentId !== studentId) continue;
    const courseId = normalizeCourseId(e.courseId);
    if (!courseId || courseId === "trial-course") continue;
    const start = String(e.startDate || e.createdAt || "").slice(0, 10);
    if (!start) continue;
    const prev = out.get(courseId);
    if (!prev || start < prev) out.set(courseId, start);
  }
  return out;
}

function computeAttendanceFromConductedClasses({
  attendanceRows,
  enrollments,
  studentId,
}) {
  const unlockStartByCourse = getUnlockStartByCourse(enrollments, studentId);
  if (unlockStartByCourse.size === 0) {
    return { percentage: 0, conductedCount: 0, presentCount: 0 };
  }

  const conductedSet = new Set();
  const presentSet = new Set();
  for (const row of attendanceRows) {
    const courseId = normalizeCourseId(row.courseId);
    const unlockStart = unlockStartByCourse.get(courseId);
    if (!unlockStart) continue;
    const date = String(row.date || "").slice(0, 10);
    if (!date || date < unlockStart) continue;
    const key = `${courseId}|${date}`;
    conductedSet.add(key);
    if (String(row.studentId || "") === String(studentId) && String(row.status || "").toLowerCase() === "present") {
      presentSet.add(key);
    }
  }
  const conductedCount = conductedSet.size;
  const presentCount = presentSet.size;
  const percentage = conductedCount ? Math.round((presentCount / conductedCount) * 100) : 0;
  return { percentage, conductedCount, presentCount };
}

function buildEnrollmentListForCourse(student, courseId, enrollments, batches, enrolledIds) {
  const cid = normalizeCourseId(courseId);
  let list = (enrollments || []).filter(
    (e) =>
      e.studentId === student?.id &&
      normalizeCourseId(e.courseId) === cid &&
      normalizeCourseId(e.courseId) !== "trial-course",
  );
  if (list.length === 0 && student?.batchId) {
    const b = (batches || []).find(
      (b0) => String(b0.id) === String(student.batchId) && normalizeCourseId(b0.courseId) === cid,
    );
    if (b) {
      list = [
        {
          studentId: student.id,
          courseId: cid,
          startDate: b.startDate || student.admissionDate,
          expiresAt: b.endDate,
          createdAt: b.createdAt || student.admissionDate,
        },
      ];
    }
  }
  if (list.length === 0 && enrolledIds?.has(cid) && student) {
    const start0 = parseIsoDate(student.admissionDate || today());
    list = [
      {
        studentId: student.id,
        courseId: cid,
        startDate: start0,
        expiresAt: addDays(start0, minAccessDaysForCourse(cid)),
        createdAt: student.createdAt || today(),
      },
    ];
  }
  return list;
}

function enrichLabCourseForStudent(c, student, enrollments, batches, enrolledIds) {
  const labUnlocked =
    student?.id && studentQualifiesForLab(student.id, enrollments, student, batches);
  if (!labUnlocked) {
    return {
      ...c,
      unlocked: false,
      status: "locked",
      completed: false,
      daysLeft: 0,
      isIncludedBenefit: true,
      unlockFee: 0,
      includedNote: "Included with all courses except Spoken English",
    };
  }
  const qualifying = getQualifyingCourseIdsForStudent(student.id, enrollments, student, batches);
  let bestAccess = null;
  for (const qid of qualifying) {
    const qList = buildEnrollmentListForCourse(student, qid, enrollments, batches, enrolledIds);
    const access = computeCourseAccessFromEnrollments(student.id, qid, qList);
    if (access && (!bestAccess || access.endDate > bestAccess.endDate)) bestAccess = access;
  }
  return {
    ...c,
    unlocked: true,
    isIncludedBenefit: true,
    unlockFee: 0,
    includedNote: "Included with your enrolled course(s)",
    status: bestAccess?.completed ? "completed" : "active",
    completed: !!bestAccess?.completed,
    startDate: bestAccess?.startDate,
    endDate: bestAccess?.endDate,
    daysLeft: bestAccess?.daysLeft ?? 0,
    renewFee: 0,
  };
}

router.get("/profile", studentAuth, (req, res) => {
  const user = getUserById(req.auth.userId);
  if (!user) return res.status(401).json({ error: "User not found" });
  const syncedTotal = getTotalClassesFromWallet(req.auth.userId);
  res.json({
    walletBalance: Number(user.walletBalance) ?? 0,
    totalClassesAttended: syncedTotal,
    vvipValidUntil: user.vvipValidUntil || null,
  });
});

router.post("/scan", studentAuth, (req, res) => {
  const { courseId, date, confirmMultiple } = req.body || {};
  const studentId = req.auth.userId;
  const authUser = getUserById(studentId);
  const student = resolveStudentRecord(authUser);
  const d = (date && String(date).slice(0, 10)) || today();

  const validId = getValidCourseId(courseId);
  if (!validId) {
    return res.status(400).json({
      error: "Invalid course. Scan the correct QR code for the class.",
    });
  }
  if (!isCourseAccessibleForAuthUser(authUser, student, validId)) {
    return res.status(403).json({
      error: "Course is locked for this student. Unlock/enroll first.",
    });
  }

  const alreadyPaid = getAttendanceFor(studentId, validId, d);
  if (alreadyPaid >= 1 && !confirmMultiple) {
    return res.json({
      alreadyPaid: true,
      classesCount: alreadyPaid,
      message: `You already paid for ${alreadyPaid} class(es) today. Pay ₹${PRICE_PER_CLASS} for another?`,
    });
  }

  const result = recordClassAndDeduct(studentId, validId, d);
  if (!result.ok) {
    const status = result.error.includes("Insufficient") ? 400 : 500;
    return res.status(status).json({ error: result.error });
  }
  appendStudentNotification(
    studentId,
    result.vvipFree
      ? `Attendance recorded for ${result.courseName || validId} on ${d} (VVIP — no charge).`
      : `Attendance recorded for ${result.courseName || validId} on ${d}. ₹${PRICE_PER_CLASS} deducted from wallet.`,
    { type: "attendance_wallet" }
  );
  const message = result.vvipFree
    ? "Attendance recorded. No charge (VVIP)."
    : `Attendance recorded. ₹${PRICE_PER_CLASS} deducted.`;
  res.json({
    success: true,
    walletBalance: result.walletBalance,
    totalClassesAttended: result.totalClassesAttended,
    classesToday: result.classesToday,
    courseName: result.courseName,
    vvipFree: result.vvipFree,
    message,
  });
});

router.post("/wallet/add", studentAuth, (req, res) => {
  return res.status(400).json({
    error: "Direct wallet top-up is disabled. Use Wallet Recharge → Payment Request with platform + screenshot, then wait for admin approval.",
  });
});

router.post("/promo/unlimited-month", studentAuth, (req, res) => {
  const result = purchaseUnlimitedMonth(req.auth.userId);
  if (!result.ok) {
    const status = result.error.includes("Insufficient") ? 400 : 500;
    return res.status(status).json({ error: result.error });
  }
  res.json({
    success: true,
    walletBalance: result.walletBalance,
    vvipValidUntil: result.vvipValidUntil,
    message: "You are now a VVIP Student! Unlimited classes for one month.",
  });
});

/** Public: Drive-hosted wallet QR image URLs (avoid serving static payment QR from /public). */
router.get("/portal/wallet-qr-config", (_req, res) => {
  res.json({
    phonepe: process.env.WALLET_QR_DRIVE_URL_PHONEPE || "",
    amazonpay: process.env.WALLET_QR_DRIVE_URL_AMAZONPAY || "",
    paytm: process.env.WALLET_QR_DRIVE_URL_PAYTM || "",
  });
});

router.get("/portal/profile", studentAuth, (req, res) => {
  const authUser = getUserById(req.auth.userId);
  if (!authUser) return res.status(401).json({ error: "User not found" });
  const student = resolveStudentRecord(authUser);
  const isLinked = !!student && student.accountUserId === req.auth.userId;
  const claimOptions = isLinked ? [] : getClaimOptionsForAuth(authUser);
  res.json({
    authUser: {
      id: authUser.id,
      name: authUser.name || "",
      email: authUser.email || "",
      walletBalance: Number(authUser.walletBalance) || 0,
      totalClassesAttended: Number(authUser.totalClassesAttended) || 0,
    },
    student: student || null,
    isLinked,
    claimOptions,
  });
});

router.get("/portal/claim-options", studentAuth, (req, res) => {
  const authUser = getUserById(req.auth.userId);
  if (!authUser) return res.status(401).json({ error: "User not found" });
  const claimOptions = getClaimOptionsForAuth(authUser);
  res.json({ claimOptions });
});

router.post("/portal/claim", studentAuth, (req, res) => {
  const authUser = getUserById(req.auth.userId);
  if (!authUser) return res.status(401).json({ error: "User not found" });
  const studentId = String(req.body?.studentId || '').trim();
  if (!studentId) return res.status(400).json({ error: 'studentId is required' });
  const students = loadJson(ACADEMY_STUDENTS_PATH);
  const idx = students.findIndex((s) => s.id === studentId);
  if (idx < 0) return res.status(404).json({ error: 'Student not found' });
  const existing = students[idx];
  if (existing.accountUserId && existing.accountUserId !== authUser.id) {
    return res.status(409).json({ error: 'This student is already linked to another account' });
  }
  students[idx] = { ...existing, accountUserId: authUser.id };
  saveJson(ACADEMY_STUDENTS_PATH, students);
  res.json({ success: true, student: students[idx] });
});

function daysInMonthString(ym) {
  const [y, m] = String(ym).split("-").map(Number);
  if (!y || !m) return 30;
  return new Date(y, m, 0).getDate();
}

/** Attendance for calendar comes from paid wallet classes only. */
router.get("/portal/attendance", studentAuth, (req, res) => {
  const month = String(req.query.month || monthKey(today()));
  const courseFilter = String(req.query.courseId || "").trim()
    ? normalizeCourseId(req.query.courseId)
    : "";

  const walletRows = loadJson(WALLET_ATTENDANCE_PATH).filter(
    (r) => r.studentId === req.auth.userId && monthKey(r.date) === month,
  );
  const filteredWallet = courseFilter
    ? walletRows.filter((r) => normalizeCourseId(r.courseId) === courseFilter)
    : walletRows;

  const dayMap = new Map();

  for (const r of filteredWallet) {
    const d = String(r.date || "").slice(0, 10);
    if (!d) continue;
    const cnt = Number(r.classesCount) || 0;
    if (!dayMap.has(d)) {
      dayMap.set(d, { classesCount: 0 });
    }
    const e = dayMap.get(d);
    e.classesCount += cnt;
  }

  const holidays = getHolidaysForMonth(month);
  const holidayMap = new Map(holidays.map((h) => [h.date, h]));
  for (const h of holidays) {
    if (!holidayMap.has(h.date)) holidayMap.set(h.date, h);
  }

  const now = today();
  const isCurrentMonth = month === monthKey(now);
  const schoolDaysDenominator = countSchoolDaysInMonth(month, isCurrentMonth ? now : null);
  const schoolDaysInMonth = countSchoolDaysInMonth(month);

  let presentSchoolDays = 0;
  const attendance = [];

  for (const [date, e] of [...dayMap.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const present = e.classesCount > 0;
    const holiday = getHolidayInfo(date);
    if (present && !isNonClassDay(date)) presentSchoolDays += 1;
    attendance.push({
      id: `day-${date}-${courseFilter || "all"}`,
      date,
      status: present ? "present" : "none",
      classesCount: e.classesCount,
      isNonClassDay: isNonClassDay(date),
      holiday: holiday
        ? { name: holiday.name, type: holiday.type }
        : null,
    });
  }

  const monthlyPercentage = schoolDaysDenominator
    ? Math.round((presentSchoolDays / schoolDaysDenominator) * 100)
    : 0;

  res.json({
    studentId: req.auth.userId,
    month,
    courseId: courseFilter || null,
    attendance,
    holidays,
    monthlyPercentage,
    daysInMonth: daysInMonthString(month),
    presentDaysCount: presentSchoolDays,
    schoolDaysInMonth,
    schoolDaysDenominator,
    calendarNote:
      "Attendance % counts only school days (Mon–Sat excluding Odisha public holidays & festivals). Sunday is always a weekly holiday.",
  });
});

router.get("/portal/fees", studentAuth, (req, res) => {
  const authUser = getUserById(req.auth.userId);
  const student = resolveStudentRecord(authUser);
  const payments = student
    ? loadJson(ACADEMY_FEES_PATH).filter((p) => p.studentId === student.id).slice().reverse()
    : [];
  const requests = loadJson(PAYMENT_REQUESTS_PATH)
    .filter((r) => r.authUserId === req.auth.userId)
    .slice()
    .reverse();
  const totalPaid = payments
    .filter((p) => p.feeStatus === "paid" || p.feeStatus === "discounted")
    .reduce((a, b) => a + (Number(b.amount) || 0), 0);
  res.json({
    totalPaid,
    walletBalance: Number(authUser?.walletBalance) || 0,
    payments,
    paymentRequests: requests,
  });
});

router.post("/portal/payment-requests", studentAuth, (req, res) => {
  const { amount, platform, mode, screenshot, note } = req.body || {};
  const platformValue = String(platform || mode || "").trim();
  if (!amount || !platformValue) return res.status(400).json({ error: "amount and platform are required" });
  const list = loadJson(PAYMENT_REQUESTS_PATH);
  const next = {
    id: `payreq-${Date.now()}`,
    authUserId: req.auth.userId,
    amount: Number(amount) || 0,
    mode: platformValue,
    platform: platformValue,
    screenshot: screenshot || "",
    note: String(note || ""),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  list.push(next);
  saveJson(PAYMENT_REQUESTS_PATH, list);
  res.json({ success: true, request: next });
});

/** Student started wallet top-up: notify admin (name, contact, amounts). */
router.post("/portal/payment-attempt", studentAuth, (req, res) => {
  const authUser = getUserById(req.auth.userId);
  if (!authUser) return res.status(401).json({ error: "User not found" });
  const student = resolveStudentRecord(authUser);
  const { topUpAmount, platform, creditedAmount } = req.body || {};
  const paid = Number(topUpAmount) || 0;
  const credit = Number(creditedAmount) || paid;
  const plat = String(platform || "").trim();
  if (!paid || !plat) {
    return res.status(400).json({ error: "topUpAmount and platform are required" });
  }
  const name = authUser.name || "Student";
  const phone = student?.phone || authUser.email || "—";

  const alerts = loadJson(ADMIN_ALERTS_PATH);
  alerts.push({
    id: `alert-${Date.now()}`,
    type: "payment_attempt",
    studentName: String(name),
    studentPhone: String(phone),
    authUserId: req.auth.userId,
    topUpAmount: paid,
    creditedAmount: credit,
    platform: plat,
    createdAt: new Date().toISOString(),
  });
  saveJson(ADMIN_ALERTS_PATH, alerts);
  res.json({ success: true });
});

router.get("/portal/notifications", studentAuth, (req, res) => {
  const list = loadJson(STUDENT_NOTIFICATIONS_PATH).filter((n) => n.userId === req.auth.userId);
  res.json({ notifications: list.slice().reverse().slice(0, 50) });
});

router.post("/portal/notifications/mark-read", studentAuth, (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  const list = loadJson(STUDENT_NOTIFICATIONS_PATH);
  for (const n of list) {
    if (n.userId === req.auth.userId && ids.includes(n.id)) n.read = true;
  }
  saveJson(STUDENT_NOTIFICATIONS_PATH, list);
  res.json({ success: true });
});

router.get("/portal/courses", studentAuth, (req, res) => {
  const authUser = getUserById(req.auth.userId);
  const student = resolveStudentRecord(authUser);
  const courses = getCourseCatalog();
  const batches = loadJson(ACADEMY_BATCHES_PATH);
  const enrollments = loadJson(ENROLLMENTS_HISTORY_PATH);
  const enrolledIds = new Set();
  for (const e of enrollments) if (e.studentId === student?.id) enrolledIds.add(normalizeCourseId(e.courseId));
  if (student?.courseEnrolled) enrolledIds.add(normalizeCourseId(student.courseEnrolled));
  for (const cid of Array.isArray(student?.selectedCourseIds) ? student.selectedCourseIds : []) {
    enrolledIds.add(normalizeCourseId(cid));
  }
  if (student?.batchId) {
    const assigned = batches.find((b) => b.id === student.batchId);
    if (assigned?.courseId) enrolledIds.add(normalizeCourseId(assigned.courseId));
  }
  if (student?.id && studentQualifiesForLab(student.id, enrollments, student, batches)) {
    enrolledIds.add(LAB_COURSE_ID);
  }
  const allCourses = courses.map((c) => {
    const id = normalizeCourseId(c.id);
    const isIncludedBenefit = !!c.isIncludedBenefit || id === LAB_COURSE_ID;
    return {
      ...c,
      id,
      isIncludedBenefit,
      unlockFee: isIncludedBenefit ? 0 : Number(COURSE_UNLOCK_FEES[id] ?? c.unlockFee ?? 499),
      unlocked: enrolledIds.has(id),
    };
  });
  const trial = enrollments
    .filter((e) => e.studentId === student?.id && String(e.courseId) === "trial-course")
    .slice()
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))[0] || null;

  const enrichedCourses = allCourses.map((c) => {
    if (c.id === LAB_COURSE_ID) {
      return enrichLabCourseForStudent(c, student, enrollments, batches, enrolledIds);
    }
    if (!enrolledIds.has(c.id)) return { ...c, status: "locked", completed: false, daysLeft: 0 };
    const list = buildEnrollmentListForCourse(student, c.id, enrollments, batches, enrolledIds);
    const access = computeCourseAccessFromEnrollments(student?.id, c.id, list);
    if (!access) return { ...c, status: "locked", completed: false, daysLeft: 0 };
    const renewFee = Math.round((Number(c.unlockFee) || 0) * 0.6);
    return {
      ...c,
      status: access.completed ? "completed" : "active",
      completed: access.completed,
      startDate: access.startDate,
      endDate: access.endDate,
      daysLeft: access.daysLeft,
      renewFee,
    };
  });
  const enrolledCourses = enrichedCourses.filter((c) => c.unlocked);
  const normalizedEnrolled = new Set([...enrolledIds].map((x) => normalizeCourseId(x)));
  const mappedBatches = batches
    .filter((b) => normalizedEnrolled.has(normalizeCourseId(b.courseId)))
    .map((b) => {
      const teacherIds = Array.isArray(b.teacherIds)
        ? b.teacherIds.map((x) => String(x))
        : b.teacherId
          ? [String(b.teacherId)]
          : [];
      return {
        ...b,
        mode: String(b.mode || "online"),
        status: computeBatchLifecycleStatus(b),
        teacherIds,
        teacherId: teacherIds[0] || "",
      };
    });
  const memberSet = new Set(studentBatchIdsForPortal(student));
  const assignedBatches = mappedBatches.filter((b) => memberSet.has(b.id));
  const assignedBatch =
    assignedBatches.length > 0 ? assignedBatches[assignedBatches.length - 1] : student?.batchId
      ? mappedBatches.find((b) => b.id === student.batchId) || null
      : null;
  const upcomingBatches = mappedBatches.filter((b) => b.status === "upcoming").slice(0, 8);
  let trialInfo = null;
  if (trial) {
    const expiresAt = parseIsoDate(trial.expiresAt || addDays(trial.createdAt || today(), 7));
    const daysLeft = daysLeftUntil(expiresAt);
    trialInfo = {
      id: trial.id,
      status: daysLeft === 0 ? "completed" : "active",
      expiresAt,
      daysLeft,
      title: "1 Week Trial Course",
    };
  }
  res.json({
    student: student || null,
    assignedBatch,
    assignedBatches,
    enrolledCourses,
    allCourses: enrichedCourses,
    upcomingBatches,
    trialInfo,
  });
});

router.post("/portal/courses/unlock", studentAuth, (req, res) => {
  const authUser = getUserById(req.auth.userId);
  if (!authUser) return res.status(401).json({ error: "User not found" });
  const student = resolveStudentRecord(authUser);
  if (!student) return res.status(400).json({ error: "Link your Student ID first to unlock courses." });
  const courseId = normalizeCourseId(req.body?.courseId);
  const confirmUnlock = !!req.body?.confirmUnlock;
  if (!courseId) return res.status(400).json({ error: "courseId is required" });

  const course = getCourseCatalog().find((c) => normalizeCourseId(c.id) === courseId);
  if (!course) return res.status(404).json({ error: "Course not found" });
  if (courseId === LAB_COURSE_ID || course.isIncludedBenefit) {
    return res.status(400).json({
      error:
        "Computer LAB is included automatically when you enroll in any course except Spoken English. Unlock a qualifying course first.",
    });
  }
  const unlockFee = Number(COURSE_UNLOCK_FEES[courseId] ?? course.unlockFee ?? 499);

  const enrollments = loadJson(ENROLLMENTS_HISTORY_PATH);
  const already = enrollments.some(
    (e) => e.studentId === student.id && normalizeCourseId(e.courseId) === courseId
  );
  if (already) return res.json({ success: true, alreadyUnlocked: true, message: "Course already unlocked." });

  if (!confirmUnlock) {
    return res.json({
      confirmRequired: true,
      courseId,
      unlockFee,
      message: `Unlock fee ₹${unlockFee} will be deducted from wallet.`,
    });
  }

  const currentBalance = Number(authUser.walletBalance) || 0;
  if (currentBalance < unlockFee) {
    return res.status(400).json({
      error: `Insufficient wallet balance. Need ₹${unlockFee}, available ₹${currentBalance}. Add balance first.`,
      requiredAmount: unlockFee,
      walletBalance: currentBalance,
    });
  }

  const users = getUsers();
  const idx = users.findIndex((u) => u.id === authUser.id);
  if (idx < 0) return res.status(404).json({ error: "User not found" });
  users[idx] = { ...users[idx], walletBalance: currentBalance - unlockFee };
  saveUsers(users);

  const nextEnrollment = {
    id: `enr-${Date.now()}`,
    studentId: student.id,
    courseId,
    batchId: "",
    note: `Course unlocked from wallet. Fee deducted ₹${unlockFee}`,
    status: "active",
    startDate: today(),
    expiresAt: addDays(today(), minAccessDaysForCourse(courseId)),
    createdAt: new Date().toISOString(),
  };
  enrollments.push(nextEnrollment);
  saveJson(ENROLLMENTS_HISTORY_PATH, enrollments);
  removeAdmissionQueueByPhone(student.phone || authUser.email || "");

  appendStudentNotification(
    req.auth.userId,
    `Course unlocked: ${course.name || courseId}. ₹${unlockFee} deducted from your wallet.`,
    { type: "course_unlock" }
  );

  res.json({
    success: true,
    courseId,
    unlockFee,
    walletBalance: Number(users[idx].walletBalance) || 0,
    message: `Course unlocked successfully. ₹${unlockFee} deducted from wallet.`,
  });
});

router.post("/portal/courses/renew", studentAuth, (req, res) => {
  const authUser = getUserById(req.auth.userId);
  if (!authUser) return res.status(401).json({ error: "User not found" });
  const student = resolveStudentRecord(authUser);
  if (!student) return res.status(400).json({ error: "Link your Student ID first." });
  const courseId = normalizeCourseId(req.body?.courseId);
  if (!courseId) return res.status(400).json({ error: "courseId is required" });
  const course = getCourseCatalog().find((c) => normalizeCourseId(c.id) === courseId);
  if (!course) return res.status(404).json({ error: "Course not found" });
  if (courseId === LAB_COURSE_ID || course.isIncludedBenefit) {
    return res.status(400).json({
      error:
        "Computer LAB access follows your enrolled course period and cannot be renewed separately.",
    });
  }

  const enrollments = loadJson(ENROLLMENTS_HISTORY_PATH);
  const batches = loadJson(ACADEMY_BATCHES_PATH);
  let list = enrollments.filter(
    (e) =>
      e.studentId === student?.id &&
      normalizeCourseId(e.courseId) === courseId &&
      normalizeCourseId(e.courseId) !== "trial-course",
  );
  if (list.length === 0 && student?.batchId) {
    const b = batches.find(
      (b0) => String(b0.id) === String(student.batchId) && normalizeCourseId(b0.courseId) === courseId,
    );
    if (b) {
      list = [
        {
          studentId: student.id,
          courseId,
          startDate: b.startDate || student.admissionDate,
          expiresAt: b.endDate,
          createdAt: b.createdAt || student.admissionDate,
        },
      ];
    }
  }
  const access = computeCourseAccessFromEnrollments(student.id, courseId, list);
  if (!access || !access.completed) {
    return res.status(400).json({
      error: "Renew is available only after your course access period has ended.",
      daysLeft: access?.daysLeft ?? 0,
      endDate: access?.endDate,
    });
  }

  const baseFee = Number(COURSE_UNLOCK_FEES[courseId] ?? course.unlockFee ?? 499);
  const renewFee = Math.round(baseFee * 0.6);
  const bal = Number(authUser.walletBalance) || 0;
  if (bal < renewFee) {
    return res.status(400).json({
      error: `Insufficient wallet balance. Need ₹${renewFee}, available ₹${bal}.`,
      renewFee,
      walletBalance: bal,
    });
  }
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === authUser.id);
  users[idx] = { ...users[idx], walletBalance: bal - renewFee };
  saveUsers(users);
  enrollments.push({
    id: `enr-${Date.now()}-renew`,
    studentId: student.id,
    courseId,
    batchId: "",
    note: `Course renewed at 40% discount. Fee deducted ₹${renewFee}`,
    status: "active",
    startDate: today(),
    expiresAt: addDays(today(), minAccessDaysForCourse(courseId)),
    createdAt: new Date().toISOString(),
  });
  saveJson(ENROLLMENTS_HISTORY_PATH, enrollments);
  appendStudentNotification(
    req.auth.userId,
    `Course renewed: ${course.name || courseId}. ₹${renewFee} deducted from wallet (40% renewal rate).`,
    { type: "course_renew" }
  );
  return res.json({
    success: true,
    courseId,
    renewFee,
    walletBalance: Number(users[idx].walletBalance) || 0,
    message: `Course renewed successfully at 40% discount. ₹${renewFee} deducted.`,
  });
});

router.get("/portal/course-content/:courseId", studentAuth, (req, res) => {
  const authUser = getUserById(req.auth.userId);
  if (!authUser) return res.status(401).json({ error: "User not found" });
  const student = resolveStudentRecord(authUser);
  if (!student) return res.status(400).json({ error: "Link your Student ID first." });
  const courseId = normalizeCourseId(req.params.courseId);
  if (!isCourseUnlockedForStudent(student.id, courseId)) {
    return res.status(403).json({ error: "Course is locked. Unlock it first." });
  }

  const courses = getCourseCatalog();
  const course = courses.find((c) => normalizeCourseId(c.id) === courseId);
  if (!course) return res.status(404).json({ error: "Course not found" });

  const tree = loadJson(ACADEMY_CONTENT_PATH);
  const courseNode = tree.find((x) => normalizeCourseId(x.courseId) === courseId) || { modules: [] };
  const progressList = loadJson(STUDENT_PROGRESS_PATH);
  const progress =
    progressList.find((p) => p.studentId === student.id && normalizeCourseId(p.courseId) === courseId) ||
    { studentId: student.id, courseId, completedChapterIds: [] };
  const completedSet = new Set((progress.completedChapterIds || []).map(String));
  const flatOrder = getFlatChapterOrder(courseNode);
  const unlockedSet = new Set();
  if (flatOrder.length > 0) unlockedSet.add(flatOrder[0]);
  for (let i = 0; i < flatOrder.length; i += 1) {
    if (completedSet.has(flatOrder[i]) && flatOrder[i + 1]) unlockedSet.add(flatOrder[i + 1]);
  }
  const modules = (courseNode.modules || [])
    .slice()
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
    .map((m) => ({
      ...m,
      chapters: (m.chapters || [])
        .slice()
        .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
        .map((c) => ({
          ...normalizeChapterForStudent(c),
          unlocked: unlockedSet.has(String(c.id)),
          completed: completedSet.has(String(c.id)),
        })),
    }));
  const progressPercent = flatOrder.length
    ? Math.round((completedSet.size / flatOrder.length) * 100)
    : 0;
  return res.json({
    course,
    modules,
    progressPercent,
    completedCount: completedSet.size,
    totalChapters: flatOrder.length,
  });
});

router.post("/portal/course-content/:courseId/chapters/:chapterId/complete", studentAuth, (req, res) => {
  const authUser = getUserById(req.auth.userId);
  if (!authUser) return res.status(401).json({ error: "User not found" });
  const student = resolveStudentRecord(authUser);
  if (!student) return res.status(400).json({ error: "Link your Student ID first." });
  const courseId = normalizeCourseId(req.params.courseId);
  const chapterId = String(req.params.chapterId);
  if (!isCourseUnlockedForStudent(student.id, courseId)) {
    return res.status(403).json({ error: "Course is locked. Unlock it first." });
  }
  const tree = loadJson(ACADEMY_CONTENT_PATH);
  const courseNode = tree.find((x) => normalizeCourseId(x.courseId) === courseId);
  if (!courseNode) return res.status(404).json({ error: "Course content not found" });
  const flatOrder = getFlatChapterOrder(courseNode);
  if (!flatOrder.includes(chapterId)) return res.status(404).json({ error: "Chapter not found" });

  const progressList = loadJson(STUDENT_PROGRESS_PATH);
  let idx = progressList.findIndex(
    (p) => p.studentId === student.id && normalizeCourseId(p.courseId) === courseId
  );
  if (idx < 0) {
    progressList.push({
      id: `prog-${Date.now()}`,
      studentId: student.id,
      courseId,
      completedChapterIds: [],
      createdAt: new Date().toISOString(),
    });
    idx = progressList.length - 1;
  }
  const completedSet = new Set((progressList[idx].completedChapterIds || []).map(String));
  const unlockedSet = new Set();
  if (flatOrder.length > 0) unlockedSet.add(flatOrder[0]);
  for (let i = 0; i < flatOrder.length; i += 1) {
    if (completedSet.has(flatOrder[i]) && flatOrder[i + 1]) unlockedSet.add(flatOrder[i + 1]);
  }
  if (!unlockedSet.has(chapterId) && !completedSet.has(chapterId)) {
    return res.status(400).json({ error: "Complete previous chapter first." });
  }
  completedSet.add(chapterId);
  progressList[idx] = {
    ...progressList[idx],
    completedChapterIds: Array.from(completedSet),
    updatedAt: new Date().toISOString(),
  };
  saveJson(STUDENT_PROGRESS_PATH, progressList);

  if (completedSet.size >= flatOrder.length && flatOrder.length > 0) {
    const enrollments = loadJson(ENROLLMENTS_HISTORY_PATH);
    const eIdx = enrollments
      .map((e, i) => ({ e, i }))
      .filter(({ e }) => e.studentId === student.id && normalizeCourseId(e.courseId) === courseId)
      .sort((a, b) => String(b.e.createdAt || "").localeCompare(String(a.e.createdAt || "")))[0];
    if (eIdx) {
      enrollments[eIdx.i] = {
        ...enrollments[eIdx.i],
        status: "completed",
        completedAt: new Date().toISOString(),
      };
      saveJson(ENROLLMENTS_HISTORY_PATH, enrollments);
    }
  }

  return res.json({ success: true, completedChapterIds: Array.from(completedSet) });
});

router.get("/portal/materials", studentAuth, (req, res) => {
  const authUser = getUserById(req.auth.userId);
  const student = resolveStudentRecord(authUser);
  const courseId = String(req.query.courseId || "");
  const batchId = String(req.query.batchId || student?.batchId || "");
  const notes = loadJson(ACADEMY_NOTES_PATH).filter(
    (n) => (!courseId || n.courseId === courseId || !n.courseId) && (!batchId || n.batchId === batchId || !n.batchId),
  );
  res.json({ notes: notes.slice().reverse() });
});

router.get("/portal/referrals", studentAuth, (req, res) => {
  const month = String(req.query.month || monthKey(today()));
  const links = loadJson(REFERRAL_LINKS_PATH).filter((x) => x.referrerUserId === req.auth.userId);
  const payouts = loadJson(REFERRAL_PAYOUTS_PATH)
    .filter((x) => x.referrerUserId === req.auth.userId && (!month || x.month === month))
    .slice()
    .reverse();
  res.json({
    studentsReferred: links.length,
    month,
    rewardsEarned: payouts.reduce((a, b) => a + (Number(b.amount) || 0), 0),
    payouts,
  });
});

router.get("/portal/certificates", studentAuth, (req, res) => {
  const authUser = getUserById(req.auth.userId);
  const student = resolveStudentRecord(authUser);
  const certs = loadJson(ACADEMY_CERTIFICATES_PATH)
    .filter((c) => c.studentId === student?.id)
    .slice()
    .reverse();
  const requests = loadJson(CERTIFICATE_REQUESTS_PATH)
    .filter((r) => r.authUserId === req.auth.userId)
    .slice()
    .reverse();
  res.json({ certificates: certs, requests });
});

router.post("/portal/certificates/request", studentAuth, (req, res) => {
  const { courseName } = req.body || {};
  if (!courseName) return res.status(400).json({ error: "courseName is required" });
  const list = loadJson(CERTIFICATE_REQUESTS_PATH);
  const next = {
    id: `creq-${Date.now()}`,
    authUserId: req.auth.userId,
    courseName: String(courseName),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  list.push(next);
  saveJson(CERTIFICATE_REQUESTS_PATH, list);
  res.json({ success: true, request: next });
});

router.get("/portal/dashboard", studentAuth, (req, res) => {
  const authUser = getUserById(req.auth.userId);
  const student = resolveStudentRecord(authUser);
  const walletRows = loadJson(WALLET_ATTENDANCE_PATH);
  const academyAttendanceRows = loadJson(ACADEMY_ATTENDANCE_PATH);
  const allEnrollments = loadJson(ENROLLMENTS_HISTORY_PATH);
  const attendanceFromConducted = computeAttendanceFromConductedClasses({
    attendanceRows: academyAttendanceRows,
    enrollments: allEnrollments,
    studentId: student?.id,
  });
  const attendancePct = attendanceFromConducted.percentage;
  const payouts = loadJson(REFERRAL_PAYOUTS_PATH).filter((p) => p.referrerUserId === req.auth.userId);
  const rewards = payouts.reduce((a, b) => a + (Number(b.amount) || 0), 0);
  const referralLinks = loadJson(REFERRAL_LINKS_PATH);
  const currentMonth = monthKey(today());
  const referralsByUserAll = countReferralsByUser(referralLinks);
  const referralsByUserMonth = countReferralsByUser(referralLinks, currentMonth);
  const myReferralsCount = referralsByUserAll.get(String(req.auth.userId)) || 0;
  const myReferralsCountMonth = referralsByUserMonth.get(String(req.auth.userId)) || 0;

  const myMetrics = buildStudentCompetitionMetrics({
    userId: req.auth.userId,
    linkedStudent: student,
    walletRows,
    academyAttendanceRows,
    allEnrollments,
    referralsCount: myReferralsCount,
    referralRewards: rewards,
  });
  const myMetricsMonth = buildStudentCompetitionMetrics({
    userId: req.auth.userId,
    linkedStudent: student,
    walletRows,
    academyAttendanceRows,
    allEnrollments,
    referralsCount: myReferralsCountMonth,
    referralRewards: rewards,
    month: currentMonth,
  });

  const achievementCardsAll = buildAchievementCards(myMetrics, 'all');
  const achievementCardsMonthAll = buildAchievementCards(myMetricsMonth, 'month');
  const achievementCards = filterChaseVisibleCards(achievementCardsAll);
  const achievementCardsMonth = filterChaseVisibleCards(achievementCardsMonthAll);
  const achievements = buildAchievementsList(achievementCardsAll);
  const { score: competitionScore, unlockedCount: achievementsUnlocked } = computeCompetitionScore(myMetrics, 'all');
  const { score: competitionScoreMonth, unlockedCount: achievementsUnlockedMonth } = computeCompetitionScore(
    myMetricsMonth,
    'month',
  );

  const totalClassesAttended = myMetrics.totalClasses;
  const enrolledCount = myMetrics.enrolledCount;
  const completedCount = myMetrics.completedCount;
  const streak = myMetrics.streak;
  const courseProgress = Math.min(100, Math.round((totalClassesAttended / 100) * 100));

  const students = loadJson(ACADEMY_STUDENTS_PATH);
  const users = getUsers().filter((u) => u.role === 'student');
  const studentByUser = new Map(
    students.filter((s) => s.accountUserId).map((s) => [String(s.accountUserId), s]),
  );
  const payoutByUser = new Map();
  for (const p of loadJson(REFERRAL_PAYOUTS_PATH)) {
    const uid = String(p.referrerUserId || '');
    payoutByUser.set(uid, (payoutByUser.get(uid) || 0) + (Number(p.amount) || 0));
  }

  const allTimeRows = buildLeaderboardRows({
    users,
    studentByUser,
    walletRows,
    academyAttendanceRows,
    allEnrollments,
    referralsByUser: referralsByUserAll,
    payoutByUser,
    month: currentMonth,
    period: 'all',
  });
  const monthRows = buildLeaderboardRows({
    users,
    studentByUser,
    walletRows,
    academyAttendanceRows,
    allEnrollments,
    referralsByUser: referralsByUserMonth,
    payoutByUser,
    month: currentMonth,
    period: 'month',
  });
  const rankedAllTime = rankLeaderboard(allTimeRows);
  const rankedMonth = rankLeaderboard(monthRows);
  const leaderboard = rankedAllTime.slice(0, 10);
  const leaderboardMonth = rankedMonth.slice(0, 10);
  const myRank = rankedAllTime.find((x) => x.userId === req.auth.userId)?.rank || null;
  const myRankMonth = rankedMonth.find((x) => x.userId === req.auth.userId)?.rank || null;

  const monthLabel = new Date(`${currentMonth}-01T00:00:00.000Z`).toLocaleString('en-IN', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  res.json({
    attendancePercentage: attendancePct,
    achievements,
    achievementsUnlocked,
    achievementsUnlockedMonth,
    courseProgress,
    rewards,
    earnedByReferring: rewards,
    referralsCount: myReferralsCount,
    referralsCountMonth: myReferralsCountMonth,
    walletBalance: Number(authUser?.walletBalance) || 0,
    totalClassesAttended,
    totalClassesAttendedMonth: myMetricsMonth.totalClasses,
    currentStreak: streak,
    currentStreakMonth: myMetricsMonth.streak,
    enrolledCourseCount: enrolledCount,
    completedCourseCount: completedCount,
    competitionScore,
    competitionScoreMonth,
    rank: myRank || null,
    rankMonth: myRankMonth || null,
    achievementCards,
    achievementCardsMonth,
    leaderboard,
    leaderboardMonth,
    currentMonth,
    currentMonthLabel: monthLabel,
    scoreBreakdown: scoreBreakdownFromCards(filterChaseVisibleCards(achievementCardsAll)),
    scoreBreakdownMonth: scoreBreakdownFromCards(filterChaseVisibleCards(achievementCardsMonthAll)),
    classesConductedCount: attendanceFromConducted.conductedCount,
    classesPresentCount: attendanceFromConducted.presentCount,
    attendancePercentageMonth: myMetricsMonth.attendancePct,
  });
});

export default router;
