
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Student, AttendanceRecord, ScheduleEntry } from '../types';
import QRGenerator from './QRGenerator';
import { Smartphone, CalendarDays, Rocket, FlaskConical, Calculator, FileText, Trophy, Sparkles, BookOpen } from 'lucide-react';

interface StudentDashboardProps {
  student: Student;
  attendance: AttendanceRecord[];
  schedule: ScheduleEntry[];
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, attendance, schedule }) => {
  const [showQR, setShowQR] = useState(false);
  const navigate = useNavigate();
  const myAttendance = attendance.filter(record => record.presentStudentIds.includes(student.id));
  const attendanceRate = attendance.length > 0 
    ? Math.round((myAttendance.length / attendance.length) * 100) 
    : 100;

  const assignments = student?.assignments || [];
  const pendingAssignments = assignments.filter(a => a.status === 'pending');

  // Get today's schedule
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = days[new Date().getDay()] as any;
  const todaySchedule = schedule
    .filter(s => s.day === today || (today === 'Sat' || today === 'Sun' ? s.day === 'Mon' : false))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Student Welcome Hero */}
      <div className="bg-indigo-600 rounded-3xl p-8 md:p-12 border border-indigo-500 flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-xl text-white">
        <div className="relative z-10 max-w-lg text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3 text-indigo-200" /> Student Success
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Hi, {student.name}!</h1>
          <p className="text-indigo-100 text-sm md:text-base mb-8 leading-relaxed font-medium">Your overall performance is looking great. You have {pendingAssignments.length} assignments needing attention.</p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center md:justify-start">
            <button 
              onClick={() => navigate('/assignments')}
              className="px-6 py-2.5 bg-white text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition-all active:scale-95 shadow-sm text-sm"
            >
              My Assignments
            </button>
            <button 
              onClick={() => navigate('/schedule')}
              className="px-6 py-2.5 bg-indigo-500/20 text-white font-bold rounded-lg border border-white/20 hover:bg-indigo-500/30 transition-all active:scale-95 text-sm"
            >
              My Schedule
            </button>
            <button 
              onClick={() => navigate('/lesson-planner')}
              className="px-6 py-2.5 bg-indigo-500/20 text-white font-bold rounded-lg border border-white/20 hover:bg-indigo-500/30 transition-all active:scale-95 text-sm"
            >
              Activity Planner
            </button>
            <button 
              onClick={() => setShowQR(true)}
              className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2 text-sm"
            >
              <Smartphone className="w-4 h-4" /> My QR Code
            </button>
          </div>
        </div>
        <div className="hidden lg:block relative z-10">
          <div className="w-44 h-44 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-inner">
             <div className="text-center">
                <p className="text-4xl font-bold text-white tracking-tight">{attendanceRate}%</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Attendance</p>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Schedule Preview */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600" /> Morning Lineup
          </h3>
          <div className="space-y-4 flex-1">
            {todaySchedule.length > 0 ? (
              todaySchedule.slice(0, 3).map((entry, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4 group hover:bg-indigo-50/50 transition-colors cursor-pointer">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-[10px] font-bold ${
                    entry.subject.includes('Math') ? 'bg-indigo-600' : 
                    entry.subject.includes('Science') ? 'bg-green-600' : 
                    'bg-slate-400'
                  }`}>
                    {entry.startTime}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{entry.subject}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{entry.room} • {entry.teacher}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No classes today</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => navigate('/schedule')}
            className="w-full py-3 mt-6 bg-indigo-50 text-indigo-600 text-xs font-black rounded-xl hover:bg-indigo-100 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <CalendarDays className="w-4 h-4" /> My Schedule
          </button>
        </div>

        {/* Priority Assignments Summary */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-slate-400" /> Priority Tasks
            </h3>
            <button 
              onClick={() => navigate('/assignments')}
              className="text-slate-400 text-xs font-bold hover:text-slate-900 transition-colors"
            >
              SEE ALL
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingAssignments.slice(0, 3).map(as => (
              <div 
                key={as.id} 
                onClick={() => navigate('/assignments')}
                className="p-5 md:p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                    {as.subject === 'Science' ? <FlaskConical className="w-5 h-5" /> : as.subject === 'Math' ? <Calculator className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{as.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DUE {new Date(as.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[9px] font-bold rounded uppercase tracking-widest shrink-0 ml-2">
                  {as.status}
                </span>
              </div>
            ))}
            {pendingAssignments.length === 0 && (
              <div className="p-10 text-center flex flex-col items-center justify-center gap-3">
                <Trophy className="w-8 h-8 text-slate-300" />
                <p className="text-slate-400 font-medium italic">No pending tasks! Enjoy your free time.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Snapshots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Math Grade', val: 'A-', color: 'indigo', icon: <Calculator className="w-4 h-4" /> },
          { label: 'Science Grade', val: 'A', color: 'green', icon: <FlaskConical className="w-4 h-4" /> },
          { label: 'Class Rank', val: '#12', color: 'amber', icon: <Trophy className="w-4 h-4" /> },
          { label: 'Points', val: '1,240', color: 'indigo', icon: <Sparkles className="w-4 h-4" /> }
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
               <span className={`w-8 h-8 rounded-lg bg-slate-50 ${item.color === 'indigo' ? 'text-indigo-600' : item.color === 'green' ? 'text-green-600' : 'text-amber-600'} flex items-center justify-center text-sm`}>{item.icon}</span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
             </div>
             <p className="text-2xl font-bold text-slate-900">{item.val}</p>
          </div>
        ))}
      </div>

      {showQR && <QRGenerator student={student} onClose={() => setShowQR(false)} />}
    </div>
  );
};

export default StudentDashboard;
