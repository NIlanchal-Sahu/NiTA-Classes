function isDataUrl(url) {
  return String(url || '').startsWith('data:')
}

export default function PaymentReceiptReviewModal({ request, onClose, onApprove, approving = false }) {
  if (!request) return null

  const previewUrl = request.receiptPreviewUrl || request.receiptViewUrl || request.receiptDriveUrl || ''
  const hasReceipt = !!previewUrl

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-gray-700 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Review payment receipt</h3>
            <p className="mt-1 text-sm text-gray-400">Verify the screenshot before approving wallet credit.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={approving}
            className="rounded-lg px-2 py-1 text-sm text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-gray-500">Student</dt>
              <dd className="font-medium text-white">{request.studentName || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Phone / contact</dt>
              <dd className="font-medium text-white">{request.studentPhone || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Wallet credit</dt>
              <dd className="font-semibold text-emerald-300">₹{request.amount}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Platform</dt>
              <dd className="font-medium text-white">{request.platform || request.mode || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Submitted</dt>
              <dd className="font-medium text-white">{String(request.createdAt || '').slice(0, 19).replace('T', ' ')}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd className="font-medium capitalize text-white">{request.status || 'pending'}</dd>
            </div>
            {request.note ? (
              <div className="sm:col-span-2">
                <dt className="text-gray-500">Student note / Txn ID</dt>
                <dd className="font-medium text-white">{request.note}</dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-5">
            <p className="text-sm font-medium text-gray-300">Payment screenshot</p>
            {hasReceipt ? (
              <div className="mt-2 overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
                {isDataUrl(previewUrl) ? (
                  <img
                    src={previewUrl}
                    alt="Payment receipt"
                    className="mx-auto max-h-[min(55vh,520px)] w-full object-contain"
                  />
                ) : (
                  <iframe
                    title="Payment receipt preview"
                    src={previewUrl}
                    className="h-[min(55vh,520px)] w-full bg-white"
                  />
                )}
              </div>
            ) : (
              <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                No receipt image attached. You can still approve if payment was verified elsewhere.
              </div>
            )}
            {request.receiptDriveUrl ? (
              <a
                href={request.receiptDriveUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-xs text-violet-300 hover:underline"
              >
                Open receipt on Google Drive →
              </a>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-gray-700 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={approving}
            className="flex-1 rounded-lg border border-gray-600 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 sm:flex-none sm:px-6"
          >
            Cancel
          </button>
          {request.status === 'pending' ? (
            <button
              type="button"
              onClick={onApprove}
              disabled={approving}
              className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 sm:flex-none sm:px-6"
            >
              {approving ? 'Approving…' : `Approve & credit ₹${request.amount}`}
            </button>
          ) : (
            <span className="self-center text-sm font-medium text-emerald-300">Already approved</span>
          )}
        </div>
      </div>
    </div>
  )
}
