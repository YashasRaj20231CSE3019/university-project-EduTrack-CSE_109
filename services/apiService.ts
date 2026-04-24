
import { Student, AttendanceRecord, ScheduleEntry, Activity, Assignment, Announcement, ParentMessage, ScheduleRequest } from '../types';

const API_BASE = '/api';

const TOKEN_KEY = 'edutrack_token';

export const apiService = {
  setAuthToken(token: string | null) {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  },

  getAuthToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  },

  authHeaders(): HeadersInit {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  },

  async apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = { ...this.authHeaders(), ...options.headers };
    const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
    
    if (res.status === 401) {
      this.setAuthToken(null);
      sessionStorage.removeItem('edutrack_user');
      window.location.href = '/';
      throw new Error('Unauthorized');
    }
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${res.status}`);
    }
    
    return res;
  },

  async login(email: string, role: string): Promise<{ token: string; user: any }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role })
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }
    
    const data = await res.json();
    this.setAuthToken(data.token);
    return data;
  },

  logout() {
    this.setAuthToken(null);
  },

  async getStudents(): Promise<Student[]> {
    const res = await this.apiFetch('/students');
    return res.json();
  },

  async getStudent(id: string): Promise<Student> {
    const res = await this.apiFetch(`/students/${id}`);
    return res.json();
  },

  async createStudent(student: Partial<Student>): Promise<{ success: boolean; id: string }> {
    const res = await this.apiFetch('/students', {
      method: 'POST',
      body: JSON.stringify(student)
    });
    return res.json();
  },

  async getAttendance(): Promise<AttendanceRecord[]> {
    const res = await this.apiFetch('/attendance');
    return res.json();
  },

  async markAttendance(date: string, presentStudentIds: string[], subject?: string, grade?: string): Promise<void> {
    await this.apiFetch('/attendance', {
      method: 'POST',
      body: JSON.stringify({ date, presentStudentIds, subject, grade })
    });
  },

  async getSchedule(): Promise<ScheduleEntry[]> {
    const res = await this.apiFetch('/schedule');
    return res.json();
  },

  async getActivities(): Promise<Activity[]> {
    const res = await this.apiFetch('/activities');
    return res.json();
  },

  async createActivity(activity: Activity): Promise<void> {
    await this.apiFetch('/activities', {
      method: 'POST',
      body: JSON.stringify(activity)
    });
  },

  async updateActivity(id: string, status: string): Promise<void> {
    await this.apiFetch(`/activities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<void> {
    await this.apiFetch(`/assignments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  async uploadFile(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = this.getAuthToken();
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers, // Do not set Content-Type for FormData, browser handles boundary
      body: formData
    });
    
    if (res.status === 401) {
      this.setAuthToken(null);
      throw new Error('Unauthorized');
    }
    if (!res.ok) throw new Error('Failed to upload file');
    return res.json();
  },

  async getQRToken(studentId: string): Promise<string> {
    const res = await this.apiFetch(`/qr/token/${studentId}`);
    const data = await res.json();
    return data.token;
  },

  async verifyQR(token: string, teacherId: string, subject?: string): Promise<any> {
    const res = await this.apiFetch('/qr/verify', {
      method: 'POST',
      body: JSON.stringify({ token, teacherId, subject })
    });
    return res.json();
  },

  async getAnnouncements(): Promise<Announcement[]> {
    const res = await this.apiFetch('/announcements');
    return res.json();
  },

  async createAnnouncement(announcement: Announcement): Promise<void> {
    await this.apiFetch('/announcements', {
      method: 'POST',
      body: JSON.stringify(announcement)
    });
  },

  async deleteAnnouncement(id: string): Promise<void> {
    await this.apiFetch(`/announcements/${id}`, {
      method: 'DELETE'
    });
  },

  async getParentContacts(): Promise<ParentMessage[]> {
    const res = await this.apiFetch('/parent-contacts');
    return res.json();
  },

  async updateParentContact(studentId: string, updates: Partial<ParentMessage>): Promise<void> {
    await this.apiFetch(`/parent-contacts/${studentId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  async importAttendanceCSV(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = this.getAuthToken();
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const res = await fetch(`${API_BASE}/attendance/import-csv`, {
      method: 'POST',
      headers, // Do not set Content-Type for FormData
      body: formData
    });
    
    if (res.status === 401) {
      this.setAuthToken(null);
      throw new Error('Unauthorized');
    }
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to import CSV');
    }
    
    return res.json();
  },

  async getUsers(): Promise<{ students: any[]; teachers: any[] }> {
    const res = await this.apiFetch('/users');
    return res.json();
  },

  async getUnreadNotifications(): Promise<{ messages: any[]; announcements: any[] }> {
    const res = await this.apiFetch('/notifications/unread');
    return res.json();
  },

  async updateStudentProfile(id: string, updates: { name?: string; email?: string; avatar?: string }): Promise<void> {
    await this.apiFetch(`/students/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  async updateProfile(updates: { name?: string; email?: string; password?: string }): Promise<void> {
    await this.apiFetch('/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  async getMessages(otherUserId: string): Promise<any[]> {
    const res = await this.apiFetch(`/messages/${otherUserId}`);
    return res.json();
  },

  async sendMessage(receiverId: string, text: string, attachmentUrl?: string, attachmentName?: string, attachmentType?: string, replyToId?: string): Promise<any> {
    const res = await this.apiFetch('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, text, attachmentUrl, attachmentName, attachmentType, replyToId })
    });
    return res.json();
  },

  async uploadChatAttachment(file: File): Promise<{ url: string; name: string; type: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = this.getAuthToken();
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const res = await fetch(`${API_BASE}/chat/upload`, {
      method: 'POST',
      headers,
      body: formData
    });
    
    if (res.status === 401) {
      this.setAuthToken(null);
      throw new Error('Unauthorized');
    }
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to upload attachment');
    }
    
    return res.json();
  },

  async markMessageAsRead(senderId: string): Promise<void> {
    await this.apiFetch('/messages/read', {
      method: 'POST',
      body: JSON.stringify({ senderId })
    });
  },
  
  async editMessage(id: string, text: string): Promise<any> {
    const res = await this.apiFetch(`/messages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ text })
    });
    return res.json();
  },

  async deleteMessage(id: string): Promise<void> {
    await this.apiFetch(`/messages/${id}`, {
      method: 'DELETE'
    });
  },

  async getScheduleRequests(): Promise<ScheduleRequest[]> {
    const res = await this.apiFetch('/schedule-requests');
    return res.json();
  },

  async createScheduleRequest(request: Partial<ScheduleRequest>): Promise<void> {
    await this.apiFetch('/schedule-requests', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  },

  async updateScheduleRequest(id: string, status: string, adminComment?: string): Promise<void> {
    await this.apiFetch(`/schedule-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminComment })
    });
  }
};
