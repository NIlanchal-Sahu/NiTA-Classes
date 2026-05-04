import { Link } from 'react-router-dom'
import { INTERNSHIP_APPLICATION_FORM_URL, WHATSAPP_NUMBER, WHATSAPP_CTA } from '../config'

const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}`

const pillars = [
  {
    id: 'live',
    title: 'Live projects',
    blurb: 'Ship real work — not just theory. Build alongside mentors.',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9h.008v.008H8V9zm4 0h.008v.008H12V9zm-4 4h.008v.008H8v-.008zm4 0h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    id: 'ai',
    title: 'AI & data analytics',
    blurb: 'Exposure to AI workflows, data sense, and practical analytics.',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    id: 'prompt',
    title: 'Prompt engineering',
    blurb: 'Learn to steer AI tools effectively for real outputs.',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.643a4.097 4.097 0 01-1.254 2.196c.384.698.894 1.316 1.496 1.84l.015.012M12 21.75l-3.75-1.5M12 21.75l2.25-1.5M12 21.75V18M9 10.5h.008v.008H9V10.5zm3 0h.008v.008H12V10.5zm3 0h.008v.008H15V10.5z"
        />
      </svg>
    ),
  },
  {
    id: 'industry',
    title: 'Industry skills',
    blurb: 'Professional habits, communication, and job-ready practices.',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
        />
      </svg>
    ),
  },
]

export default function Internship() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr,1.05fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-400 sm:text-sm">Internship program</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              <span className="text-amber-300">INTERNSHIP</span>{' '}
              <span className="text-white">PROGRAM</span>
            </h1>
            <p className="mt-2 text-xl font-bold text-cyan-300 sm:text-2xl">For UG students</p>
            <p className="mt-4 max-w-xl text-lg text-slate-300">
              Work on real projects &amp; gain industry experience — powered by{' '}
              <span className="font-semibold text-white">NITA Classes</span>
              {', '}
              in collaboration with <span className="font-semibold text-cyan-200">PRAGYAA.AI</span>.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={INTERNSHIP_APPLICATION_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-touch inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-base font-extrabold text-slate-900 shadow-lg shadow-amber-500/25 transition hover:bg-amber-300"
              >
                Apply now — limited seats!
                <span aria-hidden>→→</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-touch inline-flex items-center justify-center rounded-xl border-2 border-cyan-500/50 bg-slate-900/80 px-6 py-3.5 text-base font-semibold text-cyan-100 hover:border-cyan-400 hover:bg-slate-800"
              >
                WhatsApp
              </a>
              <Link
                to="/contact"
                className="btn-touch inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-base font-semibold text-slate-400 hover:text-white"
              >
                Contact
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/60 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-amber-300">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-bold uppercase tracking-wide">Flexible duration</span>
                </div>
                <p className="mt-2 text-lg font-semibold text-white">1 / 3 / 6 months</p>
                <p className="mt-1 text-sm text-slate-400">Pick a track that fits your semester or break.</p>
              </div>
              <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/60 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-amber-300">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-bold uppercase tracking-wide">Availability</span>
                </div>
                <p className="mt-2 text-lg font-semibold text-white">Part-time &amp; full-time</p>
                <p className="mt-1 text-sm text-slate-400">Discuss your hours when we connect after you apply.</p>
              </div>
            </div>
          </div>

          <figure className="relative">
            <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-br from-amber-400/20 via-cyan-500/20 to-transparent blur-xl" />
            <div className="relative overflow-hidden rounded-2xl border-2 border-cyan-500/40 shadow-2xl shadow-cyan-900/50 ring-1 ring-amber-400/20">
              <img
                src="/internship-program-poster.png"
                alt="NIT Academy internship program — real projects, AI and analytics, prompt engineering, industry skills. 1, 3, or 6 months. Part-time and full-time. Powered by NITA Classes with PRAGYAA.AI."
                className="w-full object-cover object-top"
                width={1200}
                height={1600}
                loading="eager"
              />
            </div>
            <figcaption className="mt-3 text-center text-xs text-slate-500">
              Program poster — same details summarized on this page.
            </figcaption>
          </figure>
        </div>

        <section className="mt-16 border-t border-cyan-500/20 pt-16">
          <h2 className="text-center text-sm font-bold uppercase tracking-[0.3em] text-cyan-400">Program pillars</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-400">
            The four focus areas we emphasize for undergraduate interns — aligned with the NIT Academy × NITA Classes
            × PRAGYAA.AI program.
          </p>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => (
              <li
                key={p.id}
                className="group rounded-2xl border border-cyan-500/25 bg-slate-900/70 p-6 shadow-lg transition hover:border-amber-400/40 hover:shadow-amber-500/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/40 text-cyan-300 group-hover:text-amber-300">
                  {p.icon}
                </div>
                <h3 className="mt-4 text-lg font-bold uppercase tracking-wide text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.blurb}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 rounded-2xl border border-slate-700 bg-slate-900/50 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-white">How to apply</h2>
          <ol className="mt-4 list-inside list-decimal space-y-2 text-slate-300">
            <li>
              Click <strong className="text-amber-200">Apply now — limited seats!</strong> and complete the Google Form.
            </li>
            <li>We review applications and may contact you by call or WhatsApp.</li>
            <li>If you are shortlisted, we share mode, timing, and next steps.</li>
          </ol>
          <p className="mt-6 text-sm text-slate-500">
            Questions first? {WHATSAPP_CTA} — mention &quot;Internship&quot; in your message.
          </p>
        </section>

        <footer className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-center text-sm text-slate-500 sm:flex-row sm:text-left">
          <p>
            <span className="text-slate-400">Powered by</span> <strong className="text-white">NITA Classes</strong>
            <span className="mx-2 text-slate-600">·</span>
            <span className="text-slate-400">In collaboration with</span>{' '}
            <strong className="text-cyan-300">PRAGYAA.AI</strong>
          </p>
          <Link to="/" className="font-medium text-cyan-400 hover:text-cyan-300">
            ← Back to NITA Classes home
          </Link>
        </footer>
      </div>
    </div>
  )
}
