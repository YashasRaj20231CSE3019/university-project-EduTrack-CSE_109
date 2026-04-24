
import React, { useState, useMemo } from 'react';
import { Student, Assignment } from '../types';
import { Search, ChevronRight, FileText, CheckCircle2, Clock, Target, X, Calculator, Scan, Book } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GradingCentreProps {
  students: Student[];
  onUpdateAssignment: (assignmentId: string, updates: Partial<Assignment>) => Promise<void>;
}

const GradingCentre: React.FC<GradingCentreProps> = ({ students, onUpdateAssignment }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [gradeValue, setGradeValue] = useState('');
  const [commentsValue, setCommentsValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    }).sort((a, b) => {
      const aSub = a.assignments.filter(as => as.status === 'submitted').length;
      const bSub = b.assignments.filter(as => as.status === 'submitted').length;
      return bSub - aSub;
    });
  }, [students, searchTerm]);

  const handleOpenGrading = (student: Student, assignment: Assignment) => {
    setSelectedStudent(student);
    setSelectedAssignment(assignment);
    setGradeValue(assignment.grade === '-' ? '' : assignment.grade);
    setCommentsValue(assignment.comments || '');
  };

  const handleSaveGrade = async () => {
    if (!selectedAssignment || !selectedStudent) return;
    
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
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">Grading Centre</h2>
            <p className="text-slate-500 text-sm font-medium">Review and evaluate student submissions.</p>
          </div>
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Filter students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] md:text-xs font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Students with Submissions</h3>
          {filteredStudents.length > 0 ? (
            filteredStudents.map((s, idx) => {
              const submittedCount = s.assignments.filter(as => as.status === 'submitted').length;
              return (
                <motion.div 
                  key={s.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedStudent(s)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between ${
                    selectedStudent?.id === s.id 
                      ? 'bg-orange-500 border-orange-500 text-white shadow-lg ring-4 ring-orange-100' 
                      : 'bg-white border-slate-200 hover:border-orange-500 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                    <img src={s.avatar} className="w-8 h-8 md:w-10 md:h-10 rounded-xl object-cover border-2 border-white/50 shrink-0" alt={s.name} />
                    <div className="overflow-hidden">
                      <h4 className={`text-xs md:text-sm font-bold tracking-tight truncate ${selectedStudent?.id === s.id ? 'text-white' : 'text-slate-900'}`}>{s.name}</h4>
                      <p className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest truncate ${selectedStudent?.id === s.id ? 'text-white/70' : 'text-slate-400'}`}>
                        {s.grade} • {submittedCount} Pending
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${selectedStudent?.id === s.id ? 'text-white' : 'text-slate-300'}`} />
                </motion.div>
              );
            })
          ) : (
            <div className="p-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 font-medium italic">No pending submissions found.</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Assignments to Review</h3>
          <AnimatePresence mode="wait">
            {selectedStudent ? (
              <motion.div 
                key={selectedStudent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {selectedStudent.assignments
                  .filter(as => as.status === 'submitted')
                  .map((as, idx) => (
                    <motion.div 
                      key={as.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => handleOpenGrading(selectedStudent, as)}
                      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-orange-500 transition-all cursor-pointer group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 border border-orange-100">
                          {as.subject === 'Science' ? <Scan className="w-5 h-5" /> : as.subject === 'Math' ? <Calculator className="w-5 h-5" /> : <Book className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{as.title}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{as.subject} • Submitted {new Date(as.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase rounded-lg border border-amber-100">
                        Pending
                      </span>
                    </motion.div>
                  ))
                }
                {selectedStudent.assignments.filter(as => as.status === 'submitted').length === 0 && (
                  <div className="p-12 bg-orange-50/50 rounded-3xl border border-dashed border-orange-200 text-center">
                    <CheckCircle2 className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                    <p className="text-orange-600 font-bold uppercase text-[10px] tracking-widest">All caught up!</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="p-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 font-medium italic">Select a student on the left to view their submissions.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Grading Modal */}
      {selectedAssignment && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500 border border-slate-200 max-h-[90vh] flex flex-col">
             <div className="p-6 md:p-10 bg-orange-500 text-white relative shrink-0">
                <button 
                  onClick={() => setSelectedAssignment(null)}
                  className="absolute top-4 md:top-6 right-4 md:right-6 w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 mb-2">
                   <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold uppercase tracking-widest border border-white/20">Evaluation</span>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-orange-200">{selectedAssignment.subject}</span>
                </div>
                <h3 className="text-2xl font-black mb-1">{selectedAssignment.title}</h3>
                <p className="text-orange-100 text-xs font-bold uppercase tracking-widest">Reviewing: {selectedStudent.name}</p>
             </div>
             
             <div className="p-8 md:p-10 space-y-8 overflow-y-auto">
                {selectedAssignment.submissionText && (
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Submission Text</h4>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                      {selectedAssignment.submissionText}
                    </div>
                  </div>
                )}
                
                {selectedAssignment.submissionFile && (
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Attached Document</h4>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                      <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-slate-900 truncate">{selectedAssignment.submissionFile}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Download to review full work</p>
                      </div>
                      <a 
                        href={selectedAssignment.submissionFile}
                        download
                        className="px-4 py-2 bg-orange-500 text-white text-[10px] font-black rounded-lg uppercase tracking-widest hover:bg-orange-600 transition-all shadow-sm"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Final Marks</label>
                    <div className="relative">
                      <input 
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={gradeValue}
                        onKeyDown={(e) => {
                          // Prevent non-numeric characters except backspace, tab, enter, arrows
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
                        autoFocus
                        placeholder="0-100"
                        className="w-full pl-6 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-black text-slate-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:outline-none transition-all"
                      />
                      <Target className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Teacher Feedback</label>
                    <textarea 
                      value={commentsValue}
                      onChange={(e) => setCommentsValue(e.target.value)}
                      placeholder="Add constructive feedback..."
                      className="w-full h-full min-h-[100px] px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:outline-none transition-all resize-none leading-relaxed"
                    ></textarea>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setSelectedAssignment(null)}
                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
                  >
                    Discard
                  </button>
                  <button 
                    onClick={handleSaveGrade}
                    disabled={isSaving || !gradeValue}
                    className={`flex-[2] py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-500/30 transition-all active:scale-95 ${
                      isSaving || !gradeValue ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-700 hover:-translate-y-1'
                    }`}
                  >
                    {isSaving ? 'Synchronizing...' : 'Submit Evaluation'}
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradingCentre;
