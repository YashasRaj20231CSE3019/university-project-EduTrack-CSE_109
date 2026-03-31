
import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { ChatUser, ChatMessage } from '../types';
import { apiService } from '../services/apiService';

interface ChatSectionProps {
  currentUserId: string;
  onlineUserIds: string[];
  socket: Socket | null;
  onClose: () => void;
}

const ChatSection: React.FC<ChatSectionProps> = ({ currentUserId, onlineUserIds, socket, onClose }) => {
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');
  const [students, setStudents] = useState<ChatUser[]>([]);
  const [teachers, setTeachers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users for currentUserId:', currentUserId);
        const data = await apiService.getUsers();
        console.log('API getUsers response:', data);
        const filteredStudents = data.students.filter(s => s.id !== currentUserId);
        const filteredTeachers = data.teachers.filter(t => t.id !== currentUserId);
        console.log('Filtered students:', filteredStudents);
        console.log('Filtered teachers:', filteredTeachers);
        setStudents(filteredStudents);
        setTeachers(filteredTeachers);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [currentUserId]);

  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async () => {
        try {
          const data = await apiService.getMessages(selectedUser.id);
          setMessages(data);
          
          // Reset unread count for this user locally
          const resetUnread = (users: ChatUser[]) => 
            users.map(u => u.id === selectedUser.id ? { ...u, unreadCount: 0 } : u);
          setStudents(resetUnread);
          setTeachers(resetUnread);
        } catch (err) {
          console.error('Failed to fetch messages:', err);
        }
      };
      fetchMessages();
    }
  }, [selectedUser]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (message: any) => {
        console.log('ChatSection received message:', message);
        
        // If message is relevant to the current chat
        const isFromSelected = selectedUser && String(message.senderId) === String(selectedUser.id);
        const isToSelected = selectedUser && String(message.receiverId) === String(selectedUser.id) && String(message.senderId) === String(currentUserId);

        if (isFromSelected || isToSelected) {
          setMessages(prev => {
            // Avoid duplicates (especially for the tab that sent the message)
            if (prev.some(m => m.id === message.id)) return prev;
            return [...prev, message];
          });
          
          if (isFromSelected) {
            // Mark as read on server
            apiService.markMessageAsRead(message.senderId);
          }
        } else if (String(message.receiverId) === String(currentUserId)) {
          // Update unread counts in the user lists
          const updateUnread = (users: ChatUser[]) => 
            users.map(u => String(u.id) === String(message.senderId) 
              ? { ...u, unreadCount: (u.unreadCount || 0) + 1 } 
              : u
            );
          
          setStudents(updateUnread);
          setTeachers(updateUnread);
        }
      };

      const onUpdateMessage = (updatedMsg: any) => {
        setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
      };

      const onDeleteMessage = (id: string) => {
        setMessages(prev => prev.filter(m => m.id !== id));
      };

      socket.on('message:new', handleNewMessage);
      socket.on('message:update', onUpdateMessage);
      socket.on('message:delete', onDeleteMessage);

      return () => {
        socket.off('message:new', handleNewMessage);
        socket.off('message:update', onUpdateMessage);
        socket.off('message:delete', onDeleteMessage);
      };
    }
  }, [socket, selectedUser, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const sentMsg = await apiService.sendMessage(selectedUser.id, newMessage);
      // We don't add it here because socket will handle it (or we can add it and socket handles duplicate)
      // Actually, socket emits to sender too now.
      // But to be safe and responsive:
      setMessages(prev => {
        if (prev.some(m => m.id === sentMsg.id)) return prev;
        return [...prev, sentMsg];
      });
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMessageId(msg.id);
    setEditValue(msg.text);
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId || !editValue.trim()) return;
    try {
      const updated = await apiService.editMessage(editingMessageId, editValue);
      setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
      setEditingMessageId(null);
    } catch (err) {
      console.error('Failed to edit message:', err);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await apiService.deleteMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-20 text-center animate-pulse">
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Chat...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
        <h4 className="font-black text-slate-800 uppercase text-[10px] md:text-xs tracking-widest flex items-center gap-2">
          <span>💬</span> Private Messages
        </h4>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <span className="text-2xl">×</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/30">
          <div className="flex p-2 gap-1 bg-slate-100/50">
            <button 
              onClick={() => setActiveTab('students')}
              className={`flex-1 py-2 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'students' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Students
            </button>
            <button 
              onClick={() => setActiveTab('teachers')}
              className={`flex-1 py-2 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'teachers' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Teachers
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Loading Users...</p>
              </div>
            ) : (activeTab === 'students' ? students : teachers).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest">No {activeTab} found</p>
              </div>
            ) : (activeTab === 'students' ? students : teachers).map(user => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all ${
                  selectedUser?.id === user.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.02]' : 'hover:bg-white hover:shadow-sm text-slate-700'
                }`}
              >
                <div className="relative shrink-0">
                  <img src={user.avatar} className="w-8 h-8 md:w-10 md:h-10 rounded-xl object-cover" alt={user.name} />
                  {onlineUserIds.includes(user.id) && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                  )}
                </div>
                <div className="text-left overflow-hidden flex-1">
                  <p className="text-[10px] md:text-xs font-black truncate leading-none mb-1">{user.name}</p>
                  <p className={`text-[8px] md:text-[10px] font-bold uppercase tracking-tighter truncate ${selectedUser?.id === user.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {user.role}
                  </p>
                </div>
                {user.unreadCount && user.unreadCount > 0 && (
                  <div className="bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center shadow-sm animate-bounce">
                    {user.unreadCount}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedUser ? (
            <>
              <div className="p-4 border-b border-slate-100 flex items-center gap-3 shrink-0">
                <div className="relative shrink-0">
                  <img src={selectedUser.avatar} className="w-8 h-8 rounded-lg object-cover" alt={selectedUser.name} />
                  {onlineUserIds.includes(selectedUser.id) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 leading-none mb-1">{selectedUser.name}</p>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${onlineUserIds.includes(selectedUser.id) ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <p className={`text-[8px] font-bold uppercase tracking-widest ${onlineUserIds.includes(selectedUser.id) ? 'text-green-500' : 'text-slate-400'}`}>
                      {onlineUserIds.includes(selectedUser.id) ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/30">
                {messages.map((msg, idx) => (
                  <div 
                    key={msg.id || idx} 
                    className={`flex group ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] relative p-3 md:p-4 rounded-2xl text-xs md:text-sm font-medium shadow-sm ${
                      msg.senderId === currentUserId 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}>
                      {editingMessageId === msg.id ? (
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white outline-none focus:bg-white/20 transition-all"
                            rows={2}
                          />
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setEditingMessageId(null)}
                              className="px-2 py-1 text-[10px] font-bold uppercase hover:underline"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={handleSaveEdit}
                              className="px-3 py-1 bg-white text-indigo-600 rounded-md text-[10px] font-black uppercase shadow-sm"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <div className="flex items-center justify-between mt-1 gap-4">
                            <p className={`text-[8px] font-bold uppercase tracking-tighter ${msg.senderId === currentUserId ? 'text-indigo-200' : 'text-slate-400'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {msg.senderId === currentUserId && (
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => handleStartEdit(msg)}
                                  className="text-[8px] font-bold uppercase hover:text-white transition-colors"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="text-[8px] font-bold uppercase text-rose-300 hover:text-rose-100 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 flex gap-2 shrink-0">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                />
                <button 
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-indigo-100"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center text-3xl mb-4">👋</div>
              <h5 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">Select a Contact</h5>
              <p className="text-xs text-slate-400 font-medium max-w-xs">Choose a student or teacher from the list to start a private conversation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
