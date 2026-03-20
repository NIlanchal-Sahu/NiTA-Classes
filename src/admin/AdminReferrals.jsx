import { useEffect, useMemo, useState } from 'react'
import * as referralsApi from '../api/referrals'

function prevMonthKey() {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${yyyy}-${mm}`
}

export default function AdminReferrals() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [overview, setOverview] = useState(null)
  const [month, setMonth] = useState(prevMonthKey())
  const [running, setRunning] = useState(false)
  const [runMsg, setRunMsg] = useState('')

  const totals = useMemo(() => {
    const partners = overview?.partners || []
    const links = overview?.links || []
    const payouts = overview?.payouts || []
    return {
      partners: partners.length,
      activePartners: partners.filter((p) => p.active).length,
      links: links.length,
      payouts: payouts.length,
      amount: payouts.reduce((acc, p) => acc + (Number(p.amount) || 0), 0),
    }
  }, [overview])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const d = await referralsApi.adminOverview()
      setOverview(d)
    } catch (e) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const run = async () => {
    setRunning(true)
    setRunMsg('')
    setError('')
    try {
      const out = await referralsApi.adminRunPayouts(month)
      setRunMsg(`Created ${out.payoutsCreated} payouts (₹${out.totalAmount}) for ${out.month}.`)
      await load()
    } catch (e) {
      setError(e.message || 'Failed to run payouts')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Referral Program</h1>
      <p className="mt-1 text-gray-400">Manage affiliate partners, referral links, and monthly payouts.</p>

      {error && <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-200">{error}</div>}
      {runMsg && <div className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-200">{runMsg}</div>}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {[
          { k: totals.partners, t: 'Total partners' },
          { k: totals.activePartners, t: 'Active partners' },
          { k: totals.links, t: 'Referred students' },
          { k: totals.payouts, t: 'Payout entries' },
          { k: `₹${totals.amount}`, t: 'Total paid (all time)' },
        ].map((x) => (
          <div key={x.t} className="rounded-2xl border border-gray-700 bg-gray-800 p-5">
            <div className="text-2xl font-extrabold text-white">{x.k}</div>
            <div className="mt-1 text-sm text-gray-400">{x.t}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Run monthly payout</h2>
        <p className="mt-1 text-sm text-gray-400">Run on the 1st for previous month (YYYY-MM).</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div>
            <label className="block text-sm font-medium text-gray-300">Month</label>
            <input
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="mt-1 w-48 rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              placeholder="2026-03"
            />
          </div>
          <button
            type="button"
            disabled={running}
            onClick={run}
            className="btn-touch rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {running ? 'Running...' : 'Run payouts'}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white">Affiliate partners</h2>
          {loading ? (
            <div className="mt-4 text-gray-400">Loading...</div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-gray-300">
                  <tr>
                    <th className="px-3 py-3">Code</th>
                    <th className="px-3 py-3">Option</th>
                    <th className="px-3 py-3">Active</th>
                    <th className="px-3 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="text-gray-200 divide-y divide-gray-700">
                  {(overview?.partners || []).map((p) => (
                    <tr key={p.code}>
                      <td className="px-3 py-3 font-semibold">{p.code}</td>
                      <td className="px-3 py-3">{p.option}</td>
                      <td className="px-3 py-3">{p.active ? 'Yes' : 'No'}</td>
                      <td className="px-3 py-3">{String(p.registeredAt || '').slice(0, 10)}</td>
                    </tr>
                  ))}
                  {(overview?.partners || []).length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-gray-500">
                        No partners yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white">Recent payouts</h2>
          {loading ? (
            <div className="mt-4 text-gray-400">Loading...</div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-gray-300">
                  <tr>
                    <th className="px-3 py-3">Month</th>
                    <th className="px-3 py-3">Kind</th>
                    <th className="px-3 py-3">Amount</th>
                    <th className="px-3 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="text-gray-200 divide-y divide-gray-700">
                  {(overview?.payouts || [])
                    .slice()
                    .reverse()
                    .slice(0, 25)
                    .map((p) => (
                      <tr key={p.id}>
                        <td className="px-3 py-3">{p.month}</td>
                        <td className="px-3 py-3">{p.kind}</td>
                        <td className="px-3 py-3 font-semibold">₹{p.amount}</td>
                        <td className="px-3 py-3">{String(p.createdAt || '').slice(0, 10)}</td>
                      </tr>
                    ))}
                  {(overview?.payouts || []).length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-gray-500">
                        No payouts yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white">Referral links</h2>
        <p className="mt-1 text-sm text-gray-400">One referrer per student (first code applied wins).</p>
        {loading ? (
          <div className="mt-4 text-gray-400">Loading...</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-gray-300">
                <tr>
                  <th className="px-3 py-3">Code</th>
                  <th className="px-3 py-3">Referrer</th>
                  <th className="px-3 py-3">Referred Student</th>
                  <th className="px-3 py-3">Fixed Paid</th>
                  <th className="px-3 py-3">Last Paid Month</th>
                </tr>
              </thead>
              <tbody className="text-gray-200 divide-y divide-gray-700">
                {(overview?.links || []).slice().reverse().map((l) => (
                  <tr key={l.id}>
                    <td className="px-3 py-3 font-semibold">{l.code}</td>
                    <td className="px-3 py-3">{l.referrerUserId}</td>
                    <td className="px-3 py-3">{l.referredStudentId}</td>
                    <td className="px-3 py-3">{l.fixedPaid ? 'Yes' : 'No'}</td>
                    <td className="px-3 py-3">{l.lastPaidMonth || '—'}</td>
                  </tr>
                ))}
                {(overview?.links || []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-gray-500">
                      No referral links yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

