import React, { useState, useEffect } from 'react';
import { ScheduleRequest, ScheduleEntry } from '../types';
import { apiService } from '../services/apiService';
import { CheckCircle, XCircle, Clock, Calendar, MessageSquare, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AdminRequestsPanel: React.FC = () => {
  const [requests, setRequests] = useState<ScheduleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await apiService.getScheduleRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      setIsProcessing(true);
      await apiService.updateScheduleRequest(id, status, adminComment);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status, adminComment } : r));
      setAdminComment('');
      setExpandedId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update request');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[2.5rem] border border-slate-200">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-bold text-xs uppercase tracking-widest">Loading Requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Schedule Requests</h2>
          <p className="text-sm text-slate-500 font-medium h-5">Review change requests from faculty</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl text-xs font-bold flex items-center gap-3">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="p-12 bg-white rounded-[2rem] border border-slate-200 border-dashed text-center">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">No requests found</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div 
                onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
                className="p-6 md:p-8 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl ${
                    request.status === 'approved' ? 'bg-green-50 text-green-600' :
                    request.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {request.status === 'approved' ? <CheckCircle className="w-6 h-6" /> :
                     request.status === 'rejected' ? <XCircle className="w-6 h-6" /> :
                     <Clock className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{request.title}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                      {request.teacherName} • {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    request.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                    request.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {request.status}
                  </span>
                  {expandedId === request.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </div>

              <AnimatePresence>
                {expandedId === request.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-50"
                  >
                    <div className="p-8 bg-slate-50/50 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Request Details</h4>
                          <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-2xl border border-slate-200">
                            {request.description}
                          </p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" /> Proposed Change
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                              <span className="text-[10px] font-bold text-slate-400">Action</span>
                              <span className="text-xs font-black text-indigo-600 uppercase italic">{request.details.action}</span>
                            </div>
                            {request.details.day && (
                              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                                <span className="text-[10px] font-bold text-slate-400">Target Day</span>
                                <span className="text-xs font-black text-slate-700">{request.details.day}</span>
                              </div>
                            )}
                            {request.details.subject && (
                              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                                <span className="text-[10px] font-bold text-slate-400">Subject</span>
                                <span className="text-xs font-black text-slate-700">{request.details.subject}</span>
                              </div>
                            )}
                            {request.details.startTime && (
                              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                                <span className="text-[10px] font-bold text-slate-400">Time</span>
                                <span className="text-xs font-black text-slate-700">{request.details.startTime} - {request.details.endTime}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {request.status === 'pending' ? (
                        <div className="space-y-4 pt-4">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Admin Comment (Optional)</label>
                            <textarea
                              value={adminComment}
                              onChange={(e) => setAdminComment(e.target.value)}
                              rows={2}
                              className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all resize-none"
                              placeholder="Add a reason or instructions..."
                            />
                          </div>
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => handleUpdateStatus(request.id, 'rejected')}
                              disabled={isProcessing}
                              className="px-6 py-3 bg-white border border-slate-200 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center gap-2"
                            >
                              <XCircle className="w-4 h-4" /> Reject
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(request.id, 'approved')}
                              disabled={isProcessing}
                              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" /> Approve Change
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-4 p-6 bg-slate-100 rounded-3xl border border-slate-200">
                           <div className="flex items-center gap-2 mb-2">
                             <MessageSquare className="w-4 h-4 text-slate-400" />
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Decision {request.status}</span>
                           </div>
                           <p className="text-xs font-bold text-slate-600 italic">
                             {request.adminComment || "No comments provided."}
                           </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminRequestsPanel;
