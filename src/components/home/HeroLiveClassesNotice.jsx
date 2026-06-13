import { LOGO_SRC } from '../../config'

/** Hero callout — classes running now */
export default function HeroLiveClassesNotice() {
  return (
    <div className="hero-live-classes mt-4 w-full">
      <style>{`
        @keyframes hero-live-shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }

        @keyframes hero-live-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.65; transform: scale(1.15); }
        }

        .hero-live-em {
          background: linear-gradient(90deg, #fde68a, #fbbf24, #fb923c, #fde68a);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: hero-live-shimmer 3s linear infinite;
        }

        .hero-live-dot {
          animation: hero-live-dot 1.2s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-live-em,
          .hero-live-dot {
            animation: none;
          }
          .hero-live-em {
            color: #fbbf24;
            background: none;
            -webkit-background-clip: unset;
            background-clip: unset;
          }
        }
      `}</style>

      <p
        className="flex flex-wrap items-center gap-3 text-sm font-extrabold tracking-wide text-white sm:text-base"
        role="status"
      >
        <span className="inline-flex flex-wrap items-center gap-2.5">
          <span
            className="hero-live-dot inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
            aria-hidden
          />
          <span>
            Classes are running for{' '}
            <span className="hero-live-em">All our Courses</span>
            ...!
          </span>
        </span>
      </p>
    </div>
  )
}
