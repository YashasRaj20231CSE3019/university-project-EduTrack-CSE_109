
import React, { useState } from 'react';
import { generateActivityIdeas } from '../services/geminiService';
import { ActivitySuggestion, Activity } from '../types';
import { exportToCSV } from '../src/utils/csvExport';
import { 
  Wand2, 
  Download, 
  Scan, 
  Calculator, 
  Book, 
  Check, 
  Package 
} from 'lucide-react';

interface ActivityPlannerProps {
  activities: Activity[];
  onAddActivity: (activity: Activity) => void;
  onUpdateActivity: (activityId: string, updates: Partial<Activity>) => void;
}

const ActivityPlanner: React.FC<ActivityPlannerProps> = ({ activities, onAddActivity, onUpdateActivity }) => {
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('9');
  const [subject, setSubject] = useState('Science');
  const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  
  // Manual form state
  const [manualTitle, setManualTitle] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualDuration, setManualDuration] = useState('45 mins');

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
  };

  const handleExportCSV = () => {
    const headers = ['Activity ID', 'Title', 'Subject', 'Description', 'Duration', 'Status', 'Learning Objectives', 'Materials'];
    const rows = activities.map(a => [
      a.id,
      a.title,
      a.subject,
      a.description,
      a.duration,
      a.status,
      a.learningObjectives.join('; '),
      a.materials.join('; ')
    ]);
    exportToCSV(`curriculum_progress_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle || !manualDesc) return;

    const newActivity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      title: manualTitle,
      subject,
      description: manualDesc,
      duration: manualDuration,
      learningObjectives: ['Custom objective'],
      materials: ['Standard materials'],
      status: 'planned'
    };
    onAddActivity(newActivity);
    setManualTitle('');
    setManualDesc('');
    setShowManualForm(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Search Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-28">
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
              <Wand2 className="w-8 h-8" />
            </div>
            <button 
              onClick={() => setShowManualForm(!showManualForm)}
              className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline"
            >
              {showManualForm ? 'USE AI GENERATOR' : 'ADD MANUALLY'}
            </button>
          </div>
          
          <h3 className="text-2xl font-black text-slate-800 mb-2">
            {showManualForm ? 'Manual Entry' : 'Lesson Planner AI'}
          </h3>
          <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
            {showManualForm 
              ? 'Create a custom lesson activity without AI assistance.' 
              : 'Let Gemini brainstorm creative and effective lesson plans tailored to your classroom needs.'}
          </p>
          
          {showManualForm ? (
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Title</label>
                <input 
                  type="text" 
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Lesson Plan Title"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Duration</label>
                <input 
                  type="text" 
                  value={manualDuration}
                  onChange={(e) => setManualDuration(e.target.value)}
                  placeholder="e.g. 45 mins"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                <textarea 
                  value={manualDesc}
                  onChange={(e) => setManualDesc(e.target.value)}
                  placeholder="What will students do?"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none h-32 resize-none transition-all"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-100 transition-all active:scale-95 hover:bg-emerald-700"
              >
                Save Lesson Plan
              </button>
            </form>
          ) : (
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
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-8 space-y-10">
        {/* Current Plan Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
             <h3 className="text-2xl font-black text-slate-800">Active Lesson Plans</h3>
             <div className="flex items-center gap-4">
               <button 
                onClick={handleExportCSV}
                className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-2"
               >
                 <Download className="w-4 h-4" /> EXPORT REPORT
               </button>
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{activities.length} PLANNED</span>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.map(act => (
              <div key={act.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${act.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {act.subject === 'Science' ? <Scan className="w-6 h-6" /> : act.subject === 'Math' ? <Calculator className="w-6 h-6" /> : <Book className="w-6 h-6" />}
                  </div>
                  <button 
                    onClick={() => onUpdateActivity(act.id, { status: act.status === 'completed' ? 'planned' : 'completed' })}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      act.status === 'completed' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-indigo-600 hover:text-white'
                    }`}
                  >
                    {act.status === 'completed' ? 'COMPLETED' : 'MARK DONE'}
                  </button>
                </div>
                <h4 className="font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{act.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 font-medium">{act.description}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{act.duration}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{act.subject}</span>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="col-span-full py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No lesson plans in current plan</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Suggestions Section */}
        {(loading || suggestions.length > 0) && (
          <div className="space-y-8 pt-10 border-t border-slate-200">
            {loading ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-slate-200 p-20 text-center animate-pulse">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-8">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">Gemini is Thinking...</h3>
                <p className="text-slate-500 text-sm font-medium max-w-xs">Gathering teaching materials and outlining objectives.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-4">
                  <h3 className="text-2xl font-black text-slate-800">AI Proposals</h3>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{suggestions.length} IDEAS</span>
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
                              <span className="w-5 h-5 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full shrink-0 mt-0.5">
                                <Check className="w-3 h-3 font-bold" />
                              </span>
                              <span className="text-sm text-slate-700 font-bold">{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Required Assets</h5>
                        <div className="flex flex-wrap gap-2">
                          {s.materials.map((mat, i) => (
                            <span key={i} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-sm hover:border-indigo-400 transition-colors">
                              <Package className="w-3 h-3 text-slate-400" /> {mat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPlanner;
