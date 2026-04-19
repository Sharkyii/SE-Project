import React, { useEffect, useState } from 'react';
import { useStore } from '../../app/store';
import { BookOpen, Users, Calendar, CheckSquare, TrendingUp } from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const { user } = useStore();
  const [stats, setStats] = useState({
    coursesTeaching: 0,
    totalStudents: 0,
    pendingGrades: 0,
    upcomingClasses: 0,
  });

  useEffect(() => {
    // Mock data - replace with actual API calls
    setStats({
      coursesTeaching: 3,
      totalStudents: 120,
      pendingGrades: 15,
      upcomingClasses: 5,
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white">Welcome, Prof. {user?.name}!</h1>
        <p className="text-gray-400 mt-2">Your teaching dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<BookOpen className="w-8 h-8 text-blue-400" />}
          title="Courses Teaching"
          value={stats.coursesTeaching.toString()}
          bgColor="from-blue-600/20 to-blue-900/20"
        />
        <StatCard
          icon={<Users className="w-8 h-8 text-green-400" />}
          title="Total Students"
          value={stats.totalStudents.toString()}
          bgColor="from-green-600/20 to-green-900/20"
        />
        <StatCard
          icon={<CheckSquare className="w-8 h-8 text-orange-400" />}
          title="Pending Grades"
          value={stats.pendingGrades.toString()}
          bgColor="from-orange-600/20 to-orange-900/20"
        />
        <StatCard
          icon={<Calendar className="w-8 h-8 text-purple-400" />}
          title="Upcoming Classes"
          value={stats.upcomingClasses.toString()}
          bgColor="from-purple-600/20 to-purple-900/20"
        />
      </div>

      {/* Quick Actions */}
      <div className="glass-effect rounded-2xl p-6 card-hover">
        <h2 className="text-2xl font-semibold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton
            icon={<CheckSquare className="w-5 h-5" />}
            label="Mark Attendance"
            href="/faculty/attendance"
          />
          <QuickActionButton
            icon={<TrendingUp className="w-5 h-5" />}
            label="Enter Grades"
            href="/faculty/grades"
          />
          <QuickActionButton
            icon={<Calendar className="w-5 h-5" />}
            label="View Timetable"
            href="/faculty/timetable"
          />
          <QuickActionButton
            icon={<BookOpen className="w-5 h-5" />}
            label="Upload Quiz"
            href="/faculty/quiz"
          />
        </div>
      </div>

      {/* Today's Schedule & Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-effect rounded-2xl p-6 card-hover">
          <h2 className="text-2xl font-semibold text-white mb-6">Today's Schedule</h2>
          <div className="space-y-3">
            <ScheduleItem
              time="09:00 AM"
              course="Data Structures"
              room="Room 301"
            />
            <ScheduleItem
              time="11:00 AM"
              course="Algorithms"
              room="Room 205"
            />
            <ScheduleItem
              time="02:00 PM"
              course="Database Systems"
              room="Lab 1"
            />
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-hover">
          <h2 className="text-2xl font-semibold text-white mb-6">Pending Tasks</h2>
          <div className="space-y-3">
            <TaskItem
              title="Grade Assignment 3"
              course="Data Structures"
              priority="high"
            />
            <TaskItem
              title="Prepare Quiz Questions"
              course="Algorithms"
              priority="medium"
            />
            <TaskItem
              title="Review Project Proposals"
              course="Database Systems"
              priority="low"
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

const ScheduleItem: React.FC<{
  time: string;
  course: string;
  room: string;
}> = ({ time, course, room }) => (
  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-all">
    <div>
      <p className="text-sm font-medium text-white">{course}</p>
      <p className="text-xs text-gray-400 mt-1">{room}</p>
    </div>
    <span className="text-sm font-semibold text-blue-400">{time}</span>
  </div>
);

const TaskItem: React.FC<{
  title: string;
  course: string;
  priority: 'high' | 'medium' | 'low';
}> = ({ title, course, priority }) => (
  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-all">
    <div>
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{course}</p>
    </div>
    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
      priority === 'high' ? 'bg-red-500/20 text-red-400' :
      priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
      'bg-green-500/20 text-green-400'
    }`}>
      {priority}
    </span>
  </div>
);

export default FacultyDashboard;
