
import React, { useState } from 'react';
import { Role, User } from '../types';
import { apiService } from '../services/apiService';

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-['Inter']">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-500">
        <div className="bg-indigo-600 p-10 text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-white/30 shadow-inner">
              🎓
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">EduTrack</h1>
            <p className="text-indigo-100 text-sm font-medium mt-1 uppercase tracking-widest">Education Management</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        </div>

        <form onSubmit={handleLogin} className="p-10 space-y-8">
          <div className="space-y-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center mb-6">Choose Your Role</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedRole('teacher')}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                  selectedRole === 'teacher' 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' 
                  : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                }`}
              >
                <span className="text-2xl">👨‍🏫</span>
                <span className="text-xs font-bold uppercase tracking-wider">Teacher</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                  selectedRole === 'student' 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' 
                  : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                }`}
              >
                <span className="text-2xl">🎒</span>
                <span className="text-xs font-bold uppercase tracking-wider">Student</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">School Email</label>
              <input
                type="email"
                placeholder={selectedRole === 'teacher' ? 'miller@school.edu' : 'student@school.edu'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl text-sm font-medium flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Sign In to EduTrack'
            )}
          </button>

          <p className="text-center text-xs text-slate-400 font-medium">
            Teacher: miller@school.edu · Students: use your school email
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
