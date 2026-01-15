
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Student, AttendanceRecord, Activity } from '../types';

interface DashboardProps {
  students: Student[];
  attendance: AttendanceRecord[];
  activities: Activity[];
}

const Dashboard: React.FC<DashboardProps> = ({ students, attendance, activities }) => {
  const latestAttendance = attendance[attendance.length - 1];
  const attendanceRate = latestAttendance 
    ? Math.round((latestAttendance.presentStudentIds.length / students.length) * 100) 
    : 92; // Fallback for demo if empty

  const chartData = [
    { name: 'Mon', attendance: 85 },
    { name: 'Tue', attendance: 92 },
    { name: 'Wed', attendance: 88 },
    { name: 'Thu', attendance: 95 },
    { name: 'Fri', attendance: attendanceRate },
  ];

  const stats = [
    { label: 'Enrolled Students', value: students.length, color: 'blue', icon: '👥', trend: '+2%' },
    { label: 'Avg. Attendance', value: `${attendanceRate}%`, color: 'emerald', icon: '📈', trend: '+1.5%' },
    { label: 'Active Activities', value: activities.filter(a => a.status === 'planned').length, color: 'amber', icon: '⏳', trend: 'Stable' },
    { label: 'Completed Tasks', value: activities.filter(a => a.status === 'completed').length, color: 'indigo', icon: '🏆', trend: '8 today' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Section */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-2xl shadow-indigo-200">
        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-extrabold mb-4 leading-tight">Welcome back, Dr. Miller! 👋</h1>
          <p className="text-indigo-100 text-lg mb-6">Your classroom is performing 12% better than the school average this week. Keep it up!</p>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all active:scale-95 shadow-lg">
              Generate Weekly Report
            </button>
            <button className="px-6 py-3 bg-indigo-500/50 text-white font-bold rounded-xl border border-white/20 hover:bg-indigo-500/70 transition-all active:scale-95">
              View Calendar
            </button>
          </div>
        </div>
        <div className="hidden lg:block relative z-10">
          <div className="w-48 h-48 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-inner">
             <div className="text-center">
                <p className="text-4xl font-black">{attendanceRate}%</p>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Present Today</p>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-5">
              <span className={`p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl text-2xl group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </span>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-400 text-sm font-semibold mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Attendance Chart */}
        <div className="xl:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800">Attendance Statistics</h3>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-600 rounded-lg">WEEKLY</button>
              <button className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:bg-slate-50 rounded-lg">MONTHLY</button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  fontWeight={600}
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  fontWeight={600}
                  tickLine={false} 
                  axisLine={false} 
                  domain={[0, 100]} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#4f46e5', strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="#4f46e5" 
                  fillOpacity={1} 
                  fill="url(#colorAtt)" 
                  strokeWidth={4} 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Schedule/Recent Activities Widget */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800">Class Roadmap</h3>
            <button className="text-indigo-600 text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="flex-1 space-y-5">
            {activities.slice(0, 4).map((act, i) => (
              <div key={act.id} className="flex items-center gap-4 group cursor-pointer">
                <div className={`w-12 h-12 flex items-center justify-center rounded-2xl shrink-0 transition-transform group-hover:scale-110 ${
                  act.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                }`}>
                   <span className="text-xl">{act.subject === 'Science' ? '🧪' : act.subject === 'Math' ? '📐' : '📖'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 truncate leading-snug">{act.title}</h4>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{act.subject} • {act.duration}</p>
                </div>
                <div className="shrink-0">
                  {act.status === 'completed' ? (
                    <span className="text-emerald-500 font-black text-xl">✓</span>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                  )}
                </div>
              </div>
            ))}
            
            {/* CTA for empty space */}
            <div className="mt-8 p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
              <p className="text-sm font-bold text-slate-800 mb-1">Weekly Quiz Tomorrow!</p>
              <p className="text-xs text-slate-400 font-medium mb-4">Make sure to review Algebraic Equations.</p>
              <button className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors">
                Set Reminder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
