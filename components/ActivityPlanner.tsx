
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
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-28">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Wand2 className="w-6 h-6" />
            </div>
            <button 
              onClick={() => setShowManualForm(!showManualForm)}
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
            >
              {showManualForm ? 'USE AI GENERATOR' : 'ADD MANUALLY'}
            </button>
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
            {showManualForm ? 'Manual Entry' : 'Lesson Planner AI'}
          </h3>
          <p className="text-xs font-medium text-slate-500 mb-8 leading-relaxed">
            {showManualForm 
              ? 'Create a custom lesson activity without AI assistance.' 
              : 'Let Gemini brainstorm creative and effective lesson plans tailored to your classroom needs.'}
          </p>
          
          {showManualForm ? (
            <form onSubmit={handleManualSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Title</label>
                <input 
                  type="text" 
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Lesson Plan Title"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-900/10 focus:border-indigo-600 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Duration</label>
                <input 
                  type="text" 
                  value={manualDuration}
                  onChange={(e) => setManualDuration(e.target.value)}
                  placeholder="e.g. 45 mins"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-900/10 focus:border-indigo-600 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                <textarea 
                  value={manualDesc}
                  onChange={(e) => setManualDesc(e.target.value)}
                  placeholder="What will students do?"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-900/10 focus:border-indigo-600 focus:outline-none h-32 resize-none transition-all"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest shadow-sm transition-all active:scale-95 hover:bg-indigo-700"
              >
                Save Lesson Plan
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Subject</label>
                <select 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-900/10 focus:border-indigo-600 focus:outline-none transition-all cursor-pointer"
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
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Grade</label>
                  <input 
                    type="text" 
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="e.g. 9"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-900/10 focus:border-indigo-600 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Session</label>
                  <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-400">
                    2024-25
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Lesson Topic</label>
                <textarea 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Describe your lesson topic..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-900/10 focus:border-indigo-600 focus:outline-none h-32 resize-none transition-all leading-relaxed"
                />
              </div>
              
              <button 
                onClick={handleGenerate}
                disabled={loading || !topic}
                className={`w-full py-3 rounded-lg font-bold text-xs uppercase tracking-widest shadow-sm transition-all active:scale-95 ${
                  loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-3 h-3 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
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
          <div className="flex items-center justify-between px-2">
             <h3 className="text-xl font-bold text-slate-900 tracking-tight">Active Lesson Plans</h3>
             <div className="flex items-center gap-4">
               <button 
                onClick={handleExportCSV}
                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center gap-2"
               >
                 <Download className="w-3.5 h-3.5" /> EXPORT REPORT
               </button>
               <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{activities.length} PLANNED</span>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.map(act => (
              <div key={act.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${act.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                    {act.subject === 'Science' ? <Scan className="w-5 h-5" /> : act.subject === 'Math' ? <Calculator className="w-5 h-5" /> : <Book className="w-5 h-5" />}
                  </div>
                  <button 
                    onClick={() => onUpdateActivity(act.id, { status: act.status === 'completed' ? 'planned' : 'completed' })}
                    className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest transition-all ${
                      act.status === 'completed' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-indigo-600 hover:text-white'
                    }`}
                  >
                    {act.status === 'completed' ? 'COMPLETED' : 'MARK DONE'}
                  </button>
                </div>
                <h4 className="font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors tracking-tight">{act.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mb-4 font-medium leading-relaxed">{act.description}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{act.duration}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{act.subject}</span>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="col-span-full py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No lesson plans in current plan</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Suggestions Section */}
        {(loading || suggestions.length > 0) && (
          <div className="space-y-8 pt-10 border-t border-slate-200">
            {loading ? (
              <div className="min-h-[300px] flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 p-10 text-center animate-pulse">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">Gemini is Thinking...</h3>
                <p className="text-slate-400 text-xs font-medium max-w-xs">Gathering teaching materials and outlining objectives.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">AI Proposals</h3>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{suggestions.length} IDEAS</span>
                </div>
                {suggestions.map((s, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 group">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-bold rounded uppercase tracking-wider">{s.duration}</span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded uppercase tracking-wider">{subject}</span>
                        </div>
                        <h4 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight mb-3">{s.title}</h4>
                        <p className="text-slate-500 text-base leading-relaxed font-medium">{s.description}</p>
                      </div>
                      <button 
                        onClick={() => handleAddSuggestion(s)}
                        className="px-6 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all text-[10px] font-bold uppercase tracking-widest shadow-sm active:scale-95"
                      >
                        Add to Plan +
                      </button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Core Objectives</h5>
                        <ul className="space-y-2.5">
                          {s.learningObjectives.map((obj, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <span className="w-4 h-4 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-full shrink-0 mt-0.5">
                                <Check className="w-2.5 h-2.5" />
                              </span>
                              <span className="text-xs text-slate-600 font-bold">{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Required Assets</h5>
                        <div className="flex flex-wrap gap-2">
                          {s.materials.map((mat, i) => (
                            <span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-500 text-[10px] font-bold rounded-lg shadow-sm hover:border-slate-400 transition-colors">
                              <Package className="w-3 h-3 text-slate-300" /> {mat}
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
