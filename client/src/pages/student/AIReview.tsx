import React, { useState } from 'react';
import { Brain, TrendingUp, BookOpen, Users, Award, RefreshCw, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import api from '../../services/api';

interface AcademicData {
  grades: { course: string; scores: { type: string; score: number }[]; average: number | null }[];
  attendance: { course: string; percentage: number; present: number; total: number }[];
  overallAverage: number | null;
  overallAttendance: number | null;
  enrolledCourses: number;
  placements: number;
}

interface ReviewData {
  student: { name: string; department: string; semester: number };
  academicData: AcademicData;
  review: string;
  generatedAt: string;
}

const parseReview = (text: string) => {
  const sections: { title: string; content: string }[] = [];
  const sectionRegex = /\d+\.\s+([A-Z\s]+)\n([\s\S]*?)(?=\d+\.\s+[A-Z\s]+\n|$)/g;
  let match;
  while ((match = sectionRegex.exec(text)) !== null) {
    sections.push({ title: match[1].trim(), content: match[2].trim() });
  }
  return sections.length > 0 ? sections : [{ title: 'AI REVIEW', content: text }];
};

const sectionIcon: Record<string, React.ReactNode> = {
  'OVERALL PERFORMANCE SUMMARY': <TrendingUp className="w-5 h-5 text-blue-400" />,
  'STRENGTHS': <CheckCircle className="w-5 h-5 text-green-400" />,
  'AREAS FOR IMPROVEMENT': <Target className="w-5 h-5 text-yellow-400" />,
  'ATTENDANCE ANALYSIS': <Users className="w-5 h-5 text-purple-400" />,
  'ACADEMIC RISK ASSESSMENT': <AlertTriangle className="w-5 h-5 text-red-400" />,
  'PERSONALIZED RECOMMENDATIONS': <BookOpen className="w-5 h-5 text-cyan-400" />,
  'MOTIVATIONAL MESSAGE': <Award className="w-5 h-5 text-pink-400" />,
};

const sectionColor: Record<string, string> = {
  'OVERALL PERFORMANCE SUMMARY': 'border-blue-500/30 bg-blue-500/5',
  'STRENGTHS': 'border-green-500/30 bg-green-500/5',
  'AREAS FOR IMPROVEMENT': 'border-yellow-500/30 bg-yellow-500/5',
  'ATTENDANCE ANALYSIS': 'border-purple-500/30 bg-purple-500/5',
  'ACADEMIC RISK ASSESSMENT': 'border-red-500/30 bg-red-500/5',
  'PERSONALIZED RECOMMENDATIONS': 'border-cyan-500/30 bg-cyan-500/5',
  'MOTIVATIONAL MESSAGE': 'border-pink-500/30 bg-pink-500/5',
};

const AIReview: React.FC = () => {
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/student/ai-review');
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to generate review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sections = data ? parseReview(data.review) : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-2xl border border-purple-500/20">
            <Brain className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">AI Academic Review</h1>
            <p className="text-gray-400 text-sm mt-1">Personalized analysis powered by Groq AI</p>
          </div>
        </div>
        {data && (
          <p className="text-xs text-gray-500">
            Generated: {new Date(data.generatedAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* Generate Button */}
      {!data && !loading && (
        <div className="glass-effect rounded-2xl border border-gray-800 p-12 text-center">
          <Brain className="w-16 h-16 text-purple-400 mx-auto mb-6 opacity-60" />
          <h2 className="text-xl font-semibold text-white mb-3">Get Your AI Academic Review</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm">
            Our AI will analyze your grades, attendance, and academic progress to provide personalized insights and recommendations.
          </p>
          <button
            onClick={fetchReview}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold flex items-center gap-2 mx-auto transition-all shadow-lg shadow-purple-600/20 active:scale-95"
          >
            <Brain className="w-5 h-5" />
            Generate My Review
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass-effect rounded-2xl border border-gray-800 p-12 text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin"></div>
            <Brain className="w-7 h-7 text-purple-400 absolute inset-0 m-auto" />
          </div>
          <p className="text-white font-semibold text-lg">Analyzing your academic data...</p>
          <p className="text-gray-400 text-sm mt-2">This may take a few seconds</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-effect rounded-2xl border border-red-500/30 bg-red-500/5 p-6 flex items-center gap-4">
          <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-400 font-medium">{error}</p>
            <button onClick={fetchReview} className="text-sm text-gray-400 hover:text-white mt-1 underline">Try again</button>
          </div>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Overall Score" value={data.academicData.overallAverage !== null ? `${data.academicData.overallAverage}%` : 'N/A'} color="text-blue-400" icon={<Award className="w-5 h-5" />} />
            <StatCard label="Attendance" value={data.academicData.overallAttendance !== null ? `${data.academicData.overallAttendance}%` : 'N/A'} color={data.academicData.overallAttendance !== null && data.academicData.overallAttendance < 75 ? 'text-red-400' : 'text-green-400'} icon={<Users className="w-5 h-5" />} />
            <StatCard label="Courses" value={`${data.academicData.enrolledCourses}`} color="text-purple-400" icon={<BookOpen className="w-5 h-5" />} />
            <StatCard label="Placements" value={`${data.academicData.placements} rounds`} color="text-yellow-400" icon={<TrendingUp className="w-5 h-5" />} />
          </div>

          {/* Course Breakdown */}
          {(data.academicData.grades.length > 0 || data.academicData.attendance.length > 0) && (
            <div className="grid md:grid-cols-2 gap-6">
              {data.academicData.grades.length > 0 && (
                <div className="glass-effect rounded-2xl border border-gray-800 p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-400" /> Grades Breakdown
                  </h3>
                  <div className="space-y-3">
                    {data.academicData.grades.map((g, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300 truncate max-w-[60%]">{g.course}</span>
                          <span className="text-white font-semibold">{g.average ?? 'N/A'}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${(g.average || 0) >= 75 ? 'bg-gradient-to-r from-green-500 to-green-400' : (g.average || 0) >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 'bg-gradient-to-r from-red-500 to-red-400'}`}
                            style={{ width: `${g.average ?? 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.academicData.attendance.length > 0 && (
                <div className="glass-effect rounded-2xl border border-gray-800 p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" /> Attendance Breakdown
                  </h3>
                  <div className="space-y-3">
                    {data.academicData.attendance.map((a, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300 truncate max-w-[60%]">{a.course}</span>
                          <span className={`font-semibold ${a.percentage < 75 ? 'text-red-400' : 'text-green-400'}`}>{a.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${a.percentage >= 75 ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-red-500 to-red-400'}`}
                            style={{ width: `${a.percentage}%` }}
                          />
                        </div>
                        {a.percentage < 75 && (
                          <p className="text-xs text-red-400 mt-1">⚠ Below 75% minimum requirement</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Review Sections */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" /> AI Analysis
            </h2>
            {sections.map((section, i) => (
              <div key={i} className={`glass-effect rounded-2xl border p-6 ${sectionColor[section.title] || 'border-gray-800'}`}>
                <div className="flex items-center gap-2 mb-3">
                  {sectionIcon[section.title] || <Brain className="w-5 h-5 text-gray-400" />}
                  <h3 className="font-semibold text-white text-sm uppercase tracking-wide">{section.title}</h3>
                </div>
                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{section.content}</div>
              </div>
            ))}
          </div>

          {/* Regenerate */}
          <div className="flex justify-center pb-4">
            <button
              onClick={fetchReview}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition-all border border-gray-700"
            >
              <RefreshCw className="w-4 h-4" /> Regenerate Review
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className="glass-effect rounded-xl border border-gray-800 p-4">
    <div className={`flex items-center gap-2 mb-2 ${color}`}>{icon}<span className="text-xs font-medium uppercase tracking-wide">{label}</span></div>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

export default AIReview;
