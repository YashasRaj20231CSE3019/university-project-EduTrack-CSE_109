
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Student, AttendanceRecord } from '../types';

interface AttendanceSheetProps {
  students: Student[];
  onSave: (record: AttendanceRecord) => void;
}

interface CheckInLog {
  id: string;
  name: string;
  time: string;
}

const AttendanceSheet: React.FC<AttendanceSheetProps> = ({ students, onSave }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'present' | 'absent'>('all');
  
  // Real-time features
  const [isLiveSession, setIsLiveSession] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [checkInLog, setCheckInLog] = useState<CheckInLog[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const isSelected = selectedIds.includes(s.id);
      if (filter === 'present') return matchesSearch && isSelected;
      if (filter === 'absent') return matchesSearch && !isSelected;
      return matchesSearch;
    });
  }, [students, search, selectedIds, filter]);

  // Timer logic
  useEffect(() => {
    if (isLiveSession && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSave();
      setIsLiveSession(false);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLiveSession, timeLeft]);

  const toggleStudent = (student: Student) => {
    const isPresent = selectedIds.includes(student.id);
    if (!isPresent) {
      // Logic for "Check-in"
      setSelectedIds(prev => [...prev, student.id]);
      const now = new Date();
      setCheckInLog(prev => [{
        id: Math.random().toString(),
        name: student.name,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }, ...prev].slice(0, 5));
    } else {
      setSelectedIds(prev => prev.filter(i => i !== student.id));
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map(s => s.id));
    }
  };

  const handleSave = () => {
    onSave({
      date: new Date().toISOString(),
      presentStudentIds: selectedIds
    });
    alert(`Attendance for ${selectedIds.length} students saved successfully!`);
    setIsLiveSession(false);
    setTimeLeft(600);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {/* Real-time Session Bar */}
      {isLiveSession && (
        <div className="bg-slate-900 text-white p-4 rounded-3xl flex items-center justify-between px-10 shadow-xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-rose-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-black uppercase tracking-widest">Live Session Active</span>
            </div>
            <div className="h-6 w-[1px] bg-slate-700"></div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase">Auto-Submit in:</span>
              <span className="text-xl font-black font-mono text-indigo-400">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:block">
                <p className="text-[10px] font-black text-slate-500 uppercase text-right leading-none mb-1">Current Progress</p>
                <div className="w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                   <div 
                    className="bg-indigo-500 h-full transition-all duration-1000" 
                    style={{ width: `${(selectedIds.length / students.length) * 100}%` }}
                   ></div>
                </div>
             </div>
             <button 
              onClick={() => setIsLiveSession(false)}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-black rounded-xl transition-all"
             >
               STOP
             </button>
          </div>
        </div>
      )}

      {/* Action Header */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-800 mb-1">Session Attendance</h3>
          <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
            {!isLiveSession && <span className="w-2 h-2 rounded-full bg-slate-300"></span>}
            {isLiveSession ? 'Monitoring check-ins...' : `Ready for session ${today}`}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {!isLiveSession ? (
            <button 
              onClick={() => setIsLiveSession(true)}
              className="px-6 py-3 bg-slate-900 text-white text-sm font-black rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-100"
            >
              <span>⚡</span> START LIVE SESSION
            </button>
          ) : (
            <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
               <span className="text-indigo-600 font-black text-xs uppercase tracking-widest">Recording...</span>
            </div>
          )}

          <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden lg:block"></div>
          
          <div className="bg-slate-100 rounded-xl p-1 flex items-center">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              ALL
            </button>
            <button 
              onClick={() => setFilter('present')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'present' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              PRESENT ({selectedIds.length})
            </button>
          </div>
          
          <button 
            onClick={handleSave}
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
          >
            Confirm & Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Table Container */}
        <div className="xl:col-span-3 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full max-w-md">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input 
                type="text" 
                placeholder="Search students..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all shadow-sm"
              />
            </div>
            <button 
              onClick={handleSelectAll}
              className="text-indigo-600 font-black text-xs hover:underline uppercase tracking-widest"
            >
              {selectedIds.length === students.length ? 'DESELECT ALL' : 'SELECT ALL'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Presence</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Class</th>
                  <th className="px-10 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const isPresent = selectedIds.includes(student.id);
                  return (
                    <tr 
                      key={student.id} 
                      onClick={() => toggleStudent(student)}
                      className={`group cursor-pointer hover:bg-slate-50 transition-all duration-200 ${isPresent ? 'bg-emerald-50/20' : ''}`}
                    >
                      <td className="px-10 py-5">
                        <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
                          isPresent 
                            ? 'bg-emerald-600 border-emerald-600 text-white' 
                            : 'border-slate-200 bg-white group-hover:border-indigo-400'
                        }`}>
                          {isPresent ? <span className="text-sm font-bold">✓</span> : <span className="text-xs text-slate-300">○</span>}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <img src={student.avatar} className="w-10 h-10 rounded-xl border border-slate-100 shadow-sm" alt="" />
                          <div>
                            <p className="text-sm font-black text-slate-800 leading-none mb-1">{student.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 lowercase">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-black rounded-lg uppercase">
                          {student.grade}
                        </span>
                      </td>
                      <td className="px-10 py-5 text-right">
                         <button 
                          className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                            isPresent ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                          }`}
                         >
                           {isPresent ? 'CHECKED-IN' : 'MARK PRESENT'}
                         </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time Side Panel */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Real-time Check-ins</h4>
            <div className="space-y-4">
              {checkInLog.length > 0 ? (
                checkInLog.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 animate-in slide-in-from-right-4 duration-300">
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs">✓</div>
                    <div>
                      <p className="text-xs font-black text-slate-800">{log.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">{log.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">No live check-ins<br/>recorded yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2rem] text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
            <h4 className="text-lg font-black mb-2 leading-tight">Session Insights</h4>
            <p className="text-xs font-bold text-indigo-100 mb-6 opacity-80 uppercase tracking-widest">Attendance Health</p>
            
            <div className="space-y-4 relative z-10">
               <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Participation</span>
                  <span className="text-2xl font-black">{Math.round((selectedIds.length / (students.length || 1)) * 100)}%</span>
               </div>
               <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-white h-full transition-all duration-1000" 
                    style={{ width: `${(selectedIds.length / (students.length || 1)) * 100}%` }}
                  ></div>
               </div>
               <p className="text-[10px] font-bold text-indigo-100/60 text-center uppercase tracking-widest">Predicted: 92% Finish</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSheet;
