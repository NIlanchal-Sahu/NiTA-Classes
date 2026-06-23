import { getCourseById } from '../../data/courseCatalog'

/**
 * Emoji + gradient course cover (no image assets).
 * Merges API course objects with public catalog icon/bgClass when available.
 */
export default function CourseEmojiCover({ course, className = '', variant = 'light' }) {
  const catalog = getCourseById(course?.id)
  const icon = course?.icon || catalog?.icon || '✨'
  const visual = course?.visual || catalog?.visual || ''
  const bgClass =
    course?.bgClass || catalog?.bgClass || 'from-indigo-100 via-violet-100 to-purple-100'

  if (variant === 'dark') {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-indigo-700/90 to-violet-900/95 ${className}`}
      >
        <div className="text-center">
          <div className="text-5xl">{icon}</div>
          {visual ? (
            <div className="mt-2 line-clamp-2 px-2 text-xs font-medium text-gray-300">{visual}</div>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center bg-gradient-to-br ${bgClass} ${className}`}>
      <div className="text-center">
        <div className="text-5xl">{icon}</div>
        {visual ? (
          <div className="mt-2 line-clamp-2 px-2 text-sm font-semibold text-gray-700">{visual}</div>
        ) : null}
      </div>
    </div>
  )
}
