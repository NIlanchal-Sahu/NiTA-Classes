import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { WHATSAPP_NUMBER, LOGO_SRC, PROGRAM_START_DATE, WHATSAPP_CTA } from '../config'

const showcase = [
  { id: 'dca', title: 'DCA: Computer + MS Office + AI Basics', img: '/qr-dummy.png', to: '/courses#dca' },
  { id: 'cca', title: 'CCA: Advanced Course + Govt Certification', img: '/qr-dummy.png', to: '/courses#cca' },
  { id: 'spoken', title: 'Spoken English Mastery: Speaking & Confidence', img: '/qr-dummy.png', to: '/courses#spoken-english-mastery' },
  { id: 'ai', title: 'AI Associate: Python + ML + Data Science', img: '/qr-dummy.png', to: '/courses#ai-associate' },
  { id: 'video', title: 'AI Video Creation: Prompts + UGC + Masterclass', img: '/qr-dummy.png', to: '/courses#ai-video-creation' },
  { id: 'vvip', title: 'VVIP Offer: Unlimited classes for ₹699 / month', img: '/qr-dummy.png', to: '/student/pay' },
]

const testimonials = [
  {
    id: 't1',
    name: 'DCA Student',
    text: 'I started from basics and learned MS Office + internet + AI tools step-by-step. The ₹10/class system is very affordable.',
  },
  {
    id: 't2',
    name: 'CCA Learner',
    text: 'The advanced course helped me learn MS Office with AI, networking basics, and web development fundamentals. Very practical training.',
  },
  {
    id: 't3',
    name: 'Spoken English Student',
    text: 'No boring grammar. I improved my speaking confidence with real conversations, group discussions, and presentations.',
  },
  {
    id: 't4',
    name: 'AI Associate Student',
    text: 'Python + machine learning topics were taught clearly. The course structure and practice made it easy to understand.',
  },
]

const features = [
  { id: 'f1', title: '₹10 Per Class Model', desc: 'Affordable learning with transparent per-class fees.' },
  { id: 'f2', title: 'Enrollment Fees by Course', desc: 'DCA ₹499, CCA ₹999, Spoken English ₹499, AI Associate ₹1499, AI Video ₹499.' },
  { id: 'f3', title: 'Urgent Certification', desc: 'DCA/CCA in 45 days, Spoken English in 30 days, AI Associate in 100 days, AI Video in 15 days.' },
  { id: 'f4', title: 'Govt Certification Support', desc: 'NSDC/NIELIT supported courses with verification on DigiLocker (where applicable).' },
  { id: 'f5', title: 'VVIP Unlimited Plan', desc: '₹699 for one month unlimited classes (no ₹10 fee during validity).' },
  { id: 'f6', title: 'WhatsApp Support', desc: 'Batch updates, reminders, and support on WhatsApp.' },
]

const ROTATING_SKILLS = [
  'AI & Computer Skills',
  'AI Video Creation Skills',
  'Spoken English Mastery',
  'AI Development with Python',
  'Professional Speaking Skills',
  'Job-Ready IT Skills',
]

