
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Student, AttendanceRecord } from '../types';
import QRGenerator from './QRGenerator';

interface StudentDashboardProps {
  student: Student;
  attendance: AttendanceRecord[];
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, attendance }) => {
  const [showQR, setShowQR] = useState(false);
  const navigate = useNavigate();
  const myAttendance = attendance.filter(record => record.presentStudentIds.includes(student.id));
  const attendanceRate = attendance.length > 0 
    ? Math.round((myAttendance.length / attendance.length) * 100) 
    : 100;

  const pendingAssignments = student.assignments.filter(a => a.status === 'pending');

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Student Welcome Hero */}
      <div className="bg-indigo-600 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-2xl shadow-indigo-200">
        <div className="relative z-10 max-w-lg text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-extrabold mb-4 leading-tight">Hi, {student.name}! ✨</h1>
          <p className="text-indigo-100 text-sm md:text-lg mb-6">Your overall performance is looking great. You have {pendingAssignments.length} assignments needing attention.</p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center md:justify-start">
            <button 
              onClick={() => navigate('/assignments')}
              className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all active:scale-95 shadow-lg text-sm md:text-base"
            >
              My Assignments
            </button>
            <button 
              onClick={() => navigate('/schedule')}
              className="px-6 py-3 bg-indigo-500/50 text-white font-bold rounded-xl border border-white/20 hover:bg-indigo-500/70 transition-all active:scale-95 text-sm md:text-base"
            >
              View Schedule
            </button>
            <button 
              onClick={() => navigate('/lesson-planner')}
              className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all active:scale-95 text-sm md:text-base"
            >
              Lesson Plan
            </button>
            <button 
              onClick={() => setShowQR(true)}
              className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <span>📱</span> My QR Code
            </button>
          </div>
        </div>
        <div className="hidden lg:block relative z-10">
          <div className="w-48 h-48 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-inner">
             <div className="text-center">
                <p className="text-4xl font-black">{attendanceRate}%</p>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Attendance</p>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Schedule Preview */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span>📅</span> Morning Lineup
          </h3>
          <div className="space-y-4">
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-black">08:00</div>
                <div>
                   <p className="text-sm font-black text-slate-800">Mathematics</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Room 302A • Prof. X</p>
                </div>
             </div>
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-xs font-black">09:15</div>
                <div>
                   <p className="text-sm font-black text-slate-800">Science Lab</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Lab 1 • Dr. Miller</p>
                </div>
             </div>
             <button 
              onClick={() => navigate('/schedule')}
              className="w-full py-3 mt-4 text-indigo-600 text-xs font-black hover:bg-indigo-50 rounded-xl transition-all uppercase tracking-widest"
            >
              FULL TIMETABLE
            </button>
          </div>
        </div>

        {/* Priority Assignments Summary */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>🚀</span> Priority Tasks
            </h3>
            <button 
              onClick={() => navigate('/assignments')}
              className="text-indigo-600 text-xs md:text-sm font-black hover:underline"
            >
              SEE ALL
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingAssignments.slice(0, 3).map(as => (
              <div 
                key={as.id} 
                onClick={() => navigate('/assignments')}
                className="p-4 md:p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shrink-0">
                    <span className="text-lg md:text-xl">{as.subject === 'Science' ? '🧪' : as.subject === 'Math' ? '📐' : '📝'}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{as.title}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DUE {new Date(as.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="px-2 md:px-3 py-1 bg-amber-100 text-amber-700 text-[8px] md:text-[10px] font-black rounded uppercase tracking-tighter shrink-0 ml-2">
                  {as.status}
                </span>
              </div>
            ))}
            {pendingAssignments.length === 0 && (
              <div className="p-10 text-center">
                <p className="text-slate-400 font-medium italic">No pending tasks! Enjoy your free time. 🎉</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Snapshots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Math Grade', val: 'A-', color: 'indigo', icon: '📐' },
          { label: 'Science Grade', val: 'A', color: 'emerald', icon: '🧪' },
          { label: 'Class Rank', val: '#12', color: 'amber', icon: '🏆' },
          { label: 'Points', val: '1,240', color: 'rose', icon: '✨' }
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
               <span className={`w-8 h-8 rounded-lg bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center text-sm`}>{item.icon}</span>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
             </div>
             <p className="text-2xl font-black text-slate-800">{item.val}</p>
          </div>
        ))}
      </div>

      {showQR && <QRGenerator student={student} onClose={() => setShowQR(false)} />}
    </div>
  );
};

export default StudentDashboard;
