
import React, { useState } from 'react';
import { Student, AttendanceRecord, Assignment } from '../types';

interface StudentDetailsProps {
  student: Student;
  attendanceHistory: AttendanceRecord[];
  onBack: () => void;
  onUpdateAssignment?: (assignmentId: string, updates: Partial<Assignment>) => void;
  isTeacherView?: boolean;
}

const StudentDetails: React.FC<StudentDetailsProps> = ({ student, attendanceHistory, onBack, onUpdateAssignment, isTeacherView }) => {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [gradeValue, setGradeValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const presentSessions = attendanceHistory.filter(record => 
    record.presentStudentIds.includes(student.id)
  );
  
  const attendanceRate = attendanceHistory.length > 0 
    ? Math.round((presentSessions.length / attendanceHistory.length) * 100) 
    : 100;

  const handleOpenGrading = (as: Assignment) => {
    if (!isTeacherView) return;
    setSelectedAssignment(as);
    setGradeValue(as.grade === '-' ? '' : as.grade);
  };

  const handleSaveGrade = () => {
    if (!selectedAssignment || !onUpdateAssignment) return;
    
    setIsSaving(true);
    setTimeout(() => {
      onUpdateAssignment(selectedAssignment.id, {
        grade: gradeValue,
        status: 'graded'
      });
      setIsSaving(false);
      setSelectedAssignment(null);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <span>←</span> Back to Directory
      </button>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-indigo-600 h-32 relative">
          <div className="absolute -bottom-12 left-8 border-4 border-white rounded-[2rem] shadow-lg overflow-hidden w-24 h-24">
            <img src={student.avatar} className="w-full h-full object-cover" alt={student.name} />
          </div>
        </div>
        <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-800">{student.name}</h3>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{student.grade} • {student.email}</p>
          </div>
          <div className="flex gap-2">
            <button className="px-6 py-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all active:scale-95 shadow-sm">
              Message
            </button>
            <button className="px-6 py-3 bg-slate-50 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-sm">
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Attendance Rate</p>
          <p className="text-3xl font-black text-slate-800">{attendanceRate}%</p>
          <div className="mt-4 w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
             <div className="bg-emerald-500 h-full" style={{ width: `${attendanceRate}%` }}></div>
          </div>
        </div>
        <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Submissions</p>
          <p className="text-3xl font-black text-slate-800">{student.assignments.length}</p>
          <p className="text-[10px] font-bold text-amber-600 mt-2 uppercase tracking-tighter">
            {student.assignments.filter(a => a.status === 'submitted').length} Awaiting grading
          </p>
        </div>
        <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Rank</p>
          <p className="text-3xl font-black text-indigo-600">Top 10%</p>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Academic Excellence</p>
        </div>
      </div>

      {/* Behavioral & Guardian Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Behavioral Notes */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
              <span>📓</span> Behavioral Journal
            </h4>
            <button className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline">+ NEW NOTE</button>
          </div>
          <div className="p-8 space-y-4">
            {student.behavioralNotes && student.behavioralNotes.length > 0 ? (
              student.behavioralNotes.map((note, idx) => (
                <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">✨</div>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">{note}</p>
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <p className="text-slate-400 font-medium italic">No behavioral notes recorded.</p>
              </div>
            )}
          </div>
        </div>

        {/* Parent/Guardian Info */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
              <span>👨‍👩‍👧</span> Guardian Information
            </h4>
          </div>
          <div className="p-8 space-y-8">
            {student.parentContact ? (
              <>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Primary Contact</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl">👤</div>
                    <div>
                      <p className="font-black text-slate-800 leading-none mb-1">{student.parentContact.name}</p>
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{student.parentContact.relation}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">📞</div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                      <p className="text-sm font-black text-slate-800">{student.parentContact.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">✉️</div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                      <p className="text-sm font-black text-slate-800 truncate">{student.parentContact.email}</p>
                    </div>
                  </div>
                </div>

                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95">
                  CONTACT GUARDIAN
                </button>
              </>
            ) : (
              <div className="py-10 text-center">
                <p className="text-slate-400 font-medium italic">Contact info not available.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assignments Table */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">Academic Portfolio</h4>
            {isTeacherView && <span className="text-[10px] font-bold text-slate-400">Click to Grade</span>}
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {student.assignments.length > 0 ? student.assignments.map(as => (
              <div 
                key={as.id} 
                onClick={() => handleOpenGrading(as)}
                className={`p-6 flex items-center justify-between transition-all group ${
                  isTeacherView ? 'cursor-pointer hover:bg-indigo-50/50' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    as.status === 'graded' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {as.subject === 'Science' ? '🧪' : as.subject === 'Math' ? '📐' : '📖'}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors leading-none mb-1">{as.title}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{as.subject} • {new Date(as.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-indigo-600 text-lg leading-none">{as.grade}</p>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${
                    as.status === 'graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {as.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="p-20 text-center">
                <p className="text-slate-400 font-medium italic">No assignments found for this period.</p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Timeline */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">Attendance Timeline</h4>
          </div>
          <div className="p-8 space-y-6 flex-1">
            {attendanceHistory.length > 0 ? [...attendanceHistory].reverse().slice(0, 6).map((record, idx) => (
              <div key={idx} className="flex items-center gap-6 group">
                <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ring-2 ${
                  record.presentStudentIds.includes(student.id) ? 'bg-emerald-500 ring-emerald-100' : 'bg-rose-500 ring-rose-100'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-700">
                    {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  record.presentStudentIds.includes(student.id) ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {record.presentStudentIds.includes(student.id) ? 'PRESENT' : 'ABSENT'}
                </span>
              </div>
            )) : (
              <div className="p-10 text-center">
                <p className="text-slate-400 font-medium italic">No attendance records yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grading Modal */}
      {selectedAssignment && isTeacherView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500 border border-slate-100">
             <div className="p-10 bg-indigo-600 text-white relative">
                <button 
                  onClick={() => setSelectedAssignment(null)}
                  className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center font-bold text-xl transition-all"
                >
                  ×
                </button>
                <div className="flex items-center gap-3 mb-2">
                   <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/20">GRADING</span>
                   <span className="text-[10px] font-bold text-indigo-100 uppercase">{selectedAssignment.subject}</span>
                </div>
                <h3 className="text-2xl font-black mb-1">{selectedAssignment.title}</h3>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-tighter">Submitting Student: {student.name}</p>
             </div>
             
             <div className="p-10 space-y-8">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Assign Final Grade</label>
                   <div className="flex gap-4">
                      <input 
                        type="text"
                        value={gradeValue}
                        onChange={(e) => setGradeValue(e.target.value)}
                        placeholder="e.g. A, 95%, Excellent"
                        className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-300"
                      />
                      <div className="w-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl">🎯</div>
                   </div>
                </div>

                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Teacher Comments</label>
                   <textarea 
                     placeholder="Add constructive feedback for the student..."
                     className="w-full h-32 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all resize-none leading-relaxed"
                   ></textarea>
                </div>

                <div className="flex gap-4">
                   <button 
                    onClick={() => setSelectedAssignment(null)}
                    className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                   >
                     CANCEL
                   </button>
                   <button 
                    onClick={handleSaveGrade}
                    disabled={isSaving || !gradeValue.trim()}
                    className={`flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95 ${
                      isSaving || !gradeValue.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700 hover:shadow-indigo-200'
                    }`}
                   >
                     {isSaving ? 'UPDATING...' : 'PUBLISH GRADE'}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetails;
