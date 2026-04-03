import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';

// Mock quiz data for demonstration
const MOCK_QUIZ = {
  id: 'q1',
  title: 'Algebraic Equations Review',
  subject: 'Math',
  questions: [
    {
      id: '1',
      text: 'Solve for x: 2x + 5 = 15',
      type: 'multiple-choice',
      options: ['x = 5', 'x = 10', 'x = 20', 'x = 2.5'],
      correctAnswer: 'x = 5'
    },
    {
      id: '2',
      text: 'What is the value of y in the equation 3y - 7 = 14?',
      type: 'multiple-choice',
      options: ['y = 7', 'y = 21', 'y = -7', 'y = 3'],
      correctAnswer: 'y = 7'
    },
    {
      id: '3',
      text: 'Explain the difference between an expression and an equation.',
      type: 'short-answer'
    }
  ]
};

export const QuizTaker: React.FC = () => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = () => {
    // Calculate score for multiple choice questions
    let correct = 0;
    let totalMC = 0;
    
    MOCK_QUIZ.questions.forEach(q => {
      if (q.type === 'multiple-choice') {
        totalMC++;
        if (answers[q.id] === q.correctAnswer) {
          correct++;
        }
      }
    });

    setScore(totalMC > 0 ? Math.round((correct / totalMC) * 100) : null);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Quiz Submitted!</h2>
          <p className="text-slate-500 font-medium mb-8">Your answers have been recorded successfully.</p>
          
          {score !== null && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 inline-block min-w-[200px]">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Auto-Graded Score</p>
              <p className="text-4xl font-black text-indigo-600">{score}%</p>
              <p className="text-xs text-slate-500 mt-2">Short answers pending review</p>
            </div>
          )}
          
          <div>
            <button 
              onClick={() => window.history.back()}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm">
        <div className="mb-8 pb-8 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase tracking-widest">
              {MOCK_QUIZ.subject}
            </span>
            <span className="text-xs font-bold text-slate-400">
              {MOCK_QUIZ.questions.length} Questions
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900">{MOCK_QUIZ.title}</h1>
        </div>

        <div className="space-y-10">
          {MOCK_QUIZ.questions.map((q, index) => (
            <div key={q.id} className="space-y-4">
              <div className="flex gap-4">
                <span className="text-lg font-black text-indigo-300">{index + 1}.</span>
                <h3 className="text-lg font-bold text-slate-800 pt-0.5">{q.text}</h3>
              </div>
              
              <div className="pl-8">
                {q.type === 'multiple-choice' ? (
                  <div className="space-y-3">
                    {q.options?.map((opt, optIndex) => (
                      <label 
                        key={optIndex} 
                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                          answers[q.id] === opt 
                            ? 'border-indigo-600 bg-indigo-50/50' 
                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          answers[q.id] === opt ? 'border-indigo-600' : 'border-slate-300'
                        }`}>
                          {answers[q.id] === opt && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>}
                        </div>
                        <span className={`font-medium ${answers[q.id] === opt ? 'text-indigo-900' : 'text-slate-700'}`}>
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea 
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:outline-none text-sm transition-all resize-none"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-bold">You cannot change answers after submitting.</span>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < MOCK_QUIZ.questions.length}
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Submit Quiz <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
