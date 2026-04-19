import React, { useEffect, useState } from 'react';
import { useStore } from '../../app/store';
import { BookOpen, Calendar, Award, DollarSign, Users, TrendingUp } from 'lucide-react';
import axios from 'axios';

export const StudentDashboard: React.FC = () => {
  const { user } = useStore();
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    attendance: 0,
    cgpa: 0,
    pendingFees: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch enrolled courses
      const enrollmentRes = await axios.get('http://localhost:5000/api/enrollments/student', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      
      setStats(prev => ({
        ...prev,
        enrolledCourses: enrollmentRes.data?.enrollments?.length || 0,
      }));

      // Mock data for other stats (replace with actual API calls)
      setStats(prev => ({
        ...prev,
        attendance: 85,
        cgpa: 8.5,
        pendingFees: 0,
      }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white">Welcome back, {user?.name}!</h1>
        <p className="text-gray-400 mt-2">Here's your academic overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<BookOpen className="w-8 h-8 text-blue-400" />}
          title="Enrolled Courses"
          value={stats.enrolledCourses.toString()}
          bgColor="from-blue-600/20 to-blue-900/20"
        />
        <StatCard
          icon={<Users className="w-8 h-8 text-green-400" />}
          title="Attendance"
          value={`${stats.attendance}%`}
          bgColor="from-green-600/20 to-green-900/20"
        />
        <StatCard
          icon={<Award className="w-8 h-8 text-purple-400" />}
          title="CGPA"
          value={stats.cgpa.toFixed(2)}
          bgColor="from-purple-600/20 to-purple-900/20"
        />
        <StatCard
          icon={<DollarSign className="w-8 h-8 text-orange-400" />}
          title="Pending Fees"
          value={stats.pendingFees === 0 ? 'Paid' : `₹${stats.pendingFees}`}
          bgColor="from-orange-600/20 to-orange-900/20"
        />
      </div>

      {/* Quick Actions */}
      <div className="glass-effect rounded-2xl p-6 card-hover">
        <h2 className="text-2xl font-semibold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton
            icon={<Calendar className="w-5 h-5" />}
            label="View Timetable"
            href="/student/timetable"
          />
          <QuickActionButton
            icon={<BookOpen className="w-5 h-5" />}
            label="Enroll Courses"
            href="/student/registration"
          />
          <QuickActionButton
            icon={<Award className="w-5 h-5" />}
            label="Check Grades"
            href="/student/grades"
          />
          <QuickActionButton
            icon={<DollarSign className="w-5 h-5" />}
            label="Pay Fees"
            href="/student/fees"
          />
        </div>
      </div>

      {/* Performance Chart */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-effect rounded-2xl p-6 card-hover">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-blue-400" />
            Academic Progress
          </h2>
          <div className="space-y-4">
            <ProgressBar label="Semester 1" percentage={90} color="from-blue-500 to-blue-600" />
            <ProgressBar label="Semester 2" percentage={85} color="from-green-500 to-green-600" />
            <ProgressBar label="Semester 3" percentage={88} color="from-purple-500 to-purple-600" />
            <ProgressBar label="Current Semester" percentage={75} color="from-orange-500 to-orange-600" />
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-hover">
          <h2 className="text-2xl font-semibold text-white mb-6">Upcoming Events</h2>
          <div className="space-y-3">
            <EventItem
              title="Mid-term Exams"
              date="Next Week"
              type="exam"
            />
            <EventItem
              title="Assignment Submission"
              date="3 days left"
              type="assignment"
            />
            <EventItem
              title="Course Registration"
              date="Opens in 2 weeks"
              type="registration"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  bgColor: string;
}> = ({ icon, title, value, bgColor }) => (
  <div className={`glass-effect bg-gradient-to-br ${bgColor} rounded-2xl p-6 card-hover`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400 mb-2">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      <div className="opacity-80">{icon}</div>
    </div>
  </div>
);

const QuickActionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  href: string;
}> = ({ icon, label, href }) => (
  <a
    href={href}
    className="flex flex-col items-center justify-center p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-all card-hover group"
  >
    <div className="text-blue-400 mb-2 group-hover:scale-110 transition-transform">{icon}</div>
    <span className="text-sm text-gray-300 text-center">{label}</span>
  </a>
);

const ProgressBar: React.FC<{
  label: string;
  percentage: number;
  color: string;
}> = ({ label, percentage, color }) => (
  <div>
    <div className="flex justify-between text-sm mb-2">
      <span className="text-gray-300">{label}</span>
      <span className="text-white font-semibold">{percentage}%</span>
    </div>
    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
      <div
        className={`bg-gradient-to-r ${color} h-3 rounded-full transition-all duration-500 shadow-lg`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

const EventItem: React.FC<{
  title: string;
  date: string;
  type: string;
}> = ({ title, date, type }) => (
  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-all">
    <div>
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{date}</p>
    </div>
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
      type === 'exam' ? 'bg-red-500/20 text-red-400' :
      type === 'assignment' ? 'bg-yellow-500/20 text-yellow-400' :
      'bg-blue-500/20 text-blue-400'
    }`}>
      {type}
    </span>
  </div>
);

export default StudentDashboard;
