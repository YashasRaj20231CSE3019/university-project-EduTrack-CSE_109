
import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Student, AttendanceRecord, Activity, ScheduleEntry } from '../types';
import { generateWeeklyReport } from '../services/aiService';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Trophy, 
  LayoutDashboard, 
  CalendarDays, 
  Scan, 
  Calculator, 
  Book,
  Sparkles,
  Check,
  X
} from 'lucide-react';

interface DashboardProps {
  students: Student[];
  attendance: AttendanceRecord[];
  activities: Activity[];
  schedule: ScheduleEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ students, attendance, activities, schedule }) => {
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
    { label: 'Enrolled Students', value: students.length, color: 'indigo', icon: <Users className="w-6 h-6" />, trend: '+2%' },
    { label: 'Avg. Attendance', value: `${attendanceRate}%`, color: 'green', icon: <TrendingUp className="w-6 h-6" />, trend: '+1.5%' },
    { label: 'Active Activities', value: activities.filter(a => a.status === 'planned').length, color: 'amber', icon: <Clock className="w-6 h-6" />, trend: 'Stable' },
    { label: 'Completed Tasks', value: activities.filter(a => a.status === 'completed').length, color: 'indigo', icon: <Trophy className="w-6 h-6" />, trend: '8 today' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Section */}
      <div className="bg-indigo-600 rounded-3xl p-8 md:p-12 border border-indigo-500 flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-xl text-white">
        <div className="relative z-10 max-w-lg text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3 text-indigo-200" /> Classroom Insights
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Welcome back, Dr. Sharma!
          </h1>
          <p className="text-indigo-100 text-sm md:text-base mb-8 leading-relaxed font-medium">Your classroom is performing 12% better than the school average this week. Keep it up!</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <button 
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="px-6 py-2.5 bg-white text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-indigo-50 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2"
            >
              {isGeneratingReport ? (
                <>
                  <span className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></span>
                  Generating...
                </>
              ) : (
                <>
                  <LayoutDashboard className="w-3.5 h-3.5" /> Generate Weekly Report
                </>
              )}
            </button>
            <button 
              onClick={() => setShowCalendar(true)}
              className="px-6 py-2.5 bg-indigo-500/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg border border-white/20 hover:bg-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <CalendarDays className="w-3.5 h-3.5" /> View Calendar
            </button>
          </div>
        </div>
        <div className="hidden lg:block relative z-10">
          <div className="w-44 h-44 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-inner">
             <div className="text-center">
                <p className="text-4xl font-bold text-white tracking-tight">{attendanceRate}%</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Present Today</p>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 bg-slate-50 text-slate-600 rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <div className="w-5 h-5 flex items-center justify-center">
                  {stat.icon}
                </div>
              </span>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest ${stat.trend.startsWith('+') ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Attendance Chart */}
        <div className="xl:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Attendance Statistics</h3>
            <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
              <button className="px-3 py-1 text-[10px] font-bold bg-white text-slate-900 rounded-md shadow-sm border border-slate-200 uppercase tracking-widest">WEEKLY</button>
              <button className="px-3 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">MONTHLY</button>
            </div>
          </div>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontWeight={700}
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                  tickFormatter={(val) => val.toUpperCase()}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontWeight={700}
                  tickLine={false} 
                  axisLine={false} 
                  domain={[0, 100]} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                  cursor={{ stroke: '#4f46e5', strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="#4f46e5" 
                  fillOpacity={1} 
                  fill="url(#colorAtt)" 
                  strokeWidth={3} 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Schedule/Recent Activities Widget */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Class Roadmap</h3>
            <button className="text-slate-400 text-[10px] font-bold hover:text-slate-900 transition-colors uppercase tracking-widest">View All</button>
          </div>
          <div className="flex-1 space-y-6">
            {activities.slice(0, 4).map((act, i) => (
              <div key={act.id} className="flex items-center gap-4 group cursor-pointer">
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl shrink-0 transition-colors border ${
                  act.status === 'completed' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600'
                }`}>
                   <span>
                     {act.subject === 'Science' ? <Scan className="w-5 h-5" /> : 
                      act.subject === 'Math' ? <Calculator className="w-5 h-5" /> : 
                      <Book className="w-5 h-5" />}
                   </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 truncate text-sm tracking-tight">{act.title}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{act.subject} • {act.duration}</p>
                </div>
                <div className="shrink-0">
                  {act.status === 'completed' ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                  )}
                </div>
              </div>
            ))}
            
            {/* CTA for empty space */}
            <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <p className="text-xs font-bold text-slate-900 mb-1 tracking-tight">Weekly Quiz Tomorrow!</p>
              <p className="text-[10px] text-slate-400 font-medium mb-4">Algebraic Equations review.</p>
              <button className="w-full py-2 bg-white border border-slate-200 text-slate-900 rounded-lg text-[10px] font-bold hover:bg-slate-50 transition-colors shadow-sm uppercase tracking-widest">
                Set Reminder
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-auto border border-slate-200">
            <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">AI Insights</p>
                  <h3 className="text-2xl font-bold flex items-center gap-2 tracking-tight">Weekly Performance Report <TrendingUp className="w-6 h-6 text-indigo-400" /></h3>
                </div>
                <button 
                  onClick={() => setShowReport(false)}
                  className="absolute top-4 right-4 z-[100] w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center hover:bg-slate-700 transition-all active:scale-90 border border-slate-700"
                  aria-label="Close report"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto prose prose-slate prose-indigo max-w-none">
              <div className="markdown-body">
                <Markdown>{reportText || ''}</Markdown>
              </div>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg hover:bg-slate-50 transition-all uppercase tracking-widest"
              >
                Print Report
              </button>
              <button 
                onClick={() => setShowReport(false)}
                className="px-8 py-2.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-slate-800 transition-all shadow-lg uppercase tracking-widest"
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
          <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-auto border border-slate-200">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold flex items-center gap-2 tracking-tight">Weekly Class Calendar <CalendarDays className="w-6 h-6 text-indigo-400" /></h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">March 10 - March 14, 2026</p>
              </div>
              <button 
                onClick={() => setShowCalendar(false)}
                className="absolute top-4 right-4 z-[100] w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center hover:bg-slate-700 transition-all active:scale-90 border border-slate-700"
                aria-label="Close calendar"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            </div>
            <div className="p-8 overflow-x-auto">
              <div className="grid grid-cols-5 gap-4 min-w-[800px]">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, i) => (
                  <div key={day} className="space-y-4">
                    <div className="text-center pb-4 border-b border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{day}</p>
                      <p className="text-xl font-bold text-slate-800 tracking-tight">{10 + i}</p>
                    </div>
                    <div className="space-y-2">
                      {schedule.filter(s => s.day === day.substring(0, 3)).slice(0, 3).map((entry, idx) => (
                        <div key={idx} className={`p-3 rounded-xl border text-[10px] font-bold ${
                          entry.subject.includes('Math') ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 
                          entry.subject.includes('Science') ? 'bg-green-50 border-green-100 text-green-700' :
                          'bg-slate-50 border-slate-100 text-slate-700'
                        }`}>
                          <p className="mb-1 tracking-tight">{entry.subject}</p>
                          <p className="opacity-70">{entry.startTime} - {entry.endTime}</p>
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
                className="px-8 py-2.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-slate-800 transition-all uppercase tracking-widest"
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
