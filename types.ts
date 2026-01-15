
export type Role = 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  studentData?: Student; // Populated if the user is a student
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  grade: string; // e.g., "A", "85%"
  date: string;
  status: 'submitted' | 'graded' | 'pending';
  description?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  avatar: string;
  assignments: Assignment[];
  behavioralNotes?: string[];
  parentContact?: {
    name: string;
    relation: string;
    phone: string;
    email: string;
  };
}

export interface AttendanceRecord {
  date: string; // ISO date string
  presentStudentIds: string[];
}

export interface Activity {
  id: string;
  title: string;
  subject: string;
  description: string;
  duration: string;
  learningObjectives: string[];
  materials: string[];
  status: 'planned' | 'completed';
}

export interface ScheduleEntry {
  id: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
  startTime: string;
  endTime: string;
  subject: string;
  room: string;
  teacher?: string;
}

export type View = 'dashboard' | 'attendance' | 'students' | 'planner' | 'my-progress' | 'schedule' | 'assignments';

export interface ActivitySuggestion {
  title: string;
  description: string;
  learningObjectives: string[];
  materials: string[];
  duration: string;
}
