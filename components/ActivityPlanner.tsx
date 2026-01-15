
import React, { useState } from 'react';
import { generateActivityIdeas } from '../services/geminiService';
import { ActivitySuggestion, Activity } from '../types';

interface ActivityPlannerProps {
  onAddActivity: (activity: Activity) => void;
}

const ActivityPlanner: React.FC<ActivityPlannerProps> = ({ onAddActivity }) => {
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('9');
  const [subject, setSubject] = useState('Science');
  const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const results = await generateActivityIdeas(grade, subject, topic);
      setSuggestions(results);
    } catch (err) {
      alert('Failed to generate ideas. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuggestion = (s: ActivitySuggestion) => {
    const newActivity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      title: s.title,
      subject,
      description: s.description,
      duration: s.duration,
      learningObjectives: s.learningObjectives,
      materials: s.materials,
      status: 'planned'
    };
    onAddActivity(newActivity);
    setSuggestions(prev => prev.filter(item => item !== s));
    alert('Activity added to your curriculum plan!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Search Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-28">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-xl shadow-indigo-100">
            🪄
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">Curriculum AI</h3>
          <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">Let Gemini brainstorm creative and effective lesson activities tailored to your classroom needs.</p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Subject</label>
              <select 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option>Science</option>
                <option>Mathematics</option>
                <option>English Literature</option>
                <option>History</option>
                <option>Geography</option>
                <option>Computer Science</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Grade</label>
                <input 
                  type="text" 
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g. 9"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Session</label>
                <div className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-400">
                  2024-25
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Lesson Topic</label>
              <textarea 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Describe your lesson topic or theme..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none h-36 resize-none transition-all leading-relaxed"
              />
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={loading || !topic}
              className={`w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
                loading ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-indigo-400 border-t-white rounded-full animate-spin"></div>
                  <span>THINKING...</span>
                </div>
              ) : 'Generate Ideas'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-8 space-y-8">
        {loading ? (
          <div className="min-h-[500px] flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-slate-200 p-20 text-center animate-pulse">
             <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-8">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
             </div>
             <h3 className="text-2xl font-black text-slate-800 mb-3">Crafting Your Curriculum...</h3>
             <p className="text-slate-500 font-medium max-w-sm">Gemini is gathering teaching materials and outlining objectives for Grade {grade} {subject}.</p>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between px-4">
               <h3 className="text-2xl font-black text-slate-800">Generated Proposals</h3>
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{suggestions.length} RESULTS FOUND</span>
            </div>
            {suggestions.map((s, idx) => (
              <div key={idx} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-indigo-200 transition-all duration-500 group">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-lg uppercase tracking-wider">{s.duration}</span>
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-wider">{subject}</span>
                    </div>
                    <h4 className="text-3xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight mb-4">{s.title}</h4>
                    <p className="text-slate-600 text-lg leading-relaxed font-medium">{s.description}</p>
                  </div>
                  <button 
                    onClick={() => handleAddSuggestion(s)}
                    className="px-8 py-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all text-xs font-black uppercase tracking-widest shadow-sm active:scale-95"
                  >
                    Add to Plan +
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-10 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="space-y-4">
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Core Objectives</h5>
                    <ul className="space-y-3">
                      {s.learningObjectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-4">
                          <span className="w-5 h-5 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full text-xs shrink-0 mt-0.5 font-bold">✓</span>
                          <span className="text-sm text-slate-700 font-bold">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Required Assets</h5>
                    <div className="flex flex-wrap gap-2">
                      {s.materials.map((mat, i) => (
                        <span key={i} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-sm hover:border-indigo-400 transition-colors">
                          📦 {mat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-center px-10">
            <div className="w-32 h-32 bg-indigo-50 rounded-[3rem] flex items-center justify-center text-5xl mb-10 shadow-inner group transition-transform hover:rotate-12">💡</div>
            <h3 className="text-3xl font-black text-slate-800 mb-4">Idea Engine is Idle</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto text-lg leading-relaxed">Specify a topic and subject in the sidebar to generate custom, high-quality teaching activities powered by Gemini AI.</p>
            <div className="mt-12 flex gap-4 text-xs font-bold text-slate-400">
               <span className="flex items-center gap-1">⚡ Instant Generation</span>
               <span className="flex items-center gap-1">🎯 Grade-Aligned</span>
               <span className="flex items-center gap-1">📋 Ready-to-use</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPlanner;
