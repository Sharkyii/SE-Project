import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../app/store';
import { Mail, Lock, User, GraduationCap, Building2, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const loginStore = useStore((state) => state.login);

    const validateEmail = (email: string) => {
        return email.endsWith('@iiitm.ac.in');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateEmail(email)) {
            setError('Only @iiitm.ac.in emails are allowed.');
            return;
        }

        setLoading(true);
        try {
            // Simulate API Call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Mock successful response
            const mockUser = {
                id: 1,
                email,
                name: name || email.split('@')[0],
                role: role, // Use selected role for mock
            };

            loginStore(mockUser as any, 'mock-jwt-token');
            navigate('/dashboard');
        } catch (err) {
            setError('Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 overflow-hidden relative">
            {/* Animated Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700" />

            <div className="w-full max-w-[440px] z-10">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-8 transition-all duration-500">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg shadow-blue-500/20">
                            <GraduationCap className="text-white w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                            Academic <span className="text-blue-400">ERP</span>
                        </h1>
                        <p className="text-slate-400 text-sm">
                            {isLogin ? 'Welcome back to IIITM portal' : 'Create your academic profile'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all font-medium"
                                />
                            </div>
                        )}

                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
                            <input
                                type="email"
                                placeholder="Email Address (@iiitm.ac.in)"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all font-medium"
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setRole('student')}
                                className={cn(
                                    "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all",
                                    role === 'student'
                                        ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
                                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                                )}
                            >
                                <User className="w-5 h-5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Student</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('faculty')}
                                className={cn(
                                    "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all",
                                    role === 'faculty'
                                        ? "bg-purple-600/20 border-purple-500/50 text-purple-400"
                                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                                )}
                            >
                                <Building2 className="w-5 h-5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Faculty</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('admin')}
                                className={cn(
                                    "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all",
                                    role === 'admin'
                                        ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-400"
                                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                                )}
                            >
                                <ShieldCheck className="w-5 h-5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Admin</span>
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm py-2 px-4 rounded-lg text-center font-medium animate-shake">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/10 text-center text-slate-400 text-sm">
                        {isLogin ? (
                            <p>
                                Don't have an account?{' '}
                                <button
                                    onClick={() => setIsLogin(false)}
                                    className="text-blue-400 font-bold hover:underline underline-offset-4"
                                >
                                    Sign Up
                                </button>
                            </p>
                        ) : (
                            <p>
                                Already have an account?{' '}
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className="text-blue-400 font-bold hover:underline underline-offset-4"
                                >
                                    Sign In
                                </button>
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer Link */}
                <p className="mt-8 text-center text-slate-500 text-xs font-medium">
                    &copy; 2026 ABV-IIITM Gwalior. All rights reserved.
                </p>
            </div>
        </div>
    );
};
