
import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import db, { initDb } from "./db.ts";
import type { AuthToken } from "./types.ts";

declare global {
  namespace Express {
    interface Request {
      user?: AuthToken;
    }
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const isProd = process.env.NODE_ENV === "production";
const uploadsDir = isProd ? path.join("/tmp", "uploads") : path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Initialize Database
initDb();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const PORT = Number(process.env.PORT) || 3000;

// Presence tracking
const onlineUsers = new Map<string, string>(); // userId -> socketId

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("auth", (userId: any) => {
    if (userId) {
      const userIdStr = String(userId);
      socket.join(userIdStr);
      onlineUsers.set(userIdStr, socket.id); // Keep for presence tracking (last active)
      console.log(`User ${userIdStr} joined room and is online`);
      io.emit("presence:update", Array.from(onlineUsers.keys()));
    }
  });

  socket.on("disconnect", () => {
    let disconnectedUserId: string | null = null;
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        break;
      }
    }
    if (disconnectedUserId) {
      // Check if user has other sockets connected (in other tabs)
      // This is a bit complex with just rooms, so we'll stick to the Map for presence
      // but use rooms for messaging.
      onlineUsers.delete(disconnectedUserId);
      console.log(`User ${disconnectedUserId} went offline`);
      io.emit("presence:update", Array.from(onlineUsers.keys()));
    }
  });
});

let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not defined. Using fallback secret.');
  JWT_SECRET = 'edutrack-secret-key-123-fallback';
}

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

// Middleware
const requireAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as any;
    req.user = { id: decoded.id, role: decoded.role, name: decoded.name };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const requireTeacher = (req: any, res: any, next: any) => {
  requireAuth(req, res, () => {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Teacher access required' });
    }
    next();
  });
};

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/login", (req, res) => {
  const { email, role } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  
  if (role === 'teacher') {
    const teacher = db.prepare('SELECT * FROM teachers WHERE email = ?').get(normalizedEmail) as any;
    if (teacher) {
      const user = { id: teacher.id, role: 'teacher', name: teacher.name, avatar: teacher.avatar };
      const token = jwt.sign(user, JWT_SECRET as string, { expiresIn: '8h' });
      return res.json({ token, user });
    }
    return res.status(401).json({ message: 'Invalid teacher credentials' });
  } else if (role === 'student') {
    const student = db.prepare('SELECT * FROM students WHERE email = ?').get(normalizedEmail) as any;
    if (student) {
      const user = { id: student.id, role: 'student', name: student.name };
      const token = jwt.sign(user, JWT_SECRET as string, { expiresIn: '8h' });
      
      const formattedStudent = {
        ...student,
        behavioralNotes: JSON.parse(student.behavioralNotes || '[]'),
        parentContact: JSON.parse(student.parentContact || '{}'),
        assignments: db.prepare('SELECT * FROM assignments WHERE studentId = ?').all(student.id)
      };
      return res.json({ token, user: formattedStudent });
    }
    return res.status(401).json({ message: 'Student not found' });
  }
  return res.status(400).json({ message: 'Invalid role' });
});

// Students API
app.get("/api/students", requireAuth, (req: any, res) => {
  const students = db.prepare('SELECT * FROM students').all() as any[];
  const formattedStudents = students.map(s => ({
    ...s,
    behavioralNotes: JSON.parse(s.behavioralNotes || '[]'),
    parentContact: JSON.parse(s.parentContact || '{}'),
    assignments: db.prepare('SELECT * FROM assignments WHERE studentId = ?').all(s.id)
  }));
  res.json(formattedStudents);
});

app.get("/api/students/:id", requireAuth, (req: any, res) => {
  const { id } = req.params;
  
  if (req.user.role === 'student' && req.user.id !== id) {
    return res.status(403).json({ message: "Access denied: Students can only view their own record" });
  }

  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id) as any;
  if (!student) return res.status(404).json({ message: "Student not found" });
  
  const formattedStudent = {
    ...student,
    behavioralNotes: JSON.parse(student.behavioralNotes || '[]'),
    parentContact: JSON.parse(student.parentContact || '{}'),
    assignments: db.prepare('SELECT * FROM assignments WHERE studentId = ?').all(id)
  };
  res.json(formattedStudent);
});

