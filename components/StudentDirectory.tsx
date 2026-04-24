
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Student, AttendanceRecord } from '../types';
import { Search, X, UserPlus, Mail, GraduationCap } from 'lucide-react';

interface StudentDirectoryProps {
  students: Student[];
  attendance?: AttendanceRecord[];
  onEnrollStudent?: (student: Partial<Student>) => Promise<void>;
}

const StudentDirectory: React.FC<StudentDirectoryProps> = ({ students, attendance = [], onEnrollStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All Grades');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    grade: 'Grade 9'
  });
  const navigate = useNavigate();

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onEnrollStudent) return;
    
    setIsSubmitting(true);
    try {
      await onEnrollStudent(newStudent);
      setShowEnrollModal(false);
      setNewStudent({ name: '', email: '', grade: 'Grade 9' });
    } catch (error) {
      console.error('Failed to enroll student:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const grades = useMemo(() => {
    const uniqueGrades = Array.from(new Set(students.map(s => s.grade)));
    return ['All Grades', ...uniqueGrades.sort()];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade = gradeFilter === 'All Grades' || student.grade === gradeFilter;
      return matchesSearch && matchesGrade;
    });
  }, [students, searchTerm, gradeFilter]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-indigo-600 p-6 md:p-8 rounded-3xl border border-indigo-500 shadow-xl text-white">
        <div className="text-center lg:text-left">
          <h3 className="text-xl font-bold text-white mb-1 tracking-tight">Student Management</h3>
          <p className="text-xs font-medium text-indigo-100">Manage {students.length} active enrollments in your system.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 flex-1 max-w-2xl lg:justify-end">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300 transition-colors group-focus-within:text-white" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/20 focus:border-white focus:outline-none text-sm transition-all shadow-sm text-white placeholder:text-indigo-300"
            />
          </div>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/20 focus:border-white focus:outline-none text-sm font-bold text-white transition-all cursor-pointer shadow-sm"
          >
            {grades.map(grade => (
              <option key={grade} value={grade} className="text-slate-900">{grade}</option>
            ))}
          </select>
          <button 
            onClick={() => setShowEnrollModal(true)}
            className="px-6 py-2.5 bg-white text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-all shadow-sm active:scale-95 shrink-0"
          >
            + Enroll Student
          </button>
        </div>
      </div>
      
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredStudents.map(s => {
            const myAttendance = attendance.filter(record => record.presentStudentIds.includes(s.id));
            const attRate = attendance.length > 0 
              ? Math.round((myAttendance.length / attendance.length) * 100) 
              : 100;

            return (
              <div 
                key={s.id} 
                onClick={() => navigate(`/students/${s.id}`)}
                className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-indigo-300 transition-all duration-300 cursor-pointer relative flex flex-col items-center text-center"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl border border-slate-100 shadow-sm overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    <img src={s.avatar} className="w-full h-full object-cover" alt={s.name} />
                  </div>
                  <div className="absolute -bottom-2 -right-2 px-2 py-1 bg-white border border-slate-200 text-[9px] font-bold rounded shadow-sm text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    {s.grade}
                  </div>
                </div>
                
                <div className="w-full px-2">
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1 truncate leading-none">{s.name}</h4>
                  <p className="text-[10px] font-medium text-slate-400 mb-6 lowercase truncate">{s.email}</p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-6">
                     <div className="bg-slate-50 rounded-xl p-2 group-hover:bg-indigo-50/30 transition-colors">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Attendance</p>
                        <p className="text-xs font-bold text-slate-900">{attRate}%</p>
                     </div>
                     <div className="bg-slate-50 rounded-xl p-2 group-hover:bg-indigo-50/30 transition-colors">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                        <p className="text-xs font-bold text-green-600 uppercase">Active</p>
                     </div>
                  </div>
                  
                  <button className="w-full py-2 bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all active:scale-95">
                    VIEW PROFILE
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner"><Search className="w-8 h-8 text-slate-300" /></div>
          <h4 className="text-xl font-bold text-slate-900 mb-2">No students found</h4>
          <p className="text-slate-400 text-sm max-w-xs text-center">Try adjusting your search criteria or enroll a new student to your database.</p>
          <button 
            onClick={() => { setSearchTerm(''); setGradeFilter('All Grades'); }}
            className="mt-8 text-slate-900 font-bold text-sm px-6 py-2 border border-slate-900 rounded-lg hover:bg-slate-900 hover:text-white transition-all active:scale-95"
          >
            Clear Search
          </button>
        </div>
      )}
      {/* Enroll Student Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Enroll New Student</h3>
                  <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">Add to your database</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEnrollModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEnrollSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. John Doe"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:outline-none text-sm transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    required
                    type="email"
                    placeholder="e.g. john@school.edu"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:outline-none text-sm transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade Level</label>
                <select
                  value={newStudent.grade}
                  onChange={(e) => setNewStudent({...newStudent, grade: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:outline-none text-sm font-bold text-slate-700 transition-all cursor-pointer"
                >
                  {grades.filter(g => g !== 'All Grades').map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-95 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100 text-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Enrolling...
                    </>
                  ) : (
                    'Enroll Student'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDirectory;
