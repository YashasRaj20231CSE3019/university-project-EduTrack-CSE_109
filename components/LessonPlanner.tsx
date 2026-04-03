
import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { Activity, Student } from '../types';
import { explainLesson, explainCurriculum } from '../services/aiService';
import { Sparkles, BookOpen, FlaskConical, Calculator, CheckCircle2, X } from 'lucide-react';

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
      <div className="bg-emerald-600 rounded-3xl p-6 md:p-10 text-white relative overflow-hidden shadow-xl border border-emerald-500">
        <div className="relative z-10 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight flex items-center justify-center md:justify-start gap-3">Activity Planner <BookOpen className="w-6 h-6 text-emerald-200" /></h1>
          <p className="text-emerald-100 text-sm md:text-base max-w-2xl font-medium">Stay ahead of your studies by reviewing upcoming activities and using our AI assistant to understand your syllabus better.</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      </div>

      {/* Curriculum AI Assistant Section */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-sm"><Sparkles className="w-5 h-5" /></div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Syllabus Explainer</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered by Gemini AI</p>
            </div>
          </div>

          <form onSubmit={handleAskCurriculum} className="space-y-6">
            <div className="relative">
              <textarea
                value={curriculumQuery}
                onChange={(e) => setCurriculumQuery(e.target.value)}
                placeholder="Ask anything about your syllabus..."
                className="w-full p-5 pb-16 md:pb-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-medium focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 focus:outline-none transition-all min-h-[140px] resize-none text-sm"
              />
              <button
                type="submit"
                disabled={isAskingCurriculum || !curriculumQuery.trim()}
                className="absolute bottom-4 right-4 px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-sm hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {isAskingCurriculum ? 'Thinking...' : 'Ask Assistant'}
              </button>
            </div>
          </form>

          {curriculumResponse && (
            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Explanation</h4>
                <button 
                  onClick={() => setCurriculumResponse(null)}
                  className="text-slate-400 hover:text-slate-900 font-bold text-[10px] uppercase tracking-widest transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="prose prose-slate max-w-none">
                <div className="markdown-body text-slate-700 text-sm leading-relaxed">
                  <Markdown>{curriculumResponse}</Markdown>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Upcoming Activities</h3>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {plannedActivities.length} PLANNED
            </span>
          </div>

          <div className="space-y-6">
            {plannedActivities.map((act) => (
              <div key={act.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center border border-slate-100">
                        {act.subject === 'Science' ? <FlaskConical className="w-5 h-5" /> : act.subject === 'Math' ? <Calculator className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{act.subject}</p>
                        <p className="text-[10px] font-bold text-slate-500">{act.duration}</p>
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 tracking-tight">{act.title}</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">{act.description}</p>
                    
                    <button 
                      onClick={() => handleExplain(act)}
                      disabled={explainingId === act.id}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all disabled:opacity-50"
                    >
                      {explainingId === act.id ? (
                        <>
                          <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                          Thinking...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" /> Explain with AI
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Learning Objectives</h5>
                    <ul className="space-y-2">
                      {act.learningObjectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-slate-300 font-bold">•</span>
                          <span className="text-[11px] font-medium text-slate-600">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Preparation</h5>
                    <div className="flex flex-wrap gap-2">
                      {act.materials.map((mat, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-500 text-[9px] font-bold rounded uppercase tracking-wider">
                          {mat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {plannedActivities.length === 0 && (
              <div className="py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No upcoming activities scheduled.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 tracking-tight">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Recently Covered
            </h3>
            <div className="space-y-3">
              {completedActivities.slice(0, 5).map(act => (
                <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-white border border-slate-100 text-slate-400 rounded-lg flex items-center justify-center">
                    {act.subject === 'Science' ? <FlaskConical className="w-4 h-4" /> : act.subject === 'Math' ? <Calculator className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 truncate">{act.title}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{act.subject}</p>
                  </div>
                </div>
              ))}
              {completedActivities.length === 0 && (
                <p className="text-[10px] text-slate-400 font-medium italic text-center py-4">No activities completed yet.</p>
              )}
            </div>
          </div>

          <div className="bg-emerald-600 p-6 rounded-3xl text-white relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <h4 className="text-sm font-bold mb-2 tracking-tight">Study Tip</h4>
            <p className="text-xs font-medium text-emerald-100 leading-relaxed">
              Reviewing the learning objectives before class helps you focus on the most important concepts during the activity.
            </p>
          </div>
        </div>
      </div>
      {/* AI Explanation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col border border-slate-200">
            <div className="bg-white p-6 border-b border-slate-100 relative shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">AI Assistant</p>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 tracking-tight">Activity Deep Dive <Sparkles className="w-4 h-4 text-emerald-500" /></h3>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-90"
                  aria-label="Close explanation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto prose prose-slate max-w-none flex-1">
              <div className="markdown-body text-sm leading-relaxed text-slate-600">
                <Markdown>{explanation || ''}</Markdown>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button 
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all active:scale-95 shadow-sm text-xs"
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