app.post("/api/students", requireTeacher, (req, res) => {
  const { name, email, grade, avatar, behavioralNotes, parentContact } = req.body;
  if (!name || !email || !grade) return res.status(400).json({ message: "Missing required fields" });

  const id = `student-${Math.random().toString(36).substr(2, 9)}`;
  const insert = db.prepare(`
    INSERT INTO students (id, name, email, grade, avatar, behavioralNotes, parentContact)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  insert.run(
    id, 
    name, 
    email.toLowerCase().trim(), 
    grade, 
    avatar || `https://picsum.photos/seed/${id}/200/200`,
    JSON.stringify(behavioralNotes || []),
    JSON.stringify(parentContact || {})
  );
  
  res.json({ success: true, id });
});

// Attendance API
app.get("/api/attendance", requireAuth, (req, res) => {
  const attendance = db.prepare('SELECT * FROM attendance ORDER BY date ASC').all() as any[];
  const formattedAttendance = attendance.map(a => ({
    ...a,
    presentStudentIds: JSON.parse(a.presentStudentIds || '[]')
  }));
  res.json(formattedAttendance);
});

app.post("/api/attendance", requireTeacher, (req, res) => {
  const { date, presentStudentIds } = req.body;
  if (!date || !presentStudentIds) return res.status(400).json({ message: "Missing date or presentStudentIds" });

  const upsert = db.prepare(`
    INSERT INTO attendance (date, presentStudentIds) 
    VALUES (?, ?) 
    ON CONFLICT(date) DO UPDATE SET presentStudentIds = excluded.presentStudentIds
  `);
  const normalizedDate = date.split('T')[0];
  upsert.run(normalizedDate, JSON.stringify(presentStudentIds));
  res.json({ success: true });
});

// Schedule API
app.get("/api/schedule", requireAuth, (req, res) => {
  const schedule = db.prepare('SELECT * FROM schedule').all();
  res.json(schedule);
});

// Activities API
app.get("/api/activities", requireAuth, (req, res) => {
  const activities = db.prepare('SELECT * FROM activities').all() as any[];
  const formattedActivities = activities.map(a => ({
    ...a,
    learningObjectives: JSON.parse(a.learningObjectives || '[]'),
    materials: JSON.parse(a.materials || '[]')
  }));
  res.json(formattedActivities);
});

