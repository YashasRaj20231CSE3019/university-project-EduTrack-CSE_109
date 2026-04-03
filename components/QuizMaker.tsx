import React, { useState } from 'react';
import { Plus, Trash2, Save, CheckCircle2, X } from 'lucide-react';

export const QuizMaker: React.FC = () => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [questions, setQuestions] = useState([
    { id: '1', text: '', type: 'multiple-choice', options: ['', ''], correctAnswer: '' }
  ]);
  const [saved, setSaved] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now().toString(), text: '', type: 'multiple-choice', options: ['', ''], correctAnswer: '' }]);
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        return { ...q, options: [...q.options, ''] };
      }
      return q;
    }));
  };

  const updateOption = (questionId: string, index: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[index] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const removeOption = (questionId: string, index: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = q.options.filter((_, i) => i !== index);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSave = () => {
    // In a real app, save to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Create New Quiz</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Quiz Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Algebraic Equations Review"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:outline-none text-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Subject</label>
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Math"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:outline-none text-sm transition-all"
            />
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((q, index) => (
            <div key={q.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group">
              <button 
                onClick={() => removeQuestion(q.id)}
                className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4 mb-4">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {index + 1}
                </span>
                <input 
                  type="text" 
                  value={q.text}
                  onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                  placeholder="Question text"
                  className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:outline-none text-sm transition-all"
                />
                <select 
                  value={q.type}
                  onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:outline-none text-sm transition-all"
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="short-answer">Short Answer</option>
                </select>
              </div>

              {q.type === 'multiple-choice' && (
                <div className="ml-12 space-y-3">
                  {q.options?.map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name={`correct-${q.id}`} 
                        checked={q.correctAnswer === opt && opt !== ''}
                        onChange={() => updateQuestion(q.id, 'correctAnswer', opt)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <input 
                        type="text" 
                        value={opt}
                        onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                        placeholder={`Option ${optIndex + 1}`}
                        className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:outline-none text-sm transition-all"
                      />
                      {q.options!.length > 2 && (
                        <button 
                          onClick={() => removeOption(q.id, optIndex)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    onClick={() => addOption(q.id)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-2"
                  >
                    <Plus className="w-3 h-3" /> Add Option
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button 
            onClick={addQuestion}
            className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
          
          <button 
            onClick={handleSave}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200"
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
};
