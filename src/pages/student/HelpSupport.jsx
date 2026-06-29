import { useState } from 'react'
import { Link } from 'react-router-dom'
import { WHATSAPP_NUMBER } from '../../config'

const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}`

const FAQS = [
  {
    q: 'How do I pay for a class?',
    a: 'Go to Pay for Class, select your unlocked course, and tap Pay ₹10. The amount is deducted from your wallet and marks you present for that school day. Keep enough balance before class time.',
  },
  {
    q: 'How do I add money to my wallet?',
    a: 'Open Pay for Class → Add to Wallet. Scan the UPI QR or pay via PhonePe / Paytm / Amazon Pay, then upload your payment screenshot. Admin verifies and credits your wallet — usually within a few hours.',
  },
  {
    q: 'What is VVIP unlimited?',
    a: 'VVIP is a monthly pass (₹699) that lets you attend classes without paying ₹10 each time during the valid period. Buy it from Pay for Class when you attend regularly and want to save on per-class fees.',
  },
  {
    q: 'How do I unlock a new course?',
    a: 'Visit Explore Courses, choose a course, and pay the one-time unlock fee from your wallet. Once unlocked, the course appears under My Courses with lessons, batch info, and pay-for-class options.',
  },
  {
    q: 'How is attendance percentage calculated?',
    a: 'Attendance is counted from your course enrollment date until today. Sundays, Odisha public holidays, and admin-marked off days are excluded. Paying for a class (₹10 from wallet or VVIP) counts as present; unpaid school days count as absent.',
  },
  {
    q: 'How does the class streak work?',
    a: 'Your streak is the number of consecutive school days you attended without a miss. Sundays, Odisha holidays, and admin off days do not break the streak. Missing any other school day resets it to zero. See Achievements for your current streak.',
  },
  {
    q: 'Where can I find my course notes and study materials?',
    a: 'Open My Courses, select a course, and browse the lessons tab — PDFs, video links, and assignments are posted there by your teacher. Materials are organised course-wise, not on this Help page.',
  },
  {
    q: 'How do referrals work?',
    a: 'Share your referral code from Refer & Earn. When someone enrolls using it, you earn rewards credited on the 1st of the next month. You can track referrals and rewards on the same page.',
  },
  {
    q: 'How do I request a certificate?',
    a: 'After completing a course, go to Achievements → Certificates, enter the course name, and submit a request. Admin generates the PDF; download it once the status shows as ready.',
  },
  {
    q: 'I forgot my password — what should I do?',
    a: 'On the login page, use Forgot Password with your registered mobile number, or message us on WhatsApp with your Student ID and full name. Admin can reset your credentials securely.',
  },
  {
    q: 'My attendance or wallet balance looks wrong',
    a: 'Make sure your Student ID is linked under My Account. If the issue continues, note the date and course, then contact us on WhatsApp with a screenshot — we will check wallet and attendance records.',
  },
  {
    q: 'Still need help?',
    a: 'Tap Open WhatsApp below for live support. Include your Student ID, course name, and a short description of the issue so we can help you faster.',
  },
]

function FaqItem({ item, open, onToggle }) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900/80">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-white">{item.q}</span>
        <span className="mt-0.5 shrink-0 text-gray-400" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div className="border-t border-gray-700/80 px-4 py-3 text-sm leading-relaxed text-gray-300">
          {item.a}
        </div>
      )}
    </div>
  )
}

export default function HelpSupport() {
  const [openIdx, setOpenIdx] = useState(0)

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Help & Support</h1>
      <p className="mt-1 text-gray-400">Quick answers to common questions, plus WhatsApp support.</p>

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
          <h3 className="font-semibold text-white">Frequently Asked Questions</h3>
          <p className="mt-1 text-sm text-gray-400">
            Tap a question to see the answer. Course materials are in{' '}
            <Link to="/student/my-courses" className="text-violet-300 hover:underline">
              My Courses
            </Link>
            .
          </p>
          <div className="mt-4 space-y-2">
            {FAQS.map((item, i) => (
              <FaqItem
                key={item.q}
                item={item}
                open={openIdx === i}
                onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
