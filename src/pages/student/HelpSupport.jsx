import { WHATSAPP_NUMBER } from '../../config'
import { useEffect, useState } from 'react'
import { studentPortalApi } from '../../api/student'

const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}`

export default function HelpSupport() {
  const [notes, setNotes] = useState([])
  useEffect(() => {
    ;(async () => {
      try {
        const out = await studentPortalApi.getMaterials()
        setNotes(out.notes || [])
      } catch {
        // ignore
      }
    })()
  }, [])

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Help & Support</h1>
      <p className="mt-1 text-gray-400">Get help, plus course-wise notes and study materials.</p>

      <div className="mt-8 space-y-6">
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
          <h3 className="font-semibold text-white">Chat on WhatsApp</h3>
          <p className="mt-1 text-sm text-gray-400">Quick support for queries and technical issues.</p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Open WhatsApp
          </a>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
          <h3 className="font-semibold text-white">Notes / Materials</h3>
          <p className="mt-1 text-sm text-gray-400">PDFs, video links and assignments filtered by your course/batch.</p>
          <div className="mt-3 space-y-2">
            {notes.map((n) => (
              <a key={n.id} href={n.url} target="_blank" rel="noreferrer" className="block rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-300 hover:border-violet-500">
                [{n.resourceType}] {n.title}
              </a>
            ))}
            {notes.length === 0 && <p className="text-sm text-gray-500">No materials assigned yet.</p>}
          </div>
        </div>
      </div>
    </>
  )
}
