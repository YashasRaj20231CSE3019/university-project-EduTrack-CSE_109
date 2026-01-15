
import React, { useState, useMemo } from 'react';
import { Student } from '../types';

interface StudentDirectoryProps {
  students: Student[];
  onSelectStudent: (id: string) => void;
}

const StudentDirectory: React.FC<StudentDirectoryProps> = ({ students, onSelectStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All Grades');

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-2xl font-black text-slate-800 mb-1">Student Management</h3>
          <p className="text-sm font-medium text-slate-500">Manage {students.length} active enrollments in your system.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-2xl lg:justify-end">
          <div className="flex-1 relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600">🔍</span>
            <input
              type="text"
              placeholder="Search by name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none text-sm transition-all"
            />
          </div>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none text-sm font-bold text-slate-700 transition-all appearance-none cursor-pointer"
          >
            {grades.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
          <button className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 shrink-0">
            + Enroll Student
          </button>
        </div>
      </div>
      
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          {filteredStudents.map(s => (
            <div 
              key={s.id} 
              onClick={() => onSelectStudent(s.id)}
              className="group bg-white border border-slate-200 rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-indigo-100 hover:border-indigo-300 transition-all duration-300 cursor-pointer relative flex flex-col items-center text-center overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[4rem] group-hover:bg-indigo-50 transition-colors"></div>
              <div className="relative z-10 mb-6">
                <div className="w-24 h-24 rounded-[2rem] border-4 border-white shadow-xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                  <img src={s.avatar} className="w-full h-full object-cover" alt={s.name} />
                </div>
                <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-white border border-slate-100 text-[10px] font-black rounded-lg shadow-md text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  {s.grade}
                </div>
              </div>
              
              <div className="relative z-10 w-full px-2">
                <h4 className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors mb-1 truncate leading-none">{s.name}</h4>
                <p className="text-xs font-bold text-slate-400 mb-6 font-mono lowercase truncate">{s.email}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                   <div className="bg-slate-50 rounded-2xl p-3 group-hover:bg-indigo-50 transition-colors">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Attendance</p>
                      <p className="text-sm font-black text-slate-800">96.5%</p>
                   </div>
                   <div className="bg-slate-50 rounded-2xl p-3 group-hover:bg-indigo-50 transition-colors">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Status</p>
                      <p className="text-sm font-black text-emerald-600 uppercase">Active</p>
                   </div>
                </div>
                
                <button className="w-full py-3 bg-slate-900 text-white text-xs font-black rounded-2xl hover:bg-indigo-600 transition-all active:scale-95">
                  VIEW FULL PROFILE
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">🔍</div>
          <h4 className="text-2xl font-black text-slate-800 mb-2">No students found</h4>
          <p className="text-slate-500 font-medium max-w-xs text-center">Try adjusting your search criteria or enroll a new student to your database.</p>
          <button 
            onClick={() => { setSearchTerm(''); setGradeFilter('All Grades'); }}
            className="mt-8 text-indigo-600 font-black text-sm px-6 py-2 border-2 border-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentDirectory;
