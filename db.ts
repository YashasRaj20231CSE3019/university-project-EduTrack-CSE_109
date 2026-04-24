
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_STUDENTS, INITIAL_ATTENDANCE, INITIAL_ACTIVITIES, MOCK_SCHEDULE } from './constants.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === "production";
const dbPath = isProd ? path.join('/tmp', 'edutrack.db') : path.join(__dirname, 'edutrack.db');
const db = new Database(dbPath);

// Initialize database
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      grade TEXT NOT NULL,
      avatar TEXT,
      behavioralNotes TEXT,
      parentContact TEXT
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT,
      grade TEXT,
      date TEXT,
      status TEXT,
      submissionText TEXT,
      submissionFile TEXT,
      comments TEXT,
      FOREIGN KEY (studentId) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      subject TEXT NOT NULL,
      grade TEXT NOT NULL DEFAULT 'all',
      presentStudentIds TEXT NOT NULL,
      UNIQUE(date, subject, grade)
    );

    CREATE TABLE IF NOT EXISTS schedule (
      id TEXT PRIMARY KEY,
      day TEXT NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      subject TEXT NOT NULL,
      room TEXT,
      teacher TEXT
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT,
      duration TEXT,
      learningObjectives TEXT,
      materials TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      authorName TEXT NOT NULL,
      priority TEXT DEFAULT 'normal',
      targetRole TEXT DEFAULT 'all',
      attachmentUrl TEXT,
      attachmentName TEXT
    );

    CREATE TABLE IF NOT EXISTS schedule_requests (
      id TEXT PRIMARY KEY,
      teacherId TEXT NOT NULL,
      teacherName TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      adminComment TEXT,
      createdAt TEXT NOT NULL,
      details TEXT NOT NULL -- JSON blob of the change (day, time, subject, etc.)
    );

    CREATE TABLE IF NOT EXISTS used_qr_tokens (
      token TEXT PRIMARY KEY,
      usedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      avatar TEXT
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      senderId TEXT NOT NULL,
      receiverId TEXT NOT NULL,
      text TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      attachmentUrl TEXT,
      attachmentName TEXT,
      attachmentType TEXT,
      replyToId TEXT
    );
  `);

  // Migration: Add submissionText and submissionFile if they don't exist
  try {
    db.exec("ALTER TABLE assignments ADD COLUMN submissionText TEXT;");
  } catch (e) {
    // Column might already exist
  }
  try {
    db.exec("ALTER TABLE assignments ADD COLUMN submissionFile TEXT;");
  } catch (e) {
    // Column might already exist
  }
  try {
    db.exec("ALTER TABLE assignments ADD COLUMN comments TEXT;");
  } catch (e) {
    // Column might already exist
  }

  try {
    db.exec("ALTER TABLE attendance ADD COLUMN subject TEXT;");
    db.prepare("UPDATE attendance SET subject = 'General' WHERE subject IS NULL").run();
  } catch (e) {
    // Column might already exist
  }

  // Migration: Add attachment fields to messages if they don't exist
  try {
    db.exec("ALTER TABLE messages ADD COLUMN attachmentUrl TEXT;");
  } catch (e) {
    // Column might already exist
  }
  try {
    db.exec("ALTER TABLE messages ADD COLUMN attachmentName TEXT;");
  } catch (e) {
    // Column might already exist
  }
  try {
    db.exec("ALTER TABLE messages ADD COLUMN attachmentType TEXT;");
  } catch (e) {
    // Column might already exist
  }
  try {
    db.exec("ALTER TABLE announcements ADD COLUMN attachmentUrl TEXT;");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE announcements ADD COLUMN attachmentName TEXT;");
  } catch (e) {}

  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS schedule_requests (
        id TEXT PRIMARY KEY,
        teacherId TEXT NOT NULL,
        teacherName TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        adminComment TEXT,
        createdAt TEXT NOT NULL,
        details TEXT NOT NULL
      );
    `);
  } catch (e) {}

  // Seed teachers if empty
  const teacherCount = db.prepare('SELECT count(*) as count FROM teachers').get() as { count: number };
  if (teacherCount.count === 0) {
    console.log('🌱 Seeding teachers...');
    const insertTeacher = db.prepare('INSERT INTO teachers (id, name, email, avatar) VALUES (?, ?, ?, ?)');
    db.transaction(() => {
      insertTeacher.run('teacher-1', 'Dr. Sharma', 'sharma@school.edu', 'https://picsum.photos/seed/teacher1/200/200');
      insertTeacher.run('teacher-2', 'Prof. Verma', 'verma@school.edu', 'https://picsum.photos/seed/teacher2/200/200');
      insertTeacher.run('teacher-3', 'Ms. Gupta', 'gupta@school.edu', 'https://picsum.photos/seed/teacher3/200/200');
      insertTeacher.run('teacher-4', 'Admin Teacher', 'yashasrajvideos@gmail.com', 'https://picsum.photos/seed/teacher4/200/200');
    })();
    console.log('✅ Teachers seeded.');
  }

  // Ensure admin teacher exists
  try {
    const adminTeacher = db.prepare('SELECT * FROM teachers WHERE email = ?').get('yashasrajvideos@gmail.com');
    if (!adminTeacher) {
      db.prepare('INSERT INTO teachers (id, name, email, avatar) VALUES (?, ?, ?, ?)').run(
        'teacher-4', 'Admin Teacher', 'yashasrajvideos@gmail.com', 'https://picsum.photos/seed/teacher4/200/200'
      );
    }
  } catch (e) {
    console.error('Failed to ensure admin teacher:', e);
  }

  // Seed data if empty
  const studentCount = db.prepare('SELECT count(*) as count FROM students').get() as { count: number };
  if (studentCount.count === 0) {
    console.log('🌱 Seeding database...');
    
    const insertStudent = db.prepare('INSERT INTO students (id, name, email, grade, avatar, behavioralNotes, parentContact) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const insertAssignment = db.prepare('INSERT INTO assignments (id, studentId, title, subject, description, grade, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const insertAttendance = db.prepare('INSERT INTO attendance (date, subject, presentStudentIds) VALUES (?, ?, ?)');
    const insertSchedule = db.prepare('INSERT INTO schedule (id, day, startTime, endTime, subject, room, teacher) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const insertActivity = db.prepare('INSERT INTO activities (id, title, subject, description, duration, learningObjectives, materials, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

    db.transaction(() => {
      for (const student of INITIAL_STUDENTS) {
        insertStudent.run(
          student.id,
          student.name,
          student.email,
          student.grade,
          student.avatar,
          JSON.stringify(student.behavioralNotes),
          JSON.stringify(student.parentContact)
        );

        for (const assignment of student.assignments) {
          insertAssignment.run(
            assignment.id,
            student.id,
            assignment.title,
            assignment.subject,
            assignment.description,
            assignment.grade,
            assignment.date,
            assignment.status
          );
        }
      }

      for (const record of INITIAL_ATTENDANCE) {
        const normalizedDate = record.date.split('T')[0];
        insertAttendance.run(normalizedDate, record.subject, JSON.stringify(record.presentStudentIds));
      }

      for (const entry of MOCK_SCHEDULE) {
        insertSchedule.run(entry.id, entry.day, entry.startTime, entry.endTime, entry.subject, entry.room, entry.teacher);
      }

      for (const activity of INITIAL_ACTIVITIES) {
        insertActivity.run(
          activity.id,
          activity.title,
          activity.subject,
          activity.description,
          activity.duration,
          JSON.stringify(activity.learningObjectives),
          JSON.stringify(activity.materials),
          activity.status
        );
      }
    })();
    console.log('✅ Seeding complete.');
  }
}

export default db;
