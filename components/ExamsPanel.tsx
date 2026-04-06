import React, { useState, useRef, useMemo } from 'react';
import { FileText, Printer, GraduationCap, Download, CheckCircle2, AlertCircle, Calendar, MapPin, User as UserIcon, ArrowLeft, ChevronRight, Users, Filter } from 'lucide-react';
import { User, ExamResult, HallTicket, Student } from '../types';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

interface ExamsPanelProps {
  user: User;
  students?: Student[];
}

const SUBJECTS = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer Science'];
const EXAM_TYPES = ['Midterm', 'Endterm'] as const;

const pseudoRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const x = Math.sin(hash++) * 10000;
  return x - Math.floor(x);
};

const MOCK_HALL_TICKET: HallTicket = {
  id: 'ht-1',
  studentId: 'student-1',
  studentName: 'Alex Johnson',
  grade: '10th Grade',
  examType: 'Endterm',
  examCenter: 'Main Block, Room 402',
  rollNumber: 'ET-2026-001',
  subjects: [
    { name: 'Mathematics', date: '2026-05-10', time: '09:00 AM' },
    { name: 'Science', date: '2026-05-12', time: '10:30 AM' },
    { name: 'English', date: '2026-05-14', time: '09:00 AM' },
    { name: 'History', date: '2026-05-16', time: '01:00 PM' },
  ]
};

