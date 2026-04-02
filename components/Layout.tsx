
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

  const teacherNavItems = [
    { id: '/', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: '/attendance', label: 'Attendance', icon: <ClipboardCheck className="w-5 h-5" /> },
    { id: '/students', label: 'Students', icon: <Users className="w-5 h-5" /> },
    { id: '/planner', label: 'Lesson Planner', icon: <Wand2 className="w-5 h-5" /> },
    { id: '/schedule', label: 'Class Schedule', icon: <CalendarDays className="w-5 h-5" /> },
    { id: '/announcements', label: 'Announcements', icon: <Megaphone className="w-5 h-5" /> },
    { id: '/parents', label: 'Parent Portal', icon: <UsersRound className="w-5 h-5" /> },
  ];

  const studentNavItems = [
    { id: '/', label: 'My Dashboard', icon: <Home className="w-5 h-5" /> },
    { id: '/lesson-planner', label: 'Activity Planner', icon: <BookOpen className="w-5 h-5" /> },
    { id: '/schedule', label: 'My Timetable', icon: <CalendarDays className="w-5 h-5" /> },
    { id: '/assignments', label: 'Assignments', icon: <Library className="w-5 h-5" /> },
    { id: '/my-progress', label: 'Grades & Progress', icon: <TrendingUp className="w-5 h-5" /> },
    { id: '/announcements', label: 'Announcements', icon: <Megaphone className="w-5 h-5" /> },
  ];

  const navItems = user.role === 'teacher' ? teacherNavItems : studentNavItems;

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
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-200">
              🎓
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
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
        
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Main Menu</p>
          {navItems.map((item) => {
            return (
              <NavLink
                key={item.id}
                to={item.id}
                end={item.id === '/'}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => `
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group
                  ${isActive
                    ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <motion.span 
                      className="text-lg"
                      animate={{ scale: isActive ? 1.15 : 1 }}
                      whileHover={{ scale: 1.15 }}
                    >
                      {item.icon}
                    </motion.span>
                    {item.label}
                    {isActive && (
                      <motion.div 
                        layoutId="activeNav"
                        className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
          
          <div className="pt-8">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Account</p>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </nav>

        <div className="px-6 py-6 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-md" alt={user.name} />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
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
              <h2 className="text-lg md:text-2xl font-bold text-slate-800 capitalize leading-none mb-1 truncate max-w-[150px] md:max-w-none">
                {getActiveLabel()}
              </h2>
              <p className="text-[10px] md:text-xs font-medium text-slate-400 uppercase tracking-widest truncate">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input type="text" placeholder="Global search..." className="bg-transparent border-none outline-none text-sm w-48 text-slate-600" />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2.5 rounded-full transition-all ${
                  showNotifications ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div 
                    className="fixed inset-0 z-[1010]" 
                    onClick={() => setShowNotifications(false)}
                  ></div>
                  <div 
                    className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200 z-[1020] overflow-hidden origin-top-right"
                    style={{ backgroundColor: '#ffffff', opacity: 1 }}
                  >
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white" style={{ backgroundColor: '#ffffff' }}>
                      <h3 className="font-bold text-slate-800">Notifications</h3>
                      <button 
                        onClick={onClearNotifications}
                        className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest"
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
                            className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors relative ${!notif.read ? 'bg-indigo-50' : 'bg-white'}`}
                            style={{ backgroundColor: !notif.read ? '#f5f7ff' : '#ffffff' }}
                          >
                            {!notif.read && (
                              <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-600 rounded-full"></div>
                            )}
                            <div className="flex gap-3">
                              <div className="shrink-0 mt-0.5">
                                {notif.type === 'info' ? <Info className="w-5 h-5 text-indigo-500" /> : 
                                 notif.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : 
                                 notif.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-500" /> : 
                                 <XCircle className="w-5 h-5 text-rose-500" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-slate-800">{notif.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                                <p className="text-[10px] font-medium text-slate-400 mt-2">{notif.time}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-10 text-center bg-white" style={{ backgroundColor: '#ffffff' }}>
                          <Inbox className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                          <p className="text-sm font-bold text-slate-800">All caught up!</p>
                          <p className="text-xs text-slate-400 mt-1">No new notifications for you.</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                      <button className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">
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
