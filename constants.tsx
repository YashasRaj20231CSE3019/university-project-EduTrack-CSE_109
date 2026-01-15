
import { Student, Activity, Assignment, ScheduleEntry, AttendanceRecord } from './types';

const ASSIGNMENT_TEMPLATES = [
  { title: 'Cell Theory Essay', subject: 'Science', description: 'A 500-word essay on the origins of cell theory.' },
  { title: 'Algebra Quiz 1', subject: 'Math', description: 'Quadratic equations and linear functions.' },
  { title: 'Photosynthesis Lab Report', subject: 'Science', description: 'Documenting the results of the light intensity experiment.' },
  { title: 'Renaissance Art Analysis', subject: 'History', description: 'Analyze the techniques of Da Vinci and Michelangelo.' },
  { title: 'Shakespearean Sonnet', subject: 'English', description: 'Write an original sonnet in iambic pentameter.' },
  { title: 'JavaScript Functions', subject: 'Computer Science', description: 'Implement 5 reusable utility functions.' },
  { title: 'Map of South America', subject: 'Geography', description: 'Label all countries and major mountain ranges.' },
  { title: 'Chemistry Equation Balancing', subject: 'Science', description: 'Balance 20 complex chemical equations.' },
  { title: 'Macbeth Character Study', subject: 'English', description: 'A deep dive into the descent of Lady Macbeth.' },
  { title: 'Pythagorean Theorem', subject: 'Math', description: 'Solve 15 real-world problems using the theorem.' },
];

export const MOCK_SCHEDULE: ScheduleEntry[] = [
  { id: 'sc-1', day: 'Mon', startTime: '08:00', endTime: '09:00', subject: 'Mathematics', room: '302A', teacher: 'Prof. X' },
  { id: 'sc-2', day: 'Mon', startTime: '09:15', endTime: '10:15', subject: 'Science', room: 'Lab 1', teacher: 'Dr. Miller' },
  { id: 'sc-3', day: 'Mon', startTime: '11:00', endTime: '12:00', subject: 'English', room: '101B', teacher: 'Ms. Wright' },
  { id: 'sc-4', day: 'Tue', startTime: '08:00', endTime: '09:00', subject: 'History', room: '204', teacher: 'Mr. Brown' },
  { id: 'sc-5', day: 'Tue', startTime: '10:00', endTime: '11:30', subject: 'Art', room: 'Studio 1', teacher: 'Ms. Palette' },
  { id: 'sc-6', day: 'Wed', startTime: '09:00', endTime: '10:00', subject: 'Mathematics', room: '302A', teacher: 'Prof. X' },
  { id: 'sc-7', day: 'Wed', startTime: '10:15', endTime: '11:15', subject: 'Computer Science', room: 'IT Hub', teacher: 'Mr. Gates' },
  { id: 'sc-8', day: 'Thu', startTime: '08:00', endTime: '09:30', subject: 'Science', room: 'Lab 1', teacher: 'Dr. Miller' },
  { id: 'sc-9', day: 'Thu', startTime: '11:00', endTime: '12:30', subject: 'Physical Ed', room: 'Main Gym', teacher: 'Coach K' },
  { id: 'sc-10', day: 'Fri', startTime: '09:00', endTime: '10:00', subject: 'English', room: '101B', teacher: 'Ms. Wright' },
  { id: 'sc-11', day: 'Fri', startTime: '13:00', endTime: '14:30', subject: 'Geography', room: '202', teacher: 'Ms. Map' },
];

const firstNames = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley", "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle", "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa", "Edward", "Deborah", "Ronald", "Stephanie", "Jason", "Rebecca", "Gary", "Sharon", "Timothy", "Laura", "Jeffrey", "Cynthia", "Ryan", "Kathleen", "Jacob", "Amy", "Gary", "Shirley", "Nicholas", "Angela", "Eric", "Helen", "Stephen", "Anna", "Jonathan", "Brenda", "Larry", "Pamela", "Justin", "Nicole", "Scott", "Emma", "Brandon", "Samantha", "Frank", "Katherine", "Benjamin", "Christine", "Gregory", "Debra", "Samuel", "Rachel", "Raymond", "Catherine", "Patrick", "Carolyn", "Alexander", "Janet", "Jack", "Ruth", "Dennis", "Maria", "Jerry", "Heather"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson", "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza", "Ruiz", "Hughes", "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers", "Long", "Ross", "Foster", "Jimenez"];
const classGroups = ["9A", "9B", "10A", "10B", "11A", "12A"];

