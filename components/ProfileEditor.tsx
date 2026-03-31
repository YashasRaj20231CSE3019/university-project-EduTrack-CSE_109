
import React, { useState } from 'react';
import { Student } from '../types';
import { apiService } from '../services/apiService';

interface ProfileEditorProps {
  student: Student;
  onUpdate: (updatedStudent: Student) => void;
  onCancel: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ student, onUpdate, onCancel }) => {
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [avatar, setAvatar] = useState(student.avatar);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await apiService.updateStudentProfile(student.id, { name, email, avatar });
      onUpdate({ ...student, name, email, avatar });
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h4 className="font-black text-slate-800 uppercase text-[10px] md:text-xs tracking-widest flex items-center gap-2">
          <span>⚙️</span> Edit Profile
        </h4>
        <button 
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <span className="text-2xl">×</span>
        </button>
      </div>
      
      <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] overflow-hidden border-4 border-slate-100 shadow-lg">
              <img src={avatar} className="w-full h-full object-cover" alt="Avatar Preview" />
            </div>
            <div className="mt-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Avatar URL</label>
              <input 
                type="text" 
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex-1 w-full space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="pt-4 flex gap-4">
              <button 
                type="button"
                onClick={onCancel}
                className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditor;
