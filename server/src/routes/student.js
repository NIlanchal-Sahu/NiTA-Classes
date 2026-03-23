import { Router } from "express";
import { verifyToken, getUserById } from "../auth.js";
import { getUsers, saveUsers } from "../auth.js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  getValidCourseId,
  getAttendanceFor,
  recordClassAndDeduct,
  isVvipActive,
  purchaseUnlimitedMonth,
} from "../student.js";

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
};
const COURSE_DURATION_DAYS = {
  dca: 90,
  cca: 180,
  "spoken-english-mastery": 90,
  "ai-associate": 180,
  "ai-video-creation": 60,
};

function loadJson(path) {
  if (!existsSync(path)) return [];
  try {
    return JSON.parse(readFileSync(path, "utf8") || "[]");
  } catch {
    return [];
  }
}

function saveJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2), "utf8");
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
  const fromAcademy = academy.map((c) => {
    const id = normalizeCourseId(c.id);
    return {
      id,
      name: c.name || id,
      description: c.description || "",
      unlockFee: Number(COURSE_UNLOCK_FEES[id] ?? c.price ?? 499),
    };
  });
  if (fromAcademy.length > 0) return fromAcademy;
  return [
    { id: "dca", name: "DCA (Basic Computer Course)", unlockFee: 499 },
    { id: "cca", name: "CCA (Computer Application)", unlockFee: 999 },
    { id: "spoken-english-mastery", name: "Spoken English Mastery", unlockFee: 499 },
    { id: "ai-associate", name: "AI Associate (Python)", unlockFee: 1499 },
    { id: "ai-video-creation", name: "AI Video Creation Course", unlockFee: 499 },
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

function isCourseUnlockedForStudent(studentId, courseId) {
  const enrollments = loadJson(ENROLLMENTS_HISTORY_PATH);
  return enrollments.some(
    (e) => e.studentId === studentId && normalizeCourseId(e.courseId) === normalizeCourseId(courseId)
  );
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

router.get("/profile", studentAuth, (req, res) => {
  const user = getUserById(req.auth.userId);
  if (!user) return res.status(401).json({ error: "User not found" });
  res.json({
    walletBalance: Number(user.walletBalance) ?? 0,
    totalClassesAttended: Number(user.totalClassesAttended) ?? 0,
    vvipValidUntil: user.vvipValidUntil || null,
  });
});

router.post("/scan", studentAuth, (req, res) => {
  const { courseId, date, confirmMultiple } = req.body || {};
  const studentId = req.auth.userId;
  const d = (date && String(date).slice(0, 10)) || today();

  const validId = getValidCourseId(courseId);
  if (!validId) {
    return res.status(400).json({
      error: "Invalid course. Scan the correct QR code for the class.",
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

/**
 * Attendance for calendar:
 * - Primary: wallet pay-for-class rows in `attendance.json` (studentId = auth user id)
 * - Optional: academy_attendance.json (studentId = academy student id, manual present/absent)
 * - No courseId: aggregate all courses — a day is "present" if any class was paid/attended
 * - With courseId: only that course's sessions count for that day
 */
router.get("/portal/attendance", studentAuth, (req, res) => {
  const authUser = getUserById(req.auth.userId);
  const student = resolveStudentRecord(authUser);
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
      dayMap.set(d, { classesCount: 0, academyPresent: false, academyAbsent: false });
    }
    const e = dayMap.get(d);
    e.classesCount += cnt;
  }

  if (student) {
    const academyRows = loadJson(ACADEMY_ATTENDANCE_PATH).filter(
      (r) => r.studentId === student.id && monthKey(r.date) === month,
    );
    for (const r of academyRows) {
      if (courseFilter && normalizeCourseId(r.courseId) !== courseFilter) continue;
      const d = String(r.date || "").slice(0, 10);
      if (!d) continue;
      if (!dayMap.has(d)) {
        dayMap.set(d, { classesCount: 0, academyPresent: false, academyAbsent: false });
      }
      const e = dayMap.get(d);
      const st = String(r.status || "").toLowerCase();
      if (st === "present") e.academyPresent = true;
      if (st === "absent") e.academyAbsent = true;
    }
  }

  const dim = daysInMonthString(month);
  let presentDayCount = 0;
  const attendance = [];

  for (const [date, e] of [...dayMap.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const paidOrAttended = e.classesCount > 0;
    const present = paidOrAttended || e.academyPresent;
    const absent = e.academyAbsent && !present;
    if (present) presentDayCount += 1;
    attendance.push({
      id: `day-${date}-${courseFilter || "all"}`,
      date,
      status: present ? "present" : absent ? "absent" : "none",
      classesCount: e.classesCount,
    });
  }

  const monthlyPercentage = dim ? Math.round((presentDayCount / dim) * 100) : 0;

  res.json({
    studentId: student?.id || null,
    month,
    courseId: courseFilter || null,
    attendance,
    monthlyPercentage,
    daysInMonth: dim,
    presentDaysCount: presentDayCount,
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
  if (student?.batchId) {
    const assigned = batches.find((b) => b.id === student.batchId);
    if (assigned?.courseId) enrolledIds.add(normalizeCourseId(assigned.courseId));
  }
  const allCourses = courses.map((c) => ({
    ...c,
    id: normalizeCourseId(c.id),
    unlockFee: Number(COURSE_UNLOCK_FEES[normalizeCourseId(c.id)] ?? c.unlockFee ?? 499),
    unlocked: enrolledIds.has(normalizeCourseId(c.id)),
  }));
  const trial = enrollments
    .filter((e) => e.studentId === student?.id && String(e.courseId) === "trial-course")
    .slice()
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))[0] || null;

  const enrollByCourse = {};
  for (const e of enrollments) {
    if (e.studentId !== student?.id) continue;
    const cid = normalizeCourseId(e.courseId);
    if (!cid || cid === "trial-course") continue;
    if (!enrollByCourse[cid] || String(e.createdAt || "") > String(enrollByCourse[cid].createdAt || "")) {
      enrollByCourse[cid] = e;
    }
  }

  const enrichedCourses = allCourses.map((c) => {
    const enr = enrollByCourse[c.id] || null;
    if (!enr) return { ...c, status: "locked", completed: false, daysLeft: 0 };
    const startDate = parseIsoDate(enr.startDate || enr.createdAt || today());
    const endDate = parseIsoDate(enr.expiresAt || addDays(startDate, COURSE_DURATION_DAYS[c.id] || 90));
    const left = daysLeftUntil(endDate);
    const completed = left === 0;
    const renewFee = Math.round((Number(c.unlockFee) || 0) * 0.6);
    return {
      ...c,
      status: completed ? "completed" : "active",
      completed,
      startDate,
      endDate,
      daysLeft: left,
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
  const assignedBatch = student?.batchId ? mappedBatches.find((b) => b.id === student.batchId) || null : null;
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
  res.json({ student: student || null, assignedBatch, enrolledCourses, allCourses: enrichedCourses, upcomingBatches, trialInfo });
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
  const unlockFee = Number(COURSE_UNLOCK_FEES[courseId] ?? course.unlockFee ?? 499);

  const enrollments = loadJson(ENROLLMENTS_HISTORY_PATH);
  const already = enrollments.some(
    (e) => e.studentId === student.id && normalizeCourseId(e.courseId) === courseId
  ) || normalizeCourseId(student.courseEnrolled) === courseId;
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
    expiresAt: addDays(today(), COURSE_DURATION_DAYS[courseId] || 90),
    createdAt: new Date().toISOString(),
  };
  enrollments.push(nextEnrollment);
  saveJson(ENROLLMENTS_HISTORY_PATH, enrollments);
  removeAdmissionQueueByPhone(student.phone || authUser.email || "");

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
  const enrollments = loadJson(ENROLLMENTS_HISTORY_PATH);
  enrollments.push({
    id: `enr-${Date.now()}-renew`,
    studentId: student.id,
    courseId,
    batchId: "",
    note: `Course renewed at 40% discount. Fee deducted ₹${renewFee}`,
    status: "active",
    startDate: today(),
    expiresAt: addDays(today(), COURSE_DURATION_DAYS[courseId] || 90),
    createdAt: new Date().toISOString(),
  });
  saveJson(ENROLLMENTS_HISTORY_PATH, enrollments);
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
          ...c,
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
  const courseId = String(req.query.courseId || student?.courseEnrolled || "");
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
  const attendance = student
    ? loadJson(ACADEMY_ATTENDANCE_PATH).filter((a) => a.studentId === student.id)
    : [];
  const present = attendance.filter((x) => x.status === "present").length;
  const attendancePct = attendance.length ? Math.round((present / attendance.length) * 100) : 0;
  const payouts = loadJson(REFERRAL_PAYOUTS_PATH).filter((p) => p.referrerUserId === req.auth.userId);
  const rewards = payouts.reduce((a, b) => a + (Number(b.amount) || 0), 0);
  const achievements = [];
  if (attendancePct >= 75) achievements.push("Attendance Star");
  if ((Number(authUser?.totalClassesAttended) || 0) >= 20) achievements.push("20 Classes Milestone");
  if (rewards > 0) achievements.push("Referral Earner");
  const courseProgress = Math.min(100, Math.round(((Number(authUser?.totalClassesAttended) || 0) / 100) * 100));
  res.json({
    attendancePercentage: attendancePct,
    achievements,
    courseProgress,
    rewards,
    earnedByReferring: rewards,
    walletBalance: Number(authUser?.walletBalance) || 0,
  });
});

export default router;
