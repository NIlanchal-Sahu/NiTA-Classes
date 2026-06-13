/** Server-side course fees — must match public catalog enrollmentFees. */

export const COURSE_FEES = {
  dca: { name: 'DCA (Basic Computer Course)', enrollmentFees: 499 },
  cca: { name: "CCA - Course on Computer Application", enrollmentFees: 999 },
  'spoken-english-mastery': { name: 'Spoken English Mastery', enrollmentFees: 499 },
  'ai-associate': { name: 'AI Associate (Python + AI)', enrollmentFees: 1499 },
  'ai-video-creation': { name: 'AI Video Creation Course', enrollmentFees: 499 },
  'ai-vibe-coding': { name: 'AI Vibe Coding', enrollmentFees: 999 },
  'plus2-it-arts-science-oav': { name: '+2 IT Arts/Science/OAV', enrollmentFees: 999 },
  'oav-ict-6th-10th': { name: 'OAV - ICT 6th-10th', enrollmentFees: 599 },
}

export function getCourseFee(courseId) {
  const id = String(courseId || '').trim().toLowerCase()
  return COURSE_FEES[id] || null
}
