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
import FeeVerification from './pages/admin/FeeVerification';

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
      case 'faculty': return '/faculty/attendance';
      case 'student': return '/student/enrollment';
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
              <Route path="admin/faculty" element={<Placeholder title="Faculty Assignment" />} />
              <Route path="admin/timetable" element={<TimetableManager />} />
              <Route path="admin/fee-verification" element={<FeeVerification />} />
            </Route>

            {/* Faculty Routes */}
            <Route element={<ProtectedRoute allowedRoles={['faculty', 'admin']} />}>
              <Route path="faculty/attendance" element={<Placeholder title="Mark Attendance" />} />
              <Route path="faculty/grades" element={<Placeholder title="Upload Grades" />} />
              <Route path="faculty/timetable" element={<FacultyTimetable />} />
            </Route>

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student', 'admin']} />}>
              <Route path="student/enrollment" element={<Placeholder title="Course Enrollment" />} />
              <Route path="student/grades" element={<Placeholder title="My Grades" />} />
              <Route path="student/timetable" element={<StudentTimetable />} />
              <Route path="student/fees" element={<FeeManagement />} />
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
