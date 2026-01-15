
import React, { useState } from 'react';
import { Student, Assignment } from '../types';

interface AssignmentsViewProps {
  student: Student;
  onUpdateAssignment: (assignmentId: string, updates: Partial<Assignment>) => void;
}

const AssignmentsView: React.FC<AssignmentsViewProps> = ({ student, onUpdateAssignment }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [search, setSearch] = useState('');
  const [submissionMode, setSubmissionMode] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredAssignments = student.assignments.filter(as => {
    const matchesFilter = filter === 'all' || as.status === filter;
    const matchesSearch = as.title.toLowerCase().includes(search.toLowerCase()) || 
                          as.subject.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: student.assignments.length,
    pending: student.assignments.filter(a => a.status === 'pending').length,
    completed: student.assignments.filter(a => a.status !== 'pending').length,
  };

  const handleOpenAssignment = (as: Assignment) => {
    setSelectedAssignment(as);
    setSubmissionMode(false);
    setSubmissionText('');
  };

  const handleSubmitWork = () => {
    if (!selectedAssignment) return;
    
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      onUpdateAssignment(selectedAssignment.id, {
        status: 'submitted',
        date: new Date().toISOString()
      });
      setIsSubmitting(false);
      setSubmissionMode(false);
      setSelectedAssignment(null);
      alert('Assignment submitted successfully!');
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl">📚</div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Issued</p>
            <p className="text-2xl font-black text-slate-800">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl">⏳</div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Required</p>
            <p className="text-2xl font-black text-slate-800">{stats.pending}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl">✅</div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</p>
            <p className="text-2xl font-black text-slate-800">{stats.completed}</p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-8 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6 bg-slate-50/30">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-full lg:w-auto overflow-hidden">
            {(['all', 'pending', 'submitted', 'graded'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  filter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-96 group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search assignments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none text-sm transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredAssignments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
              {filteredAssignments.map((as) => (
                <div
                  key={as.id}
                  onClick={() => handleOpenAssignment(as)}
                  className="group bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-50 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-2 h-full ${
                    as.status === 'graded' ? 'bg-emerald-500' : as.status === 'submitted' ? 'bg-indigo-500' : 'bg-amber-500'
                  }`}></div>
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${
                      as.subject === 'Science' ? 'bg-emerald-50 text-emerald-600' : 
                      as.subject === 'Math' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                      <span className="text-2xl">{as.subject === 'Science' ? '🧪' : as.subject === 'Math' ? '📐' : '📝'}</span>
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                      as.status === 'graded' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                      as.status === 'submitted' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 
                      'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {as.status}
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{as.title}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">{as.subject}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase">{as.status === 'pending' ? 'Due Date' : 'Update Date'}</span>
                      <span className="text-xs font-bold text-slate-600">{new Date(as.date).toLocaleDateString()}</span>
                    </div>
                    {as.status === 'graded' && (
                      <div className="text-right">
                        <span className="text-[10px] font-black text-slate-400 uppercase block">Grade</span>
                        <span className="text-xl font-black text-indigo-600">{as.grade}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center px-10">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-4xl mb-6 shadow-inner">📚</div>
              <h4 className="text-2xl font-black text-slate-800 mb-2">No assignments found</h4>
              <p className="text-slate-500 font-medium max-w-xs">Try changing your filters or search term.</p>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Modal with Submission Support */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
            <div className={`p-10 ${selectedAssignment.subject === 'Science' ? 'bg-emerald-600' : 'bg-indigo-600'} text-white relative`}>
               <button 
                onClick={() => {
                  setSelectedAssignment(null);
                  setSubmissionMode(false);
                }}
                className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center font-bold text-xl transition-all"
               >
                 ×
               </button>
               <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-2">{selectedAssignment.subject}</p>
               <h3 className="text-3xl font-black mb-4">{selectedAssignment.title}</h3>
               <div className="flex gap-4">
                  <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20">
                     <p className="text-[10px] font-black uppercase opacity-60">Status</p>
                     <p className="text-sm font-bold uppercase">{selectedAssignment.status}</p>
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20">
                     <p className="text-[10px] font-black uppercase opacity-60">Due Date</p>
                     <p className="text-sm font-bold">{new Date(selectedAssignment.date).toLocaleDateString()}</p>
                  </div>
               </div>
            </div>

            <div className="p-10 space-y-8">
               {submissionMode ? (
                 <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Your Submission</h4>
                      <textarea
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        placeholder="Paste your project link or type your response here..."
                        className="w-full h-48 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all resize-none leading-relaxed"
                      />
                    </div>
                    
                    <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <span className="text-xl">📎</span>
                         <span className="text-xs font-bold text-indigo-700">Optional: Attachment Simulation</span>
                       </div>
                       <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">UPLOAD FILE</button>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => setSubmissionMode(false)}
                        className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                      >
                        BACK
                      </button>
                      <button 
                        onClick={handleSubmitWork}
                        disabled={isSubmitting || !submissionText.trim()}
                        className={`flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 active:scale-95 ${
                          isSubmitting || !submissionText.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700 hover:shadow-indigo-200'
                        }`}
                      >
                        {isSubmitting ? 'SUBMITTING...' : 'CONFIRM SUBMISSION'}
                      </button>
                    </div>
                 </div>
               ) : (
                 <>
                   <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Task Description</h4>
                      <p className="text-slate-600 leading-relaxed font-medium">
                        {selectedAssignment.description || "Review the chapters covered in class and provide a detailed analysis of the practical application of the concepts discussed. Use diagrams where necessary."}
                      </p>
                   </div>
                   
                   <div className="flex gap-4">
                      {selectedAssignment.status === 'pending' ? (
                        <button 
                          onClick={() => setSubmissionMode(true)}
                          className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 transition-all active:scale-95"
                        >
                          SUBMIT WORK
                        </button>
                      ) : (
                        <button 
                          onClick={() => setSubmissionMode(true)}
                          className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
                        >
                          RESUBMIT WORK
                        </button>
                      )}
                      <button className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
                        VIEW COMMENTS
                      </button>
                   </div>
                 </>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsView;