app.post("/api/activities", requireTeacher, (req, res) => {
  const { id, title, subject, description, duration, learningObjectives, materials, status } = req.body;
  const insert = db.prepare(`
    INSERT INTO activities (id, title, subject, description, duration, learningObjectives, materials, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run(id, title, subject, description, duration, JSON.stringify(learningObjectives), JSON.stringify(materials), status);
  res.json({ success: true });
});

app.patch("/api/activities/:id", requireTeacher, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const update = db.prepare('UPDATE activities SET status = ? WHERE id = ?');
  update.run(status, id);
  res.json({ success: true });
});

// Assignments API
app.patch("/api/assignments/:id", requireAuth, (req: any, res) => {
  const { id } = req.params;
  const { grade, status, submissionText, submissionFile, comments } = req.body;
  
  if (req.user.role === 'student' && (grade !== undefined || comments !== undefined)) {
    return res.status(403).json({ message: "Access denied: Students cannot set grades or comments" });
  }
  
  const update = db.prepare(`
    UPDATE assignments 
    SET grade = COALESCE(?, grade), 
        status = COALESCE(?, status),
        submissionText = COALESCE(?, submissionText),
        submissionFile = COALESCE(?, submissionFile),
        comments = COALESCE(?, comments)
    WHERE id = ?
  `);
  const result = update.run(grade || null, status || null, submissionText || null, submissionFile || null, comments || null, id);
  
  if (result.changes === 0) return res.status(404).json({ message: "Assignment not found" });
  res.json({ success: true });
});

// QR Code API
app.get("/api/qr/token/:studentId", requireAuth, (req: any, res) => {
  const { studentId } = req.params;
  
  if (req.user.role === 'student' && req.user.id !== studentId) {
    return res.status(403).json({ message: "Access denied: Students can only generate their own QR token" });
  }
  
  const token = jwt.sign({ studentId, timestamp: Date.now() }, JWT_SECRET as string, { expiresIn: "30s" });
  res.json({ token });
});

// File Upload API
app.post("/api/upload", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.originalname });
});

app.post("/api/qr/verify", requireTeacher, (req, res) => {
  const { token, teacherId } = req.body;
  if (!token) return res.status(400).json({ success: false, message: "No token provided" });
  
  const usedTokenRecord = db.prepare('SELECT * FROM used_qr_tokens WHERE token = ?').get(token);
  if (usedTokenRecord) return res.status(400).json({ success: false, message: "Token already used" });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as any;
    
    // Insert into used_qr_tokens
    db.prepare('INSERT INTO used_qr_tokens (token, usedAt) VALUES (?, ?)').run(token, new Date().toISOString());
    
    // Clean up old tokens (older than 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    db.prepare('DELETE FROM used_qr_tokens WHERE usedAt < ?').run(fiveMinutesAgo);
    
    // Mark attendance for today
    const today = new Date().toISOString().split('T')[0];
    const record = db.prepare('SELECT * FROM attendance WHERE date = ?').get(today) as any;
    let presentIds = record ? JSON.parse(record.presentStudentIds) : [];
    
    if (!presentIds.includes(decoded.studentId)) {
      presentIds.push(decoded.studentId);
      const upsert = db.prepare(`
        INSERT INTO attendance (date, presentStudentIds) 
        VALUES (?, ?) 
        ON CONFLICT(date) DO UPDATE SET presentStudentIds = excluded.presentStudentIds
      `);
      upsert.run(today, JSON.stringify(presentIds));
    }

    res.json({ success: true, studentId: decoded.studentId });
  } catch (err: any) {
    res.status(401).json({ success: false, message: "Invalid or expired QR code" });
  }
});

// Announcements API
app.get("/api/announcements", requireAuth, (req: any, res) => {
  const role = req.user.role;
  const announcements = db.prepare(`
    SELECT * FROM announcements 
    WHERE targetRole = 'all' OR targetRole = ? 
    ORDER BY createdAt DESC
  `).all(role);
  res.json(announcements);
});

app.post("/api/announcements", requireTeacher, (req: any, res) => {
  const { id, title, message, priority, targetRole } = req.body;
  const createdAt = new Date().toISOString();
  const authorName = req.user.name;
  
  const insert = db.prepare(`
    INSERT INTO announcements (id, title, message, priority, targetRole, createdAt, authorName)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run(id, title, message, priority, targetRole, createdAt, authorName);
  
  // Notify users via socket
  io.emit("announcement:new", {
    id,
    title,
    message,
    priority,
    targetRole,
    authorName,
    createdAt
  });
  
  res.json({ success: true });
});

app.delete("/api/announcements/:id", requireTeacher, (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM announcements WHERE id = ?').run(id);
  res.json({ success: true });
});

// Parent Contacts API
app.get("/api/parent-contacts", requireTeacher, (req, res) => {
  const students = db.prepare('SELECT id, name, parentContact FROM students').all() as any[];
  const contacts = students.map(s => {
    const parentContact = JSON.parse(s.parentContact || '{}');
    return {
      studentId: s.id,
      studentName: s.name,
      parentName: parentContact.name || '',
      parentRelation: parentContact.relation || '',
      parentPhone: parentContact.phone || '',
      parentEmail: parentContact.email || '',
      notes: parentContact.notes || ''
    };
  });
  res.json(contacts);
});

app.patch("/api/parent-contacts/:studentId", requireTeacher, (req, res) => {
  const { studentId } = req.params;
  const updates = req.body;
  
  const student = db.prepare('SELECT parentContact FROM students WHERE id = ?').get(studentId) as any;
  if (!student) return res.status(404).json({ message: "Student not found" });
  
  const currentContact = JSON.parse(student.parentContact || '{}');
  const newContact = { ...currentContact, ...updates };
  
  db.prepare('UPDATE students SET parentContact = ? WHERE id = ?').run(JSON.stringify(newContact), studentId);
  res.json({ success: true });
});

// Bulk Attendance CSV Import
app.post("/api/attendance/import-csv", requireTeacher, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  
  try {
    const csvData = fs.readFileSync(req.file.path, 'utf-8');
    const lines = csvData.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length === 0) return res.status(400).json({ message: "Empty CSV file" });
    
    const headers = lines[0].toLowerCase().split(',');
    const dateIdx = headers.indexOf('date');
    const emailIdx = headers.indexOf('email');
    const statusIdx = headers.indexOf('status');
    
    if (dateIdx === -1 || emailIdx === -1 || statusIdx === -1) {
      return res.status(400).json({ message: "CSV must contain 'date', 'email', and 'status' columns" });
    }
    
    const attendanceMap = new Map<string, Set<string>>();
    let skippedRows = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',');
      if (row.length < 3) {
        skippedRows++;
        continue;
      }
      
      const date = row[dateIdx].trim();
      const email = row[emailIdx].trim();
      const status = row[statusIdx].trim().toLowerCase();
      
      if (status !== 'present') {
        skippedRows++;
        continue;
      }
      
      const student = db.prepare('SELECT id FROM students WHERE email = ?').get(email) as any;
      if (!student) {
        skippedRows++;
        continue;
      }
      
      if (!attendanceMap.has(date)) {
        attendanceMap.set(date, new Set<string>());
      }
      attendanceMap.get(date)!.add(student.id);
    }
    
    const summary: any[] = [];
    const upsert = db.prepare(`
      INSERT INTO attendance (date, presentStudentIds) 
      VALUES (?, ?) 
      ON CONFLICT(date) DO UPDATE SET presentStudentIds = excluded.presentStudentIds
    `);
    
    db.transaction(() => {
      for (const [date, studentIds] of attendanceMap.entries()) {
        const normalizedDate = date.split('T')[0];
        const idsArray = Array.from(studentIds);
        
        // Merge with existing attendance if any
        const existingRecord = db.prepare('SELECT presentStudentIds FROM attendance WHERE date = ?').get(normalizedDate) as any;
        if (existingRecord) {
          const existingIds = JSON.parse(existingRecord.presentStudentIds);
          existingIds.forEach((id: string) => studentIds.add(id));
        }
        
        upsert.run(normalizedDate, JSON.stringify(Array.from(studentIds)));
        summary.push({ date: normalizedDate, imported: idsArray.length });
      }
    })();
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    res.json({ 
      success: true, 
      datesProcessed: attendanceMap.size, 
      skippedRows, 
      summary 
    });
  } catch (err) {
    console.error("CSV Import Error:", err);
    res.status(500).json({ message: "Failed to process CSV file" });
  }
});

