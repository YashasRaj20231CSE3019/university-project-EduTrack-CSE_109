
import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Student, AttendanceRecord, Activity } from '../types';
import { generateWeeklyReport } from '../services/aiService';

interface DashboardProps {
  students: Student[];
  attendance: AttendanceRecord[];
  activities: Activity[];
}

const Dashboard: React.FC<DashboardProps> = ({ students, attendance, activities }) => {
  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const latestAttendance = attendance[attendance.length - 1];
  const attendanceRate = latestAttendance 
    ? Math.round((latestAttendance.presentStudentIds.length / students.length) * 100) 
    : 92; // Fallback for demo if empty

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    const stats = {
      attendanceRate,
      studentCount: students.length,
    };
    const text = await generateWeeklyReport(stats, activities);
    setReportText(text);
    setIsGeneratingReport(false);
    setShowReport(true);
  };

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
      <div className="bg-indigo-600 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-2xl shadow-indigo-200">
        <div className="relative z-10 max-w-lg text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-extrabold mb-4 leading-tight">Welcome back, Dr. Miller! 👋</h1>
          <p className="text-indigo-100 text-sm md:text-lg mb-6">Your classroom is performing 12% better than the school average this week. Keep it up!</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <button 
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 text-sm md:text-base"
            >
              {isGeneratingReport ? (
                <>
                  <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                  Generating...
                </>
              ) : (
                <>
                  <span>📊</span> Generate Weekly Report
                </>
              )}
            </button>
            <button 
              onClick={() => setShowCalendar(true)}
              className="px-6 py-3 bg-indigo-500/50 text-white font-bold rounded-xl border border-white/20 hover:bg-indigo-500/70 transition-all active:scale-95 text-sm md:text-base"
            >
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 md:p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <span className={`p-3 md:p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl text-xl md:text-2xl group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </span>
              <span className={`text-[10px] md:text-xs font-bold px-2 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-400 text-xs md:text-sm font-semibold mb-1">{stat.label}</p>
            <p className="text-2xl md:text-3xl font-black text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Attendance Chart */}
        <div className="xl:col-span-2 bg-white p-5 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <h3 className="text-lg md:text-xl font-bold text-slate-800">Attendance Statistics</h3>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 text-[10px] md:text-xs font-bold bg-indigo-50 text-indigo-600 rounded-lg">WEEKLY</button>
              <button className="px-4 py-1.5 text-[10px] md:text-xs font-bold text-slate-400 hover:bg-slate-50 rounded-lg">MONTHLY</button>
            </div>
          </div>
          <div className="h-64 md:h-80">
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
        <div className="bg-white p-5 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg md:text-xl font-bold text-slate-800">Class Roadmap</h3>
            <button className="text-indigo-600 text-xs md:text-sm font-bold hover:underline">View All</button>
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
      {/* Weekly Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
            <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">AI Insights</p>
                  <h3 className="text-2xl font-black">Weekly Performance Report 📈</h3>
                </div>
                <button 
                  onClick={() => setShowReport(false)}
                  className="absolute top-4 right-4 z-[100] w-10 h-10 bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-xl hover:bg-slate-50 transition-all active:scale-90"
                  aria-label="Close report"
                >
                  <span className="text-2xl font-black">×</span>
                </button>
              </div>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto prose prose-slate prose-indigo max-w-none">
              <div className="markdown-body">
                <Markdown>{reportText || ''}</Markdown>
              </div>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => window.print()}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-black rounded-xl hover:bg-slate-50 transition-all"
              >
                Print Report
              </button>
              <button 
                onClick={() => setShowReport(false)}
                className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
            <div className="bg-slate-800 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black">Weekly Class Calendar 📅</h3>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">March 10 - March 14, 2026</p>
              </div>
              <button 
                onClick={() => setShowCalendar(false)}
                className="absolute top-4 right-4 z-[100] w-10 h-10 bg-white text-slate-800 rounded-full flex items-center justify-center shadow-xl hover:bg-slate-50 transition-all active:scale-90"
                aria-label="Close calendar"
              >
                <span className="text-2xl font-black">×</span>
              </button>
            </div>
            <div className="p-8 overflow-x-auto">
              <div className="grid grid-cols-5 gap-4 min-w-[800px]">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, i) => (
                  <div key={day} className="space-y-4">
                    <div className="text-center pb-4 border-b border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</p>
                      <p className="text-xl font-black text-slate-800">{10 + i}</p>
                    </div>
                    <div className="space-y-2">
                      {activities.filter(a => i % 2 === 0 ? a.subject === 'Math' : a.subject === 'Science').slice(0, 2).map((act, idx) => (
                        <div key={idx} className={`p-3 rounded-xl border text-[10px] font-bold ${
                          act.subject === 'Math' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        }`}>
                          <p className="mb-1">{act.title}</p>
                          <p className="opacity-70">{act.duration}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setShowCalendar(false)}
                className="px-8 py-3 bg-slate-800 text-white font-black rounded-xl hover:bg-slate-900 transition-all"
              >
                Close Calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
