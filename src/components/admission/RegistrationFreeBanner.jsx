/** Attention-grabbing “Register Now for Free” banner */
export default function RegistrationFreeBanner() {
  return (
    <div className="register-free-banner mx-auto mb-8 flex justify-center px-2">
      <style>{`
        @keyframes reg-badge-enter {
          0% {
            opacity: 0;
            transform: translateY(14px) scale(0.94);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes reg-gradient-flow {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }

        @keyframes reg-shimmer-sweep {
          0% { transform: translateX(-130%) skewX(-14deg); opacity: 0; }
          12% { opacity: 1; }
          100% { transform: translateX(230%) skewX(-14deg); opacity: 0; }
        }

        @keyframes reg-badge-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 10px 28px rgba(79, 70, 229, 0.2);
          }
          50% {
            transform: scale(1.03);
            box-shadow: 0 14px 36px rgba(6, 182, 212, 0.28);
          }
        }

        @keyframes reg-dot-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.55; }
          50% { transform: translateY(-4px); opacity: 1; }
        }

        .reg-badge-shell {
          position: relative;
          padding: 3px;
          border-radius: 9999px;
          background: linear-gradient(
            90deg,
            #4f46e5,
            #06b6d4,
            #10b981,
            #f59e0b,
            #ec4899,
            #4f46e5
          );
          background-size: 300% 100%;
          animation:
            reg-badge-enter 0.65s ease-out both,
            reg-gradient-flow 5s linear infinite,
            reg-badge-pulse 2.8s ease-in-out infinite;
        }

        .reg-badge-inner {
          position: relative;
          overflow: hidden;
          border-radius: 9999px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 55%, #eef2ff 100%);
          padding: 0.9rem 1.6rem;
        }

        @media (min-width: 640px) {
          .reg-badge-inner {
            padding: 1rem 2rem;
          }
        }

        .reg-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            transparent 38%,
            rgba(255, 255, 255, 0.85) 50%,
            transparent 62%
          );
          animation: reg-shimmer-sweep 2.6s ease-in-out infinite;
          pointer-events: none;
        }

        .reg-free-word {
          background: linear-gradient(90deg, #059669, #10b981, #34d399, #059669);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: reg-gradient-flow 2.5s linear infinite;
        }

        .reg-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          margin-left: 6px;
          border-radius: 9999px;
          background: #10b981;
          vertical-align: middle;
          animation: reg-dot-bounce 1.4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .reg-badge-shell,
          .reg-shimmer,
          .reg-free-word,
          .reg-dot {
            animation: none;
          }
          .reg-badge-shell {
            box-shadow: 0 8px 20px rgba(79, 70, 229, 0.18);
          }
          .reg-free-word {
            color: #059669;
            background: none;
            -webkit-background-clip: unset;
            background-clip: unset;
          }
        }
      `}</style>

      <div className="reg-badge-shell" aria-label="Register now for free">
        <div className="reg-badge-inner">
          <span className="reg-shimmer" aria-hidden />
          <p className="relative z-10 text-center text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl md:text-3xl">
            Register Now for{' '}
            <span className="reg-free-word">Free</span>
            <span className="reg-dot" aria-hidden />
          </p>
        </div>
      </div>
    </div>
  )
}
