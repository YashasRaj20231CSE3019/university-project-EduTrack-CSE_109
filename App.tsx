
import React, { useState, useEffect } from 'react';
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
import { View, Student, Activity, AttendanceRecord, User, Assignment, Notification, ScheduleEntry } from './types';
import { INITIAL_NOTIFICATIONS } from './constants';
import { apiService } from './services/apiService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS as any);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      if (updates.grade && updates.status) {
        await apiService.updateAssignment(assignmentId, updates.grade, updates.status);
      }
      
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
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedStudentId(null);
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

  if (!currentUser) {
    return <LoginPage students={students} onLogin={handleLogin} />;
  }

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const renderView = () => {
    // Student specific views
    if (currentUser.role === 'student') {
      const student = currentUser.studentData!;
      switch (currentView) {
        case 'dashboard':
          return (
            <StudentDashboard 
              student={student} 
              attendance={attendance} 
              onNavigateToAssignments={() => setCurrentView('assignments')}
              onNavigateToSchedule={() => setCurrentView('schedule')}
              onNavigateToLessonPlan={() => setCurrentView('lesson-planner')}
            />
          );
        case 'schedule':
          return <ScheduleView schedule={schedule} title="My Timetable" />;
        case 'assignments':
          return <AssignmentsView student={student} onUpdateAssignment={(aId, updates) => handleUpdateAssignment(student.id, aId, updates)} />;
        case 'lesson-planner':
          return <LessonPlanner student={student} activities={activities} />;
        case 'my-progress':
          return (
            <StudentDetails 
              student={student} 
              attendanceHistory={attendance} 
              onBack={() => setCurrentView('dashboard')} 
            />
          );
        default:
          return (
            <StudentDashboard 
              student={student} 
              attendance={attendance} 
              onNavigateToAssignments={() => setCurrentView('assignments')}
              onNavigateToSchedule={() => setCurrentView('schedule')}
              onNavigateToLessonPlan={() => setCurrentView('lesson-planner')}
            />
          );
      }
    }

    // Teacher specific views
    switch (currentView) {
      case 'dashboard':
        return <Dashboard students={students} attendance={attendance} activities={activities} />;
      case 'attendance':
        return <AttendanceSheet students={students} onSave={handleSaveAttendance} user={currentUser} />;
      case 'schedule':
        return <ScheduleView schedule={schedule} title="Class 9A Weekly Schedule" />;
      case 'students':
        if (selectedStudent) {
          return (
            <StudentDetails 
              student={selectedStudent} 
              attendanceHistory={attendance}
              onBack={() => setSelectedStudentId(null)} 
              onUpdateAssignment={(aId, updates) => handleUpdateAssignment(selectedStudent.id, aId, updates)}
              isTeacherView={true}
            />
          );
        }
        return (
          <StudentDirectory 
            students={students} 
            onSelectStudent={setSelectedStudentId} 
          />
        );
      case 'planner':
        return <ActivityPlanner activities={activities} onAddActivity={handleAddActivity} onUpdateActivity={handleUpdateActivity} />;
      default:
        return <Dashboard students={students} attendance={attendance} activities={activities} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onViewChange={setCurrentView}
      user={currentUser}
      onLogout={handleLogout}
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onClearNotifications={handleClearNotifications}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
