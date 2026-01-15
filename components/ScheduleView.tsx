import React, { useState } from 'react';
import { ScheduleEntry } from '../types';

interface ScheduleViewProps {
  schedule: ScheduleEntry[];
  title?: string;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ schedule, title = "Class Timetable" }) => {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
  const allDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

  // Mock Monthly Logic: October 2024
  // October 1, 2024 is a Tuesday (Index 2 in allDays)
  const monthName = "October 2024";
  const startDayOffset = 2; 
  const totalDays = 31;
  const calendarCells = Array.from({ length: 35 }, (_, i) => {
    const dayNum = i - startDayOffset + 1;
    return dayNum > 0 && dayNum <= totalDays ? dayNum : null;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h3 className="text-2xl font-black text-slate-800">{title}</h3>
            <p className="text-sm font-medium text-slate-500">Academic Year 2024-25 • {viewMode === 'week' ? 'Weekly Outlook' : monthName}</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center shadow-inner border border-slate-200/50">
              <button 
                onClick={() => setViewMode('week')}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all duration-300 ${viewMode === 'week' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                WEEK
              </button>
              <button 
                onClick={() => setViewMode('month')}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all duration-300 ${viewMode === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                MONTH
              </button>
            </div>
            <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all uppercase tracking-widest hidden lg:flex items-center gap-2 shadow-lg shadow-slate-100 active:scale-95">
              <span>🖨️</span> PRINT
            </button>
          </div>
        </div>

        {viewMode === 'week' ? (
          /* Weekly Grid View */
          <div className="overflow-x-auto animate-in fade-in zoom-in-95 duration-500">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-6 border-b border-slate-100 pb-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Time</div>
                {days.map(day => (
                  <div key={day} className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{day}</div>
                ))}
              </div>

              <div className="relative">
                {timeSlots.map((time, idx) => (
                  <div key={time} className="grid grid-cols-6 h-24 border-b border-slate-50 relative group">
                    <div className="text-[10px] font-bold text-slate-400 flex items-start justify-center pt-2">{time}</div>
                    
                    {days.map(day => {
                      const entry = schedule.find(s => s.day === day && s.startTime.startsWith(time.split(':')[0]));
                      return (
                        <div key={`${day}-${time}`} className="border-l border-slate-50 p-2 relative">
                          {entry && (
                            <div className={`absolute inset-1 rounded-xl p-3 shadow-sm border-l-4 overflow-hidden group/entry transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer ${
                              entry.subject.includes('Math') ? 'bg-indigo-50 border-indigo-500 text-indigo-800' :
                              entry.subject.includes('Science') ? 'bg-emerald-50 border-emerald-500 text-emerald-800' :
                              entry.subject.includes('History') ? 'bg-amber-50 border-amber-500 text-amber-800' :
                              'bg-slate-50 border-slate-400 text-slate-800'
                            }`}>
                              <p className="text-[10px] font-black uppercase leading-none mb-1 truncate">{entry.subject}</p>
                              <p className="text-[10px] font-bold opacity-60 leading-none">{entry.startTime} - {entry.endTime}</p>
                              <p className="text-[9px] mt-2 font-bold opacity-40 uppercase">{entry.room}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Monthly Calendar View */
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="grid grid-cols-7 border-b border-slate-100 pb-4 mb-2">
                {allDays.map(day => (
                   <div key={day} className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{day}</div>
                ))}
             </div>
             <div className="grid grid-cols-7 grid-rows-5 gap-px bg-slate-100 border border-slate-100 rounded-2xl overflow-hidden shadow-inner">
                {calendarCells.map((day, idx) => {
                   const dayName = allDays[idx % 7] as any;
                   const isWorkDay = days.includes(dayName);
                   const daySchedule = isWorkDay ? schedule.filter(s => s.day === dayName) : [];
                   const isToday = day === 15;

                   return (
                      <div key={idx} className={`min-h-[140px] bg-white p-3 group transition-colors hover:bg-slate-50 relative ${!day ? 'bg-slate-50/50' : ''}`}>
                         {day && (
                            <>
                               <div className="flex items-center justify-between mb-3">
                                  <span className={`text-xs font-black ${isToday ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-lg ring-4 ring-indigo-50' : 'text-slate-400'}`}>
                                     {day}
                                  </span>
                               </div>
                               
                               <div className="space-y-1.5 overflow-hidden">
                                  {daySchedule.slice(0, 3).map((s, sIdx) => (
                                     <div key={sIdx} className={`px-2 py-1.5 rounded-lg text-[9px] font-black truncate border-l-2 shadow-sm transition-transform hover:scale-105 cursor-pointer ${
                                        s.subject.includes('Math') ? 'bg-indigo-50 text-indigo-700 border-indigo-500' :
                                        s.subject.includes('Science') ? 'bg-emerald-50 text-emerald-700 border-emerald-500' :
                                        s.subject.includes('History') ? 'bg-amber-50 text-amber-700 border-amber-500' :
                                        'bg-slate-50 text-slate-600 border-slate-400'
                                     }`}>
                                        {s.startTime} {s.subject}
                                     </div>
                                  ))}
                                  {daySchedule.length > 3 && (
                                     <div className="text-[8px] font-black text-slate-300 uppercase pl-1 tracking-widest pt-1">
                                        + {daySchedule.length - 3} more sessions
                                     </div>
                                  )}
                               </div>
                            </>
                         )}
                      </div>
                   );
                })}
             </div>
          </div>
        )}
      </div>
      
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700"></div>
          <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>📅</span> Coming Up Next
          </h4>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
             <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest mb-1">08:00 AM • Room 302A</p>
             <p className="text-lg font-black mb-4 truncate">Advanced Algebra: Finals Prep</p>
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-[10px] font-bold">PX</div>
                <span className="text-xs font-bold text-indigo-100">Prof. X • Class 9A</span>
             </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 flex flex-col justify-center shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Weekly Utilization</p>
           <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-slate-800">32.5</span>
              <span className="text-sm font-bold text-slate-400 mb-1">hrs / week</span>
           </div>
           <div className="mt-4 flex gap-1.5">
              {[85, 45, 90, 70, 60].map((w, i) => (
                 <div key={i} className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${w}%` }}></div>
                 </div>
              ))}
           </div>
           <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-tighter">Capacity reached: 92%</p>
        </div>

        <div className="bg-emerald-600 p-8 rounded-[2rem] text-white flex flex-col justify-between group shadow-xl shadow-emerald-100 relative overflow-hidden">
           <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
           <div className="relative z-10">
              <h4 className="text-lg font-black leading-tight">Calendar Sync Active</h4>
              <p className="text-xs font-medium text-emerald-100 mt-2">All sessions are now synchronized with your mobile device and school mainframe.</p>
           </div>
           <button className="w-full py-3.5 bg-white text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest mt-6 hover:bg-emerald-50 transition-all active:scale-95 shadow-lg shadow-emerald-900/10 relative z-10">
              REFRESH FEED
           </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;
