
import React, { useState } from 'react';
import { Role, User } from '../types';
import { apiService } from '../services/apiService';
import { motion } from 'motion/react';
import { GraduationCap, Backpack, AlertTriangle, ArrowRight, Bot, Smartphone, MessageSquare, BarChart3 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<Role>('teacher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiService.login(email, selectedRole);
      const userId = data.user.userId || data.user.id;
      const userRole = data.user.role || selectedRole;
      
      onLogin({
        id: userId,
        name: data.user.name,
        email: email,
        role: userRole,
        avatar: data.user.avatar || `https://picsum.photos/seed/${userId}/100/100`,
        studentData: userRole === 'student' ? data.user : undefined
      });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-['Inter'] overflow-x-hidden">
      {/* Brand Section - Secondary on mobile, Primary on desktop */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 p-8 lg:p-16 flex-col justify-between relative overflow-hidden shrink-0">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -right-24 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 left-1/4 w-80 h-80 bg-indigo-700/30 rounded-full blur-3xl animate-bounce duration-[10s]"></div>
        </div>

        <div className="relative z-10">
          <div className="hidden lg:flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl border border-white/30 shadow-inner">
              🎓
            </div>
            <span className="text-2xl font-black text-white tracking-tighter uppercase">EduTrack</span>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl"
          >
            <h2 className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-4">Platform Features</h2>
            <h1 className="text-3xl lg:text-7xl font-black text-white leading-[0.9] tracking-tighter mb-8">
              SMART <br className="hidden lg:block" />
              <span className="text-indigo-200">EDUCATION</span> <br className="hidden lg:block" />
              TOOLS.
            </h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              {[
                { icon: <Bot className="w-6 h-6 text-indigo-200" />, title: 'AI Lesson Planner', desc: 'Generate objectives in seconds' },
                { icon: <Smartphone className="w-6 h-6 text-indigo-200" />, title: 'QR Attendance', desc: 'Secure touchless check-in' },
                { icon: <MessageSquare className="w-6 h-6 text-indigo-200" />, title: 'Real-time Chat', desc: 'Instant teacher-student sync' },
                { icon: <BarChart3 className="w-6 h-6 text-indigo-200" />, title: 'Smart Analytics', desc: 'Track academic progress' },
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="bg-white/10 backdrop-blur-sm border border-white/10 p-4 rounded-2xl flex items-start gap-4"
                >
                  <div className="mt-1">{feature.icon}</div>
                  <div>
                    <h3 className="text-white font-bold text-xs lg:text-sm uppercase tracking-wider">{feature.title}</h3>
                    <p className="text-indigo-200 text-[10px] lg:text-xs leading-tight mt-1">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 mt-12 pt-8 border-t border-white/10 flex justify-between items-center">
          <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">© 2026 EduTrack Systems</p>
          <div className="flex gap-4">
            <div className="w-2 h-2 rounded-full bg-white/20"></div>
            <div className="w-2 h-2 rounded-full bg-white/40"></div>
            <div className="w-2 h-2 rounded-full bg-white/60"></div>
          </div>
        </div>
      </div>

      {/* Login Form Section - Primary on mobile */}
      <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center p-6 lg:p-16 min-h-screen">
        {/* Mobile Header - More compact */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-lg shadow-lg shadow-indigo-100">
            🎓
          </div>
          <span className="text-lg font-black text-slate-800 tracking-tighter uppercase">EduTrack</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white lg:bg-transparent p-8 lg:p-0 rounded-[2rem] lg:rounded-none shadow-xl shadow-slate-200 lg:shadow-none border border-slate-100 lg:border-none"
        >
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-2xl lg:text-4xl font-black text-slate-800 tracking-tight mb-2">Welcome Back</h2>
            <p className="text-slate-400 text-xs lg:text-sm font-medium">Sign in to your school account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-1">Select Your Role</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('teacher')}
                  className={`flex items-center justify-center gap-2 p-3 lg:p-4 rounded-2xl border-2 transition-all ${
                    selectedRole === 'teacher' 
                    ? 'border-indigo-600 bg-indigo-50/30 text-indigo-700 shadow-lg shadow-indigo-100 scale-[1.02]' 
                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Teacher</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  className={`flex items-center justify-center gap-2 p-3 lg:p-4 rounded-2xl border-2 transition-all ${
                    selectedRole === 'student' 
                    ? 'border-indigo-600 bg-indigo-50/30 text-indigo-700 shadow-lg shadow-indigo-100 scale-[1.02]' 
                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <Backpack className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Student</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">School Email</label>
                <input
                  type="email"
                  placeholder={selectedRole === 'teacher' ? 'sharma@school.edu' : 'aarav.sharma1@school.edu'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-6 py-4 bg-slate-50 lg:bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-6 py-4 bg-slate-50 lg:bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3"
              >
                <AlertTriangle className="w-5 h-5" /> {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-3"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In to EduTrack
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="pt-6 text-center">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                Demo Accounts
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 bg-slate-100 lg:bg-slate-200 text-slate-500 lg:text-slate-600 rounded-full text-[8px] font-bold">sharma@school.edu</span>
                <span className="px-3 py-1 bg-slate-100 lg:bg-slate-200 text-slate-500 lg:text-slate-600 rounded-full text-[8px] font-bold">aarav.sharma1@school.edu</span>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );



};

export default LoginPage;

