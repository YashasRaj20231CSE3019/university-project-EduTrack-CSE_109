
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { io, Socket } from 'socket.io-client';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import StudentDashboard from './components/StudentDashboard';
import AttendanceSheet from './components/AttendanceSheet';
import ActivityPlanner from './components/ActivityPlanner';
import StudentDetails from './components/StudentDetails';
import StudentDirectory from './components/StudentDirectory';
import ScheduleView from './components/ScheduleView';
import AssignmentsView from './components/AssignmentsView';
import LessonPlanner from './components/LessonPlanner';
import AnnouncementsPanel from './components/AnnouncementsPanel';
import ParentPortal from './components/ParentPortal';
import { Student, Activity, AttendanceRecord, User, Assignment, Notification, ScheduleEntry } from './types';
import { INITIAL_NOTIFICATIONS } from './constants';
import { apiService } from './services/apiService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [loading, setLoading] = useState(true);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  const fetchInitialNotifications = async () => {
    if (!currentUser) return;
    try {
      const { messages, announcements } = await apiService.getUnreadNotifications();
      const newNotifications: Notification[] = [];

      messages.forEach((m: any) => {
        newNotifications.push({
          id: `msg-${m.id}`,
          title: 'Unread Message',
          message: `From ${m.senderName || 'someone'}: ${m.text.substring(0, 30)}${m.text.length > 30 ? '...' : ''}`,
          type: 'info',
          time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          link: `/messages?userId=${m.senderId}`
        });
      });

      announcements.forEach((a: any) => {
        newNotifications.push({
          id: `ann-${a.id}`,
          title: 'Recent Announcement',
          message: a.title,
          type: 'success',
          time: new Date(a.createdAt).toLocaleDateString(),
          read: false,
          link: `/announcements#${a.id}`
        });
      });

      if (newNotifications.length > 0) {
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const filtered = newNotifications.filter(n => !existingIds.has(n.id));
          return [...filtered, ...prev];
        });
      }
    } catch (err) {
      console.error('Failed to fetch initial notifications:', err);
    }
  };

  useEffect(() => {
    // Check for existing session
    const storedUser = sessionStorage.getItem('edutrack_user');
    const storedToken = sessionStorage.getItem('edutrack_token');
    
    if (storedUser && storedToken) {
      setCurrentUser(JSON.parse(storedUser));
      apiService.setAuthToken(storedToken);
      fetchData();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      setNotifications(INITIAL_NOTIFICATIONS); // Set initial notifications
      fetchInitialNotifications();
      // Connect to socket
      const socket = io();
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Connected to server via socket');
        socket.emit('auth', currentUser.id);
      });

      socket.on('presence:update', (userIds: string[]) => {
        setOnlineUserIds(userIds);
      });

      socket.on('message:new', (message: any) => {
        console.log('New message received via socket:', message);
        // Only notify if it's for the current user and not from themselves
        if (String(message.receiverId) === String(currentUser.id)) {
          const newNotification: Notification = {
            id: `msg-${message.id || Date.now()}`,
            title: 'New Message',
            message: `You received a message from ${message.senderName || 'someone'}`,
            type: 'info',
            time: 'Just now',
            read: false,
            link: `/messages?userId=${message.senderId}`
          };
          console.log('Adding new notification:', newNotification);
          setNotifications(prev => {
            if (prev.some(n => n.id === newNotification.id)) return prev;
            return [newNotification, ...prev];
          });
        }
      });

      socket.on('announcement:new', (announcement: any) => {
        console.log('New announcement received via socket:', announcement);
        // Check if announcement is for this user's role
        if (announcement.targetRole === 'all' || announcement.targetRole === currentUser.role) {
          const newNotification: Notification = {
            id: `ann-${announcement.id || Date.now()}`,
            title: 'New Announcement',
            message: announcement.title,
            type: 'success',
            time: 'Just now',
            read: false,
            link: `/announcements#${announcement.id}`
          };
          console.log('Adding new announcement notification:', newNotification);
          setNotifications(prev => {
            if (prev.some(n => n.id === newNotification.id)) return prev;
            return [newNotification, ...prev];
          });
        }
      });

      return () => {
        socket.disconnect();
      };
    } else {
      setNotifications([]);
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsData, activitiesData, attendanceData, scheduleData] = await Promise.all([
        apiService.getStudents(),
        apiService.getActivities(),
        apiService.getAttendance(),
        apiService.getSchedule()
      ]);
      setStudents(studentsData);
      setActivities(activitiesData);
      setAttendance(attendanceData);
      setSchedule(scheduleData);

      setCurrentUser(prevUser => {
        if (prevUser?.role === 'student') {
          const updatedStudent = studentsData.find(s => s.id === prevUser.id);
          if (updatedStudent) {
            const newUser = { ...prevUser, studentData: updatedStudent };
            sessionStorage.setItem('edutrack_user', JSON.stringify(newUser));
            return newUser;
          }
        }
        return prevUser;
      });
    } catch (error) {
      // If unauthorized, clear session
      if (error instanceof Error && error.message === 'Unauthorized') {
        handleLogout();
      } else {
        console.error('Error fetching data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleAddActivity = async (newAct: Activity) => {
    try {
      await apiService.createActivity(newAct);
      setActivities(prev => [newAct, ...prev]);
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const handleUpdateActivity = async (activityId: string, updates: Partial<Activity>) => {
    try {
      if (updates.status) {
        await apiService.updateActivity(activityId, updates.status);
      }
      setActivities(prev => prev.map(a => a.id === activityId ? { ...a, ...updates } : a));
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const handleSaveAttendance = async (record: AttendanceRecord) => {
    try {
      await apiService.markAttendance(record.date, record.presentStudentIds);
      setAttendance(prev => {
        const existingIdx = prev.findIndex(a => a.date === record.date);
        if (existingIdx >= 0) {
          const newAttendance = [...prev];
          newAttendance[existingIdx] = record;
          return newAttendance;
        }
        return [...prev, record];
      });
    } catch (error) {
      console.error('Error saving attendance:', error);
    }
  };

  const handleUpdateAssignment = async (studentId: string, assignmentId: string, updates: Partial<Assignment>) => {
    try {
      await apiService.updateAssignment(assignmentId, updates);
      
      setStudents(prevStudents => {
        const updatedStudents = prevStudents.map(s => {
          if (s.id === studentId) {
            const updatedAssignments = s.assignments.map(a => 
              a.id === assignmentId ? { ...a, ...updates } : a
            );
            return { ...s, assignments: updatedAssignments };
          }
          return s;
        });

        // Update current user if they are the student whose assignment was updated
        if (currentUser?.role === 'student' && currentUser.id === studentId) {
          const updatedStudent = updatedStudents.find(s => s.id === studentId);
          if (updatedStudent) {
            const updatedUser = {
              ...currentUser,
              studentData: updatedStudent
            };
            setCurrentUser(updatedUser);
            sessionStorage.setItem('edutrack_user', JSON.stringify(updatedUser));
          }
        }
        
        return updatedStudents;
      });
    } catch (error) {
      console.error('Error updating assignment:', error);
    }
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    if (currentUser?.role === 'student' && currentUser.studentData?.id === updatedStudent.id) {
      const updatedUser = {
        ...currentUser,
        name: updatedStudent.name,
        email: updatedStudent.email,
        avatar: updatedStudent.avatar,
        studentData: updatedStudent
      };
      setCurrentUser(updatedUser);
      sessionStorage.setItem('edutrack_user', JSON.stringify(updatedUser));
    }
  };

  const handleEnrollStudent = async (studentData: Partial<Student>) => {
    try {
      await apiService.createStudent(studentData);
      await fetchData();
    } catch (error) {
      console.error('Error enrolling student:', error);
      throw error;
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setNotifications(INITIAL_NOTIFICATIONS);
    sessionStorage.setItem('edutrack_user', JSON.stringify(user));
    fetchData(); // Fetch data after login
    navigate('/');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setNotifications([]);
    sessionStorage.removeItem('edutrack_user');
    apiService.logout();
    navigate('/login');
  };

  if ((loading && !currentUser && location.pathname !== '/login') || (currentUser?.role === 'student' && !currentUser.studentData)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading EduTrack...</p>
        </div>
      </div>
    );
  }

  if (!currentUser && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  if (currentUser && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Layout 
      user={currentUser}
      onLogout={handleLogout}
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onClearNotifications={handleClearNotifications}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {currentUser.role === 'teacher' ? (
            <TeacherRoutes 
              students={students} 
              attendance={attendance} 
              activities={activities} 
              schedule={schedule} 
              currentUser={currentUser} 
              onlineUserIds={onlineUserIds}
              socket={socketRef.current}
              onSaveAttendance={handleSaveAttendance}
              onAddActivity={handleAddActivity}
              onUpdateActivity={handleUpdateActivity}
              onUpdateAssignment={handleUpdateAssignment}
              onUpdateStudent={handleUpdateStudent}
              onEnrollStudent={handleEnrollStudent}
              fetchData={fetchData}
            />
          ) : (
            <StudentRoutes 
              student={currentUser.studentData!} 
              attendance={attendance} 
              schedule={schedule} 
              activities={activities} 
              currentUser={currentUser}
              onlineUserIds={onlineUserIds}
              socket={socketRef.current}
              onUpdateAssignment={handleUpdateAssignment}
              onUpdateStudent={handleUpdateStudent}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
};

const TeacherRoutes: React.FC<{
  students: Student[];
  attendance: AttendanceRecord[];
  activities: Activity[];
  schedule: ScheduleEntry[];
  currentUser: User;
  onlineUserIds: string[];
  socket: Socket | null;
  onSaveAttendance: (record: AttendanceRecord) => Promise<void>;
  onAddActivity: (act: Activity) => Promise<void>;
  onUpdateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  onUpdateAssignment: (sId: string, aId: string, updates: Partial<Assignment>) => Promise<void>;
  onUpdateStudent: (updatedStudent: Student) => Promise<void>;
  onEnrollStudent: (studentData: Partial<Student>) => Promise<void>;
  fetchData: () => Promise<void>;
}> = ({ students, attendance, activities, schedule, currentUser, onlineUserIds, socket, onSaveAttendance, onAddActivity, onUpdateActivity, onUpdateAssignment, onUpdateStudent, onEnrollStudent, fetchData }) => (
  <Routes>
    <Route path="/" element={<Dashboard students={students} attendance={attendance} activities={activities} schedule={schedule} />} />
    <Route path="/attendance" element={<AttendanceSheet students={students} onSave={onSaveAttendance} user={currentUser} onAttendanceImported={fetchData} />} />
    <Route path="/schedule" element={<ScheduleView schedule={schedule} title="Class 9A Weekly Schedule" />} />
    <Route path="/students" element={<StudentDirectory students={students} onEnrollStudent={onEnrollStudent} />} />
    <Route path="/students/:id" element={
      <StudentDetailsWrapper 
        students={students} 
        attendance={attendance} 
        onUpdateAssignment={onUpdateAssignment}
        onUpdateStudent={onUpdateStudent}
        isTeacherView={true}
        currentUser={currentUser}
        onlineUserIds={onlineUserIds}
        socket={socket}
      />
    } />
    <Route path="/planner" element={<ActivityPlanner activities={activities} onAddActivity={onAddActivity} onUpdateActivity={onUpdateActivity} />} />
    <Route path="/announcements" element={<AnnouncementsPanel userRole={currentUser.role} />} />
    <Route path="/parents" element={<ParentPortal />} />
    <Route path="/messages" element={<MessagesWrapper currentUser={currentUser} onlineUserIds={onlineUserIds} socket={socket} />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const StudentRoutes: React.FC<{
  student: Student;
  attendance: AttendanceRecord[];
  schedule: ScheduleEntry[];
  activities: Activity[];
  currentUser: User;
  onlineUserIds: string[];
  socket: Socket | null;
  onUpdateAssignment: (sId: string, aId: string, updates: Partial<Assignment>) => Promise<void>;
  onUpdateStudent: (updatedStudent: Student) => Promise<void>;
}> = ({ student, attendance, schedule, activities, currentUser, onlineUserIds, socket, onUpdateAssignment, onUpdateStudent }) => {
  const navigate = useNavigate();
  
  if (!student) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400 font-bold uppercase tracking-widest">Student data not found.</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <StudentDashboard 
          student={student} 
          attendance={attendance} 
          schedule={schedule}
        />
      } />
      <Route path="/schedule" element={<ScheduleView schedule={schedule} title="My Timetable" />} />
      <Route path="/assignments" element={<AssignmentsView student={student} onUpdateAssignment={(aId, updates) => onUpdateAssignment(student.id, aId, updates)} />} />
      <Route path="/lesson-planner" element={<LessonPlanner student={student} activities={activities} />} />
      <Route path="/my-progress" element={
        <StudentDetails 
          student={student} 
          attendanceHistory={attendance} 
          onBack={() => navigate('/')} 
          onUpdateStudent={onUpdateStudent}
          currentUser={currentUser}
          onlineUserIds={onlineUserIds}
          socket={socket}
        />
      } />
      <Route path="/announcements" element={<AnnouncementsPanel userRole={currentUser.role} />} />
      <Route path="/messages" element={<MessagesWrapper currentUser={currentUser} onlineUserIds={onlineUserIds} socket={socket} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Helper component to handle student ID from URL
import { useParams, useSearchParams } from 'react-router-dom';
import ChatSection from './components/ChatSection';

const MessagesWrapper: React.FC<{
  currentUser: User;
  onlineUserIds: string[];
  socket: Socket | null;
}> = ({ currentUser, onlineUserIds, socket }) => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId') || undefined;
  const navigate = useNavigate();

  return (
    <div className="h-[calc(100vh-8rem)]">
      <ChatSection 
        currentUserId={currentUser.id} 
        onlineUserIds={onlineUserIds}
        socket={socket}
        initialSelectedUserId={userId}
        onClose={() => navigate(-1)}
        fullHeight
      />
    </div>
  );
};

const StudentDetailsWrapper: React.FC<{
  students: Student[];
  attendance: AttendanceRecord[];
  onUpdateAssignment: (sId: string, aId: string, updates: Partial<Assignment>) => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  isTeacherView: boolean;
  currentUser: User;
  onlineUserIds: string[];
  socket: Socket | null;
}> = ({ students, attendance, onUpdateAssignment, onUpdateStudent, isTeacherView, currentUser, onlineUserIds, socket }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const student = students.find(s => s.id === id);

  if (!student) {
    return <Navigate to="/students" replace />;
  }

  return (
    <StudentDetails 
      student={student} 
      attendanceHistory={attendance}
      onBack={() => navigate('/students')} 
      onUpdateAssignment={(aId, updates) => onUpdateAssignment(student.id, aId, updates)}
      onUpdateStudent={onUpdateStudent}
      isTeacherView={isTeacherView}
      currentUser={currentUser}
      onlineUserIds={onlineUserIds}
      socket={socket}
    />
  );
};

export default App;
