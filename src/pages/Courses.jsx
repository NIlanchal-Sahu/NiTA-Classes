import { Link } from 'react-router-dom'

const COURSE_DETAILS = [
  {
    id: 'dca',
    name: 'DCA (Basic Computer Course) - Quick and Short Term Course',
    courseHour: '140 / 300 Hours',
    certificationDuration: '3 Month / 6 Month (as per student preference)',
    enrollmentFees: '499',
    classFee: '10/class',
    urgent: 'Urgent Certification Available in 45 Days',
    level: 'Quick & Short Term',
    content: [
      'Basics of Computer Technology & AI',
      'Basics of MS Office (Word, Excel, PPT, Email) - Introductory AI Tools',
      'Basics of Networking - Communication Technologies, Website, Mobile APP, Web Application.',
      'Spoken English - Intermediate Level (6 Month Course Only)',
    ],
  },
  {
    id: 'cca',
    name: "CCA - Course on Computer Application (Equivalent to PGDCA & 'O' Level)",
    nsqf: 'NSQF Level - 4',
    nsdc: 'NSDC Govt. Certification (Certificates available & can be verified on DigiLocker app)',
    courseHour: '600 Hours',
    certificationDuration: '6 Month / 1 Year (as per student preference)',
    enrollmentFees: '999',
    classFee: '10/class',
    urgent: 'Urgent Certification Available in 45 Days',
    level: 'Advanced Computer Course',
    content: [
      'Fundamentals of Computer Technology & AI',
      'Complete MS Office Skills (Word, Excel, PPT, Email) - With AI Tools',
      'Concept of Networking - Communication Technologies, Website, Mobile APP, Web Application.',
      'C and Java Programming',
      'HTML + React JS (Website Development)',
      'Tally ERP',
      'Project (As per student choice)',
    ],
  },
  {
    id: 'spoken-english-mastery',
    name: 'Spoken English Mastery - Advance Level',
    courseHour: '140 Hours',
    certificationDuration: '3 Months / 6 Months',
    enrollmentFees: '499',
    classFee: '10/class',
    urgent: 'Urgent Complete in 30 Days',
    level: 'Communication & Speaking Focus',
    content: [
      'From ABCD to Advanced Sentence Making',
      'Vocabulary',
      'Confidence Building',
      'Colocations',
      'English Presentation',
      'Talking to Stranger (Online App)',
      'Group Discussion',
    ],
  },
  {
    id: 'ai-associate',
    name: 'Artificial Intelligent Associate (AI Development Course with Python)',
    qpCode: 'QP Code - NIE/SSC/Q1004',
    nsqf: 'NSQF Level - 4',
    nielit: 'NIELIT / NSDC Govt. Certification (Verify on DigiLocker app)',
    courseHour: '600 Hours',
    certificationDuration: '6 Month / 1 Year (as per student preference)',
    enrollmentFees: '1499',
    classFee: '10/class',
    urgent: 'Urgent Certification Available in 100 Days',
    level: 'AI Development with Python',
    content: [
      'NIE/ITS/N1005: Development of Deep Learning framework for collecting, analysing and interpreting large amounts of data',
      'NIE/ITS/N1005: PROGRAMMING with PYTHON',
      'NIE/ITS/N1006: Create and deploy interactive Artificial Intelligence projects',
      'NIE/ITS/N1007: Conceptualising Data Science with Python',
      'NIE/ITS/N1008: FUNDAMENTALS of MACHINE LEARNING',
      'NIE/ITS/N1008: Data analysis and Visualization',
      'NIE/ITS/N1009: PERFORMANCE and ACCURACY of MACHINE LEARNING MODELS',
      'DGT/VSQ/N0102: Employability Skills (60 Hours)',
    ],
  },
  {
    id: 'ai-video-creation',
    name: 'AI Video Creation Course',
    courseHour: '80 Hours',
    certificationDuration: '2 Months',
    enrollmentFees: '499',
    classFee: '10/class',
    urgent: 'Urgent Complete in 15 Days',
    level: 'AI Video Creation',
    content: [
      'Product Ad Video Prompts Using JSON Framework',
      'AI Model Creation',
      'Retail Store Demo Ad (BIBA Case Study)',
      'UGC Ad Creation',
      'AI Presentation Video',
      'Facebook Ads Video Creation',
      'Idea To Complete AI Video – LIVE Masterclass',
    ],
  },
]

export default function Courses() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Comprehensive Courses</h1>
      <p className="mt-2 text-gray-600">Course duration and certification depend on your preference. *Terms & Conditions Apply.</p>

      <div className="mt-10 space-y-8">
        {COURSE_DETAILS.map((course) => (
          <article key={course.id} id={course.id} className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
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
                  {course.nsqf && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Certification Details</dt>
                      <dd className="text-gray-900">{course.nsqf}</dd>
                    </div>
                  )}
                  {course.nielit && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Govt Certification</dt>
                      <dd className="text-gray-900">{course.nielit}</dd>
                    </div>
                  )}
                  {course.nsdc && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">NSDC Certification</dt>
                      <dd className="text-gray-900">{course.nsdc}</dd>
                    </div>
                  )}
                </dl>

                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-800">
                    Enrollment fees: ₹{course.enrollmentFees} + {course.classFee}
                  </p>
                  <p className="mt-1 text-sm text-red-600 font-medium">{course.urgent}</p>
                </div>

                <h3 className="mt-5 text-sm font-semibold text-gray-700">Course Content</h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-gray-600">
                  {course.content.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="shrink-0 lg:text-right">
                <p className="text-2xl font-bold text-primary-600">
                  ₹{course.enrollmentFees} + {course.classFee}
                </p>
                <Link
                  to="/admission"
                  className="btn-touch mt-3 inline-block rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition"
                >
                  Enroll Now
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

