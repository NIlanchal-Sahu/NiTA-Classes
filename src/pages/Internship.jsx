import { Link } from 'react-router-dom'
import { INTERNSHIP_APPLICATION_FORM_URL, WHATSAPP_NUMBER, WHATSAPP_CTA } from '../config'
import { INTERNSHIP_PILLARS } from '../components/internship/internshipContent'

const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}`

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
            {INTERNSHIP_PILLARS.map((p) => (
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
