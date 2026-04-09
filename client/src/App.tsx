import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Auth } from './components/auth/Auth';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
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

// Mock components for routes that might not exist yet
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p className="text-gray-600">This module is under development.</p>
  </div>
);

function App() {
  const { isAuthenticated, user } = useStore();

  const getDefaultRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin/courses';
      case 'faculty': return '/faculty/grades';
      case 'student': return '/student/grades';
      default: return '/login';
    }
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={!isAuthenticated ? <Auth /> : <Navigate to="/dashboard" replace />}
        />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to={getDefaultRoute()} replace />} />
            <Route path="dashboard" element={<Navigate to={getDefaultRoute()} replace />} />

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="admin/courses" element={<CourseCreation />} />
              <Route path="admin/enrollments" element={<AdminCourseEnrollment />} />
              <Route path="admin/enrollments" element={<EnrollmentManagement />} />
              <Route path="admin/faculty" element={<UserManagement />} />
              <Route path="admin/timetable" element={<TimetableManager />} />
              <Route path="admin/fee-verification" element={<FeeVerification />} />
              <Route path="admin/users" element={<UserManagement />} />
              <Route path="admin/reports" element={<GradeApprovals />} />
            </Route>

            {/* Faculty Routes */}
            <Route element={<ProtectedRoute allowedRoles={['faculty', 'admin']} />}>
              <Route path="faculty/attendance" element={<Placeholder title="Mark Attendance" />} />
              <Route path="faculty/grades" element={<GradeManager />} />
              <Route path="faculty/quiz" element={<QuizUpload />} />
              <Route path="faculty/timetable" element={<FacultyTimetable />} />
            </Route>

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student', 'admin']} />}>
              <Route path="student/registration" element={<StudentRegistration />} />
              <Route path="student/enrollment" element={<StudentRegistration />} />
              <Route path="student/electives" element={<Electives />} />
              <Route path="student/grades" element={<StudentGrades />} />
              <Route path="student/timetable" element={<StudentTimetable />} />
              <Route path="student/fees" element={<FeeManagement />} />
              <Route path="student/attendance" element={<Placeholder title="Attendance" />} />
              <Route path="student/feedback" element={<Placeholder title="Feedback" />} />
              <Route path="student/leaderboard" element={<Placeholder title="Leaderboard" />} />
              <Route path="student/dashboard" element={<Placeholder title="Dashboard" />} />
            </Route>
          </Route>
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router >
  );
}

export default App;
