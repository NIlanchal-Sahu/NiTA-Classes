function token() {
  return localStorage.getItem('nita_token') || ''
}

function headers(json = true) {
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${token()}`,
  }
}

async function request(path, options = {}) {
  const res = await fetch(`/api/admin/academy${path}`, options)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const academyApi = {
  getDashboard: () => request('/dashboard', { headers: headers(false) }),
  getStudents: () => request('/students', { headers: headers(false) }),
  getTeachers: () => request('/teachers', { headers: headers(false) }),
  createTeacher: (body) => request('/teachers', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
  updateTeacher: (id, body) => request(`/teachers/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }),
  updateTeacherStatus: (id, status) =>
    request(`/teachers/${id}/status`, { method: 'PATCH', headers: headers(), body: JSON.stringify({ status }) }),
  deleteTeacher: (id) => request(`/teachers/${id}`, { method: 'DELETE', headers: headers(false) }),
  getTeacherAttendance: (query = '') =>
    request(`/teachers/attendance${query ? `?${query}` : ''}`, { headers: headers(false) }),
  markTeacherAttendance: (body) =>
    request('/teachers/attendance', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
  getTeacherAttendanceRequests: (query = '') =>
    request(`/teachers/attendance-requests${query ? `?${query}` : ''}`, { headers: headers(false) }),
  createTeacherAttendanceRequest: (body) =>
    request('/teachers/attendance-requests', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
  approveTeacherAttendanceRequest: (id) =>
    request(`/teachers/attendance-requests/${id}/approve`, { method: 'POST', headers: headers(), body: JSON.stringify({}) }),
  rejectTeacherAttendanceRequest: (id, note = '') =>
    request(`/teachers/attendance-requests/${id}/reject`, { method: 'POST', headers: headers(), body: JSON.stringify({ note }) }),
  getTeacherPayments: (query = '') =>
    request(`/teachers/payments${query ? `?${query}` : ''}`, { headers: headers(false) }),
  addTeacherPayment: (body) =>
    request('/teachers/payments', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
  createStudent: (body) => request('/students', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
  updateStudent: (id, body) => request(`/students/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }),
  deleteStudent: (id) => request(`/students/${id}`, { method: 'DELETE', headers: headers(false) }),
  getStudentProfile: (id) => request(`/students/${id}`, { headers: headers(false) }),
  getStudentDashboardView: (id) => request(`/students/${id}/dashboard-view`, { headers: headers(false) }),
  getRemovedStudents: (mobile = '') =>
    request(`/students/removed${mobile ? `?mobile=${encodeURIComponent(mobile)}` : ''}`, { headers: headers(false) }),
  deleteRemovedStudentRecord: (recordId) =>
    request(`/students/removed/${encodeURIComponent(recordId)}`, { method: 'DELETE', headers: headers(false) }),
  addEnrollment: (id, body) => request(`/students/${id}/enrollments`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
  patchEnrollmentExtension: (enrollmentId, body) =>
    request(`/enrollments/${encodeURIComponent(enrollmentId)}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify(body),
    }),
  deleteEnrollment: (enrollmentId) =>
    request(`/enrollments/${encodeURIComponent(enrollmentId)}`, { method: 'DELETE', headers: headers(false) }),

  getCourses: () => request('/courses', { headers: headers(false) }),
  createCourse: (body) => request('/courses', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
  updateCourse: (id, body) => request(`/courses/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }),
  deleteCourse: (id) => request(`/courses/${id}`, { method: 'DELETE', headers: headers(false) }),

  getBatches: () => request('/batches', { headers: headers(false) }),
  createBatch: (body) => request('/batches', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
  updateBatch: (id, body) => request(`/batches/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }),
  markBatchCompleted: (id) => request(`/batches/${id}/mark-completed`, { method: 'POST', headers: headers(), body: JSON.stringify({}) }),

  getAttendance: (query = '') => request(`/attendance${query ? `?${query}` : ''}`, { headers: headers(false) }),
  markAttendance: (body) => request('/attendance/mark', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
  getMonthlyAttendanceReport: (monthOrQuery, batchId = '') => {
    const raw = String(monthOrQuery || '')
    const qs = raw.includes('=') || raw.includes('&')
      ? raw
      : `month=${encodeURIComponent(raw)}${batchId ? `&batchId=${encodeURIComponent(batchId)}` : ''}`
    return request(`/attendance/report/monthly?${qs}`, { headers: headers(false) })
  },

  getFees: (studentId = '') => request(`/fees${studentId ? `?studentId=${encodeURIComponent(studentId)}` : ''}`, { headers: headers(false) }),
  createPayment: (body) => request('/fees/payments', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
  getPaymentRequests: () => request('/fees/payment-requests', { headers: headers(false) }),
  getAdminAlerts: () => request('/admin-alerts', { headers: headers(false) }),
  getStudentProfiles: () => request('/student-profiles', { headers: headers(false) }),
  approvePaymentRequest: (id) => request(`/fees/payment-requests/${id}/approve`, { method: 'POST', headers: headers(), body: JSON.stringify({}) }),

  getDiscounts: () => request('/discounts', { headers: headers(false) }),
  createDiscount: (body) => request('/discounts', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),

  getNotes: () => request('/notes', { headers: headers(false) }),
  createNote: (body) => request('/notes', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),

  getCertificates: () => request('/certificates', { headers: headers(false) }),
  generateCertificate: (body) => request('/certificates/generate', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),

  getReferralLinks: () => request('/referrals/links', { headers: headers(false) }),

  resetStudentPassword: (body) =>
    request('/students/reset-password', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
  resetAdminPassword: (body) =>
    request('/admins/reset-password', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),

  getContentCourses: () => request('/content/courses', { headers: headers(false) }),
  createModule: (courseId, body) =>
    request(`/content/courses/${encodeURIComponent(courseId)}/modules`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
  updateModule: (courseId, moduleId, body) =>
    request(`/content/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(body),
    }),
  deleteModule: (courseId, moduleId) =>
    request(`/content/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}`, { method: 'DELETE', headers: headers(false) }),
  reorderModules: (courseId, orders) =>
    request(`/content/courses/${encodeURIComponent(courseId)}/modules/reorder`, { method: 'POST', headers: headers(), body: JSON.stringify({ orders }) }),
  createChapter: (courseId, moduleId, body) =>
    request(`/content/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/chapters`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    }),
  updateChapter: (courseId, moduleId, chapterId, body) =>
    request(
      `/content/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/chapters/${encodeURIComponent(chapterId)}`,
      {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(body),
      }
    ),
  deleteChapter: (courseId, moduleId, chapterId) =>
    request(
      `/content/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/chapters/${encodeURIComponent(chapterId)}`,
      { method: 'DELETE', headers: headers(false) }
    ),
  reorderChapters: (courseId, moduleId, orders) =>
    request(`/content/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/chapters/reorder`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ orders }),
    }),

  /** Upload PDF/DOC/DOCX to Google Drive (NITA_Course_Content/.../Chapter_{id}/). Requires chapter id before create. */
  uploadChapterNotes: (courseId, moduleId, chapterId, file) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('chapterId', chapterId)
    return fetch(
      `/api/admin/academy/content/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/upload-notes`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` },
        body: fd,
      },
    ).then(async (res) => {
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      return data
    })
  },
}

