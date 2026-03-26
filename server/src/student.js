import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { getUsers, saveUsers, getUserById } from "./auth.js";
import { readJsonSync, writeJsonSync } from "./services/sheetsJsonStore.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ATTENDANCE_PATH = join(__dirname, "data", "attendance.json");
const COURSES_PATH = join(__dirname, "data", "courses.json");
const PRICE_PER_CLASS = 10;

function getCourses() {
  return readJsonSync(COURSES_PATH, []);
}

function getAttendance() {
  return readJsonSync(ATTENDANCE_PATH, []);
}

function saveAttendance(records) {
  writeJsonSync(ATTENDANCE_PATH, records);
}

export function getValidCourseId(courseId) {
  const id = String(courseId).trim().toLowerCase();
  const courses = getCourses();
  const found = courses.find(
    (c) => c.id === id || c.id.replace(/-/g, "") === id.replace(/-/g, ""),
  );
  return found ? found.id : null;
}

export function getCourseName(courseId) {
  const courses = getCourses();
  const c = courses.find((x) => x.id === courseId);
  return c ? c.name : courseId;
}

export function getAttendanceFor(studentId, courseId, date) {
  const records = getAttendance();
  const d = date || today();
  const r = records.find(
    (x) => x.studentId === studentId && x.courseId === courseId && x.date === d,
  );
  return r ? r.classesCount : 0;
}

export function getTotalClassesFromWallet(studentId) {
  const records = getAttendance();
  return records
    .filter((x) => x.studentId === studentId)
    .reduce((sum, x) => sum + (Number(x.classesCount) || 0), 0);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

/** Same date next month (e.g. 2025-03-17 -> 2025-04-17). */
function addOneMonth(dateStr) {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCMonth(d.getUTCMonth() + 1);
  return d.toISOString().slice(0, 10);
}

export function isVvipActive(user) {
  const until = user?.vvipValidUntil;
  if (!until) return false;
  return String(until).slice(0, 10) >= today();
}

export function recordClassAndDeduct(studentId, courseId, date) {
  const user = getUserById(studentId);
  if (!user || user.role !== "student")
    return { ok: false, error: "Student not found" };
  const users = getUsers();
  const u = users.find((x) => x.id === studentId);
  if (!u) return { ok: false, error: "Student not found" };
  const vvip = isVvipActive(u);
  if (!vvip) {
    const balance = Number(u.walletBalance) ?? 0;
    if (balance < PRICE_PER_CLASS)
      return {
        ok: false,
        error: "Insufficient wallet balance. Add money to continue.",
      };
  }

  const d = date || today();
  const records = getAttendance();
  let r = records.find(
    (x) => x.studentId === studentId && x.courseId === courseId && x.date === d,
  );
  if (!r) {
    r = { studentId, courseId, date: d, classesCount: 0 };
    records.push(r);
  }
  r.classesCount += 1;
  saveAttendance(records);

  if (!vvip) {
    u.walletBalance = (Number(u.walletBalance) ?? 0) - PRICE_PER_CLASS;
  }
  // Keep counter synchronized with wallet attendance rows to avoid drift.
  u.totalClassesAttended = records
    .filter((x) => x.studentId === studentId)
    .reduce((sum, x) => sum + (Number(x.classesCount) || 0), 0);
  saveUsers(users);
  return {
    ok: true,
    walletBalance: u.walletBalance,
    totalClassesAttended: u.totalClassesAttended,
    classesToday: r.classesCount,
    courseName: getCourseName(courseId),
    vvipFree: vvip,
  };
}

const UNLIMITED_PROMO_PRICE = 699;

export function purchaseUnlimitedMonth(studentId) {
  const user = getUserById(studentId);
  if (!user || user.role !== "student")
    return { ok: false, error: "Student not found" };
  const balance = Number(user.walletBalance) ?? 0;
  if (balance < UNLIMITED_PROMO_PRICE)
    return {
      ok: false,
      error: `Insufficient balance. Need ₹${UNLIMITED_PROMO_PRICE} in wallet.`,
    };
  const users = getUsers();
  const u = users.find((x) => x.id === studentId);
  u.walletBalance = (Number(u.walletBalance) ?? 0) - UNLIMITED_PROMO_PRICE;
  u.vvipValidUntil = addOneMonth(today());
  saveUsers(users);
  return {
    ok: true,
    walletBalance: u.walletBalance,
    vvipValidUntil: u.vvipValidUntil,
  };
}
