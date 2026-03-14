import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  format, startOfWeek, addDays, isSameDay, startOfMonth, 
  endOfMonth, eachDayOfInterval, isToday, subMonths, addMonths,
  startOfDay, endOfDay, eachHourOfInterval, isWithinInterval,
  addWeeks, subWeeks, subDays
} from 'date-fns';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, 
  User, Filter, Search, X, CheckCircle2, XCircle, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchBookings, updateBookingStatus } from '../../store/slices/bookingSlice';
import { useToast } from '../../context/UIContext';

const Calendar = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const { items: bookings } = useSelector((state) => state.bookings);
  
  const [view, setView] = useState('month'); // month, week, day
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  useEffect(() => {
    if (user) dispatch(fetchBookings(user.id));
  }, [user, dispatch]);

  const navigateDate = (dir) => {
    if (view === 'month') setCurrentDate(dir === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    if (view === 'week') setCurrentDate(dir === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    if (view === 'day') setCurrentDate(dir === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1));
  };

  const getDayBookings = (date) => {
    return bookings.filter(b => isSameDay(new Date(b.startTime), date) && b.status !== 'cancelled');
  };

  const MonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = addDays(startOfWeek(monthEnd), 42); 
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="flex flex-col flex-1">
        {/* Days Header */}
        <div className="grid grid-cols-7 theme-border border-b theme-elevated">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-4 text-center section-label">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 flex-1 theme-border border-l">
          {days.map((day, idx) => {
            const dayBookings = getDayBookings(day);
            const isCurrentMonth = format(day, 'MM') === format(currentDate, 'MM');
            return (
              <div 
                key={day.toISOString()} 
                className={`min-h-[140px] p-3 border-r border-b theme-border transition-colors group ${
                  !isCurrentMonth ? 'opacity-40 theme-bg' : 'hover:var(--bg-elevated)'
                }`}
                onMouseEnter={e => { if (isCurrentMonth) e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}}
                onMouseLeave={e => { if (isCurrentMonth) e.currentTarget.style.backgroundColor = 'transparent'}}
              >
                <div className={`text-xs font-black w-7 h-7 flex items-center justify-center rounded-lg mb-2 ${
                  isToday(day) ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/30' : 'theme-text-muted'
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1.5">
                  {dayBookings.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedMeeting(b)}
                      className="w-full text-left px-2 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-900/30 border-l-2 border-sky-500 hover:bg-sky-100 dark:hover:bg-sky-800 transition-all"
                    >
                      <p className="text-[10px] font-black text-sky-700 dark:text-sky-300 truncate leading-tight uppercase tracking-widest">{b.typeTitle}</p>
                      <p className="text-[9px] font-bold text-sky-900/60 dark:text-sky-400 mt-0.5 truncate">{format(new Date(b.startTime), 'HH:mm')} {b.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const WeekView = () => {
    const startDate = startOfWeek(currentDate);
    const days = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
    const hours = eachHourOfInterval({ start: startOfDay(currentDate), end: endOfDay(currentDate) });

    return (
      <div className="flex flex-col flex-1 overflow-auto">
        <div className="grid grid-cols-8 theme-border border-b theme-elevated sticky top-0 z-10">
          <div className="p-4 theme-border border-r" />
          {days.map(day => (
            <div key={day.toISOString()} className={`p-4 text-center border-r theme-border ${isToday(day) ? 'bg-sky-50 dark:bg-sky-900/20' : ''}`}>
               <p className="section-label">{format(day, 'EEE')}</p>
               <p className={`text-lg font-black mt-1 ${isToday(day) ? 'text-sky-600' : 'theme-text'}`}>{format(day, 'dd')}</p>
            </div>
          ))}
        </div>
        <div className="flex-1 min-h-[800px] relative">
           {hours.map(hour => (
             <div key={hour.toISOString()} className="grid grid-cols-8 h-20 border-b theme-border group hover:bg-[var(--bg-elevated)] transition-colors">
                <div className="p-2 border-r theme-border text-[10px] font-black theme-text-muted text-right pr-4 uppercase">
                   {format(hour, 'HH:mm')}
                </div>
                {days.map(day => {
                  const hourBookings = bookings.filter(b => 
                    b.status !== 'cancelled' &&
                    isSameDay(new Date(b.startTime), day) &&
                    isWithinInterval(new Date(b.startTime), { start: hour, end: addDays(hour, 0) })
                  );
                  return (
                    <div key={day.toISOString()} className="border-r theme-border p-1 relative">
                       {hourBookings.map(b => (
                         <div 
                           key={b.id} 
                           onClick={() => setSelectedMeeting(b)}
                           className="absolute inset-1 rounded-xl bg-sky-500 text-white p-3 shadow-xl cursor-pointer hover:bg-sky-600 transition-all z-10"
                         >
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{b.typeTitle}</p>
                            <p className="text-xs font-black truncate">{b.name}</p>
                         </div>
                       ))}
                    </div>
                  );
                })}
             </div>
           ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="page-header">Schedule Calendar</h1>
          <p className="body-text mt-1">Visualizing {bookings.length} active engagements.</p>
        </div>
        
        <div className="flex items-center gap-4">
           {/* View Selection */}
           <div className="flex p-1 theme-elevated rounded-xl border theme-border">
             {['month', 'week', 'day'].map((v) => (
               <button
                 key={v}
                 onClick={() => setView(v)}
                 className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                   view === v ? 'theme-surface text-sky-600 shadow-sm border theme-border' : 'theme-text-muted hover:theme-text'
                 }`}
               >
                 {v}
               </button>
             ))}
           </div>
           
           {/* Date Navigation */}
           <div className="flex items-center gap-2 theme-surface p-1 rounded-xl border theme-border shadow-sm">
              <button 
                onClick={() => navigateDate('prev')}
                className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg theme-text-muted transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-[10px] font-black theme-text min-w-[140px] text-center uppercase tracking-widest leading-none">
                {view === 'month' ? format(currentDate, 'MMMM yyyy') : 
                 view === 'week' ? `Week of ${format(startOfWeek(currentDate), 'MMM dd')}` : 
                 format(currentDate, 'MMMM dd, yyyy')}
              </span>
              <button 
                onClick={() => navigateDate('next')}
                className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg theme-text-muted transition-colors"
              >
                <ChevronRight size={16} />
              </button>
           </div>
        </div>
      </div>

      <div className="card-premium !p-0 overflow-hidden flex-1 min-h-[700px] flex flex-col">
        {view === 'month' ? <MonthView /> : view === 'week' ? <WeekView /> : <div className="p-20 text-center theme-text-muted font-black uppercase tracking-widest">Day View Coming Soon</div>}
      </div>

      {/* Meeting Detail Modal */}
      <AnimatePresence>
        {selectedMeeting && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedMeeting(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="theme-surface w-full max-w-xl rounded-3xl shadow-2xl relative overflow-hidden border theme-border"
            >
              <div className="p-8 border-b theme-border flex justify-between items-center bg-[var(--bg-elevated)]">
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-sky-100 dark:bg-sky-900/30 text-sky-600 rounded-2xl shadow-inner">
                      <CalendarIcon size={24} />
                   </div>
                   <div>
                     <h3 className="text-xl font-black theme-text">{selectedMeeting.typeTitle}</h3>
                     <p className="text-xs font-bold theme-text-muted uppercase tracking-widest mt-1">Meeting Details</p>
                   </div>
                 </div>
                 <button onClick={() => setSelectedMeeting(null)} className="p-2 hover:bg-[var(--bg-surface)] rounded-xl transition-colors theme-text-muted hover:theme-text border theme-border">
                   <X size={20} />
                 </button>
              </div>
              
              <div className="p-8 space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <span className="section-label">Guest Information</span>
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 theme-elevated rounded-full flex items-center justify-center text-xs font-black theme-text border theme-border">
                             {selectedMeeting.name.charAt(0)}
                          </div>
                          <p className="text-sm font-black theme-text">{selectedMeeting.name}</p>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <span className="section-label">Scheduled Time</span>
                       <div className="flex items-center gap-2 text-sky-600">
                          <Clock size={16} />
                          <p className="text-sm font-black">{format(new Date(selectedMeeting.startTime), 'HH:mm')}</p>
                       </div>
                    </div>
                 </div>

                 {selectedMeeting.message && (
                   <div className="p-6 theme-elevated rounded-2xl border theme-border">
                      <span className="section-label block mb-3">Message from Guest</span>
                      <p className="text-sm font-bold theme-text-secondary italic leading-relaxed">
                        "{selectedMeeting.message}"
                      </p>
                   </div>
                 )}

                 <div className="pt-8 flex gap-4">
                    <button className="btn-secondary !bg-rose-50 !text-rose-600 !border-rose-100 dark:!bg-rose-900/10 dark:!border-rose-800 flex-1 hover:!bg-rose-100" 
                      onClick={() => {
                        dispatch(updateBookingStatus({ id: selectedMeeting.id, status: 'cancelled' }));
                        toast('Meeting Cancelled');
                        setSelectedMeeting(null);
                      }}
                    >
                      <XCircle size={16} /> Cancel Meeting
                    </button>
                    <button className="flex-1 btn-primary">
                      Reschedule
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Calendar;
