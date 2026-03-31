
import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";
import db, { initDb } from "./db.ts";

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
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "edutrack-secret-key-123";

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

// In-memory store for used tokens to prevent replay attacks
const usedTokens = new Set<string>();

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Students API
app.get("/api/students", (req, res) => {
  const students = db.prepare('SELECT * FROM students').all() as any[];
  const formattedStudents = students.map(s => ({
    ...s,
    behavioralNotes: JSON.parse(s.behavioralNotes || '[]'),
    parentContact: JSON.parse(s.parentContact || '{}'),
    assignments: db.prepare('SELECT * FROM assignments WHERE studentId = ?').all(s.id)
  }));
  res.json(formattedStudents);
});

app.get("/api/students/:id", (req, res) => {
  const { id } = req.params;
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

// Attendance API
app.get("/api/attendance", (req, res) => {
  const attendance = db.prepare('SELECT * FROM attendance ORDER BY date ASC').all() as any[];
  const formattedAttendance = attendance.map(a => ({
    ...a,
    presentStudentIds: JSON.parse(a.presentStudentIds || '[]')
  }));
  res.json(formattedAttendance);
});

app.post("/api/attendance", (req, res) => {
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
app.get("/api/schedule", (req, res) => {
  const schedule = db.prepare('SELECT * FROM schedule').all();
  res.json(schedule);
});

// Activities API
app.get("/api/activities", (req, res) => {
  const activities = db.prepare('SELECT * FROM activities').all() as any[];
  const formattedActivities = activities.map(a => ({
    ...a,
    learningObjectives: JSON.parse(a.learningObjectives || '[]'),
    materials: JSON.parse(a.materials || '[]')
  }));
  res.json(formattedActivities);
});

app.post("/api/activities", (req, res) => {
  const { id, title, subject, description, duration, learningObjectives, materials, status } = req.body;
  const insert = db.prepare(`
    INSERT INTO activities (id, title, subject, description, duration, learningObjectives, materials, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run(id, title, subject, description, duration, JSON.stringify(learningObjectives), JSON.stringify(materials), status);
  res.json({ success: true });
});

app.patch("/api/activities/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const update = db.prepare('UPDATE activities SET status = ? WHERE id = ?');
  update.run(status, id);
  res.json({ success: true });
});

// Assignments API
app.patch("/api/assignments/:id", (req, res) => {
  const { id } = req.params;
  const { grade, status, submissionText, submissionFile } = req.body;
  
  const update = db.prepare(`
    UPDATE assignments 
    SET grade = COALESCE(?, grade), 
        status = COALESCE(?, status),
        submissionText = COALESCE(?, submissionText),
        submissionFile = COALESCE(?, submissionFile)
    WHERE id = ?
  `);
  const result = update.run(grade || null, status || null, submissionText || null, submissionFile || null, id);
  
  if (result.changes === 0) return res.status(404).json({ message: "Assignment not found" });
  res.json({ success: true });
});

// QR Code API
app.get("/api/qr/token/:studentId", (req, res) => {
  const { studentId } = req.params;
  const token = jwt.sign({ studentId, timestamp: Date.now() }, JWT_SECRET, { expiresIn: "30s" });
  res.json({ token });
});

// File Upload API
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.originalname });
});

app.post("/api/qr/verify", (req, res) => {
  const { token, teacherId } = req.body;
  if (!token) return res.status(400).json({ success: false, message: "No token provided" });
  if (usedTokens.has(token)) return res.status(400).json({ success: false, message: "Token already used" });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    usedTokens.add(token);
    
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 EduTrack Server running on http://localhost:${PORT}`);
  });
}

startServer();
