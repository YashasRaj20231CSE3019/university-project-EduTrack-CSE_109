import React, { useState } from 'react';
import { ScheduleEntry, ScheduleRequest } from '../types';
import { apiService } from '../services/apiService';
import { X, Calendar, Clock, BookOpen, Send, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScheduleRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schedule: ScheduleEntry[];
}

const ScheduleRequestModal: React.FC<ScheduleRequestModalProps> = ({ isOpen, onClose, onSuccess, schedule }) => {
  const [title, setTitle] = useState('');
  const [description, setMessage] = useState('');
  const [action, setAction] = useState<'replace' | 'move' | 'add'>('replace');
  const [targetScheduleId, setTargetScheduleId] = useState('');
  const [newDay, setNewDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Mon');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const details: any = { action };
      if (action === 'replace' || action === 'move') {
        details.targetScheduleId = targetScheduleId;
      }
      if (action === 'add' || action === 'move') {
        details.day = newDay;
        details.startTime = newStartTime;
        details.endTime = newEndTime;
        details.subject = newSubject;
      }
      if (action === 'replace') {
        details.subject = newSubject;
      }

      const request: Partial<ScheduleRequest> = {
        id: `req-${Date.now()}`,
        title,
        description,
        details
      };

      await apiService.createScheduleRequest(request);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
        >
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Schedule Change Request</h2>
                <p className="text-sm text-slate-500 font-medium italic">Sent to school administrator for approval</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl text-xs font-bold flex items-center gap-3">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Request Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="E.g., Move Mathematics Lab"
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Change Type</label>
                    <div className="grid grid-cols-3 gap-2">
                       {(['replace', 'move', 'add'] as const).map((type) => (
                         <button
                          key={type}
                          type="button"
                          onClick={() => setAction(type)}
                          className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                            action === type 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                              : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                          }`}
                         >
                           {type}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Description / Reason</label>
                    <textarea
                      required
                      value={description}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      placeholder="Please explain why this change is needed..."
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Details of Change</h3>
                </div>

                {(action === 'replace' || action === 'move') && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5">Select Class/Slot to Modify</label>
                    <select
                      required
                      value={targetScheduleId}
                      onChange={(e) => setTargetScheduleId(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                    >
                      <option value="">-- Select Existing Slot --</option>
                      {schedule.map(s => (
                        <option key={s.id} value={s.id}>{s.day} {s.startTime} - {s.subject}</option>
                      ))}
                    </select>
                  </div>
                )}

                {(action === 'add' || action === 'move') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1.5">New Day</label>
                      <select
                        value={newDay}
                        onChange={(e) => setNewDay(e.target.value as any)}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                      >
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1.5">New Subject</label>
                      <input
                        type="text"
                        required
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="Subject name"
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1.5">New Start Time</label>
                      <input
                        type="time"
                        required
                        value={newStartTime}
                        onChange={(e) => setNewStartTime(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1.5">New End Time</label>
                      <input
                        type="time"
                        required
                        value={newEndTime}
                        onChange={(e) => setNewEndTime(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {action === 'replace' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5">Replace with Subject</label>
                    <input
                      type="text"
                      required
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="New subject name"
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : <><Send className="w-3.5 h-3.5" /> Submit Request</>}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ScheduleRequestModal;
