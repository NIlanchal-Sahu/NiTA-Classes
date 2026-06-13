/** Practical Computer LAB — bundled with all courses except Spoken English. */

export const LAB_COURSE_ID = 'practical-computer-lab'
export const LAB_EXCLUDED_COURSE_ID = 'spoken-english-mastery'

export function normalizeCourseId(input) {
  return String(input || '').trim().toLowerCase()
}

export function isQualifyingCourseForLab(courseId) {
  const id = normalizeCourseId(courseId)
  return (
    !!id &&
    id !== LAB_COURSE_ID &&
    id !== 'trial-course' &&
    id !== LAB_EXCLUDED_COURSE_ID
  )
}

/** Course IDs the student is enrolled in (wallet unlocks + batch assignment + profile). */
export function getStudentEnrolledCourseIds(studentId, enrollments, student, batches) {
  const ids = new Set()
  for (const e of enrollments || []) {
    if (String(e.studentId) === String(studentId)) {
      const cid = normalizeCourseId(e.courseId)
      if (cid) ids.add(cid)
    }
  }
  if (student && String(student.id) === String(studentId)) {
    if (student.courseEnrolled) ids.add(normalizeCourseId(student.courseEnrolled))
    for (const cid of Array.isArray(student.selectedCourseIds) ? student.selectedCourseIds : []) {
      const normalized = normalizeCourseId(cid)
      if (normalized) ids.add(normalized)
    }
  }
  if (student?.batchId) {
    const assigned = (batches || []).find((b) => String(b.id) === String(student.batchId))
    if (assigned?.courseId) ids.add(normalizeCourseId(assigned.courseId))
  }
  for (const bid of Array.isArray(student?.batchIds) ? student.batchIds : []) {
    const assigned = (batches || []).find((b) => String(b.id) === String(bid))
    if (assigned?.courseId) ids.add(normalizeCourseId(assigned.courseId))
  }
  return ids
}

export function getQualifyingCourseIdsForStudent(studentId, enrollments, student, batches) {
  return [...getStudentEnrolledCourseIds(studentId, enrollments, student, batches)].filter(
    isQualifyingCourseForLab,
  )
}

export function studentQualifiesForLab(studentId, enrollments, student, batches) {
  if (!studentId) return false
  return getQualifyingCourseIdsForStudent(studentId, enrollments, student, batches).length > 0
}
