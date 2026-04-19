import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen, Users, Calendar, Award, ArrowRight, Sparkles } from 'lucide-react';
import { AuroraBackground } from '../components/effects/AuroraBackground';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AuroraBackground className="min-h-screen">
      {/* Header */}
      <header className="glass-effect border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <GraduationCap className="w-8 h-8 text-blue-400 animate-glow" />
              <Sparkles className="w-4 h-4 text-purple-400 absolute -top-1 -right-1" />
            </div>
            <span className="text-2xl font-bold text-white">ABV-IIITM Gwalior</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
          >
            Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center animate-float">
          <h1 className="text-6xl font-bold text-white mb-6">
            Welcome to ABV-IIITM Gwalior
            <span className="block text-gradient mt-3 text-7xl">Academic ERP System</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            A comprehensive platform for managing courses, enrollments, grades, and academic activities.
            Empowering students, faculty, and administrators with seamless digital solutions.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 text-white px-10 py-4 rounded-xl hover:scale-105 transition-all flex items-center space-x-2 text-lg font-semibold shadow-2xl shadow-blue-500/30 hover:shadow-purple-500/50"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center text-white mb-12">Key Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<BookOpen className="w-8 h-8 text-blue-400" />}
            title="Course Management"
            description="Browse courses, enroll in electives, and manage your academic journey with ease."
          />
          <FeatureCard
            icon={<Calendar className="w-8 h-8 text-purple-400" />}
            title="Timetable & Scheduling"
            description="Access your personalized timetable and exam schedules anytime, anywhere."
          />
          <FeatureCard
            icon={<Award className="w-8 h-8 text-emerald-400" />}
            title="Grades & Performance"
            description="Track your academic performance and view detailed grade reports."
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-pink-400" />}
            title="Attendance Tracking"
            description="Monitor attendance records and stay updated on your presence."
          />
          <FeatureCard
            icon={<GraduationCap className="w-8 h-8 text-yellow-400" />}
            title="Fee Management"
            description="Manage fee payments, view receipts, and track payment status."
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8 text-cyan-400" />}
            title="AI Assistant"
            description="Get instant help with our AI-powered chatbot for all your queries."
          />
        </div>
      </section>

      {/* About IIIT Gwalior */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">About ABV-IIITM Gwalior</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Atal Bihari Vajpayee Indian Institute of Information Technology and Management, Gwalior 
                is an Institute of National Importance established in 1997. We focus on Information Technology, 
                Management and allied areas, offering world-class education and research opportunities.
              </p>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Our programs include B.Tech, M.Tech, MBA, and PhD in Computer Science, Electronics & Communication,
                Information Technology, and Management. With state-of-the-art infrastructure and experienced faculty,
                we nurture innovation and excellence.
              </p>
            </div>
            <div className="glass-effect p-8 rounded-2xl card-hover">
              <h3 className="text-2xl font-bold text-white mb-6">Quick Stats</h3>
              <div className="space-y-4">
                <StatItem label="Programs Offered" value="B.Tech, M.Tech, PhD" />
                <StatItem label="Specializations" value="CSE, ECE, IT" />
                <StatItem label="Campus" value="Modern Infrastructure" />
                <StatItem label="Location" value="Gwalior, MP" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-effect border-t border-gray-800/50 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2026 ABV-IIITM Gwalior. All rights reserved.</p>
        </div>
      </footer>
    </AuroraBackground>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => (
  <div className="glass-effect p-6 rounded-xl card-hover group">
    <div className="mb-4 transform group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
    <p className="text-gray-300 leading-relaxed">{description}</p>
  </div>
);

const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
    <span className="text-gray-300 font-medium">{label}:</span>
    <span className="text-gradient font-bold">{value}</span>
  </div>
);
