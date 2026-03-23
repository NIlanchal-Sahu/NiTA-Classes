import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicLayout from './layouts/PublicLayout'
import StudentLayout from './layouts/StudentLayout'
import Home from './pages/Home'
import Courses from './pages/Courses'
import Admission from './pages/Admission'
import About from './pages/About'
import Contact from './pages/Contact'
import Referral from './pages/Referral'
import Login from './pages/Login'
import AdminPanel from './pages/AdminPanel'
import DashboardHome from './pages/student/DashboardHome'
import PayForClass from './pages/student/PayForClass'
import MyCourses from './pages/student/MyCourses'
import ExploreCourses from './pages/student/ExploreCourses'
import LearningPaths from './pages/student/LearningPaths'
import CourseContent from './pages/student/CourseContent'
import HelpSupport from './pages/student/HelpSupport'
import Achievements from './pages/student/Achievements'
import Settings from './pages/student/Settings'
import StudentProfile from './pages/student/StudentProfile'
import ReferEarn from './pages/student/ReferEarn'
import LinkStudent from './pages/student/LinkStudent'
import AdminLayout from './admin/AdminLayout'
import AdminDashboard from './admin/AdminDashboard'
import AdminStudents from './admin/AdminStudents'
import AdminAttendance from './admin/AdminAttendance'
import AdminEnrollments from './admin/AdminEnrollments'
import AdminBatches from './admin/AdminBatches'
import AdminNotifications from './admin/AdminNotifications'
import AdminReferrals from './admin/AdminReferrals'
import AdminCourses from './admin/AdminCourses'
import AdminFees from './admin/AdminFees'
import AdminDiscounts from './admin/AdminDiscounts'
import AdminNotes from './admin/AdminNotes'
import AdminCertificates from './admin/AdminCertificates'
import AdminStudentProfiles from './admin/AdminStudentProfiles'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/admission" element={<Admission />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/login" element={<Login />} />
        </Route>
        <Route
          path="/student"
          element={
            <ProtectedRoute requireRole="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="pay" element={<PayForClass />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="explore" element={<ExploreCourses />} />
          <Route path="learning-paths" element={<LearningPaths />} />
          <Route path="course/:courseId" element={<CourseContent />} />
          <Route path="help" element={<HelpSupport />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="referrals" element={<ReferEarn />} />
          <Route path="link-student" element={<LinkStudent />} />
        </Route>
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireRole={['admin', 'teacher']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="fees" element={<AdminFees />} />
          <Route path="discounts" element={<AdminDiscounts />} />
          <Route path="notes" element={<AdminNotes />} />
          <Route path="certificates" element={<AdminCertificates />} />
          <Route path="student-profiles" element={<AdminStudentProfiles />} />
          <Route path="enrollments" element={<AdminEnrollments />} />
          <Route path="batches" element={<AdminBatches />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="referrals" element={<AdminReferrals />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
