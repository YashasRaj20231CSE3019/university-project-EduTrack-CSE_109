
import React from 'react';
import { View, User } from '../types';

interface LayoutProps {
  currentView: View;
  onViewChange: (view: View) => void;
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onViewChange, user, onLogout, children }) => {
  const teacherNavItems = [
    { id: 'dashboard' as View, label: 'Overview', icon: '📊' },
    { id: 'attendance' as View, label: 'Attendance', icon: '📝' },
    { id: 'students' as View, label: 'Students', icon: '👥' },
    { id: 'planner' as View, label: 'Activity Planner', icon: '🪄' },
    { id: 'schedule' as View, label: 'Class Schedule', icon: '📅' },
  ];

  const studentNavItems = [
    { id: 'dashboard' as View, label: 'My Dashboard', icon: '🏠' },
    { id: 'schedule' as View, label: 'My Timetable', icon: '📅' },
    { id: 'assignments' as View, label: 'Assignments', icon: '📚' },
    { id: 'my-progress' as View, label: 'Grades & Progress', icon: '📈' },
  ];

  const navItems = user.role === 'teacher' ? teacherNavItems : studentNavItems;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Inter']">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-200">
              🎓
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              EduTrack
            </h1>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Main Menu</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                currentView === item.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 translate-x-1'
                  : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
          
          <div className="pt-8">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Account</p>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-all duration-200"
            >
              <span className="text-lg">🚪</span>
              Logout
            </button>
          </div>
        </nav>

        <div className="p-4 mt-auto">
          {user.role === 'teacher' && (
            <div className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden group mb-6">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-indigo-500/40 transition-all"></div>
              <p className="text-xs font-medium text-indigo-300 mb-1">PRO PLAN</p>
              <p className="text-sm font-bold mb-3">Upgrade for AI Insights</p>
              <button className="w-full py-2 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors">
                Upgrade Now
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-3 px-2">
            <div className="relative">
              <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-md" alt={user.name} />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                {user.role === 'teacher' ? 'Class 9A Head' : `Student • ${user.studentData?.grade || 'N/A'}`}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 shrink-0 sticky top-0 z-10">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-slate-800 capitalize leading-none mb-1">{currentView.replace('-', ' ')}</h2>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
              <span className="text-slate-400 mr-2 text-sm">🔍</span>
              <input type="text" placeholder="Global search..." className="bg-transparent border-none outline-none text-sm w-48 text-slate-600" />
            </div>
            
            <button className="relative p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
              <span className="text-xl">🔔</span>
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
