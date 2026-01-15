
import React, { useState } from 'react';
import { Role, User, Student } from '../types';

interface LoginPageProps {
  students: Student[];
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ students, onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<Role>('teacher');
  const [email, setEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedRole === 'teacher') {
      // Mock teacher login
      onLogin({
        id: 't-1',
        name: 'Dr. Sarah Miller',
        email: 'miller@school.edu',
        role: 'teacher',
        avatar: 'https://picsum.photos/seed/teacher/100/100'
      });
    } else {
      // Mock student login - find a student by email or just pick the first one if empty
      const student = students.find(s => s.email.toLowerCase() === email.toLowerCase()) || students[0];
      onLogin({
        id: student.id,
        name: student.name,
        email: student.email,
        role: 'student',
        avatar: student.avatar,
        studentData: student
      });
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
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 transition-all active:scale-95"
          >
            Sign In to EduTrack
          </button>

          <p className="text-center text-xs text-slate-400 font-medium">
            Demo: Use any credentials to sign in.
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