const BEHAVIOR_LOGS = [
  "Participated excellently in group discussions today.",
  "Turned in homework late but showed good understanding of the material.",
  "Helped a classmate with a difficult math problem.",
  "Was slightly distracted during the afternoon session.",
  "Showed great leadership during the team sports activity.",
  "Consistently arrives on time and prepared for lessons.",
  "Exhibited creative thinking during the science project phase.",
  "Needs to focus more on independent study time.",
];

const generateStudents = (count: number): Student[] => {
  const students: Student[] = [];
  for (let i = 1; i <= count; i++) {
    const fName = firstNames[i % firstNames.length];
    const lName = lastNames[i % lastNames.length];
    const name = `${fName} ${lName}`;
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@school.edu`;
    const grade = classGroups[Math.floor(Math.random() * classGroups.length)];
    
    // Assign 2-5 assignments per student
    const assignments: Assignment[] = [];
    const assignmentCount = Math.floor(Math.random() * 4) + 2;
    const templatePool = [...ASSIGNMENT_TEMPLATES];
    
    for(let j = 0; j < assignmentCount; j++) {
      const templateIndex = Math.floor(Math.random() * templatePool.length);
      const template = templatePool.splice(templateIndex, 1)[0];
      const grades = ["A", "A-", "B+", "B", "B-", "C+", "95%", "88%", "91%", "75%"];
      const statuses: ('submitted' | 'graded' | 'pending')[] = ['submitted', 'graded', 'pending'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      assignments.push({
        id: `as-${i}-${j}`,
        title: template.title,
        subject: template.subject,
        description: template.description,
        grade: status === 'graded' ? grades[Math.floor(Math.random() * grades.length)] : '-',
        date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString(),
        status
      });
    }

    // New behavioral notes
    const notesCount = Math.floor(Math.random() * 3) + 1;
    const behavioralNotes = Array.from({ length: notesCount }, () => 
      BEHAVIOR_LOGS[Math.floor(Math.random() * BEHAVIOR_LOGS.length)]
    );

    // New parent contact
    const parentFName = firstNames[(i + 10) % firstNames.length];
    const parentContact = {
      name: `${parentFName} ${lName}`,
      relation: Math.random() > 0.5 ? 'Mother' : 'Father',
      phone: `(555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      email: `${parentFName.toLowerCase()}.${lName.toLowerCase()}@gmail.com`
    };

    students.push({
      id: i.toString(),
      name,
      email,
      grade,
      avatar: `https://picsum.photos/seed/std${i}/200/200`,
      assignments,
      behavioralNotes,
      parentContact
    });
  }
  return students;
};

export const INITIAL_STUDENTS: Student[] = generateStudents(105);

const generateAttendanceHistory = (students: Student[]): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  
  // Last 14 days
  for (let i = 14; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Skip weekends for more realism
    const day = date.getDay();
    if (day === 0 || day === 6) continue;

    const presentIds = students
      .filter(() => Math.random() > 0.08) // 92% average attendance
      .map(s => s.id);

    records.push({
      date: date.toISOString(),
      presentStudentIds: presentIds
    });
  }
  return records;
};

export const INITIAL_ATTENDANCE: AttendanceRecord[] = generateAttendanceHistory(INITIAL_STUDENTS);

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    title: 'Photosynthesis Lab',
    subject: 'Science',
    description: 'Observe oxygen production in aquatic plants under different light conditions.',
    duration: '60 mins',
    learningObjectives: ['Understand the Calvin cycle', 'Measure rate of photosynthesis'],
    materials: ['Elodea plants', 'Beakers', 'Lamp', 'Funnel'],
    status: 'planned'
  },
  {
    id: 'act-2',
    title: 'Algebraic Equations Intro',
    subject: 'Math',
    description: 'Introduction to solving multi-step linear equations.',
    duration: '45 mins',
    learningObjectives: ['Variable isolation', 'Balance method'],
    materials: ['Whiteboard markers', 'Worksheets'],
    status: 'completed'
  },
  {
    id: 'act-3',
    title: 'Shakespearean Sonnets',
    subject: 'English',
    description: 'Analyze the structure and imagery of Sonnet 18.',
    duration: '50 mins',
    learningObjectives: ['Identify iambic pentameter', 'Understand volta'],
    materials: ['Sonnets handout', 'Highlighters'],
    status: 'planned'
  }
];
