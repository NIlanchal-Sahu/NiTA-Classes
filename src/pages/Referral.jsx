import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Referral() {
  const { user, isStudent } = useAuth()

  return (
    <div className="bg-gray-50 border-t border-gray-200">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Refer & Earn with NITA Classes</h1>
            <p className="mt-2 text-gray-600">
              Become an <span className="font-semibold">Affiliate Partner</span>, invite students, and earn rewards.
            </p>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-gray-900">Benefit option 1</div>
                <div className="mt-1 text-xl font-extrabold text-primary-700">₹200 for each student referred</div>
                <div className="mt-2 text-sm text-gray-600">Earn a fixed bonus when your referred student starts attending classes.</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-gray-900">Benefit option 2</div>
                <div className="mt-1 text-xl font-extrabold text-primary-700">₹1 per class attended</div>
                <div className="mt-2 text-sm text-gray-600">
                  For every class your referred student attends in a calendar month, you earn the same amount in rupees.
                  The payout is credited on the <span className="font-semibold">1st day of next month</span>.
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="font-semibold text-emerald-900">Affiliate Partner registration fee: ₹0</div>
              <div className="mt-1 text-sm text-emerald-900/90">
                Join now for free and get your personal referral code instantly.
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {user ? (
                <Link
                  to={isStudent ? '/student/referrals' : '/admin/referrals'}
                  className="btn-touch inline-flex items-center justify-center rounded-xl bg-primary-600 px-6 py-4 text-sm font-semibold text-white hover:bg-primary-700 transition"
                >
                  Open Refer & Earn
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="btn-touch inline-flex items-center justify-center rounded-xl bg-primary-600 px-6 py-4 text-sm font-semibold text-white hover:bg-primary-700 transition"
                >
                  Login to Register
                </Link>
              )}
              <Link
                to="/admission"
                className="btn-touch inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-4 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
              >
                Take Admission (enter referral code)
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">How monthly payout works</h2>
            <div className="mt-4 space-y-3">
              {[
                { t: 'Track attendance', d: 'Classes attended by referred students are tracked month-wise.' },
                { t: 'Monthly calculation', d: 'For option 2, total classes in the calendar month = total rupees you earn.' },
                { t: 'Credit on 1st', d: 'On the 1st day of next month, the amount is added to your wallet automatically.' },
                { t: 'Use wallet', d: 'Wallet balance can be used for your own classes / benefits.' },
              ].map((x) => (
                <div key={x.t} className="flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="mt-0.5 h-7 w-7 shrink-0 rounded-lg bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{x.t}</div>
                    <div className="mt-1 text-sm text-gray-600">{x.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-gray-500">*Terms & Conditions Apply</div>
          </div>
        </div>
      </div>
    </div>
  )
}

