import { lazy, Suspense, useEffect, useRef, useState } from 'react'

const AllOurCoursesInteractive = lazy(() => import('./AllOurCoursesInteractive'))

export default function LazyAllOurCoursesSection() {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { rootMargin: '120px 0px', threshold: 0.02 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-0"
      aria-label="Interactive course and skills explorer"
    >
      {visible ? (
        <Suspense
          fallback={
            <div
              className="min-h-[400px] w-full animate-pulse rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50/80 to-indigo-50/40 sm:min-h-[440px]"
              aria-hidden
            />
          }
        >
          <AllOurCoursesInteractive />
        </Suspense>
      ) : (
        <div
          className="min-h-[400px] w-full rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50/60 to-white sm:min-h-[440px]"
          aria-hidden
        />
      )}
    </section>
  )
}
