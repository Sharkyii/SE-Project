import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Auth } from './components/auth/Auth';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Chatbot } from './components/chatbot/Chatbot';
import { SplashCursor } from './components/effects/SplashCursor';
import { LandingPage } from './pages/LandingPage';
import { useStore } from './app/store';
import CourseCreation from './pages/admin/CourseCreation';
import TimetableManager from './pages/admin/TimetableManager';
import FacultyTimetable from './pages/faculty/FacultyTimetable';
import StudentTimetable from './pages/student/StudentTimetable';
import FeeManagement from './pages/student/FeeManagement';
import Electives from './pages/student/Electives';
import FeeVerification from './pages/admin/FeeVerification';
import UserManagement from './pages/admin/UserManagement';
import AdminCourseEnrollment from './pages/admin/AdminCourseEnrollment';
import GradeManager from './pages/faculty/GradeManager';
import QuizUpload from './pages/faculty/QuizUpload';
import GradeApprovals from './pages/admin/GradeApprovals';
import StudentGrades from './pages/student/StudentGrades';
import EnrollmentManagement from './pages/admin/EnrollmentManagement';
import StudentRegistration from './pages/student/StudentRegistration';
import ExamTimetableManager from './pages/admin/ExamTimetableManager';
import StudentExamTimetable from './pages/student/StudentExamTimetable';
import CourseAllocation from './pages/admin/CourseAllocation';
import AttendanceManager from './pages/faculty/AttendanceManager';
import StudentAttendance from './pages/student/StudentAttendance';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminDashboard from './pages/admin/AdminDashboard';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyLeave from './pages/faculty/FacultyLeave';
import StudentDashboard from './pages/student/StudentDashboard';

import TestPage from './pages/TestPage';

// Mock components for routes that might not exist yet
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-6 glass-effect rounded-2xl">
    <h1 className="text-3xl font-bold mb-4 text-white">{title}</h1>
    <p className="text-gray-300">This module is under development.</p>
  </div>
);

function App() {
  const { isAuthenticated, user } = useStore();

  console.log('App rendering - isAuthenticated:', isAuthenticated, 'user:', user);

  const getDefaultRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'faculty': return '/faculty/dashboard';
      case 'student': return '/student/dashboard';
      default: return '/login';
    }
  };

  console.log('Default route:', getDefaultRoute());

  return (
    <Router>
      <SplashCursor />
      <Chatbot />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={!isAuthenticated ? <Auth /> : <Navigate to={getDefaultRoute()} replace />}
        />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/test" element={<TestPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/courses" element={<CourseCreation />} />
              <Route path="/admin/enrollments" element={<AdminCourseEnrollment />} />
              <Route path="/admin/enrollment-management" element={<EnrollmentManagement />} />
              <Route path="/admin/course-allocation" element={<CourseAllocation />} />
              <Route path="/admin/faculty" element={<UserManagement />} />
              <Route path="/admin/timetable" element={<TimetableManager />} />
              <Route path="/admin/exam-timetable" element={<ExamTimetableManager />} />
              <Route path="/admin/fee-verification" element={<FeeVerification />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/reports" element={<GradeApprovals />} />
              <Route path="/admin/attendance" element={<AdminAttendance />} />
            </Route>

            {/* Faculty Routes */}
            <Route element={<ProtectedRoute allowedRoles={['faculty', 'admin']} />}>
              <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
              <Route path="/faculty/attendance" element={<AttendanceManager />} />
              <Route path="/faculty/grades" element={<GradeManager />} />
              <Route path="/faculty/quiz" element={<QuizUpload />} />
              <Route path="/faculty/timetable" element={<FacultyTimetable />} />
              <Route path="/faculty/leave" element={<FacultyLeave />} />
            </Route>


            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student', 'admin']} />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/registration" element={<StudentRegistration />} />
              <Route path="/student/enrollment" element={<StudentRegistration />} />
              <Route path="/student/electives" element={<Electives />} />
              <Route path="/student/grades" element={<StudentGrades />} />
              <Route path="/student/timetable" element={<StudentTimetable />} />
              <Route path="/student/exam-timetable" element={<StudentExamTimetable />} />
              <Route path="/student/fees" element={<FeeManagement />} />
              <Route path="/student/attendance" element={<StudentAttendance />} />
              <Route path="/student/feedback" element={<Placeholder title="Feedback" />} />
              <Route path="/student/leaderboard" element={<Placeholder title="Leaderboard" />} />
            </Route>
          </Route>
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<Navigate to={isAuthenticated ? getDefaultRoute() : "/login"} replace />} />
      </Routes>
    </Router >
  );
}

export default App;