export default function Home() {
  const { user, isStudent } = useAuth()
  const [skillIndex, setSkillIndex] = useState(0)
  const [typedSkill, setTypedSkill] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = ROTATING_SKILLS[skillIndex]
    let timeoutMs = deleting ? 45 : 80

    if (!deleting && typedSkill === current) {
      timeoutMs = 1300
      const timer = setTimeout(() => setDeleting(true), timeoutMs)
      return () => clearTimeout(timer)
    }

    if (deleting && typedSkill.length === 0) {
      const timer = setTimeout(() => {
        setDeleting(false)
        setSkillIndex((prev) => (prev + 1) % ROTATING_SKILLS.length)
      }, 250)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => {
      setTypedSkill((prev) =>
        deleting ? prev.slice(0, -1) : current.slice(0, prev.length + 1),
      )
    }, timeoutMs)
    return () => clearTimeout(timer)
  }, [typedSkill, deleting, skillIndex])

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
        <div className="absolute inset-0 opacity-50 bg-[url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'0.05\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/90">
            <span>ONLY 47 SEATS LEFT</span>
          </div>

          <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-3">
                <img src={LOGO_SRC} alt="NITA Classes logo" className="h-10 w-auto" />
                <p className="text-sm text-primary-100/80 sm:text-base">Program starts: {PROGRAM_START_DATE}</p>
              </div>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                <span className="block">Build Skills</span>
                <span className="mt-1 block text-accent-orange">
                  {typedSkill}
                  <span className="animate-pulse">|</span>
                </span>
                <span className="mt-1 block">That Get You Hired</span>
              </h1>
              <p className="mt-4 text-lg font-semibold text-primary-100 sm:text-xl">
                at just ₹10 per class
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/admission"
                  className="btn-touch inline-flex items-center justify-center rounded-xl bg-accent-orange px-6 py-4 text-base font-semibold text-white shadow-lg hover:bg-orange-600 transition"
                >
                  Enroll Now
                </Link>
                <Link
                  to="/courses"
                  className="btn-touch inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-base font-semibold text-white/95 backdrop-blur hover:bg-white/10 transition"
                >
                  Explore Courses
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: '7 Days', value: '7' },
                  { label: 'No Experience', value: '0' },
                  { label: 'LIVE Support', value: '1' },
                  { label: 'From', value: '₹10' },
                ].map((x) => (
                  <div key={x.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xl font-bold text-white">{x.value}</div>
                    <div className="mt-1 text-xs text-white/70">{x.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur">
              <h2 className="text-xl font-bold">Quick Enrollment</h2>
              <p className="mt-1 text-sm text-white/75">Enroll → Pay → Access LMS → Join LIVE</p>

              <div className="mt-5 space-y-3">
                {[
                  { n: '1', t: 'Register', d: 'Fill enrollment form in minutes' },
                  { n: '2', t: 'Payment', d: 'Pay ₹10/class or course pricing' },
                  { n: '3', t: 'Group Access', d: 'WhatsApp + learning resources' },
                  { n: '4', t: 'Learn', d: 'Start learning on your schedule' },
                ].map((s) => (
                  <div key={s.n} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-sm font-bold">
                      {s.n}
                    </div>
                    <div>
                      <div className="font-semibold">{s.t}</div>
                      <div className="text-sm text-white/70">{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl bg-white/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-white/70">Starting from</div>
                    <div className="text-2xl font-extrabold">₹10 / class</div>
                  </div>
                  <div className="text-sm text-white/70">Terms & Conditions Apply</div>
                </div>
                <Link
                  to="/admission"
                  className="btn-touch mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-primary-900 hover:bg-primary-50 transition"
                >
                  Enroll Now
                </Link>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-touch mt-3 inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
                >
                  {WHATSAPP_CTA}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Showcase (portfolio-style) */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Our Courses & Student Outcomes</h2>
            <p className="mt-1 text-gray-600">Explore what students learn in each course.</p>
          </div>
          <Link to="/courses" className="text-sm font-semibold text-primary-600 hover:underline">
            View all →
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {showcase.map((v) => (
            <Link key={v.id} to={v.to} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="relative aspect-video bg-gray-100">
                <img src={v.img} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              <div className="p-4">
                <div className="font-semibold text-gray-900">{v.title}</div>
                <div className="mt-1 text-sm text-gray-500">See details →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-primary-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { k: '₹10', t: 'Per class fee' },
              { k: '5', t: 'Comprehensive courses' },
              { k: '45 Days', t: 'Urgent certification (DCA/CCA)' },
              { k: '₹699', t: 'VVIP unlimited (1 month)' },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-primary-100 bg-white p-6">
                <div className="text-3xl font-extrabold text-primary-700">{x.k}</div>
                <div className="mt-2 text-sm font-medium text-gray-700">{x.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bonuses + Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="text-2xl font-bold text-gray-900">Features & Benefits</h2>
        <p className="mt-1 text-gray-600">Designed for students, beginners, and job-ready skills.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((b) => (
            <div key={b.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-lg font-bold text-gray-900">{b.title}</div>
              <div className="mt-2 text-sm text-gray-600">{b.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900">What Program Graduates Are Saying</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {testimonials.slice(0, 4).map((t) => (
                <blockquote key={t.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <p className="text-sm text-gray-700">“{t.text}”</p>
                  <footer className="mt-4 text-sm font-semibold text-gray-900">{t.name}</footer>
                </blockquote>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-white shadow-sm">
            <h3 className="text-xl font-bold">Ready to start?</h3>
            <p className="mt-2 text-sm text-white/80">Enroll today and learn with a structured roadmap.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/admission" className="btn-touch rounded-xl bg-accent-orange px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition">
                Enroll Now
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-touch inline-flex items-center justify-center rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                {WHATSAPP_CTA}
              </a>
            </div>
            <div className="mt-4 text-xs text-white/70">Limited seats. Terms & Conditions Apply.</div>
          </div>
        </div>
      </section>

      {/* Referral */}
      <section id="referral" className="bg-gray-50 border-t border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Refer & Earn with NITA Classes</h2>
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

              <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-5">
                <div className="font-semibold text-orange-900">Affiliate Partner registration fee: ₹99</div>
                <div className="mt-1 text-sm text-orange-900/90">
                  Register once to get your personal referral code and start earning.
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {user ? (
                  <Link
                    to={isStudent ? '/student/referrals' : '/admin'}
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
              <h3 className="text-lg font-bold text-gray-900">How monthly payout works</h3>
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
      </section>
    </>
  )
}
