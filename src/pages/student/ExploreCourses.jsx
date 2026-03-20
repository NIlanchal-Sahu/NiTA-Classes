import { Link } from 'react-router-dom'

const courses = [
  {
    id: 'dca',
    title: 'DCA (Basic Computer Course) - Quick & Short Term',
    discount: null,
    locked: true,
    image: '/qr-dummy.png',
  },
  {
    id: 'cca',
    title: "CCA - Computer Application (PGDCA / O Level Equivalent)",
    discount: null,
    locked: true,
    image: '/qr-dummy.png',
  },
  {
    id: 'spoken-english-mastery',
    title: 'Spoken English Mastery (Advance Level)',
    discount: null,
    locked: true,
    image: '/qr-dummy.png',
  },
  {
    id: 'ai-associate',
    title: 'Artificial Intelligent Associate (AI Dev with Python)',
    discount: null,
    locked: true,
    image: '/qr-dummy.png',
  },
  {
    id: 'ai-video-creation',
    title: 'AI Video Creation Course',
    discount: null,
    locked: true,
    image: '/qr-dummy.png',
  },
]

export default function ExploreCourses() {
  return (
    <>
      <h1 className="text-2xl font-bold text-white">Explore Courses</h1>
      <p className="mt-1 text-gray-400">Choose your course and enroll.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <div
            key={c.id}
            className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 transition hover:border-gray-600"
          >
            <div className="relative aspect-video bg-gray-700">
              <img src={c.image} alt="" className="h-full w-full object-cover" />
              <span className="absolute left-2 top-2 rounded bg-red-600/90 px-2 py-1 text-xs font-medium text-white">
                LOCKED
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-white line-clamp-2">{c.title}</h3>
              <Link
                to="/admission"
                className="mt-3 inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
              >
                Enroll Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

