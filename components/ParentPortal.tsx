import React, { useState, useEffect } from 'react';
import { ParentMessage } from '../types';
import { apiService } from '../services/apiService';
import { Download, Search, Phone, Mail, Mailbox, X } from 'lucide-react';

const ParentPortal: React.FC = () => {
  const [contacts, setContacts] = useState<ParentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingContact, setEditingContact] = useState<ParentMessage | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getParentContacts();
      setContacts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load parent contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;

    try {
      await apiService.updateParentContact(editingContact.studentId, editingContact);
      setContacts(prev => prev.map(c => c.studentId === editingContact.studentId ? editingContact : c));
      setEditingContact(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update contact');
    }
  };

  const exportCSV = () => {
    const headers = ['Student Name', 'Parent Name', 'Relation', 'Phone', 'Email', 'Notes'];
    const rows = contacts.map(c => [
      c.studentName,
      c.parentName,
      c.parentRelation,
      c.parentPhone,
      c.parentEmail,
      c.notes
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'parent_contacts.csv';
    link.click();
  };

  const filteredContacts = contacts.filter(c => 
    c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.parentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Parent Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Manage parent and guardian contact information</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white p-4 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student or parent name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-slate-500 mt-4">Loading contacts...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="pb-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Parent/Guardian</th>
                  <th className="pb-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Info</th>
                  <th className="pb-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Notes</th>
                  <th className="pb-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.map((contact) => (
                  <tr key={contact.studentId} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {contact.studentName.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800 text-sm">{contact.studentName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800 text-sm">{contact.parentName || 'Not provided'}</span>
                        <span className="text-xs text-slate-500">{contact.parentRelation || '-'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-4 h-4" /> {contact.parentPhone || 'No phone'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-4 h-4" /> {contact.parentEmail || 'No email'}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-slate-600 max-w-xs truncate" title={contact.notes}>
                        {contact.notes || '-'}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setEditingContact(contact)}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredContacts.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl mt-4">
                <div className="flex justify-center mb-3"><Mailbox className="w-10 h-10 text-slate-400" /></div>
                <p className="text-slate-500 font-medium">No contacts found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingContact && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Edit Contact Info</h2>
              <button 
                onClick={() => setEditingContact(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateContact} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Student</p>
                <p className="text-sm font-bold text-slate-800">{editingContact.studentName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parent Name</label>
                  <input
                    type="text"
                    value={editingContact.parentName}
                    onChange={(e) => setEditingContact({...editingContact, parentName: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Relation</label>
                  <input
                    type="text"
                    value={editingContact.parentRelation}
                    onChange={(e) => setEditingContact({...editingContact, parentRelation: e.target.value})}
                    placeholder="e.g., Mother, Father"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={editingContact.parentPhone}
                  onChange={(e) => setEditingContact({...editingContact, parentPhone: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  value={editingContact.parentEmail}
                  onChange={(e) => setEditingContact({...editingContact, parentEmail: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notes</label>
                <textarea
                  value={editingContact.notes}
                  onChange={(e) => setEditingContact({...editingContact, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingContact(null)}
                  className="px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentPortal;
