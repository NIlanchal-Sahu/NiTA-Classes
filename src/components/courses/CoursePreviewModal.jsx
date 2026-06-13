import { Link } from 'react-router-dom'

export default function CoursePreviewModal({ course, onClose }) {
  if (!course) return null

  const enrollTo = course.isVvip
    ? '/student/pay'
    : course.isIncludedBenefit
      ? '/admission'
      : `/enroll/${course.id}`
  const enrollLabel = course.isVvip
    ? 'Get VVIP — Login required'
    : course.isIncludedBenefit
      ? 'Enroll in a course — LAB included'
      : 'Enroll Now — Pay online'

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-gray-200 bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`relative flex aspect-[2/1] items-center justify-center bg-gradient-to-br ${course.bgClass}`}>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-gray-700 shadow hover:bg-white"
            aria-label="Close preview"
          >
            ×
          </button>
          <div className="text-center">
            <div className="text-5xl">{course.icon}</div>
            <div className="mt-2 text-sm font-semibold text-gray-700">{course.visual}</div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {course.trustBadge && (
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              {course.trustBadge}
            </span>
          )}
          <h2 className="mt-2 text-xl font-bold text-gray-900">{course.shortTitle || course.name}</h2>
          <p className="mt-1 text-sm text-gray-500">{course.level}</p>

          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
              <dt className="text-xs font-medium text-gray-500">Course hours</dt>
              <dd className="text-sm font-semibold text-gray-900">{course.courseHour}</dd>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
              <dt className="text-xs font-medium text-gray-500">Duration</dt>
              <dd className="text-sm font-semibold text-gray-900">{course.certificationDuration}</dd>
            </div>
            <div className="rounded-xl border border-primary-100 bg-primary-50 px-3 py-2 sm:col-span-2">
              <dt className="text-xs font-medium text-primary-700">
                {course.isIncludedBenefit ? 'Access' : 'Enrollment fee'}
              </dt>
              <dd className="text-lg font-extrabold text-primary-700">
                {course.isIncludedBenefit
                  ? 'Included with all courses except Spoken English'
                  : `₹${course.enrollmentFees} + ${course.classFee}`}
              </dd>
            </div>
          </dl>

          {course.urgent && <p className="mt-3 text-sm font-medium text-red-600">{course.urgent}</p>}
          {course.intro && <p className="mt-3 text-sm leading-relaxed text-gray-700">{course.intro}</p>}

          <h3 className="mt-4 text-sm font-semibold text-gray-800">What you will learn</h3>
          <ul className="mt-2 max-h-36 space-y-1 overflow-y-auto text-sm text-gray-600">
            {(course.content || []).slice(0, 5).map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-primary-500">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to={enrollTo}
              onClick={onClose}
              className="btn-touch inline-flex flex-1 items-center justify-center rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700"
            >
              {enrollLabel}
            </Link>
            <Link
              to={`/courses#${course.id}`}
              onClick={onClose}
              className="btn-touch inline-flex flex-1 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Full course details
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
