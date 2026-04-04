import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Users, ChevronRight, ArrowLeft, CheckCircle2, Trash2, AlertTriangle, X } from 'lucide-react';
import { QuizMaker } from './QuizMaker';
import { quizService } from '../services/quizService';

export const TeacherQuizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, [isCreating]);

  const loadQuizzes = () => {
    setQuizzes(quizService.getQuizzes());
  };

  const loadSubmissions = (quizId: string) => {
    const allSubmissions = JSON.parse(localStorage.getItem('edutrack_quiz_submissions') || '[]');
    setSubmissions(allSubmissions.filter((sub: any) => sub.quizId === quizId));
  };

  const handleSelectQuiz = (quiz: any) => {
    setSelectedQuiz(quiz);
    loadSubmissions(quiz.id);
  };

  const handleUpdateScore = (submissionId: string, newScore: number) => {
    const allSubmissions = JSON.parse(localStorage.getItem('edutrack_quiz_submissions') || '[]');
    const updatedSubmissions = allSubmissions.map((sub: any) => 
      sub.id === submissionId ? { ...sub, score: newScore } : sub
    );
    localStorage.setItem('edutrack_quiz_submissions', JSON.stringify(updatedSubmissions));
    setSubmissions(updatedSubmissions.filter((sub: any) => sub.quizId === selectedQuiz.id));
  };

  const handleDeleteQuiz = (e: React.MouseEvent, quizId: string) => {
    e.stopPropagation(); // Prevent opening the quiz
    setQuizToDelete(quizId);
  };

  const confirmDelete = () => {
    if (quizToDelete) {
      quizService.deleteQuiz(quizToDelete);
      setQuizToDelete(null);
      loadQuizzes();
    }
  };

  if (isCreating) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setIsCreating(false)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Quizzes
        </button>
        <QuizMaker onSave={() => setIsCreating(false)} />
      </div>
    );
  }

  if (selectedQuiz) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => setSelectedQuiz(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Quizzes
        </button>

        <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm">
          <div className="mb-8 pb-8 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                {selectedQuiz.subject}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {selectedQuiz.questions?.length || 0} Questions
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900">{selectedQuiz.title}</h1>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" /> Student Responses ({submissions.length})
            </h2>

            {submissions.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <p className="text-slate-500 font-medium">No students have submitted this quiz yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                          {sub.studentName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{sub.studentName}</h3>
                          <p className="text-xs text-slate-500">Submitted on {new Date(sub.submittedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-sm font-bold text-slate-700">Score (%)</p>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            min="0" 
                            max="100"
                            value={sub.score || 0}
                            onChange={(e) => handleUpdateScore(sub.id, parseInt(e.target.value) || 0)}
                            className="w-20 px-3 py-1 text-xl font-black text-indigo-600 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-slate-100">
                      {selectedQuiz.questions.map((q: any, qIdx: number) => (
                        <div key={q.id} className="bg-slate-50 p-4 rounded-xl">
                          <p className="font-bold text-slate-800 mb-2">{qIdx + 1}. {q.text}</p>
                          <div className="flex items-start gap-2">
                            <span className="text-sm font-bold text-slate-500 mt-0.5">Answer:</span>
                            <p className={`text-sm font-medium ${
                              q.type === 'multiple-choice' 
                                ? (sub.answers[q.id] === q.correctAnswer ? 'text-green-600' : 'text-rose-600')
                                : 'text-slate-700'
                            }`}>
                              {sub.answers[q.id] || 'No answer provided'}
                            </p>
                          </div>
                          {q.type === 'multiple-choice' && sub.answers[q.id] !== q.correctAnswer && (
                            <p className="text-xs text-green-600 mt-1 font-medium">Correct answer: {q.correctAnswer}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Quizzes</h2>
          <p className="text-sm font-medium text-slate-500">Manage and review student quizzes</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          <Plus className="w-4 h-4" /> Create New Quiz
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div 
            key={quiz.id} 
            onClick={() => handleSelectQuiz(quiz)}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col h-full relative"
          >
            <button 
              onClick={(e) => handleDeleteQuiz(e, quiz.id)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              title="Delete Quiz"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{quiz.title}</h3>
            <div className="flex items-center gap-3 mt-auto pt-4">
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                {quiz.subject}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {quiz.questions?.length || 0} Questions
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {quizToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle className="w-8 h-8 text-rose-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 text-center mb-2">Delete Quiz?</h3>
            <p className="text-slate-500 text-center mb-8 font-medium">
              This action cannot be undone. All student submissions for this quiz will also be permanently deleted.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setQuizToDelete(null)}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
