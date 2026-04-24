
import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { Student, AttendanceRecord, Assignment } from '../types';
import ProfileEditor from './ProfileEditor';
import ChatSection from './ChatSection';
import { 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  Users, 
  User as UserIcon, 
  Phone, 
  Mail, 
  Scan, 
  Calculator, 
  Book, 
  X, 
  FileText, 
  Target 
} from 'lucide-react';

interface StudentDetailsProps {
  student: Student;
  attendanceHistory: AttendanceRecord[];
  onBack: () => void;
  onUpdateAssignment?: (assignmentId: string, updates: Partial<Assignment>) => void;
  onUpdateStudent?: (updatedStudent: Student) => void;
  isTeacherView?: boolean;
  currentUser: any;
  onlineUserIds: string[];
  socket: Socket | null;
}

const StudentDetails: React.FC<StudentDetailsProps> = ({ student, attendanceHistory, onBack, onUpdateAssignment, onUpdateStudent, isTeacherView, currentUser, onlineUserIds, socket }) => {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [gradeValue, setGradeValue] = useState('');
  const [commentsValue, setCommentsValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'details' | 'settings' | 'chat'>('details');

  const presentSessions = attendanceHistory.filter(record => 
    record.presentStudentIds.includes(student.id)
  );
  
  const attendanceRate = attendanceHistory.length > 0 
    ? Math.round((presentSessions.length / attendanceHistory.length) * 100) 
    : 100;

  const assignments = student?.assignments || [];

  const handleOpenGrading = (as: Assignment) => {
    setSelectedAssignment(as);
    setGradeValue(as.grade === '-' ? '' : as.grade);
    setCommentsValue(as.comments || '');
  };

  const handleSaveGrade = async () => {
    if (!selectedAssignment || !onUpdateAssignment || !isTeacherView) return;
    
    setIsSaving(true);
    try {
      await onUpdateAssignment(selectedAssignment.id, {
        grade: gradeValue,
        comments: commentsValue,
        status: 'graded'
      });
      setSelectedAssignment(null);
    } catch (error) {
      console.error('Failed to save grade:', error);
      alert('Failed to save grade. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Directory
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-indigo-600 h-24 md:h-32 relative">
          <div className="absolute -bottom-10 md:-bottom-12 left-6 md:left-8 border-4 border-white rounded-2xl shadow-md overflow-hidden w-20 h-20 md:w-24 md:h-24 bg-white">
            <img src={student.avatar} className="w-full h-full object-cover" alt={student.name} />
          </div>
        </div>
        <div className="pt-14 md:pt-16 pb-6 md:pb-8 px-6 md:px-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{student.name}</h3>
            <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest">{student.grade} • {student.email}</p>
          </div>
          <div className="flex gap-2 justify-center md:justify-end">
            <button 
              onClick={() => setViewMode(viewMode === 'chat' ? 'details' : 'chat')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-sm ${
                viewMode === 'chat' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {viewMode === 'chat' ? 'Close Chat' : 'Message'}
            </button>
            {!isTeacherView && (
              <button 
                onClick={() => setViewMode(viewMode === 'settings' ? 'details' : 'settings')}
                className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-sm ${
                  viewMode === 'settings' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                {viewMode === 'settings' ? 'Close Settings' : 'Settings'}
              </button>
            )}
          </div>
        </div>
      </div>

      {viewMode === 'settings' && !isTeacherView && (
        <ProfileEditor 
          student={student} 
          onUpdate={(updated) => {
            onUpdateStudent?.(updated);
            setViewMode('details');
          }}
          onCancel={() => setViewMode('details')}
        />
      )}

      {viewMode === 'chat' && (
        <ChatSection 
          currentUserId={currentUser.id} 
          onlineUserIds={onlineUserIds}
          socket={socket}
          onClose={() => setViewMode('details')}
        />
      )}

      {viewMode === 'details' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Attendance Rate</p>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{attendanceRate}%</p>
          <div className="mt-4 w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
             <div className="bg-emerald-500 h-full" style={{ width: `${attendanceRate}%` }}></div>
          </div>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Submissions</p>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{assignments.length}</p>
          <p className="text-[10px] font-bold text-amber-600 mt-2 uppercase tracking-widest">
            {assignments.filter(a => a.status === 'submitted').length} Awaiting grading
          </p>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm sm:col-span-2 md:col-span-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Current Rank</p>
          <p className="text-2xl md:text-3xl font-bold text-indigo-600 tracking-tight">Top 10%</p>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Academic Excellence</p>
        </div>
      </div>

      {/* Behavioral & Guardian Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Behavioral Notes */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h4 className="font-bold text-slate-900 uppercase text-[10px] md:text-xs tracking-widest flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-400" /> Behavioral Journal
            </h4>
            <button className="text-slate-900 text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:underline">+ NEW NOTE</button>
          </div>
          <div className="p-6 md:p-8 space-y-4">
            {student.behavioralNotes && student.behavioralNotes.length > 0 ? (
              student.behavioralNotes.map((note, idx) => (
                <div key={idx} className="p-4 md:p-5 bg-slate-50 rounded-xl border border-slate-100 flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <p className="text-xs md:text-sm font-medium text-slate-600 leading-relaxed">{note}</p>
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <p className="text-slate-400 font-medium italic text-sm">No behavioral notes recorded.</p>
              </div>
            )}
          </div>
        </div>

        {/* Parent/Guardian Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
            <h4 className="font-bold text-slate-900 uppercase text-[10px] md:text-xs tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" /> Guardian Information
            </h4>
          </div>
          <div className="p-6 md:p-8 space-y-6 md:space-y-8">
            {student.parentContact ? (
              <>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Primary Contact</p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                      <UserIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <p className="text-sm md:text-base font-bold text-slate-900 leading-none mb-1">{student.parentContact.name}</p>
                      <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">{student.parentContact.relation}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all border border-slate-100">
                      <Phone className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div>
                      <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                      <p className="text-xs md:text-sm font-bold text-slate-900">{student.parentContact.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all border border-slate-100">
                      <Mail className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                      <p className="text-xs md:text-sm font-bold text-slate-900 truncate">{student.parentContact.email}</p>
                    </div>
                  </div>
                </div>

                <button className="w-full py-3.5 md:py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-sm active:scale-95">
                  CONTACT GUARDIAN
                </button>
              </>
            ) : (
              <div className="py-10 text-center">
                <p className="text-slate-400 font-medium italic text-sm">Contact info not available.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assignments Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h4 className="font-bold text-slate-900 uppercase text-[10px] md:text-xs tracking-widest">Academic Portfolio</h4>
            {isTeacherView && <span className="text-[8px] md:text-[10px] font-bold text-slate-400 tracking-widest uppercase">Click to Grade</span>}
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {assignments.length > 0 ? assignments.map(as => (
              <div 
                key={as.id} 
                onClick={() => handleOpenGrading(as)}
                className="p-4 md:p-6 flex items-center justify-between transition-all group cursor-pointer hover:bg-slate-50"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-base md:text-lg border ${
                    as.status === 'graded' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {as.subject === 'Science' ? <Scan className="w-4 h-4 md:w-5 md:h-5" /> : as.subject === 'Math' ? <Calculator className="w-4 h-4 md:w-5 md:h-5" /> : <Book className="w-4 h-4 md:w-5 md:h-5" />}
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-none mb-1">{as.title}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{as.subject} • {new Date(as.date).toLocaleDateString()}</p>
                      {as.comments && <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 text-base md:text-lg leading-none mb-1">{as.grade}</p>
                  <span className={`text-[8px] md:text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    as.status === 'graded' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {as.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="p-10 md:p-20 text-center">
                <p className="text-slate-400 font-medium italic text-sm">No assignments found for this period.</p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 md:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h4 className="font-bold text-slate-900 uppercase text-[9px] md:text-xs tracking-widest">Attendance</h4>
            <div className="flex gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
               <span className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest">Present</span>
               <span className="w-1.5 h-1.5 rounded-full bg-rose-500 ml-1"></span>
               <span className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest">Absent</span>
            </div>
          </div>
          <div className="p-4 md:p-8 space-y-4 flex-1">
            {/* Subject Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {Array.from(new Set(attendanceHistory.map(r => r.subject || 'General'))).map(subj => {
                const records = attendanceHistory.filter(r => (r.subject || 'General') === subj);
                const attended = records.filter(r => r.presentStudentIds.includes(student.id)).length;
                const total = records.length;
                const rate = total > 0 ? Math.round((attended / total) * 100) : 0;
                
                return (
                  <div key={subj} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                       <p className="text-[9px] font-bold text-slate-900 truncate max-w-[120px]">{subj}</p>
                       <p className="text-[9px] font-bold text-indigo-600">{rate}%</p>
                    </div>
                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                       <div className="bg-indigo-600 h-full" style={{ width: `${rate}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              {attendanceHistory.length > 0 ? [...attendanceHistory].reverse().slice(0, 6).map((record, idx) => (
              <div key={idx} className="flex items-center gap-3 md:gap-6 group">
                <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full border-2 border-white shadow-sm ring-2 ${
                  record.presentStudentIds.includes(student.id) ? 'bg-green-500 ring-green-50' : 'bg-rose-500 ring-rose-50'
                }`}></div>
                <div className="flex-1">
                  <p className="text-[10px] md:text-sm font-bold text-slate-700">
                    {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{record.subject || 'General'}</p>
                </div>
                <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest ${
                  record.presentStudentIds.includes(student.id) ? 'text-green-600' : 'text-rose-600'
                }`}>
                  {record.presentStudentIds.includes(student.id) ? 'PRESENT' : 'ABSENT'}
                </span>
              </div>
            )) : (
              <div className="p-10 text-center">
                <p className="text-slate-400 font-medium italic text-sm">No attendance records yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </>
)}
    {/* Assignment Details/Grading Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500 border border-slate-200 max-h-[90vh] flex flex-col">
             <div className="p-6 md:p-10 bg-indigo-600 text-white relative shrink-0">
                <button 
                  onClick={() => setSelectedAssignment(null)}
                  className="absolute top-4 md:top-6 right-4 md:right-6 z-[100] w-10 h-10 md:w-12 md:h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all active:scale-90 border border-white/10"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <div className="flex items-center gap-3 mb-2">
                   <span className="px-2 py-0.5 bg-white/10 rounded text-[9px] md:text-[10px] font-bold uppercase tracking-widest border border-white/10">
                     {isTeacherView ? 'GRADING' : 'ASSIGNMENT INFO'}
                   </span>
                   <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedAssignment.subject}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-1 tracking-tight">{selectedAssignment.title}</h3>
                <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">Student: {student.name}</p>
             </div>
             
             <div className="p-6 md:p-10 space-y-6 md:space-y-8 overflow-y-auto">
                {selectedAssignment.description && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</h4>
                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">{selectedAssignment.description}</p>
                  </div>
                )}
                
                {selectedAssignment.status !== 'pending' && (
                  <div className="space-y-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Student Submission</h4>
                      <div className="p-4 bg-white rounded-lg border border-slate-200 text-xs md:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                        {selectedAssignment.submissionText || "No text submission provided."}
                      </div>
                    </div>
                    
                    {selectedAssignment.submissionFile && (
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Attached File</h4>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                          <FileText className="w-5 h-5 text-slate-400" />
                          <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold text-slate-900 truncate">{selectedAssignment.submissionFile}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Student Uploaded File</p>
                          </div>
                          <a 
                            href={selectedAssignment.submissionFile}
                            download
                            className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[8px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all border border-slate-200"
                          >
                            DOWNLOAD
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Total Marks (0-100)</label>
                   <div className="flex gap-4">
                      <input 
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={gradeValue}
                        onKeyDown={(e) => {
                          if (!/[0-9]/.test(e.key) && !['Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || (Number(val) >= 0 && Number(val) <= 100)) {
                            setGradeValue(val);
                          }
                        }}
                        readOnly={!isTeacherView}
                        placeholder={isTeacherView ? "0-100" : "Not graded yet"}
                        className={`flex-1 px-4 md:px-6 py-3 md:py-4 border rounded-xl text-base md:text-lg font-bold transition-all focus:outline-none ${
                          isTeacherView 
                            ? 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-900/10 focus:border-indigo-600' 
                            : 'bg-slate-100 border-transparent text-slate-500'
                        }`}
                      />
                      <div className={`w-16 md:w-20 rounded-xl flex items-center justify-center border transition-colors ${
                        isTeacherView ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-slate-100 border-transparent text-slate-300'
                      }`}>
                        <Target className="w-6 h-6 md:w-8 md:h-8" />
                      </div>
                   </div>
                </div>

                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Teacher Feedback</label>
                   <textarea 
                     value={commentsValue}
                     onChange={(e) => setCommentsValue(e.target.value)}
                     readOnly={!isTeacherView}
                     placeholder={isTeacherView ? "Add constructive feedback..." : "No feedback provided yet."}
                     className={`w-full h-24 md:h-32 px-4 md:px-6 py-3 md:py-4 border rounded-xl text-xs md:text-sm font-medium leading-relaxed resize-none transition-all focus:outline-none ${
                       isTeacherView 
                         ? 'bg-slate-50 border-slate-200 text-slate-700 focus:ring-2 focus:ring-indigo-900/10 focus:border-indigo-600' 
                         : 'bg-slate-100 border-transparent text-slate-500'
                     }`}
                   ></textarea>
                </div>

                {isTeacherView ? (
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setSelectedAssignment(null)}
                      className="flex-1 py-3 md:py-4 bg-slate-50 text-slate-400 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200"
                    >
                      CANCEL
                    </button>
                    <button 
                      onClick={handleSaveGrade}
                      disabled={isSaving || !gradeValue.trim()}
                      className={`flex-[2] py-3 md:py-4 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-sm transition-all active:scale-95 ${
                        isSaving || !gradeValue.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
                      }`}
                    >
                      {isSaving ? 'SAVING...' : 'PUBLISH GRADE'}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setSelectedAssignment(null)}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm"
                  >
                    CLOSE VIEW
                  </button>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetails;
