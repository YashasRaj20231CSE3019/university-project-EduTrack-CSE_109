
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_STUDENTS, INITIAL_ATTENDANCE, INITIAL_ACTIVITIES, MOCK_SCHEDULE } from './constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'edutrack.db'));

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
      FOREIGN KEY (studentId) REFERENCES students(id)
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE NOT NULL,
      presentStudentIds TEXT NOT NULL
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
  `);

  // Seed data if empty
  const studentCount = db.prepare('SELECT count(*) as count FROM students').get() as { count: number };
  if (studentCount.count === 0) {
    console.log('🌱 Seeding database...');
    
    const insertStudent = db.prepare('INSERT INTO students (id, name, email, grade, avatar, behavioralNotes, parentContact) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const insertAssignment = db.prepare('INSERT INTO assignments (id, studentId, title, subject, description, grade, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const insertAttendance = db.prepare('INSERT INTO attendance (date, presentStudentIds) VALUES (?, ?)');
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
        insertAttendance.run(normalizedDate, JSON.stringify(record.presentStudentIds));
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