export const ExamsPanel: React.FC<ExamsPanelProps> = ({ user, students = [] }) => {
  const [activeTab, setActiveTab] = useState<'results' | 'hall-ticket'>('results');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const hallTicketRef = useRef<HTMLDivElement>(null);

  // Generate mock results for all provided students
  const mockResults = useMemo(() => {
    const results: ExamResult[] = [];
    let idCounter = 1;

    // If no students are passed (e.g., fallback), we could generate some, but we expect students array.
    // In student view, students array might just contain the current student.
    const studentsToProcess = students.length > 0 ? students : [{ id: user.id, name: user.name, grade: '10A' } as Student];

    studentsToProcess.forEach((student) => {
      EXAM_TYPES.forEach(examType => {
        SUBJECTS.forEach((subject, subIdx) => {
          const seed = `${student.id}-${examType}-${subject}`;
          const rand = pseudoRandom(seed);
          
          // Generate marks between 65 and 100
          const marks = Math.floor(65 + (rand * 36));
          
          let grade = 'C';
          if (marks >= 95) grade = 'A+';
          else if (marks >= 90) grade = 'A';
          else if (marks >= 85) grade = 'A-';
          else if (marks >= 80) grade = 'B+';
          else if (marks >= 75) grade = 'B';
          else if (marks >= 70) grade = 'B-';
          else if (marks >= 65) grade = 'C+';

          const month = examType === 'Midterm' ? '03' : '06';
          const day = 15 + subIdx;
          const date = `2026-${month}-${day.toString().padStart(2, '0')}`;

          results.push({
            id: (idCounter++).toString(),
            studentId: student.id,
            studentName: student.name,
            examType,
            subject,
            marks,
            totalMarks: 100,
            grade,
            date
          });
        });
      });
    });
    return results;
  }, [students, user.id, user.name]);

  const uniqueGrades = useMemo(() => {
    const grades = new Set(students.map(s => s.grade));
    return ['All', ...Array.from(grades).sort()];
  }, [students]);

  const handlePrintHallTicket = async () => {
    if (!hallTicketRef.current) return;
    
    try {
      const dataUrl = await toPng(hallTicketRef.current, { quality: 0.95, backgroundColor: '#fff' });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Hall_Ticket_${user.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    }
  };

  const renderResultsTable = (results: ExamResult[]) => (
    <div className="overflow-x-auto border border-slate-100 rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50">
            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grade</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {results.map((res) => (
            <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 font-bold text-slate-700 text-sm">{res.subject}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900">{res.marks}</span>
                  <span className="text-slate-400 text-xs">/ {res.totalMarks}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                  res.grade.startsWith('A') ? 'bg-green-50 text-green-600' : 
                  res.grade.startsWith('B') ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {res.grade}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500 font-medium">{new Date(res.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderResultsDetail = (results: ExamResult[], title: string, onBack?: () => void) => {
    const midterm = results.filter(r => r.examType === 'Midterm');
    const endterm = results.filter(r => r.examType === 'Endterm');

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Students
          </button>
        )}
        
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              {title}
            </h2>
          </div>
          
          <div className="p-6 space-y-8">
            {/* Midterm Section */}
            <div>
              <h3 className="text-md font-black text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Midterm Examinations
              </h3>
              {midterm.length > 0 ? renderResultsTable(midterm) : <p className="text-sm text-slate-500">No midterm results available.</p>}
            </div>
            
            {/* Endterm Section */}
            <div>
              <h3 className="text-md font-black text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span> Endterm Examinations
              </h3>
              {endterm.length > 0 ? renderResultsTable(endterm) : <p className="text-sm text-slate-500">No endterm results available.</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTeacherStudentList = () => {
    // Filter students based on selected grade
    const filteredStudents = selectedGrade === 'All' 
      ? students 
      : students.filter(s => s.grade === selectedGrade);

    const studentsWithResults = filteredStudents.map(student => {
      const studentResults = mockResults.filter(r => r.studentId === student.id);
      return {
        id: student.id,
        name: student.name,
        grade: student.grade,
        resultCount: studentResults.length
      };
    });

    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Student Results Overview
          </h2>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 font-medium shadow-sm"
            >
              {uniqueGrades.map(grade => (
                <option key={grade} value={grade}>{grade === 'All' ? 'All Sections' : `Section ${grade}`}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {studentsWithResults.length > 0 ? (
            studentsWithResults.map(student => (
              <div 
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className="p-6 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      {student.name}
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] uppercase tracking-wider">
                        {student.grade}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{student.resultCount} Exam Records</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-500 font-medium">
              No students found for the selected section.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Examinations</h1>
          <p className="text-slate-500 font-medium">Results and Hall Tickets</p>
        </div>
        
        {user.role === 'student' && (
          <div className="flex w-full md:w-auto bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <button 
              onClick={() => setActiveTab('results')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'results' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Results
            </button>
            <button 
              onClick={() => setActiveTab('hall-ticket')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'hall-ticket' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Hall Ticket
            </button>
          </div>
        )}
      </div>

      {activeTab === 'results' ? (
        user.role === 'teacher' ? (
          selectedStudentId ? (
            renderResultsDetail(
              mockResults.filter(r => r.studentId === selectedStudentId),
              `${mockResults.find(r => r.studentId === selectedStudentId)?.studentName}'s Results`,
              () => setSelectedStudentId(null)
            )
          ) : (
            renderTeacherStudentList()
          )
        ) : (
          renderResultsDetail(
            mockResults.filter(r => r.studentId === user.id || r.studentName === user.name),
            'My Examination Results'
          )
        )
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button 
              onClick={handlePrintHallTicket}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              <Printer className="w-4 h-4" /> Print Hall Ticket
            </button>
          </div>

          <div className="flex justify-center">
            <div 
              ref={hallTicketRef}
              className="bg-white w-full max-w-2xl p-12 rounded-[2rem] border-2 border-slate-200 shadow-2xl relative overflow-hidden"
            >
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-50 rounded-full -ml-24 -mb-24 opacity-50"></div>
              
              <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-12 pb-8 border-b-2 border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200">
                      <GraduationCap className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">EduTrack</h2>
                      <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest">Academic Institution</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2">
                      Official Hall Ticket
                    </div>
                    <p className="text-slate-500 font-bold text-sm">{MOCK_HALL_TICKET.examType} Examination 2026</p>
                  </div>
                </div>

                {/* Student Info Grid */}
                <div className="grid grid-cols-2 gap-10 mb-12">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Student Name</label>
                      <div className="flex items-center gap-2 text-slate-900">
                        <UserIcon className="w-4 h-4 text-indigo-500" />
                        <span className="text-lg font-black">{user.name}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Roll Number</label>
                      <div className="text-lg font-black text-slate-900">{MOCK_HALL_TICKET.rollNumber}</div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Grade / Class</label>
                      <div className="text-lg font-black text-slate-900">{MOCK_HALL_TICKET.grade}</div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Examination Center</label>
                      <div className="flex items-center gap-2 text-slate-900">
                        <MapPin className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-bold">{MOCK_HALL_TICKET.examCenter}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule Table */}
                <div className="mb-12">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Examination Schedule</label>
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-100/50">
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">Subject</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/50">
                        {MOCK_HALL_TICKET.subjects.map((sub, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4 font-bold text-slate-800 text-sm">{sub.name}</td>
                            <td className="px-6 py-4 text-sm text-slate-600 font-medium">{new Date(sub.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-sm text-slate-600 font-medium">{sub.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer / Instructions */}
                <div className="pt-8 border-t-2 border-dashed border-slate-100 flex items-end justify-between">
                  <div className="max-w-xs">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">Important Instructions</h4>
                    <ul className="text-[9px] text-slate-500 space-y-1 font-medium list-disc pl-4">
                      <li>Please carry this hall ticket to every examination.</li>
                      <li>Report to the exam center 30 minutes before the start time.</li>
                      <li>Electronic gadgets are strictly prohibited in the exam hall.</li>
                    </ul>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-1 bg-slate-900 mb-2 mx-auto"></div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Principal's Signature</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
