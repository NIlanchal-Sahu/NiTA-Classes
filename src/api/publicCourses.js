const API = '/api/public/courses'

async function parseJson(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export async function getPublicCourse(courseId) {
  const res = await fetch(`${API}/${encodeURIComponent(courseId)}`)
  return parseJson(res)
}

export async function getRazorpayKey() {
  const res = await fetch(`${API}/payment/config`)
  return parseJson(res)
}

export async function createCoursePaymentOrder(body) {
  const res = await fetch(`${API}/payment/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseJson(res)
}

export async function verifyCoursePayment(body) {
  const res = await fetch(`${API}/payment/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseJson(res)
}
