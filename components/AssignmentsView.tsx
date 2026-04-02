
import React, { useState } from 'react';
import { Student, Assignment } from '../types';
import FileUpload from './FileUpload';
import { apiService } from '../services/apiService';
import { BookOpen, Hourglass, CheckCircle2, Search, FlaskConical, Calculator, FileText, X, File } from 'lucide-react';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assignments = student?.assignments || [];

  const filteredAssignments = assignments.filter(as => {
    const matchesFilter = filter === 'all' || as.status === filter;
    const matchesSearch = as.title.toLowerCase().includes(search.toLowerCase()) || 
                          as.subject.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    completed: assignments.filter(a => a.status !== 'pending').length,
  };

  const handleOpenAssignment = (as: Assignment) => {
    setSelectedAssignment(as);
    setSubmissionMode(false);
    setSubmissionText('');
    setSelectedFile(null);
  };

  const handleSubmitWork = async () => {
    if (!selectedAssignment) return;
    
    setIsSubmitting(true);
    try {
      let submissionFileUrl = undefined;
      let submissionFileName = undefined;

      if (selectedFile) {
        const uploadRes = await apiService.uploadFile(selectedFile);
        submissionFileUrl = uploadRes.url;
        submissionFileName = uploadRes.filename;
      }

      onUpdateAssignment(selectedAssignment.id, {
        status: 'submitted',
        date: new Date().toISOString(),
        submissionText: submissionText,
        submissionFile: submissionFileUrl || submissionFileName // Use URL if available
      });

      setIsSubmitting(false);
      setSubmissionMode(false);
      setSelectedAssignment(null);
      setSelectedFile(null);
      setSubmissionText('');
      alert('Assignment submitted successfully!');
    } catch (error) {
      console.error('Error submitting work:', error);
      alert('Failed to submit assignment. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><BookOpen className="w-5 h-5 md:w-6 md:h-6" /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Issued</p>
            <p className="text-xl md:text-2xl font-black text-slate-800">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center"><Hourglass className="w-5 h-5 md:w-6 md:h-6" /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Required</p>
            <p className="text-xl md:text-2xl font-black text-slate-800">{stats.pending}</p>
          </div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4 sm:col-span-2 md:col-span-1">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</p>
            <p className="text-xl md:text-2xl font-black text-slate-800">{stats.completed}</p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px] md:min-h-[600px] flex flex-col">
        <div className="p-4 md:p-8 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6 bg-slate-50/30">
          <div className="flex flex-wrap bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-full lg:w-auto overflow-hidden">
            {(['all', 'pending', 'submitted', 'graded'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 lg:flex-none px-3 md:px-6 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all ${
                  filter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-8">
              {filteredAssignments.map((as) => (
                <div
                  key={as.id}
                  onClick={() => handleOpenAssignment(as)}
                  className="group bg-white p-4 md:p-6 rounded-[2rem] border border-slate-100 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-50 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-1.5 md:w-2 h-full ${
                    as.status === 'graded' ? 'bg-emerald-500' : as.status === 'submitted' ? 'bg-indigo-500' : 'bg-amber-500'
                  }`}></div>
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl ${
                      as.subject === 'Science' ? 'bg-emerald-50 text-emerald-600' : 
                      as.subject === 'Math' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                      {as.subject === 'Science' ? <FlaskConical className="w-5 h-5 md:w-6 md:h-6" /> : as.subject === 'Math' ? <Calculator className="w-5 h-5 md:w-6 md:h-6" /> : <FileText className="w-5 h-5 md:w-6 md:h-6" />}
                    </div>
                    <span className={`text-[8px] md:text-[10px] font-black px-2 md:px-3 py-1 rounded-full uppercase tracking-widest ${
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
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner"><BookOpen className="w-10 h-10 text-slate-400" /></div>
              <h4 className="text-2xl font-black text-slate-800 mb-2">No assignments found</h4>
              <p className="text-slate-500 font-medium max-w-xs">Try changing your filters or search term.</p>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Modal with Submission Support */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500 max-h-[90vh] flex flex-col">
            <div className={`p-6 md:p-10 ${selectedAssignment.subject === 'Science' ? 'bg-emerald-600' : 'bg-indigo-600'} text-white relative shrink-0`}>
               <button 
                onClick={() => {
                  setSelectedAssignment(null);
                  setSubmissionMode(false);
                }}
                className="absolute top-4 md:top-6 right-4 md:right-6 z-[100] w-10 h-10 md:w-12 md:h-12 bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-xl hover:bg-slate-50 transition-all active:scale-90"
                aria-label="Close assignment"
               >
                 <X className="w-6 h-6 md:w-8 md:h-8" />
               </button>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">{selectedAssignment.subject}</p>
               <h3 className="text-xl md:text-3xl font-black mb-4">{selectedAssignment.title}</h3>
               <div className="flex gap-2 md:gap-4">
                  <div className="bg-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-white/20">
                     <p className="text-[8px] md:text-[10px] font-black uppercase opacity-60">Status</p>
                     <p className="text-[10px] md:text-sm font-bold uppercase">{selectedAssignment.status}</p>
                  </div>
                  <div className="bg-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-white/20">
                     <p className="text-[8px] md:text-[10px] font-black uppercase opacity-60">Due Date</p>
                     <p className="text-[10px] md:text-sm font-bold">{new Date(selectedAssignment.date).toLocaleDateString()}</p>
                  </div>
               </div>
            </div>

            <div className="p-6 md:p-10 space-y-6 md:space-y-8 overflow-y-auto">
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
                    
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Supporting Documents</h4>
                      <FileUpload onFileSelect={setSelectedFile} />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => setSubmissionMode(false)}
                        className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                      >
                        BACK
                      </button>
                      <button 
                        onClick={handleSubmitWork}
                        disabled={isSubmitting || (!submissionText.trim() && !selectedFile)}
                        className={`flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 active:scale-95 ${
                          isSubmitting || (!submissionText.trim() && !selectedFile) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700 hover:shadow-indigo-200'
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
                      <p className="text-slate-600 leading-relaxed font-medium mb-8">
                        {selectedAssignment.description || "Review the chapters covered in class and provide a detailed analysis of the practical application of the concepts discussed. Use diagrams where necessary."}
                      </p>

                      {selectedAssignment.status !== 'pending' && (
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4 mb-8">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Submission</h4>
                          <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-600 whitespace-pre-wrap">
                            {selectedAssignment.submissionText || "No text provided."}
                          </div>
                          {selectedAssignment.submissionFile && (
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                              <File className="w-5 h-5 text-slate-400" />
                              <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-black text-slate-800 truncate">{selectedAssignment.submissionFile.split('/').pop()}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase">Uploaded File</p>
                              </div>
                              <a 
                                onClick={(e) => e.stopPropagation()}
                                href={selectedAssignment.submissionFile}
                                download
                                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[8px] font-black uppercase hover:bg-indigo-100 transition-all flex items-center justify-center"
                              >
                                DOWNLOAD
                              </a>
                            </div>
                          )}
                        </div>
                      )}
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
