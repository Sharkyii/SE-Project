import React, { useEffect, useState } from 'react';
import { useStore } from '../../app/store';
import { Users, BookOpen, GraduationCap, TrendingUp, DollarSign, CheckSquare } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useStore();
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    pendingApprovals: 0,
    feeCollection: 0,
    activeEnrollments: 0,
  });

  useEffect(() => {
    // Mock data - replace with actual API calls
    setStats({
      totalStudents: 450,
      totalFaculty: 35,
      totalCourses: 120,
      pendingApprovals: 12,
      feeCollection: 85,
      activeEnrollments: 1200,
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 mt-2">System overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={<Users className="w-8 h-8 text-blue-400" />}
          title="Total Students"
          value={stats.totalStudents.toString()}
          bgColor="from-blue-600/20 to-blue-900/20"
          trend="+5%"
        />
        <StatCard
          icon={<GraduationCap className="w-8 h-8 text-green-400" />}
          title="Total Faculty"
          value={stats.totalFaculty.toString()}
          bgColor="from-green-600/20 to-green-900/20"
          trend="+2%"
        />
        <StatCard
          icon={<BookOpen className="w-8 h-8 text-purple-400" />}
          title="Total Courses"
          value={stats.totalCourses.toString()}
          bgColor="from-purple-600/20 to-purple-900/20"
          trend="+8%"
        />
        <StatCard
          icon={<CheckSquare className="w-8 h-8 text-orange-400" />}
          title="Pending Approvals"
          value={stats.pendingApprovals.toString()}
          bgColor="from-orange-600/20 to-orange-900/20"
        />
        <StatCard
          icon={<DollarSign className="w-8 h-8 text-red-400" />}
          title="Fee Collection"
          value={`${stats.feeCollection}%`}
          bgColor="from-red-600/20 to-red-900/20"
        />
        <StatCard
          icon={<TrendingUp className="w-8 h-8 text-indigo-400" />}
          title="Active Enrollments"
          value={stats.activeEnrollments.toString()}
          bgColor="from-indigo-600/20 to-indigo-900/20"
        />
      </div>

      {/* Quick Actions */}
      <div className="glass-effect rounded-2xl p-6 card-hover">
        <h2 className="text-2xl font-semibold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton
            icon={<Users className="w-5 h-5" />}
            label="Manage Users"
            href="/admin/users"
          />
          <QuickActionButton
            icon={<BookOpen className="w-5 h-5" />}
            label="Create Course"
            href="/admin/courses"
          />
          <QuickActionButton
            icon={<CheckSquare className="w-5 h-5" />}
            label="Verify Fees"
            href="/admin/fee-verification"
          />
          <QuickActionButton
            icon={<GraduationCap className="w-5 h-5" />}
            label="Enrollments"
            href="/admin/enrollment-management"
          />
        </div>
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-effect rounded-2xl p-6 card-hover">
          <h2 className="text-2xl font-semibold text-white mb-6">Recent Activities</h2>
          <div className="space-y-3">
            <ActivityItem
              action="New student registered"
              user="John Doe"
              time="5 minutes ago"
            />
            <ActivityItem
              action="Course created"
              user="Admin"
              time="1 hour ago"
            />
            <ActivityItem
              action="Fee verified"
              user="Jane Smith"
              time="2 hours ago"
            />
            <ActivityItem
              action="Grade approved"
              user="Prof. Kumar"
              time="3 hours ago"
            />
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-hover">
          <h2 className="text-2xl font-semibold text-white mb-6">System Status</h2>
          <div className="space-y-4">
            <StatusBar label="Database" percentage={95} status="healthy" />
            <StatusBar label="API Services" percentage={98} status="healthy" />
            <StatusBar label="Storage" percentage={65} status="warning" />
            <StatusBar label="User Sessions" percentage={80} status="healthy" />
          </div>
        </div>
      </div>

      {/* Department Overview */}
      <div className="glass-effect rounded-2xl p-6 card-hover">
        <h2 className="text-2xl font-semibold text-white mb-6">Department Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DepartmentCard
            name="Computer Science"
            students={180}
            faculty={12}
            courses={45}
          />
          <DepartmentCard
            name="Electronics & Communication"
            students={150}
            faculty={10}
            courses={40}
          />
          <DepartmentCard
            name="Information Technology"
            students={120}
            faculty={13}
            courses={35}
          />
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
  trend?: string;
}> = ({ icon, title, value, bgColor, trend }) => (
  <div className={`glass-effect bg-gradient-to-br ${bgColor} rounded-2xl p-6 card-hover`}>
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-sm text-gray-400 mb-2">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      <div className="opacity-80">{icon}</div>
    </div>
    {trend && (
      <p className="text-xs text-green-400 font-medium">{trend} from last month</p>
    )}
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

const ActivityItem: React.FC<{
  action: string;
  user: string;
  time: string;
}> = ({ action, user, time }) => (
  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-all">
    <div>
      <p className="text-sm font-medium text-white">{action}</p>
      <p className="text-xs text-gray-400 mt-1">{user}</p>
    </div>
    <span className="text-xs text-gray-500">{time}</span>
  </div>
);

const StatusBar: React.FC<{
  label: string;
  percentage: number;
  status: 'healthy' | 'warning' | 'error';
}> = ({ label, percentage, status }) => {
  const color = status === 'healthy' ? 'from-green-500 to-green-600' : status === 'warning' ? 'from-yellow-500 to-yellow-600' : 'from-red-500 to-red-600';
  
  return (
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
};

const DepartmentCard: React.FC<{
  name: string;
  students: number;
  faculty: number;
  courses: number;
}> = ({ name, students, faculty, courses }) => (
  <div className="bg-gray-800/30 p-6 rounded-xl hover:bg-gray-800/50 transition-all">
    <h3 className="font-semibold text-white mb-4 text-lg">{name}</h3>
    <div className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-400">Students:</span>
        <span className="font-medium text-white">{students}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Faculty:</span>
        <span className="font-medium text-white">{faculty}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Courses:</span>
        <span className="font-medium text-white">{courses}</span>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
