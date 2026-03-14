import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchBookings, 
  updateBookingStatus 
} from '../../store/slices/bookingSlice';
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  ChevronDown, 
  Filter, 
  XCircle, 
  CheckCircle2,
  Trash2,
  Search,
  MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';

const Bookings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: bookings, loading } = useSelector((state) => state.bookings);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) dispatch(fetchBookings(user.id));
  }, [user, dispatch]);

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = filter === 'all' || b.status === filter;
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         b.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-600 ring-emerald-100';
      case 'cancelled': return 'bg-rose-50 text-rose-600 ring-rose-100';
      case 'rescheduled': return 'bg-amber-50 text-amber-600 ring-amber-100';
      default: return 'bg-slate-50 text-slate-600 ring-slate-100';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bookings</h1>
          <p className="text-slate-500 font-medium">Manage and track all your scheduled meetings.</p>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 w-full sm:w-64">
             <Search size={18} className="text-slate-400" />
             <input 
               type="text" 
               placeholder="Search guest or email..." 
               className="bg-transparent border-none outline-none text-sm font-semibold w-full"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {['all', 'confirmed', 'cancelled', 'rescheduled'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-black capitalize transition-all whitespace-nowrap ${
                  filter === f 
                  ? 'bg-primary-600 text-white shadow-md ring-4 ring-primary-100' 
                  : 'bg-white text-slate-500 hover:bg-slate-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Guest</th>
                <th className="px-6 py-4">Event & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 group-hover:bg-white transition-colors">
                        {booking.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-tight">{booking.name}</p>
                        <p className="text-xs font-semibold text-slate-400">{booking.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-700">{booking.typeTitle}</p>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Calendar size={12} />
                        <span>{format(new Date(booking.startTime), 'MMM dd, yyyy')}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <Clock size={12} />
                        <span>{format(new Date(booking.startTime), 'HH:mm')}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ring-1 ring-inset ${getStatusStyle(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                       {booking.status !== 'cancelled' ? (
                         <button 
                           onClick={() => dispatch(updateBookingStatus({ id: booking.id, status: 'cancelled' }))}
                           className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                           title="Cancel Booking"
                         >
                           <XCircle size={18} />
                         </button>
                       ) : (
                         <button 
                           onClick={() => dispatch(updateBookingStatus({ id: booking.id, status: 'confirmed' }))}
                           className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-500 rounded-lg transition-colors"
                           title="Restart Booking"
                         >
                           <CheckCircle2 size={18} />
                         </button>
                       )}
                       <button className="p-2 hover:bg-slate-100 text-slate-400 rounded-lg transition-colors">
                         <MoreHorizontal size={18} />
                       </button>
                     </div>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <div className="opacity-20 mb-4 flex justify-center">
                      <Calendar size={64} />
                    </div>
                    <p className="text-slate-400 font-bold">No bookings found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
