import { useEffect, useState } from 'react'
import { academyApi } from '../api/adminAcademy'

export default function AdminFees() {
  const [students, setStudents] = useState([])
  const [payments, setPayments] = useState([])
  const [requests, setRequests] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    studentId: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    mode: 'cash',
    feeStatus: 'paid',
    note: '',
  })

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const [s, p, r] = await Promise.all([academyApi.getStudents(), academyApi.getFees(), academyApi.getPaymentRequests()])
      setStudents(s.students || [])
      setPayments(p.payments || [])
      setRequests(r.requests || [])
    } catch (e) {
      setError(e.message || 'Failed to load fees data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await academyApi.createPayment({ ...form, amount: Number(form.amount) || 0 })
      setForm((p) => ({ ...p, amount: '', note: '' }))
      await refresh()
    } catch (e1) {
      setError(e1.message || 'Failed to save payment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Fees & Payments</h1>
      <p className="mt-1 text-gray-400">Record cash/UPI, fee status, and student payment history.</p>
      {error && <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-200">{error}</div>}

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Record Payment</h2>
        <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <select value={form.studentId} onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" required>
            <option value="">Select student</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
          </select>
          <input type="number" min="0" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Amount" required />
          <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" required />
          <select value={form.mode} onChange={(e) => setForm((p) => ({ ...p, mode: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white">
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
          </select>
          <select value={form.feeStatus} onChange={(e) => setForm((p) => ({ ...p, feeStatus: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white">
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="discounted">Discounted</option>
          </select>
          <input value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white" placeholder="Note (optional)" />
          <div className="sm:col-span-2 lg:col-span-3">
            <button disabled={saving} className="btn-touch rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Payment'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Payment Requests (UPI/Cash Pending Approval)</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-gray-300">
              <tr>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Student Auth ID</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Mode</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Action</th>
                <th className="px-3 py-3">Screenshot</th>
              </tr>
            </thead>
            <tbody className="text-gray-200 divide-y divide-gray-700">
              {requests.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-3">{String(r.createdAt).slice(0, 10)}</td>
                  <td className="px-3 py-3">{r.authUserId}</td>
                  <td className="px-3 py-3">₹{r.amount}</td>
                  <td className="px-3 py-3">{r.mode}</td>
                  <td className="px-3 py-3">{r.status}</td>
                  <td className="px-3 py-3">
                    {r.status === 'pending' ? (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await academyApi.approvePaymentRequest(r.id)
                            await refresh()
                          } catch (e) {
                            setError(e.message || 'Failed to approve')
                          }
                        }}
                        className="rounded bg-emerald-700 px-2 py-1 text-xs text-white hover:bg-emerald-600"
                      >
                        Approve + Add Wallet
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-300">Approved</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {r.screenshot ? (
                      <a
                        href={r.screenshot}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-violet-300 hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-xs text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && <tr><td colSpan={7} className="px-3 py-4 text-gray-500">No payment requests.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Payment History</h2>
        {loading ? <div className="mt-4 text-gray-400">Loading...</div> : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-gray-300">
                <tr>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Student</th>
                  <th className="px-3 py-3">Amount</th>
                  <th className="px-3 py-3">Mode</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-200 divide-y divide-gray-700">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-3">{p.date}</td>
                    <td className="px-3 py-3">{p.studentId}</td>
                    <td className="px-3 py-3">₹{p.amount}</td>
                    <td className="px-3 py-3">{p.mode}</td>
                    <td className="px-3 py-3">{p.feeStatus}</td>
                  </tr>
                ))}
                {payments.length === 0 && <tr><td colSpan={5} className="px-3 py-4 text-gray-500">No payments yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

