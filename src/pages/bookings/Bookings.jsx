import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBookings, updateBookingStatus } from '../../store/slices/bookingSlice';
import { addNotification } from '../../store/slices/notificationSlice';
import { 
  Calendar, Clock, User, Mail, MessageSquare, Search, Filter,
  CheckCircle2, XCircle, Clock3, ChevronRight, TrendingUp, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isAfter, isBefore } from 'date-fns';
import { useToast } from '../../context/UIContext';

const Bookings = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const { items: bookings } = useSelector((state) => state.bookings);
  const [filter, setFilter] = useState('upcoming');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) dispatch(fetchBookings(user.id));
  }, [user, dispatch]);

  const filteredBookings = bookings.filter(b => {
    const isUpcoming = isAfter(new Date(b.startTime), new Date());
    const isCancelled = b.status === 'cancelled';
    
    if (filter === 'upcoming') return isUpcoming && !isCancelled;
    if (filter === 'past') return !isUpcoming && !isCancelled;
    if (filter === 'cancelled') return isCancelled;
    return true;
  }).filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.typeTitle.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    upcoming: bookings.filter(b => isAfter(new Date(b.startTime), new Date()) && b.status !== 'cancelled').length,
    past: bookings.filter(b => isBefore(new Date(b.startTime), new Date()) && b.status !== 'cancelled').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="page-header">Booking Management</h1>
          <p className="body-text mt-1">Managing {bookings.length} total scheduled events.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Upcoming', key: 'upcoming', icon: TrendingUp, count: stats.upcoming, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/30' },
          { label: 'Past Events', key: 'past', icon: History, count: stats.past, color: 'theme-text-secondary', bg: 'theme-elevated' },
          { label: 'Cancelled', key: 'cancelled', icon: XCircle, count: stats.cancelled, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/30' }
        ].map(s => (
          <button 
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`card-premium !flex items-center gap-6 group transition-all text-left ${
              filter === s.key ? 'ring-2 ring-sky-500 shadow-xl' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <div className={`p-4 rounded-2xl ${s.bg} ${s.color} transition-transform group-hover:scale-110`}>
              <s.icon size={24} />
            </div>
            <div>
               <p className="section-label">{s.label}</p>
               <h3 className="text-2xl font-black theme-text">{s.count}</h3>
            </div>
            {filter === s.key && (
              <div className="ml-auto w-1 h-8 bg-sky-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="card-premium !p-0 overflow-hidden min-h-[500px] flex flex-col">
        {/* Search Header */}
        <div className="p-4 theme-border border-b theme-elevated flex flex-col sm:flex-row gap-4">
           <div className="relative flex-1">
             <Search className="absolute left-4 top-3.5 theme-text-muted" size={18} />
             <input 
               placeholder="Search by name or event type..."
               className="input-field !pl-12 !border-none !shadow-inner"
               value={search}
               onChange={e => setSearch(e.target.value)}
             />
           </div>
           <button className="btn-secondary">
             <Filter size={16} /> Advanced Filters
           </button>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
               <tr className="theme-elevated">
                 <th className="px-8 py-5 section-label">Guest & Event</th>
                 <th className="px-8 py-5 section-label">Scheduled Date</th>
                 <th className="px-8 py-5 section-label">Status</th>
                 <th className="px-8 py-5 section-label">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y theme-border">
              <AnimatePresence mode="popLayout">
                {filteredBookings.map((booking) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={booking.id} 
                    className="hover:theme-elevated transition-colors group"
                  >
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/40 text-sky-600 rounded-2xl flex items-center justify-center font-black">
                            {booking.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold theme-text">{booking.name}</p>
                            <p className="text-xs font-bold theme-text-muted uppercase tracking-widest">{booking.typeTitle}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-bold">
                        <p className="text-sm theme-text">{format(new Date(booking.startTime), 'MMM dd, yyyy')}</p>
                        <p className="text-xs theme-text-muted">{format(new Date(booking.startTime), 'HH:mm')} ({booking.duration}m)</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800' :
                        booking.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/30 dark:border-rose-800' :
                        'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:border-amber-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-2.5 hover:theme-surface rounded-xl theme-text-muted hover:text-sky-500 shadow-sm transition-all" title="View Detail">
                           <ChevronRight size={18} />
                         </button>
                         {booking.status !== 'cancelled' && (
                           <button 
                             onClick={() => {
                               dispatch(updateBookingStatus({ id: booking.id, status: 'cancelled' }));
                               dispatch(addNotification({ 
                                 title: 'Booking Cancelled', 
                                 message: `The meeting with ${booking.name} has been cancelled.`, 
                                 type: 'error' 
                               }));
                               toast('Booking cancelled');
                             }}
                             className="p-2.5 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl theme-text-muted hover:text-rose-600 transition-all" 
                             title="Cancel Booking"
                           >
                              <XCircle size={18} />
                           </button>
                         )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredBookings.length === 0 && (
            <div className="py-24 text-center">
               <Calendar size={48} className="mx-auto mb-4 theme-text-muted opacity-50" />
               <h3 className="text-lg font-black theme-text">No bookings found</h3>
               <p className="text-sm font-bold theme-text-muted italic">Try adjusting your filters or search term.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bookings;
