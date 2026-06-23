import { Link } from 'react-router-dom'

export default function CourseUnlockModal({
  courseName,
  unlockFee,
  walletBalance,
  onCancel,
  onConfirm,
  confirming = false,
}) {
  const fee = Number(unlockFee) || 0
  const balance = Number(walletBalance) || 0
  const insufficient = balance < fee

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white">Unlock course?</h3>
        <p className="mt-2 text-sm text-gray-300">
          <span className="font-semibold text-white">{courseName}</span>
        </p>
        <p className="mt-2 text-sm text-amber-300">
          Course unlock fee ₹{fee} will be deducted from your wallet.
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Wallet balance: <span className="font-semibold text-white">₹{balance}</span>
        </p>
        {insufficient && (
          <p className="mt-2 text-sm text-red-300">
            Insufficient wallet balance. Please add balance first.
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={confirming}
            className="flex-1 rounded-lg border border-gray-600 py-2.5 font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          {insufficient ? (
            <Link
              to="/student/pay"
              className="flex-1 rounded-lg bg-blue-600 py-2.5 text-center font-medium text-white hover:bg-blue-700"
            >
              Add Balance
            </Link>
          ) : (
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirming}
              className="flex-1 rounded-lg bg-violet-600 py-2.5 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {confirming ? 'Unlocking…' : 'Confirm Unlock'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
