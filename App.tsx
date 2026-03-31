
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
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
import { Student, Activity, AttendanceRecord, User, Assignment, Notification, ScheduleEntry } from './types';
import { INITIAL_NOTIFICATIONS } from './constants';
import { apiService } from './services/apiService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS as any);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
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
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
      setAttendance(prev => [...prev, record]);
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
            setCurrentUser({
              ...currentUser,
              studentData: updatedStudent
            });
          }
        }
        
        return updatedStudents;
      });
    } catch (error) {
      console.error('Error updating assignment:', error);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    navigate('/');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  if (loading) {
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
    return <LoginPage students={students} onLogin={handleLogin} />;
  }

  const TeacherRoutes = () => (
    <Routes>
      <Route path="/" element={<Dashboard students={students} attendance={attendance} activities={activities} />} />
      <Route path="/attendance" element={<AttendanceSheet students={students} onSave={handleSaveAttendance} user={currentUser} />} />
      <Route path="/schedule" element={<ScheduleView schedule={schedule} title="Class 9A Weekly Schedule" />} />
      <Route path="/students" element={<StudentDirectory students={students} />} />
      <Route path="/students/:id" element={
        <StudentDetailsWrapper 
          students={students} 
          attendance={attendance} 
          onUpdateAssignment={handleUpdateAssignment}
          isTeacherView={true}
        />
      } />
      <Route path="/planner" element={<ActivityPlanner activities={activities} onAddActivity={handleAddActivity} onUpdateActivity={handleUpdateActivity} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  const StudentRoutes = () => {
    const student = currentUser.studentData!;
    return (
      <Routes>
        <Route path="/" element={
          <StudentDashboard 
            student={student} 
            attendance={attendance} 
          />
        } />
        <Route path="/schedule" element={<ScheduleView schedule={schedule} title="My Timetable" />} />
        <Route path="/assignments" element={<AssignmentsView student={student} onUpdateAssignment={(aId, updates) => handleUpdateAssignment(student.id, aId, updates)} />} />
        <Route path="/lesson-planner" element={<LessonPlanner student={student} activities={activities} />} />
        <Route path="/my-progress" element={
          <StudentDetails 
            student={student} 
            attendanceHistory={attendance} 
            onBack={() => navigate('/')} 
          />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  };

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
          {currentUser.role === 'teacher' ? <TeacherRoutes /> : <StudentRoutes />}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
};

// Helper component to handle student ID from URL
import { useParams } from 'react-router-dom';
const StudentDetailsWrapper: React.FC<{
  students: Student[];
  attendance: AttendanceRecord[];
  onUpdateAssignment: (sId: string, aId: string, updates: Partial<Assignment>) => void;
  isTeacherView: boolean;
}> = ({ students, attendance, onUpdateAssignment, isTeacherView }) => {
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
      isTeacherView={isTeacherView}
    />
  );
};

export default App;
