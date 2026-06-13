import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getShowcaseCourses } from '../../data/courseCatalog'
import CoursePreviewModal from './CoursePreviewModal'

export default function CourseShowcaseGrid({ title = 'Our Courses & Student Outcomes', subtitle = 'Explore what students learn in each course.' }) {
  const courses = getShowcaseCourses()
  const [previewCourse, setPreviewCourse] = useState(null)

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="mt-1 text-gray-600">{subtitle}</p>
          </div>
          <Link to="/courses" className="text-sm font-semibold text-primary-600 hover:underline">
            View all →
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => setPreviewCourse(course)}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"
            >
              <div className={`relative flex aspect-video items-center justify-center bg-gradient-to-br ${course.bgClass}`}>
                <div className="text-center">
                  <div className="text-5xl transition duration-300 group-hover:-translate-y-1 group-hover:scale-110">
                    {course.icon}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-gray-700">{course.visual}</div>
                </div>
                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-700 shadow">
                  Preview
                </span>
              </div>
              <div className="p-4">
                <div className="font-semibold text-gray-900">{course.shortTitle || course.name}</div>
                <div className="mt-1 flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {course.isIncludedBenefit
                      ? 'Included with courses (except Spoken English)'
                      : `₹${course.enrollmentFees} enrollment`}
                  </span>
                  <span className="font-medium text-primary-600 group-hover:underline">Tap to preview →</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <CoursePreviewModal course={previewCourse} onClose={() => setPreviewCourse(null)} />
    </>
  )
}
