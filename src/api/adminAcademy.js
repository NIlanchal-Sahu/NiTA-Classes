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
  createStudent: (body) => request('/students', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
  updateStudent: (id, body) => request(`/students/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }),
  deleteStudent: (id) => request(`/students/${id}`, { method: 'DELETE', headers: headers(false) }),
  getStudentProfile: (id) => request(`/students/${id}`, { headers: headers(false) }),
  addEnrollment: (id, body) => request(`/students/${id}/enrollments`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }),

  getCourses: () => request('/courses', { headers: headers(false) }),
  createCourse: (body) => request('/courses', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
  updateCourse: (id, body) => request(`/courses/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }),
  deleteCourse: (id) => request(`/courses/${id}`, { method: 'DELETE', headers: headers(false) }),

  getBatches: () => request('/batches', { headers: headers(false) }),
  createBatch: (body) => request('/batches', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
  updateBatch: (id, body) => request(`/batches/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }),

  getAttendance: (query = '') => request(`/attendance${query ? `?${query}` : ''}`, { headers: headers(false) }),
  markAttendance: (body) => request('/attendance/mark', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
  getMonthlyAttendanceReport: (month, batchId = '') =>
    request(`/attendance/report/monthly?month=${encodeURIComponent(month)}${batchId ? `&batchId=${encodeURIComponent(batchId)}` : ''}`, { headers: headers(false) }),

  getFees: (studentId = '') => request(`/fees${studentId ? `?studentId=${encodeURIComponent(studentId)}` : ''}`, { headers: headers(false) }),
  createPayment: (body) => request('/fees/payments', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
  getPaymentRequests: () => request('/fees/payment-requests', { headers: headers(false) }),
  approvePaymentRequest: (id) => request(`/fees/payment-requests/${id}/approve`, { method: 'POST', headers: headers(), body: JSON.stringify({}) }),

  getDiscounts: () => request('/discounts', { headers: headers(false) }),
  createDiscount: (body) => request('/discounts', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),

  getNotes: () => request('/notes', { headers: headers(false) }),
  createNote: (body) => request('/notes', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),

  getCertificates: () => request('/certificates', { headers: headers(false) }),
  generateCertificate: (body) => request('/certificates/generate', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),

  getReferralLinks: () => request('/referrals/links', { headers: headers(false) }),
}

