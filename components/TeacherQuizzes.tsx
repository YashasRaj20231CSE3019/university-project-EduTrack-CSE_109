import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Users, ChevronRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { QuizMaker } from './QuizMaker';

export const TeacherQuizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    loadQuizzes();
  }, [isCreating]);

  const loadQuizzes = () => {
    const savedQuizzes = JSON.parse(localStorage.getItem('edutrack_quizzes') || '[]');
    // Mock quiz data for demonstration
    const MOCK_QUIZ = {
      id: 'q1',
      title: 'Algebraic Equations Review',
      subject: 'Math',
      questions: [
        { id: '1', text: 'Solve for x: 2x + 5 = 15', type: 'multiple-choice', options: ['x = 5', 'x = 10', 'x = 20', 'x = 2.5'], correctAnswer: 'x = 5' },
        { id: '2', text: 'What is the value of y in the equation 3y - 7 = 14?', type: 'multiple-choice', options: ['y = 7', 'y = 21', 'y = -7', 'y = 3'], correctAnswer: 'y = 7' },
        { id: '3', text: 'Explain the difference between an expression and an equation.', type: 'short-answer' }
      ]
    };
    setQuizzes([MOCK_QUIZ, ...savedQuizzes]);
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
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col h-full"
          >
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
    </div>
  );
};
