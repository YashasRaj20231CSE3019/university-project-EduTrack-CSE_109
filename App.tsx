
import React, { useState } from 'react';
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
import { View, Student, Activity, AttendanceRecord, User, Assignment } from './types';
import { INITIAL_STUDENTS, INITIAL_ACTIVITIES, MOCK_SCHEDULE, INITIAL_ATTENDANCE } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const handleAddActivity = (newAct: Activity) => {
    setActivities(prev => [newAct, ...prev]);
  };

  const handleSaveAttendance = (record: AttendanceRecord) => {
    setAttendance(prev => [...prev, record]);
  };

  const handleUpdateAssignment = (studentId: string, assignmentId: string, updates: Partial<Assignment>) => {
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
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedStudentId(null);
  };

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
            />
          );
        case 'schedule':
          return <ScheduleView schedule={MOCK_SCHEDULE} title="My Timetable" />;
        case 'assignments':
          return <AssignmentsView student={student} onUpdateAssignment={(aId, updates) => handleUpdateAssignment(student.id, aId, updates)} />;
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
            />
          );
      }
    }

    // Teacher specific views
    switch (currentView) {
      case 'dashboard':
        return <Dashboard students={students} attendance={attendance} activities={activities} />;
      case 'attendance':
        return <AttendanceSheet students={students} onSave={handleSaveAttendance} />;
      case 'schedule':
        return <ScheduleView schedule={MOCK_SCHEDULE} title="Class 9A Weekly Schedule" />;
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
        return <ActivityPlanner onAddActivity={handleAddActivity} />;
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
    >
      {renderView()}
    </Layout>
  );
};

export default App;
