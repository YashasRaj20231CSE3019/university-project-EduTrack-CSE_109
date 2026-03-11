
import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { Activity, Student } from '../types';
import { explainLesson, explainCurriculum } from '../services/aiService';

interface LessonPlannerProps {
  student: Student;
  activities: Activity[];
}

const LessonPlanner: React.FC<LessonPlannerProps> = ({ student, activities }) => {
  const [explainingId, setExplainingId] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Curriculum Assistant State
  const [curriculumQuery, setCurriculumQuery] = useState('');
  const [isAskingCurriculum, setIsAskingCurriculum] = useState(false);
  const [curriculumResponse, setCurriculumResponse] = useState<string | null>(null);

  const handleExplain = async (act: Activity) => {
    setExplainingId(act.id);
    const text = await explainLesson(act.title, act.description, act.learningObjectives);
    setExplanation(text);
    setExplainingId(null);
    setShowModal(true);
  };

  const handleAskCurriculum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curriculumQuery.trim()) return;

    setIsAskingCurriculum(true);
    const text = await explainCurriculum('General Curriculum', student.grade, curriculumQuery);
    setCurriculumResponse(text);
    setIsAskingCurriculum(false);
  };

  const plannedActivities = activities.filter(a => a.status === 'planned');
  const completedActivities = activities.filter(a => a.status === 'completed');

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-emerald-600 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-emerald-200">
        <div className="relative z-10 text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-extrabold mb-4 leading-tight">Curriculum Assistant 📖</h1>
          <p className="text-emerald-100 text-sm md:text-lg max-w-2xl">Stay ahead of your studies by reviewing upcoming lessons and using our AI assistant to understand your syllabus better.</p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      </div>

      {/* Curriculum AI Assistant Section */}
      <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-emerald-100 shadow-xl shadow-emerald-50/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-200">✨</div>
            <div>
              <h3 className="text-2xl font-black text-slate-800">Syllabus Explainer</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Powered by Gemini AI</p>
            </div>
          </div>

          <form onSubmit={handleAskCurriculum} className="space-y-6">
            <div className="relative">
              <textarea
                value={curriculumQuery}
                onChange={(e) => setCurriculumQuery(e.target.value)}
                placeholder="Ask anything about your syllabus... (e.g., 'What will I learn in Science this term?' or 'Explain the key concepts of Algebra for my grade.')"
                className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-slate-700 font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none transition-all min-h-[120px] resize-none"
              />
              <button
                type="submit"
                disabled={isAskingCurriculum || !curriculumQuery.trim()}
                className="absolute bottom-4 right-4 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {isAskingCurriculum ? 'Thinking...' : 'Ask Assistant'}
              </button>
            </div>
          </form>

          {curriculumResponse && (
            <div className="mt-10 p-8 bg-emerald-50/50 rounded-[2.5rem] border border-emerald-100 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-black text-emerald-800 uppercase tracking-widest">AI Explanation</h4>
                <button 
                  onClick={() => setCurriculumResponse(null)}
                  className="text-emerald-600 hover:text-emerald-800 font-bold text-xs uppercase tracking-widest"
                >
                  Clear
                </button>
              </div>
              <div className="prose prose-emerald max-w-none">
                <div className="markdown-body text-slate-700 leading-relaxed">
                  <Markdown>{curriculumResponse}</Markdown>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-2xl font-black text-slate-800">Upcoming Lessons</h3>
            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">
              {plannedActivities.length} PLANNED
            </span>
          </div>

          <div className="space-y-6">
            {plannedActivities.map((act) => (
              <div key={act.id} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 group">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl">
                        {act.subject === 'Science' ? '🧪' : act.subject === 'Math' ? '📐' : '📖'}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{act.subject}</p>
                        <p className="text-xs font-bold text-slate-600">{act.duration}</p>
                      </div>
                    </div>
                    <h4 className="text-xl md:text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors mb-3">{act.title}</h4>
                    <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed mb-6">{act.description}</p>
                    
                    <button 
                      onClick={() => handleExplain(act)}
                      disabled={explainingId === act.id}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all disabled:opacity-50"
                    >
                      {explainingId === act.id ? (
                        <>
                          <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                          Thinking...
                        </>
                      ) : (
                        <>
                          <span>✨</span> Explain with AI
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-5 md:p-6 bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 grid md:grid-cols-2 gap-6 md:gap-8">
                  <div>
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">What you'll learn</h5>
                    <ul className="space-y-2">
                      {act.learningObjectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-indigo-500 font-bold">•</span>
                          <span className="text-[10px] md:text-xs font-bold text-slate-700">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Preparation</h5>
                    <div className="flex flex-wrap gap-2">
                      {act.materials.map((mat, i) => (
                        <span key={i} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-[8px] md:text-[10px] font-black rounded-lg uppercase">
                          {mat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {plannedActivities.length === 0 && (
              <div className="py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                <p className="text-slate-400 font-bold uppercase tracking-widest">No upcoming lessons scheduled yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span>✅</span> Recently Covered
            </h3>
            <div className="space-y-4">
              {completedActivities.slice(0, 5).map(act => (
                <div key={act.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-lg">
                    {act.subject === 'Science' ? '🧪' : act.subject === 'Math' ? '📐' : '📖'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{act.title}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{act.subject}</p>
                  </div>
                </div>
              ))}
              {completedActivities.length === 0 && (
                <p className="text-xs text-slate-400 font-medium italic text-center py-4">No lessons completed this week.</p>
              )}
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <h4 className="text-xl font-black mb-2">Study Tip</h4>
            <p className="text-sm font-medium text-indigo-100 opacity-80 leading-relaxed">
              Reviewing the learning objectives before class helps you focus on the most important concepts during the lesson.
            </p>
          </div>
        </div>
      </div>
      {/* AI Explanation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="bg-indigo-600 p-6 md:p-8 text-white relative overflow-hidden shrink-0">
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">AI Assistant</p>
                  <h3 className="text-xl md:text-2xl font-black">Lesson Deep Dive ✨</h3>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 md:w-10 md:h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto prose prose-slate prose-indigo max-w-none flex-1">
              <div className="markdown-body text-sm md:text-base">
                <Markdown>{explanation || ''}</Markdown>
              </div>
            </div>
            <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button 
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg text-xs md:text-sm"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonPlanner;
