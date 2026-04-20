import React, { useEffect, useState } from 'react';
import { Trophy, Medal, TrendingUp, Users, BookOpen, Award } from 'lucide-react';
import api from '../../services/api';

interface LeaderboardEntry {
  rank: number;
  student_id: string;
  name: string;
  department: string;
  semester: number;
  section: string;
  averageScore: number | null;
  attendancePercentage: number | null;
  compositeScore: number;
  totalGrades: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  myRank: LeaderboardEntry | null;
  department: string;
  semester: number;
}

const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'Mechanical', 'Civil'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const rankStyle = (rank: number) => {
  if (rank === 1) return { bg: 'bg-yellow-500/20 border-yellow-500/40', text: 'text-yellow-400', icon: '🥇' };
  if (rank === 2) return { bg: 'bg-gray-400/20 border-gray-400/40', text: 'text-gray-300', icon: '🥈' };
  if (rank === 3) return { bg: 'bg-orange-600/20 border-orange-600/40', text: 'text-orange-400', icon: '🥉' };
  return { bg: 'bg-gray-900/40 border-gray-800', text: 'text-gray-400', icon: `#${rank}` };
};

const Leaderboard: React.FC = () => {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');

  const fetchLeaderboard = async (dept?: string, sem?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dept) params.append('department', dept);
      if (sem) params.append('semester', sem);
      const res = await api.get(`/student/leaderboard?${params.toString()}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaderboard(); }, []);

  const handleFilter = () => fetchLeaderboard(department, semester);

  const top3 = data?.leaderboard.slice(0, 3) || [];
  const rest = data?.leaderboard.slice(3) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-yellow-600/30 to-orange-600/30 rounded-2xl border border-yellow-500/20">
          <Trophy className="w-8 h-8 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            {data ? `${data.department} · Semester ${data.semester}` : 'Loading...'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-effect rounded-2xl border border-gray-800 p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Department</label>
          <select
            value={department}
            onChange={e => setDepartment(e.target.value)}
            className="px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="">My Department</option>
            {DEPARTMENTS.map(d => <option key={d} className="bg-gray-900">{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Semester</label>
          <select
            value={semester}
            onChange={e => setSemester(e.target.value)}
            className="px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="">My Semester</option>
            {SEMESTERS.map(s => <option key={s} value={s} className="bg-gray-900">Semester {s}</option>)}
          </select>
        </div>
        <button
          onClick={handleFilter}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all"
        >
          Apply
        </button>
      </div>

      {loading ? (
        <div className="glass-effect rounded-2xl border border-gray-800 p-16 text-center">
          <div className="w-10 h-10 border-4 border-t-yellow-500 border-gray-700 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading rankings...</p>
        </div>
      ) : !data || data.leaderboard.length === 0 ? (
        <div className="glass-effect rounded-2xl border border-gray-800 p-16 text-center">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No data available yet. Rankings appear once grades are published.</p>
        </div>
      ) : (
        <>
          {/* My Rank Banner */}
          {data.myRank && (
            <div className="glass-effect rounded-2xl border border-blue-500/30 bg-blue-500/5 p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-black text-blue-400">#{data.myRank.rank}</div>
                <div>
                  <p className="text-white font-semibold">Your Rank</p>
                  <p className="text-gray-400 text-sm">out of {data.leaderboard.length} students</p>
                </div>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-xl font-bold text-white">{data.myRank.averageScore ?? 'N/A'}</p>
                  <p className="text-xs text-gray-500">Avg Score</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{data.myRank.attendancePercentage ?? 'N/A'}%</p>
                  <p className="text-xs text-gray-500">Attendance</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-blue-400">{data.myRank.compositeScore}</p>
                  <p className="text-xs text-gray-500">Overall</p>
                </div>
              </div>
            </div>
          )}

          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {/* Reorder: 2nd, 1st, 3rd */}
              {[top3[1], top3[0], top3[2]].map((entry, i) => {
                if (!entry) return <div key={i} />;
                const actualRank = i === 1 ? 1 : i === 0 ? 2 : 3;
                const style = rankStyle(actualRank);
                return (
                  <div key={entry.student_id} className={`glass-effect rounded-2xl border p-5 text-center ${style.bg} ${actualRank === 1 ? 'scale-105' : ''}`}>
                    <div className="text-4xl mb-2">{style.icon}</div>
                    <p className="text-white font-bold truncate">{entry.name}</p>
                    <p className="text-gray-400 text-xs mt-1">{entry.section ? `Section ${entry.section}` : entry.department}</p>
                    <div className={`text-2xl font-black mt-3 ${style.text}`}>{entry.compositeScore}</div>
                    <p className="text-xs text-gray-500 mt-1">Overall Score</p>
                    <div className="flex justify-center gap-3 mt-3 text-xs text-gray-400">
                      <span>📚 {entry.averageScore ?? 'N/A'}</span>
                      <span>📅 {entry.attendancePercentage ?? 'N/A'}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rest of rankings */}
          {rest.length > 0 && (
            <div className="glass-effect rounded-2xl border border-gray-800 overflow-hidden">
              <div className="grid grid-cols-12 px-6 py-3 bg-gray-900/60 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Student</div>
                <div className="col-span-2 text-center">Avg Score</div>
                <div className="col-span-2 text-center">Attendance</div>
                <div className="col-span-2 text-center">Overall</div>
                <div className="col-span-1 text-center">Grades</div>
              </div>
              <div className="divide-y divide-gray-800">
                {rest.map(entry => {
                  const isMe = entry.student_id === data.myRank?.student_id;
                  return (
                    <div key={entry.student_id} className={`grid grid-cols-12 px-6 py-4 items-center transition-colors ${isMe ? 'bg-blue-500/10 border-l-2 border-l-blue-500' : 'hover:bg-gray-800/30'}`}>
                      <div className="col-span-1 text-gray-400 font-bold">#{entry.rank}</div>
                      <div className="col-span-4">
                        <p className={`font-medium ${isMe ? 'text-blue-400' : 'text-white'}`}>{entry.name} {isMe && <span className="text-xs">(you)</span>}</p>
                        <p className="text-xs text-gray-500">{entry.section ? `Section ${entry.section}` : ''}</p>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-white font-semibold">{entry.averageScore ?? '—'}</span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className={`font-semibold ${entry.attendancePercentage !== null && entry.attendancePercentage < 75 ? 'text-red-400' : 'text-green-400'}`}>
                          {entry.attendancePercentage !== null ? `${entry.attendancePercentage}%` : '—'}
                        </span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-blue-400 font-bold">{entry.compositeScore}</span>
                      </div>
                      <div className="col-span-1 text-center text-gray-500 text-sm">{entry.totalGrades}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Score formula note */}
          <p className="text-xs text-gray-600 text-center pb-4">
            Overall Score = 70% Academic Score + 30% Attendance · Rankings are based on published grades only
          </p>
        </>
      )}
    </div>
  );
};

export default Leaderboard;
