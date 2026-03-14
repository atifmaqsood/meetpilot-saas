import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Users, 
  CalendarCheck, 
  CalendarX, 
  TrendingUp,
  Clock
} from 'lucide-react';
import { fetchBookings } from '../../store/slices/bookingSlice';
import { format, subDays, startOfDay } from 'date-fns';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: bookings } = useSelector((state) => state.bookings);

  useEffect(() => {
    if (user) dispatch(fetchBookings(user.id));
  }, [user, dispatch]);

  // Analytics Logic
  const stats = [
    { name: 'Total Bookings', value: bookings.length, icon: CalendarCheck, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Upcoming', value: bookings.filter(b => b.status === 'confirmed').length, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, icon: CalendarX, color: 'text-rose-600', bg: 'bg-rose-100' },
    { name: 'New Customers', value: new Set(bookings.map(b => b.email)).size, icon: Users, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  // Chart Data Preparation (Last 7 days)
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'MMM dd');
    const count = bookings.filter(b => format(new Date(b.createdAt), 'MMM dd') === dateStr).length;
    return { name: dateStr, bookings: count };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 font-medium">Here's what's happening with your bookings today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <TrendingUp size={16} />
          <span>+12.5% from last week</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card group relative overflow-hidden">
            <div className="flex items-center gap-4 relative z-10">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.name}</p>
                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              </div>
            </div>
            {/* Subtle background decoration */}
            <div className={`absolute -right-4 -bottom-4 w-16 h-16 ${stat.bg} opacity-10 rounded-full blur-2xl`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-extrabold text-slate-800 mb-6">Booking Activity</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 600}}
                />
                <Area 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="#0ea5e9" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorBookings)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-extrabold text-slate-800 mb-6">Upcoming Bookings</h3>
          <div className="space-y-4">
            {bookings.filter(b => b.status === 'confirmed').slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                  {booking.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{booking.name}</p>
                  <p className="text-xs font-semibold text-slate-500">{format(new Date(booking.startTime), 'MMM dd, HH:mm')}</p>
                </div>
                <div className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded">
                  {booking.duration}m
                </div>
              </div>
            ))}
            {bookings.length === 0 && (
              <div className="text-center py-12 opacity-50">
                <CalendarCheck size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-sm font-bold text-slate-400">No upcoming bookings</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
