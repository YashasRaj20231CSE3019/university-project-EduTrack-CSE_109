
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
  submissionText?: string;
  submissionFile?: string;
  comments?: string;
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

export type View = 'dashboard' | 'attendance' | 'students' | 'planner' | 'my-progress' | 'schedule' | 'assignments' | 'lesson-planner';

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
}

export interface ActivitySuggestion {
  title: string;
  description: string;
  learningObjectives: string[];
  materials: string[];
  duration: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  authorName: string;
  priority: 'normal' | 'high' | 'urgent';
  targetRole: 'all' | 'teacher' | 'student';
}

export interface ParentMessage {
  studentId: string;
  studentName: string;
  parentName: string;
  parentRelation: string;
  parentPhone: string;
  parentEmail: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface ChatRoom {
  id: string;
  participants: string[]; // [userId1, userId2]
  lastMessage?: ChatMessage;
}

export interface ChatUser {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  email: string;
  unreadCount?: number;
}

export interface AuthToken {
  id: string;
  email: string;
  role: Role;
  name: string;
}