// Notifications API
app.get("/api/notifications/unread", requireAuth, (req: any, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  // Unread messages
  const unreadMessages = db.prepare(`
    SELECT m.*, t.name as senderName 
    FROM messages m
    LEFT JOIN teachers t ON m.senderId = t.id
    WHERE m.receiverId = ? AND m.read = 0
  `).all(userId) as any[];

  // If sender wasn't a teacher, try student
  unreadMessages.forEach(m => {
    if (!m.senderName) {
      const student = db.prepare('SELECT name FROM students WHERE id = ?').get(m.senderId) as any;
      if (student) m.senderName = student.name;
    }
  });

  // Recent announcements (last 24h)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const recentAnnouncements = db.prepare(`
    SELECT * FROM announcements 
    WHERE (targetRole = 'all' OR targetRole = ?) 
    AND createdAt > ?
    ORDER BY createdAt DESC
  `).all(role, oneDayAgo);

  res.json({
    messages: unreadMessages,
    announcements: recentAnnouncements
  });
});

// Users API
app.get("/api/users", requireAuth, (req: any, res) => {
  try {
    const currentUserId = req.user.id;
    const students = db.prepare("SELECT id, name, email, avatar, 'student' as role FROM students").all() as any[];
    
    // Ensure teachers table exists before querying
    let teachers = [] as any[];
    try {
      teachers = db.prepare("SELECT id, name, email, avatar, 'teacher' as role FROM teachers").all() as any[];
    } catch (e) {
      console.warn("Teachers table might not exist yet, returning empty list");
    }
    
    // Get unread counts for the current user
    const unreadCounts = db.prepare(`
      SELECT senderId, COUNT(*) as count 
      FROM messages 
      WHERE receiverId = ? AND read = 0 
      GROUP BY senderId
    `).all(currentUserId) as any[];

    const unreadMap = new Map(unreadCounts.map(c => [c.senderId, c.count]));

    const studentsWithUnread = students.map(s => ({
      ...s,
      unreadCount: unreadMap.get(s.id) || 0
    }));

    const teachersWithUnread = teachers.map(t => ({
      ...t,
      unreadCount: unreadMap.get(t.id) || 0
    }));

    res.json({ students: studentsWithUnread, teachers: teachersWithUnread });
  } catch (err) {
    console.error("Error in /api/users:", err);
    res.status(500).json({ message: "Failed to fetch users", error: String(err) });
  }
});

// Profile Update API
app.patch("/api/students/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const { name, email, avatar } = req.body;
  
  // Only allow students to update their own profile, or teachers to update any student
  if (req.user!.role !== 'teacher' && req.user!.id !== id) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (name) { updates.push("name = ?"); params.push(name); }
  if (email) { updates.push("email = ?"); params.push(email); }
  if (avatar) { updates.push("avatar = ?"); params.push(avatar); }

  if (updates.length === 0) return res.json({ success: true });

  params.push(id);
  db.prepare(`UPDATE students SET ${updates.join(", ")} WHERE id = ?`).run(...params);
  res.json({ success: true });
});

// Chat API
app.get("/api/messages/:otherUserId", requireAuth, (req: any, res) => {
  const { otherUserId } = req.params;
  const userId = req.user!.id;
  
  const messages = db.prepare(`
    SELECT * FROM messages 
    WHERE (senderId = ? AND receiverId = ?) 
       OR (senderId = ? AND receiverId = ?)
    ORDER BY timestamp ASC
  `).all(userId, otherUserId, otherUserId, userId);
  
  // Mark these messages as read
  db.prepare('UPDATE messages SET read = 1 WHERE receiverId = ? AND senderId = ?').run(userId, otherUserId);
  
  res.json(messages);
});

app.post("/api/messages/read", requireAuth, (req: any, res) => {
  const { senderId } = req.body;
  const userId = req.user!.id;
  db.prepare('UPDATE messages SET read = 1 WHERE receiverId = ? AND senderId = ?').run(userId, senderId);
  res.json({ success: true });
});

app.post("/api/messages", requireAuth, (req: any, res) => {
  const { receiverId, text, attachmentUrl, attachmentName, attachmentType } = req.body;
  const senderId = req.user!.id;
  const senderName = req.user!.name;
  const id = Math.random().toString(36).substr(2, 9);
  const timestamp = new Date().toISOString();
  
  db.prepare(`
    INSERT INTO messages (id, senderId, receiverId, text, timestamp, read, attachmentUrl, attachmentName, attachmentType)
    VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)
  `).run(id, senderId, receiverId, text, timestamp, attachmentUrl || null, attachmentName || null, attachmentType || null);
  
  const message = { id, senderId, receiverId, text, timestamp, read: 0, senderName, attachmentUrl, attachmentName, attachmentType };
  
  // Notify both sender and receiver via socket rooms (supports multiple tabs)
  io.to(String(senderId)).emit("message:new", message);
  io.to(String(receiverId)).emit("message:new", message);
  
  res.json(message);
});

app.post("/api/chat/upload", requireAuth, upload.single("file"), (req: any, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  
  const fileUrl = `/uploads/${req.file.filename}`;
  const fileName = req.file.originalname;
  const mimeType = req.file.mimetype;
  let attachmentType = 'other';
  if (mimeType.startsWith('image/')) attachmentType = 'image';
  else if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text') || mimeType.includes('msword') || mimeType.includes('excel')) attachmentType = 'document';
  
  res.json({
    url: fileUrl,
    name: fileName,
    type: attachmentType
  });
});

app.patch("/api/messages/:id", requireAuth, (req: any, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.user!.id;

  const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(id) as any;
  if (!message) return res.status(404).json({ message: 'Message not found' });
  if (String(message.senderId) !== String(userId)) return res.status(403).json({ message: 'Unauthorized' });

  db.prepare('UPDATE messages SET text = ? WHERE id = ?').run(text, id);
  
  const updatedMessage = { ...message, text };
  
  io.to(String(message.senderId)).emit("message:update", updatedMessage);
  io.to(String(message.receiverId)).emit("message:update", updatedMessage);

  res.json(updatedMessage);
});

app.delete("/api/messages/:id", requireAuth, (req: any, res) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(id) as any;
  if (!message) return res.status(404).json({ message: 'Message not found' });
  if (String(message.senderId) !== String(userId)) return res.status(403).json({ message: 'Unauthorized' });

  db.prepare('DELETE FROM messages WHERE id = ?').run(id);
  
  io.to(String(message.senderId)).emit("message:delete", id);
  io.to(String(message.receiverId)).emit("message:delete", id);

  res.json({ success: true });
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 EduTrack Server running on http://localhost:${PORT}`);
  });
}

startServer();
