import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  format, 
  startOfWeek, 
  addDays, 
  isSameDay, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isToday,
  subMonths,
  addMonths
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  User 
} from 'lucide-react';
import { fetchBookings } from '../../store/slices/bookingSlice';

const Calendar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: bookings } = useSelector((state) => state.bookings);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (user) dispatch(fetchBookings(user.id));
  }, [user, dispatch]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = addDays(startOfWeek(monthEnd), 42); // 6 weeks

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayBookings = (date) => {
    return bookings.filter(b => isSameDay(new Date(b.startTime), date) && b.status !== 'cancelled');
  };

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Calendar</h1>
          <p className="text-slate-500 font-medium">Your monthly schedule at a glance.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-black text-slate-800 min-w-[120px] text-center uppercase tracking-widest">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden flex-1 min-h-[600px] flex flex-col">
        {/* Header Days */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 flex-1">
          {days.map((day, idx) => {
            const dayBookings = getDayBookings(day);
            const isCurrentMonth = format(day, 'MM') === format(currentMonth, 'MM');
            
            return (
              <div 
                key={day.toISOString()} 
                className={`min-h-[120px] p-2 border-r border-b border-slate-50 group hover:bg-slate-50/50 transition-colors ${
                  !isCurrentMonth ? 'opacity-30 grayscale' : ''
                } ${idx % 7 === 6 ? 'border-r-0' : ''}`}
              >
                <div className={`text-xs font-bold mb-2 flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
                  isToday(day) 
                  ? 'bg-primary-600 text-white shadow-lg ring-4 ring-primary-100' 
                  : 'text-slate-400 group-hover:text-slate-900'
                }`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayBookings.slice(0, 3).map(b => (
                    <div 
                      key={b.id} 
                      className="px-2 py-1 rounded bg-primary-50 text-[10px] font-black text-primary-700 truncate border-l-2 border-primary-500"
                      title={`${b.typeTitle} - ${b.name}`}
                    >
                      {format(new Date(b.startTime), 'HH:mm')} {b.name}
                    </div>
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="text-[10px] font-black text-slate-400 pl-2">
                      + {dayBookings.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
