
import type { Student, Activity, Assignment, ScheduleEntry, AttendanceRecord, Notification } from './types.ts';

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
  { id: 'sc-1', day: 'Mon', startTime: '08:00', endTime: '09:00', subject: 'Mathematics', room: '302A', teacher: 'Prof. Verma' },
  { id: 'sc-2', day: 'Mon', startTime: '09:15', endTime: '10:15', subject: 'Science', room: 'Lab 1', teacher: 'Dr. Sharma' },
  { id: 'sc-3', day: 'Mon', startTime: '11:00', endTime: '12:00', subject: 'English', room: '101B', teacher: 'Ms. Gupta' },
  { id: 'sc-4', day: 'Tue', startTime: '08:00', endTime: '09:00', subject: 'History', room: '204', teacher: 'Mr. Singh' },
  { id: 'sc-5', day: 'Tue', startTime: '10:00', endTime: '11:30', subject: 'Art', room: 'Studio 1', teacher: 'Ms. Patel' },
  { id: 'sc-6', day: 'Wed', startTime: '09:00', endTime: '10:00', subject: 'Mathematics', room: '302A', teacher: 'Prof. Verma' },
  { id: 'sc-7', day: 'Wed', startTime: '10:15', endTime: '11:15', subject: 'Computer Science', room: 'IT Hub', teacher: 'Mr. Kumar' },
  { id: 'sc-8', day: 'Thu', startTime: '08:00', endTime: '09:30', subject: 'Science', room: 'Lab 1', teacher: 'Dr. Sharma' },
  { id: 'sc-9', day: 'Thu', startTime: '11:00', endTime: '12:30', subject: 'Physical Ed', room: 'Main Gym', teacher: 'Coach Rao' },
  { id: 'sc-10', day: 'Fri', startTime: '09:00', endTime: '10:00', subject: 'English', room: '101B', teacher: 'Ms. Gupta' },
  { id: 'sc-11', day: 'Fri', startTime: '13:00', endTime: '14:30', subject: 'Geography', room: '202', teacher: 'Ms. Desai' },
];

const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Atharv", "Advik", "Pranav", "Kabir", "Ritvik", "Aryan", "Dhruv", "Rudra", "Ojas", "Ananya", "Myra", "Saanvi", "Diya", "Pari", "Aaradhya", "Anika", "Navya", "Avni", "Isha", "Riya", "Aadhya", "Kavya", "Kiara", "Prisha", "Roshni", "Neha", "Pooja", "Sneha", "Kriti", "Rahul", "Rohit", "Amit", "Sumit", "Sanjay", "Rajesh", "Ramesh", "Suresh", "Mahesh", "Dinesh", "Karan", "Varun", "Tarun", "Arun", "Ravi", "Priya", "Kiran", "Megha", "Shikha", "Swati", "Nidhi", "Divya", "Shilpa", "Rekha", "Geeta", "Seema", "Sunita", "Anita", "Kavita", "Savita", "Ritu", "Nisha", "Asha", "Usha", "Lata", "Maya", "Tara", "Mira", "Gauri", "Radha", "Meera", "Sita", "Gita", "Rani", "Mona", "Sona", "Tina", "Mina", "Rina", "Bina", "Hina", "Zoya", "Zara", "Sana", "Saba", "Nida", "Huda", "Fiza", "Rida", "Safa", "Marwa"];
const lastNames = ["Sharma", "Verma", "Gupta", "Malhotra", "Singh", "Kapoor", "Kumar", "Das", "Bose", "Sen", "Nair", "Menon", "Pillai", "Reddy", "Rao", "Naidu", "Gowda", "Patil", "Deshmukh", "Joshi", "Kulkarni", "Deshpande", "Bhatt", "Trivedi", "Vyas", "Mishra", "Pandey", "Shukla", "Tiwari", "Dubey", "Yadav", "Chauhan", "Rajput", "Thakur", "Rathore", "Shekhawat", "Choudhary", "Jat", "Gurjar", "Meena", "Bhil", "Gond", "Santhal", "Munda", "Oraon", "Ho", "Kharia", "Bhumij", "Mahato", "Kurmi", "Koiri", "Teli", "Sahu", "Bania", "Agarwal", "Garg", "Bansal", "Goyal", "Jain", "Shah", "Mehta", "Desai", "Patel", "Amin", "Modi", "Gandhi", "Ambani", "Adani", "Tata", "Birla", "Hinduja", "Godrej", "Bajaj", "Mahindra", "TVS", "Murthy", "Premji", "Nadella", "Pichai", "Nooyi", "Banga", "Kurien", "Swaminathan", "Kalam", "Raman", "Bose", "Ramanujan", "Chandrasekhar", "Khurana", "Sen", "Bhagwati", "Rajan", "Basu", "Banerjee", "Chatterjee", "Mukherjee", "Bhattacharya", "Ganguly", "Goswami"];
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
    const fName = firstNames[(i - 1) % firstNames.length];
    const lName = lastNames[(i - 1) % lastNames.length];
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
      phone: `+91 ${Math.floor(60000 + Math.random() * 39999)} ${Math.floor(10000 + Math.random() * 89999)}`,
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

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'not-1',
    title: 'New Assignment',
    message: 'A new assignment "Cell Theory Essay" has been posted.',
    time: '2 hours ago',
    read: false,
    type: 'info',
    link: '/assignments'
  },
  {
    id: 'not-2',
    title: 'Attendance Alert',
    message: 'Class 9A attendance is below average today.',
    time: '4 hours ago',
    read: false,
    type: 'warning',
    link: '/attendance'
  },
  {
    id: 'not-3',
    title: 'System Update',
    message: 'EduTrack has been updated with new AI features.',
    time: '1 day ago',
    read: true,
    type: 'success',
    link: '/'
  }
];
