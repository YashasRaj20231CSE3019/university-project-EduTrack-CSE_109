
import React, { useMemo, useState } from 'react';
import { AttendanceRecord, Student } from '../types';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  BarChart3,
  Filter
} from 'lucide-react';

interface StudentAttendanceProps {
  student: Student;
  attendanceHistory: AttendanceRecord[];
}

export const StudentAttendance: React.FC<StudentAttendanceProps> = ({ student, attendanceHistory }) => {
  const [filterSubject, setFilterSubject] = useState<string>('all');

  const subjects = useMemo(() => {
    const subs = Array.from(new Set(attendanceHistory.map(r => r.subject)));
    return subs.length > 0 ? subs : ['Mathematics', 'Science', 'English', 'History', 'Art', 'Computer Science'];
  }, [attendanceHistory]);

  const stats = useMemo(() => {
    return subjects.map(subject => {
      const records = attendanceHistory.filter(r => r.subject === subject);
      const present = records.filter(r => r.presentStudentIds.includes(student.id)).length;
      const total = records.length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      
      return {
        subject,
        present,
        total,
        percentage,
        status: percentage > 85 ? 'good' : percentage > 75 ? 'warning' : 'critical'
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [subjects, attendanceHistory, student.id]);

  const totalClasses = useMemo(() => stats.reduce((sum, s) => sum + s.total, 0), [stats]);
  const attendedClasses = useMemo(() => stats.reduce((sum, s) => sum + s.present, 0), [stats]);

  const overallPercentage = useMemo(() => {
    return totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;
  }, [attendedClasses, totalClasses]);

  // Daily log for current student
  const recentLogs = useMemo(() => {
    let logs = [...attendanceHistory];
    if (filterSubject !== 'all') {
      logs = logs.filter(l => l.subject === filterSubject);
    }

    return logs
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 15)
      .map(r => ({
        ...r,
        isPresent: r.presentStudentIds.includes(student.id)
      }));
  }, [attendanceHistory, student.id, filterSubject]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Overall Attendance</p>
            <div className="flex items-end gap-3 mb-4">
              <h2 className="text-5xl font-black tracking-tighter">{overallPercentage}%</h2>
              <div className={`mb-1.5 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${overallPercentage >= 85 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {overallPercentage >= 85 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {overallPercentage >= 85 ? 'On Track' : 'Below Goal'}
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-widest">
              {attendedClasses} sessions attended out of {totalClasses} total classes
            </p>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${overallPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${overallPercentage >= 85 ? 'bg-green-500' : 'bg-amber-500'}`}
              ></motion.div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subject Mastery</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{subjects.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Courses Tracked</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${overallPercentage >= 85 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
              {overallPercentage >= 85 ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{overallPercentage >= 85 ? 'Regular' : 'Borderline'}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attendance Status</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subject wise list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Calculated Breakdown</h3>
            <span className="text-[10px] font-bold text-slate-400 px-2 py-1 bg-slate-100 rounded-full">PER SUBJECT</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.map((s, idx) => (
              <motion.div 
                key={s.subject}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setFilterSubject(s.subject === filterSubject ? 'all' : s.subject)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden ${
                  filterSubject === s.subject 
                    ? 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100 shadow-lg' 
                    : 'bg-white border-slate-200 text-slate-900 shadow-sm hover:border-indigo-500'
                }`}
              >
                {filterSubject === s.subject && (
                  <div className="absolute top-2 right-2">
                    <Filter className="w-3 h-3 text-white opacity-50" />
                  </div>
                )}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className={`text-lg font-black tracking-tight ${filterSubject === s.subject ? 'text-white' : 'text-slate-900'}`}>{s.subject}</h4>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${filterSubject === s.subject ? 'text-white/60' : 'text-slate-400'}`}>
                      {s.present} / {s.total} Classes
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                    filterSubject === s.subject 
                      ? 'bg-white/20 text-white' 
                      : s.status === 'good' ? 'bg-green-100 text-green-700' : 
                        s.status === 'warning' ? 'bg-amber-100 text-amber-700' : 
                        'bg-rose-100 text-rose-700'
                  }`}>
                    {s.percentage}%
                  </div>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${filterSubject === s.subject ? 'bg-white/10' : 'bg-slate-100'}`}>
                  <div 
                    className={`h-full transition-all duration-700 ${
                      filterSubject === s.subject ? 'bg-white' : 
                      s.status === 'good' ? 'bg-green-500' : 
                      s.status === 'warning' ? 'bg-amber-500' : 
                      'bg-rose-500'
                    }`}
                    style={{ width: `${s.percentage}%` }}
                  ></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent logs */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
              {filterSubject === 'all' ? 'Recent Activity' : `${filterSubject} Logs`}
            </h3>
            {filterSubject !== 'all' ? (
              <button 
                onClick={() => setFilterSubject('all')}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1"
              >
                Clear Filter <XCircle className="w-3 h-3" />
              </button>
            ) : (
              <Calendar className="w-4 h-4 text-slate-400" />
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {recentLogs.length > 0 ? (
                recentLogs.map((log, idx) => (
                  <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${log.isPresent ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                        {log.isPresent ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 tracking-tight">{log.subject}</p>
                        <p className="text-[9px] font-medium text-slate-400">{new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className={`text-[10px] font-black uppercase tracking-widest ${log.isPresent ? 'text-green-600' : 'text-rose-600'}`}>
                      {log.isPresent ? 'Present' : 'Absent'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <AlertCircle className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No logs found</p>
                </div>
              )}
            </div>
            <button className="w-full py-4 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
              View Full History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
