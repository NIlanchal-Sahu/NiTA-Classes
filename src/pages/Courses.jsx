import { useState } from 'react'
import { Link } from 'react-router-dom'
import { COURSE_CATALOG } from '../data/courseCatalog'
import CoursePreviewModal from '../components/courses/CoursePreviewModal'

export default function Courses() {
  const [previewCourse, setPreviewCourse] = useState(null)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Comprehensive Courses</h1>
      <p className="mt-2 text-gray-600">Course duration and certification depend on your preference. *Terms & Conditions Apply.</p>
      <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1.2fr,1fr] lg:items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Certification by NSDC and Skill India</h2>
            <p className="mt-2 text-sm text-gray-700 sm:text-base">
              Selected courses at NITA Classes are aligned with <span className="font-semibold">NSQF Level 4</span> and
              follow an industry-ready structure. For applicable courses, certification is recognized under
              <span className="font-semibold"> NSDC</span> and <span className="font-semibold">Skill India</span> under the
              <span className="font-semibold"> Ministry of Skill Development and Entrepreneurship</span>.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Certificates earned in eligible programs can be verified on the Government's
              <span className="font-semibold"> DigiLocker</span> app, making them secure, authentic, and easy to verify.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Note: To check whether a certificate is Government-recognized, verify it through DigiLocker.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-white/70 bg-white p-4">
            <div className="flex items-center justify-center rounded-lg border border-gray-100 bg-white p-3">
              <img src="/skill-india-logo.png" alt="Skill India recognized pathway" className="h-20 w-auto object-contain sm:h-24" />
            </div>
            <div className="flex items-center justify-center rounded-lg border border-gray-100 bg-white p-3">
              <img src="/nsdc-logo.png" alt="NSDC aligned certification support" className="h-20 w-auto object-contain sm:h-24" />
            </div>
            <div className="col-span-2 rounded-lg bg-emerald-100 px-3 py-2 text-center text-xs font-semibold text-emerald-900">
              Selected courses are NSQF Level 4 aligned and can be verified on DigiLocker app.
            </div>
          </div>
        </div>
      </section>

      <div className="mt-10 space-y-8">
        {COURSE_CATALOG.map((course) => (
          <article key={course.id} id={course.id} className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                {course.trustBadge && (
                  <div className="mb-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                    {course.trustBadge}
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{course.name}</h2>
                <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Course Hour</dt>
                    <dd className="text-gray-900">{course.courseHour}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Certification Duration</dt>
                    <dd className="text-gray-900">{course.certificationDuration}</dd>
                  </div>
                </dl>

                <div className="mt-4">
                  {course.isIncludedBenefit ? (
                    <p className="text-sm font-semibold text-emerald-700">
                      Included with all courses except Spoken English
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-gray-800">
                      Enrollment fees: ₹{course.enrollmentFees} + {course.classFee}
                    </p>
                  )}
                  <p className="mt-1 text-sm font-medium text-red-600">{course.urgent}</p>
                </div>

                {course.intro && (
                  <p className="mt-5 rounded-xl border border-primary-100 bg-primary-50/60 p-4 text-sm leading-relaxed text-gray-800">
                    {course.intro}
                  </p>
                )}

                <h3 className="mt-5 text-sm font-semibold text-gray-700">Course Content</h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-gray-600">
                  {course.content.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="shrink-0 lg:text-right">
                {course.isIncludedBenefit ? (
                  <p className="text-lg font-bold text-emerald-700">Included benefit</p>
                ) : (
                  <p className="text-2xl font-bold text-primary-600">
                    ₹{course.enrollmentFees} + {course.classFee}
                  </p>
                )}
                <div className="mt-3 flex flex-col gap-2 sm:items-end">
                  <button
                    type="button"
                    onClick={() => setPreviewCourse(course)}
                    className="btn-touch inline-block rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
                  >
                    Quick preview
                  </button>
                  {course.isIncludedBenefit ? (
                    <Link
                      to="/admission"
                      className="btn-touch inline-block rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition"
                    >
                      Enroll in a course — LAB included
                    </Link>
                  ) : (
                    <>
                      <Link
                        to={course.isVvip ? '/student/pay' : `/enroll/${course.id}`}
                        className="btn-touch inline-block rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition"
                      >
                        {course.isVvip ? 'Get VVIP' : 'Enroll Now — Pay online'}
                      </Link>
                      {!course.isVvip && (
                        <Link
                          to="/admission"
                          className="text-xs font-medium text-gray-500 hover:text-primary-600 hover:underline"
                        >
                          Or use free admission form
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <CoursePreviewModal course={previewCourse} onClose={() => setPreviewCourse(null)} />
    </div>
  )
}
