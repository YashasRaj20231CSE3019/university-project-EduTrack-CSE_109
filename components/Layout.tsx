
import React, { useState } from 'react';
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Notification } from '../types';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  Users, 
  Wand2, 
  CalendarDays, 
  Megaphone, 
  UsersRound, 
  Home, 
  BookOpen, 
  Library, 
  TrendingUp,
  LogOut,
  Menu,
  Search,
  Bell,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Inbox,
  X
} from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearNotifications: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ 
  user, 
  onLogout, 
  notifications,
  onMarkAsRead,
  onClearNotifications,
  children 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.read).length;

  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const teacherNavItems = [
    { id: '/', label: 'Overview', icon: LayoutDashboard, color: 'text-indigo-500', keywords: ['dashboard', 'home', 'main'] },
    { id: '/attendance', label: 'Attendance', icon: ClipboardCheck, color: 'text-emerald-500', keywords: ['roll', 'present', 'absent'] },
    { id: '/students', label: 'Students', icon: Users, color: 'text-blue-500', keywords: ['directory', 'list', 'profiles'] },
    { id: '/planner', label: 'Lesson Planner', icon: Wand2, color: 'text-purple-500', keywords: ['ai', 'generate', 'activities'] },
    { id: '/schedule', label: 'Class Schedule', icon: CalendarDays, color: 'text-amber-500', keywords: ['timetable', 'calendar', 'classes'] },
    { id: '/announcements', label: 'Announcements', icon: Megaphone, color: 'text-rose-500', keywords: ['news', 'updates', 'messages'] },
    { id: '/parents', label: 'Parent Portal', icon: UsersRound, color: 'text-teal-500', keywords: ['contacts', 'family', 'communication'] },
    { id: '/quiz-maker', label: 'Quiz Maker', icon: BookOpen, color: 'text-cyan-500', keywords: ['test', 'exam', 'assessment', 'weekly'] },
  ];

  const studentNavItems = [
    { id: '/', label: 'My Dashboard', icon: Home, color: 'text-indigo-500', keywords: ['home', 'main', 'overview'] },
    { id: '/lesson-planner', label: 'Activity Planner', icon: BookOpen, color: 'text-emerald-500', keywords: ['activities', 'tasks'] },
    { id: '/schedule', label: 'My Schedule', icon: CalendarDays, color: 'text-amber-500', keywords: ['timetable', 'calendar', 'classes'] },
    { id: '/assignments', label: 'Assignments', icon: Library, color: 'text-rose-500', keywords: ['homework', 'tasks', 'projects'] },
    { id: '/my-progress', label: 'Grades & Progress', icon: TrendingUp, color: 'text-blue-500', keywords: ['marks', 'report', 'performance'] },
    { id: '/announcements', label: 'Announcements', icon: Megaphone, color: 'text-purple-500', keywords: ['news', 'updates', 'messages'] },
    { id: '/quizzes', label: 'My Quizzes', icon: ClipboardCheck, color: 'text-cyan-500', keywords: ['test', 'exam', 'assessment', 'weekly'] },
  ];

  const navItems = user.role === 'teacher' ? teacherNavItems : studentNavItems;

  const searchResults = navItems.filter(item => 
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getActiveLabel = () => {
    const activeItem = navItems.find(item => 
      item.id === '/' ? location.pathname === '/' : location.pathname.startsWith(item.id)
    );
    return activeItem ? activeItem.label : 'EduTrack';
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Inter'] relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[1000] w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="px-6 py-8 flex items-center justify-between">
          <Link 
            to="/"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-100">
              🎓
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              EduTrack
            </h1>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>
          {navItems.map((item) => {
            return (
              <NavLink
                key={item.id}
                to={item.id}
                end={item.id === '/'}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => `
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group
                  ${isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                {({ isActive }) => {
                  const Icon = item.icon;
                  return (
                  <>
                    <span className={`transition-colors ${isActive ? 'text-white' : `${item.color} group-hover:text-slate-900`}`}>
                      <div className="w-5 h-5 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                    </span>
                    {item.label}
                  </>
                )}}
              </NavLink>
            );
          })}
          
          <div className="pt-8">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Account</p>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
            >
              <LogOut className="w-4.5 h-4.5" />
              Logout
            </button>
          </div>
        </nav>

        <div className="px-6 py-6 border-t border-slate-100 mt-auto bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={user.avatar} className="w-10 h-10 rounded-xl border-2 border-white shadow-md bg-white" alt={user.name} />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{user.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {user.role === 'teacher' ? 'Class 9A Head' : `Student • ${user.studentData?.grade || 'N/A'}`}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-10 shrink-0 sticky top-0 z-[990]">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h2 className="text-lg md:text-2xl font-bold text-slate-900 capitalize leading-none mb-1 truncate max-w-[150px] md:max-w-none tracking-tight">
                {getActiveLabel()}
              </h2>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest truncate">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center relative">
              <div className="flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-slate-200 focus-within:ring-4 focus-within:ring-slate-900/5 focus-within:border-slate-300 transition-all">
                <Search className="w-4 h-4 text-slate-400 mr-3" />
                <input 
                  type="text" 
                  placeholder="Search features..." 
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSearchResults(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowSearchResults(searchTerm.length > 0)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  className="bg-transparent border-none outline-none text-sm w-48 text-slate-900 font-medium placeholder:text-slate-400" 
                />
              </div>
              
              {showSearchResults && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-[1050]">
                  {searchResults.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto">
                      {searchResults.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              navigate(item.id);
                              setSearchTerm('');
                              setShowSearchResults(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                          >
                            <Icon className={`w-4 h-4 ${item.color}`} />
                            <span className="text-sm font-bold text-slate-700">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-slate-500 font-medium">
                      No matching features found.
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2.5 rounded-xl transition-all border ${
                  showNotifications ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50 border-transparent'
                }`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div 
                    className="fixed inset-0 z-[1010]" 
                    onClick={() => setShowNotifications(false)}
                  ></div>
                  <div 
                    className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-200 z-[1020] overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200"
                    style={{ backgroundColor: '#ffffff', opacity: 1 }}
                  >
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white" style={{ backgroundColor: '#ffffff' }}>
                      <h3 className="font-bold text-slate-900 tracking-tight">Notifications</h3>
                      <button 
                        onClick={onClearNotifications}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto bg-white" style={{ backgroundColor: '#ffffff' }}>
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => {
                              onMarkAsRead(notif.id);
                              setShowNotifications(false);
                              if (notif.link) {
                                navigate(notif.link);
                              }
                            }}
                            className={`p-5 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors relative ${!notif.read ? 'bg-indigo-50/30' : 'bg-white'}`}
                            style={{ backgroundColor: !notif.read ? '#f5f7ff' : '#ffffff' }}
                          >
                            {!notif.read && (
                              <div className="absolute top-5 right-5 w-2 h-2 bg-indigo-600 rounded-full"></div>
                            )}
                            <div className="flex gap-4">
                              <div className="shrink-0 mt-0.5">
                                {notif.type === 'info' ? <Info className="w-5 h-5 text-indigo-500" /> : 
                                 notif.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : 
                                 notif.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-500" /> : 
                                 <XCircle className="w-5 h-5 text-rose-500" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-slate-900 tracking-tight">{notif.title}</p>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">{notif.message}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest">{notif.time}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-12 text-center bg-white" style={{ backgroundColor: '#ffffff' }}>
                          <Inbox className="w-12 h-12 mx-auto text-slate-200 mb-4" />
                          <p className="text-sm font-bold text-slate-900 tracking-tight">All caught up!</p>
                          <p className="text-xs text-slate-400 mt-1 font-medium">No new notifications for you.</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                      <button className="text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">
                        View All Activity
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
