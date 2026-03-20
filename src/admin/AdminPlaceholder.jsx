export default function AdminPlaceholder({ title, description }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <p className="mt-2 text-gray-400">{description}</p>

      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-6 text-sm text-gray-300">
        This section is a placeholder in the current build. We can connect it to:
        <ul className="mt-2 list-disc list-inside">
          <li>Razorpay payments + receipts</li>
          <li>Google Sheets enrollment data</li>
          <li>Class schedules stored in DB</li>
          <li>WhatsApp notifications via backend jobs</li>
        </ul>
      </div>
    </div>
  )
}

