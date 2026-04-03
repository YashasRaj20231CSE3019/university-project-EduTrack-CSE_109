
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Student, AttendanceRecord, User } from '../types';
import QRScanner from './QRScanner';
import { exportToCSV } from '../src/utils/csvExport';
import AttendanceCSVImport from './AttendanceCSVImport';
import { Download, Scan, Zap, Search, Check, Circle } from 'lucide-react';

interface AttendanceSheetProps {
  students: Student[];
  onSave: (record: AttendanceRecord) => void;
  user: User;
  onAttendanceImported?: () => void;
}

interface CheckInLog {
  id: string;
  name: string;
  grade: string;
  time: string;
}

const AttendanceSheet: React.FC<AttendanceSheetProps> = ({ students, onSave, user, onAttendanceImported }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [showScanner, setShowScanner] = useState(false);
  
  // Real-time features
  const [isLiveSession, setIsLiveSession] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [checkInLog, setCheckInLog] = useState<CheckInLog[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const sections = useMemo(() => {
    const uniqueSections = Array.from(new Set(students.map(s => s.grade))).sort();
    return ['all', ...uniqueSections];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const matchesSection = selectedSection === 'all' || s.grade === selectedSection;
      const isSelected = selectedIds.includes(s.id);
      
      if (!matchesSection) return false;
      
      if (filter === 'present') return matchesSearch && isSelected;
      if (filter === 'absent') return matchesSearch && !isSelected;
      return matchesSearch;
    });
  }, [students, search, selectedIds, filter, selectedSection]);

  const currentSectionStudents = useMemo(() => {
    return students.filter(s => selectedSection === 'all' || s.grade === selectedSection);
  }, [students, selectedSection]);

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
        grade: student.grade,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }, ...prev].slice(0, 5));
    } else {
      setSelectedIds(prev => prev.filter(i => i !== student.id));
    }
  };

  const handleSelectAll = () => {
    const currentSectionIds = currentSectionStudents.map(s => s.id);
    const allSelectedInCurrentSection = currentSectionIds.every(id => selectedIds.includes(id));
    
    if (allSelectedInCurrentSection) {
      setSelectedIds(prev => prev.filter(id => !currentSectionIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...currentSectionIds])));
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

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Name', 'Email', 'Grade', 'Status', 'Date'];
    const rows = students.map(s => [
      s.id,
      s.name,
      s.email,
      s.grade,
      selectedIds.includes(s.id) ? 'Present' : 'Absent',
      today
    ]);
    exportToCSV(`attendance_${today}.csv`, headers, rows);
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
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between px-6 md:px-8 gap-4 shadow-lg animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Live Session Active</span>
            </div>
            <div className="hidden md:block h-4 w-[1px] bg-slate-700"></div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auto-Submit:</span>
              <span className="text-lg font-bold font-mono text-indigo-400">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:block">
                <div className="w-32 bg-slate-800 h-1 rounded-full overflow-hidden">
                   <div 
                    className="bg-indigo-500 h-full transition-all duration-1000" 
                    style={{ width: `${(selectedIds.filter(id => currentSectionStudents.some(s => s.id === id)).length / (currentSectionStudents.length || 1)) * 100}%` }}
                   ></div>
                </div>
             </div>
             <button 
              onClick={() => setIsLiveSession(false)}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold rounded-lg transition-all border border-slate-700 uppercase tracking-widest"
             >
               Stop Session
             </button>
          </div>
        </div>
      )}

      {/* Action Header */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="text-center lg:text-left">
          <h3 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">Session Attendance</h3>
          <p className="text-xs font-medium text-slate-500 flex items-center justify-center lg:justify-start gap-2">
            {!isLiveSession && <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>}
            {isLiveSession ? 'Monitoring check-ins...' : `Ready for session ${today}`}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3">
          <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-200">
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section:</span>
            <select 
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 pr-4 py-1 cursor-pointer"
            >
              {sections.map(sec => (
                <option key={sec} value={sec}>{sec.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-[10px] font-bold rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm uppercase tracking-widest"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>

          <button 
            onClick={() => setShowScanner(true)}
            className="px-4 py-2 bg-green-600 text-white text-[10px] font-bold rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 shadow-sm uppercase tracking-widest"
          >
            <Scan className="w-3.5 h-3.5" /> Scan QR
          </button>

          {!isLiveSession ? (
            <button 
              onClick={() => setIsLiveSession(true)}
              className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm uppercase tracking-widest"
            >
              <Zap className="w-3.5 h-3.5" /> Start Live
            </button>
          ) : (
            <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
               <span className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest">Recording...</span>
            </div>
          )}

          <div className="h-6 w-[1px] bg-slate-200 mx-2 hidden lg:block"></div>
          
          <div className="bg-slate-50 rounded-lg p-1 flex items-center border border-slate-200">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
            >
              ALL
            </button>
            <button 
              onClick={() => setFilter('present')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${filter === 'present' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
            >
              PRESENT ({selectedIds.length})
            </button>
          </div>
          
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white text-[10px] font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest"
          >
            Save Changes
          </button>
        </div>
      </div>

      {user.role === 'teacher' && (
        <AttendanceCSVImport onImportSuccess={() => onAttendanceImported && onAttendanceImported()} />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Table Container */}
        <div className="xl:col-span-3 space-y-6">
          {/* Section Summary Stats */}
          {selectedSection === 'all' && (
            <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-6">
              {sections.filter(s => s !== 'all').map(sec => {
                const secStudents = students.filter(s => s.grade === sec);
                const secPresent = selectedIds.filter(id => secStudents.some(s => s.id === id)).length;
                const percentage = Math.round((secPresent / (secStudents.length || 1)) * 100);
                
                return (
                  <button 
                    key={sec}
                    onClick={() => setSelectedSection(sec)}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-500 transition-all text-left group min-w-[140px] md:min-w-0 shrink-0"
                  >
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{sec}</p>
                    <div className="flex items-end justify-between">
                      <p className="text-lg font-black text-slate-800">{secPresent}/{secStudents.length}</p>
                      <p className={`text-[10px] font-bold ${percentage > 90 ? 'text-green-500' : percentage > 75 ? 'text-indigo-500' : 'text-rose-500'}`}>
                        {percentage}%
                      </p>
                    </div>
                    <div className="mt-2 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${percentage > 90 ? 'bg-green-500' : percentage > 75 ? 'bg-indigo-500' : 'bg-rose-500'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:flex-1">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search students..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:outline-none transition-all shadow-sm"
                  />
                </div>
                {selectedSection !== 'all' && (
                  <button 
                    onClick={() => setSelectedSection('all')}
                    className="w-full sm:w-auto px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200 hover:bg-slate-200 transition-all uppercase tracking-widest"
                  >
                    Clear Section: {selectedSection}
                  </button>
                )}
              </div>
              <button 
                onClick={handleSelectAll}
                className="text-slate-400 font-bold text-[10px] hover:text-slate-900 uppercase tracking-widest transition-colors"
              >
                {currentSectionStudents.every(s => selectedIds.includes(s.id)) ? 'Deselect All' : 'Select All'}
              </button>
            </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 md:px-10 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Presence</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Class</th>
                  <th className="px-6 md:px-10 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const isPresent = selectedIds.includes(student.id);
                  return (
                    <tr 
                      key={student.id} 
                      onClick={() => toggleStudent(student)}
                      className={`group cursor-pointer hover:bg-slate-50 transition-all duration-200 ${isPresent ? 'bg-green-50/10' : ''}`}
                    >
                      <td className="px-6 md:px-10 py-4">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-300 ${
                          isPresent 
                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                            : 'border-slate-200 bg-white group-hover:border-slate-400'
                        }`}>
                          {isPresent ? <Check className="w-3 h-3" /> : <Circle className="w-2 h-2 text-slate-100" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={student.avatar} className="w-8 h-8 rounded-lg border border-slate-100 shadow-sm bg-white" alt="" />
                          <div>
                            <p className="text-sm font-bold text-slate-900 leading-none mb-1 tracking-tight">{student.name}</p>
                            <p className="text-[10px] font-medium text-slate-400">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase tracking-widest">
                          {student.grade}
                        </span>
                      </td>
                      <td className="px-6 md:px-10 py-4 text-right">
                         <button 
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                            isPresent ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white'
                          }`}
                         >
                           {isPresent ? 'Present' : 'Mark'}
                         </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Real-time Side Panel */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Live Check-ins</h4>
            <div className="space-y-4">
              {checkInLog.length > 0 ? (
                checkInLog.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 animate-in slide-in-from-right-4 duration-300">
                    <div className="w-8 h-8 bg-white border border-slate-200 text-green-600 rounded-lg flex items-center justify-center text-xs shadow-sm"><Check className="w-4 h-4" /></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 tracking-tight">{log.name}</p>
                        <span className="text-[8px] font-bold bg-slate-200 px-1.5 py-0.5 rounded text-slate-500 uppercase tracking-widest">{log.grade}</span>
                      </div>
                      <p className="text-[10px] font-medium text-slate-400">{log.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">No live check-ins<br/>recorded yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl text-white overflow-hidden relative group shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
            <h4 className="text-lg font-bold mb-1 leading-tight tracking-tight">Session Insights</h4>
            <p className="text-[10px] font-bold text-slate-500 mb-6 uppercase tracking-widest">Attendance Health</p>
            
            <div className="space-y-4 relative z-10">
               <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Participation</span>
                  <span className="text-2xl font-bold tracking-tight">
                    {Math.round((selectedIds.filter(id => currentSectionStudents.some(s => s.id === id)).length / (currentSectionStudents.length || 1)) * 100)}%
                  </span>
               </div>
               <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full transition-all duration-1000" 
                    style={{ width: `${(selectedIds.filter(id => currentSectionStudents.some(s => s.id === id)).length / (currentSectionStudents.length || 1)) * 100}%` }}
                  ></div>
               </div>
               <p className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-widest">Predicted: 92% Finish</p>
            </div>
          </div>
        </div>
      </div>

      {showScanner && (
        <QRScanner 
          teacher={user} 
          onScanSuccess={(studentId) => {
            const student = students.find(s => s.id === studentId);
            if (student) toggleStudent(student);
          }} 
          onClose={() => setShowScanner(false)} 
        />
      )}
    </div>
  );
};

export default AttendanceSheet;
