
import { Student, AttendanceRecord, ScheduleEntry, Activity } from '../types';

const API_BASE = '/api';

export const apiService = {
  async getStudents(): Promise<Student[]> {
    const res = await fetch(`${API_BASE}/students`);
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  },

  async getStudent(id: string): Promise<Student> {
    const res = await fetch(`${API_BASE}/students/${id}`);
    if (!res.ok) throw new Error('Failed to fetch student');
    return res.json();
  },

  async getAttendance(): Promise<AttendanceRecord[]> {
    const res = await fetch(`${API_BASE}/attendance`);
    if (!res.ok) throw new Error('Failed to fetch attendance');
    return res.json();
  },

  async markAttendance(date: string, presentStudentIds: string[]): Promise<void> {
    const res = await fetch(`${API_BASE}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, presentStudentIds })
    });
    if (!res.ok) throw new Error('Failed to mark attendance');
  },

  async getSchedule(): Promise<ScheduleEntry[]> {
    const res = await fetch(`${API_BASE}/schedule`);
    if (!res.ok) throw new Error('Failed to fetch schedule');
    return res.json();
  },

  async getActivities(): Promise<Activity[]> {
    const res = await fetch(`${API_BASE}/activities`);
    if (!res.ok) throw new Error('Failed to fetch activities');
    return res.json();
  },

  async createActivity(activity: Activity): Promise<void> {
    const res = await fetch(`${API_BASE}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity)
    });
    if (!res.ok) throw new Error('Failed to create activity');
  },

  async updateActivity(id: string, status: string): Promise<void> {
    const res = await fetch(`${API_BASE}/activities/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update activity');
  },

  async updateAssignment(id: string, grade: string, status: string): Promise<void> {
    const res = await fetch(`${API_BASE}/assignments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grade, status })
    });
    if (!res.ok) throw new Error('Failed to update assignment');
  },

  async getQRToken(studentId: string): Promise<string> {
    const res = await fetch(`${API_BASE}/qr/token/${studentId}`);
    if (!res.ok) throw new Error('Failed to get QR token');
    const data = await res.json();
    return data.token;
  },

  async verifyQR(token: string, teacherId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/qr/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, teacherId })
    });
    if (!res.ok) throw new Error('Failed to verify QR');
    return res.json();
  }
};
