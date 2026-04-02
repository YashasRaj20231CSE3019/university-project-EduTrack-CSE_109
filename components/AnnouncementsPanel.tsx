import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Announcement, Role } from '../types';
import { apiService } from '../services/apiService';
import { Mailbox, Trash2, AlertOctagon, Pin, Info } from 'lucide-react';

interface AnnouncementsPanelProps {
  userRole: Role;
}

const AnnouncementsPanel: React.FC<AnnouncementsPanelProps> = ({ userRole }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [targetRole, setTargetRole] = useState<'all' | 'student' | 'teacher'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length > 0 && location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-4', 'ring-indigo-500', 'ring-opacity-50');
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-indigo-500', 'ring-opacity-50');
          }, 2000);
        }, 100);
      }
    }
  }, [announcements, location.hash]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAnnouncements();
      setAnnouncements(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      const newAnnouncement: Announcement = {
        id: `ann-${Date.now()}`,
        title,
        message,
        priority,
        targetRole,
        createdAt: new Date().toISOString(),
        authorName: 'Current User' // Handled by backend
      };
      
      await apiService.createAnnouncement(newAnnouncement);
      setTitle('');
      setMessage('');
      setPriority('normal');
      setTargetRole('all');
      fetchAnnouncements();
    } catch (err: any) {
      setError(err.message || 'Failed to post announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      await apiService.deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete announcement');
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'urgent': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'high': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Announcements</h1>
          <p className="text-sm text-slate-500 mt-1">Important updates and information</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      {userRole === 'teacher' && (
        <div className="bg-white p-4 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-6">Post New Announcement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="E.g., Tomorrow's Field Trip"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                placeholder="Details about the announcement..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Audience</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as any)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="all">Everyone</option>
                  <option value="student">Students Only</option>
                  <option value="teacher">Teachers Only</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Post Announcement'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-slate-500 mt-4">Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
            <div className="flex justify-center mb-3"><Mailbox className="w-10 h-10 text-slate-400" /></div>
            <p className="text-slate-500 font-medium">No announcements yet</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} id={announcement.id} className="bg-white p-4 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 relative group transition-all duration-500">
              {userRole === 'teacher' && (
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete announcement"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {announcement.priority === 'urgent' ? <AlertOctagon className="w-8 h-8 text-rose-500" /> : announcement.priority === 'high' ? <Pin className="w-8 h-8 text-amber-500" /> : <Info className="w-8 h-8 text-indigo-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-800">{announcement.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                    {userRole === 'teacher' && announcement.targetRole !== 'all' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-slate-100 text-slate-600 border-slate-200">
                        {announcement.targetRole}s only
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed mb-3">
                    {announcement.message}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <span>Posted by {announcement.authorName}</span>
                    <span>•</span>
                    <span>{new Date(announcement.createdAt).toLocaleString(undefined, { 
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                    })}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPanel;
