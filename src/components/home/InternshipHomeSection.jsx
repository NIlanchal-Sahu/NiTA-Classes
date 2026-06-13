import { Link } from 'react-router-dom'

const highlights = [
  { label: 'Duration', value: '1 / 3 / 6 months' },
  { label: 'Mode', value: 'Part-time & full-time' },
  { label: 'Focus', value: 'Live projects & AI skills' },
  { label: 'Partner', value: 'PRAGYAA.AI collaboration' },
]

export default function InternshipHomeSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-indigo-50 to-primary-50 p-6 shadow-sm sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Internship program</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              UG Internship — real projects &amp; industry experience
            </h2>
            <p className="mt-3 text-gray-700">
              Work on live projects, AI workflows, and industry-ready skills with{' '}
              <span className="font-semibold">NITA Classes</span> in collaboration with{' '}
              <span className="font-semibold">PRAGYAA.AI</span>. Open to undergraduate students.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {highlights.map((h) => (
                <div key={h.label} className="rounded-xl border border-white/80 bg-white/70 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-primary-600">{h.label}</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">{h.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/internship"
                className="btn-touch inline-flex items-center justify-center rounded-xl bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
              >
                Explore internship program →
              </Link>
            </div>
          </div>

          <Link
            to="/internship"
            className="group block overflow-hidden rounded-2xl border border-violet-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <img
              src="/internship-program-poster.png"
              alt="NITA Classes internship program for UG students"
              className="aspect-[4/5] w-full object-cover object-top transition duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
            <div className="border-t border-gray-100 px-4 py-3 text-center text-sm font-semibold text-primary-700 group-hover:text-primary-800">
              View program details &amp; apply →
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
