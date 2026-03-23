import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LOGO_SRC } from "../config";
import { studentPortalApi } from "../api/student";

const navItems = [
  { to: "/student", end: true, label: "Dashboard", icon: DashboardIcon },
  { to: "/student/pay", label: "Pay for Class", icon: WalletIcon },
  { to: "/student/referrals", label: "Refer & Earn", icon: GiftIcon },
  { to: "/student/my-courses", label: "My Courses", icon: BookIcon },
  { to: "/student/explore", label: "Explore Courses", icon: EyeIcon, badge: 5 },
  { to: "/student/learning-paths", label: "Attendance Tracker", icon: PathIcon },
  { to: "/student/help", label: "Help & Support", icon: HelpIcon },
  { to: "/student/achievements", label: "Achievements", icon: TrophyIcon },
  { to: "/student/settings", label: "Settings", icon: SettingsIcon },
];

function DashboardIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}
function BookIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
}
function EyeIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}
function PathIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  );
}
function HelpIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
function TrophyIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3h14v5a3 3 0 01-3 3h-8a3 3 0 01-3-3V3zM8 21h8M12 17v4M7 11h10M7 7h10"
      />
    </svg>
  );
}

function GiftIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v13m0-13H7a2 2 0 00-2 2v11h14V10a2 2 0 00-2-2h-5zm0 0c-1.657 0-3-1.12-3-2.5S10.343 3 12 3s3 1.12 3 2.5S13.657 8 12 8z"
      />
    </svg>
  );
}
function SettingsIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}
function WalletIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  );
}

function isVvip(user) {
  const until = user?.vvipValidUntil;
  if (!until) return false;
  return String(until).slice(0, 10) >= new Date().toISOString().slice(0, 10);
}

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [enrolledCourseCount, setEnrolledCourseCount] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initial = (user?.name || user?.email || "S").charAt(0).toUpperCase();
  const vvip = user?.role === "student" && isVvip(user);

  useEffect(() => {
    if (user?.role !== "student") return;
    let cancelled = false;
    (async () => {
      try {
        const out = await studentPortalApi.getCoursesLearning();
        const enrolled =
          out.enrolledCourses || (out.allCourses || []).filter((c) => c.unlocked);
        const list = enrolled.filter((c) => String(c.id) !== "trial-course");
        if (!cancelled) setEnrolledCourseCount(list.length);
      } catch {
        if (!cancelled) setEnrolledCourseCount(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role]);

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar overlay (mobile) */}
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        style={{ display: sidebarOpen ? "block" : "none" }}
        onClick={() => setSidebarOpen(false)}
        aria-hidden
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-gray-800 border-r border-gray-700 lg:static lg:translate-x-0 transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-gray-700 px-4 lg:justify-center">
          <Link to="/student" className="flex items-center gap-2">
            <img src={LOGO_SRC} alt="NITA Academy logo" className="h-9 w-auto" />
            <span className="text-lg font-bold text-violet-300">Student</span>
          </Link>
          <button
            type="button"
            className="btn-touch rounded-lg p-2 text-gray-400 hover:bg-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-violet-600 text-white"
                    : "text-gray-400 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge != null && (
                <span className="rounded-full bg-violet-600 px-2 py-0.5 text-xs font-medium text-white">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-700 bg-gray-900 px-4 lg:px-8">
          <button
            type="button"
            className="btn-touch -ml-2 rounded-lg p-2 text-gray-400 hover:bg-gray-800 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex-1 lg:flex-none" />
          {user?.role === "student" && (
            <div className="hidden items-center gap-4 sm:flex">
              <Link
                to="/student/pay"
                className="flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-1.5 text-sm"
              >
                <span className="text-gray-400">Wallet</span>
                <span className="font-semibold text-white">
                  ₹{user?.walletBalance ?? 0}
                </span>
              </Link>
              <span className="text-sm text-gray-400">
                <span className="font-semibold text-white">
                  {user?.totalClassesAttended ?? 0}
                </span>{" "}
                classes
              </span>
              <span className="text-sm text-gray-400">
                <span className="font-semibold text-white">
                  {enrolledCourseCount === null ? "—" : enrolledCourseCount}
                </span>{" "}
                enrolled
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              className="btn-touch rounded-lg p-2 text-gray-400 hover:bg-gray-800"
              aria-label="Notifications"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            <div className="relative flex items-center gap-3">
              {vvip && (
                <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-400 ring-1 ring-amber-500/50">
                  VVIP
                </span>
              )}
              <button
                type="button"
                className="flex items-center gap-3 rounded-lg py-1 pl-1 pr-2 hover:bg-gray-800"
                onClick={() => setUserMenuOpen((o) => !o)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <div className="h-9 w-9 rounded-full bg-violet-600 flex items-center justify-center text-sm font-semibold text-white overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span>{initial}</span>
                  )}
                </div>
                <span className="hidden max-w-[10rem] truncate text-left text-sm font-medium text-white sm:block">
                  {user?.name || user?.email || "Student"}
                </span>
                <svg className="hidden h-4 w-4 text-gray-400 sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" aria-hidden onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border border-gray-700 bg-gray-800 py-1 shadow-xl">
                    <Link
                      to="/student/profile"
                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Student profile
                    </Link>
                    <Link
                      to="/student/settings"
                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      type="button"
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                        navigate("/login");
                      }}
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>

        <footer className="border-t border-gray-700 py-4 px-4 lg:px-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} NITA Classes. All Rights Reserved.
        </footer>
      </div>
    </div>
  );
}
