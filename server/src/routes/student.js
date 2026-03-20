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
const ACADEMY_FEES_PATH = join(__dirname, "..", "data", "academy_fees.json");
const ACADEMY_NOTES_PATH = join(__dirname, "..", "data", "academy_notes.json");
const ACADEMY_CERTIFICATES_PATH = join(__dirname, "..", "data", "academy_certificates.json");
const PAYMENT_REQUESTS_PATH = join(__dirname, "..", "data", "payment_requests.json");
const CERTIFICATE_REQUESTS_PATH = join(__dirname, "..", "data", "certificate_requests.json");
const REFERRAL_LINKS_PATH = join(__dirname, "..", "data", "referral_links.json");
const REFERRAL_PAYOUTS_PATH = join(__dirname, "..", "data", "referral_payouts.json");
const ENROLLMENTS_HISTORY_PATH = join(__dirname, "..", "data", "student_enrollments.json");

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

router.get("/portal/attendance", studentAuth, (req, res) => {
  const authUser = getUserById(req.auth.userId);
  const student = resolveStudentRecord(authUser);
  if (!student) return res.json({ studentId: null, attendance: [], monthlyPercentage: 0 });
  const month = String(req.query.month || monthKey(today()));
  const courseId = String(req.query.courseId || "");
  const records = loadJson(ACADEMY_ATTENDANCE_PATH).filter(
    (r) =>
      r.studentId === student.id &&
      monthKey(r.date) === month &&
      (!courseId || r.courseId === courseId),
  );
  const present = records.filter((r) => r.status === "present").length;
  const monthlyPercentage = records.length ? Math.round((present / records.length) * 100) : 0;
  res.json({
    studentId: student.id,
    month,
    attendance: records,
    monthlyPercentage,
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

router.get("/portal/courses", studentAuth, (req, res) => {
  const authUser = getUserById(req.auth.userId);
  const student = resolveStudentRecord(authUser);
  const courses = loadJson(ACADEMY_COURSES_PATH);
  const batches = loadJson(ACADEMY_BATCHES_PATH);
  const enrollments = loadJson(ENROLLMENTS_HISTORY_PATH);
  const enrolledIds = new Set();
  if (student?.courseEnrolled) enrolledIds.add(student.courseEnrolled);
  for (const e of enrollments) if (e.studentId === student?.id) enrolledIds.add(e.courseId);
  const enrolledCourses = courses.filter((c) => enrolledIds.has(c.id));
  const upcomingBatches = batches.filter((b) => enrolledIds.has(b.courseId)).slice(0, 8);
  res.json({ student: student || null, enrolledCourses, upcomingBatches });
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
