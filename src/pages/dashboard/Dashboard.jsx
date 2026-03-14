import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  TrendingUp, Users, CalendarCheck, CalendarX, Clock, Activity, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchBookings } from '../../store/slices/bookingSlice';
import { format, subDays, eachDayOfInterval } from 'date-fns';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: bookings } = useSelector((state) => state.bookings);

  useEffect(() => {
    if (user) dispatch(fetchBookings(user.id));
  }, [user, dispatch]);

  const analytics = useMemo(() => {
    const now = new Date();
    const confirmed = bookings.filter(b => b.status === 'confirmed');
    const cancelled = bookings.filter(b => b.status === 'cancelled');
    const convRate = bookings.length > 0 ? ((confirmed.length / bookings.length) * 100).toFixed(1) : 0;
    
    const byType = {};
    bookings.forEach(b => {
      byType[b.typeTitle] = (byType[b.typeTitle] || 0) + 1;
    });
    const pieData = Object.keys(byType).map(name => ({ name, value: byType[name] }));

    const days = eachDayOfInterval({
      start: subDays(now, 6),
      end: now
    });

    const timeline = days.map(day => {
      const dStr = format(day, 'MMM dd');
      return {
        name: dStr,
        bookings: bookings.filter(b => format(new Date(b.createdAt), 'MMM dd') === dStr).length,
        confirmed: confirmed.filter(b => format(new Date(b.createdAt), 'MMM dd') === dStr).length
      };
    });

    return { timeline, pieData, convRate, confirmedCount: confirmed.length, cancelledCount: cancelled.length };
  }, [bookings]);

  const COLORS = ['#0ea5e9', '#6366f1', '#f43f5e', '#eab308'];

  const stats = [
    { name: 'Total Volume', value: bookings.length, trend: '+12%', icon: Activity, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/10' },
    { name: 'Confirmed', value: analytics.confirmedCount, trend: '+8%', icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
    { name: 'Cancellations', value: analytics.cancelledCount, trend: '-3%', icon: CalendarX, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/10' },
    { name: 'Conv. Rate', value: `${analytics.convRate}%`, trend: '+2.4%', icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/10' },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="page-header flex items-center gap-4">
             Dashboard <span className="text-[10px] font-black text-sky-600 bg-sky-100/50 dark:bg-sky-500/10 px-3 py-1 rounded-full border border-sky-200/50 dark:border-sky-800 tracking-widest uppercase">Live View</span>
          </h1>
          <p className="body-text mt-2 text-lg">Welcome back, {user?.name.split(' ')[0]}. Here is your performance overview.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="btn-secondary !text-[10px] !py-2.5 !px-5">Custom Range</button>
           <button className="btn-primary !text-[10px] !py-2.5 !px-5">Export Data</button>
        </div>
      </div>

      {/* Responsive Grid - Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={stat.name} 
            className="card-premium flex flex-col justify-between group relative h-full"
          >
            <div className="flex justify-between items-start">
              <div className={`p-4 rounded-[1.25rem] ${stat.bg} ${stat.color} transition-all group-hover:scale-110`}>
                <stat.icon size={22} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg ${stat.trend.startsWith('+') ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-rose-600 bg-rose-50 dark:bg-rose-900/20'}`}>
                {stat.trend}
              </div>
            </div>
            <div className="mt-8">
              <p className="section-label">{stat.name}</p>
              <h3 className="text-3xl font-black theme-text mt-2">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Growth Chart */}
        <div className="lg:col-span-2 card-premium !p-6 sm:!p-10 flex flex-col min-h-[450px]">
          <div className="mb-10">
              <h3 className="text-xl font-black theme-text flex items-center gap-2 italic mb-2">
                <Activity size={20} className="text-sky-500" /> Activity Growth
              </h3>
              <p className="section-label">7-Day Real-time Evolution</p>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.timeline} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                   <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--border-color)" tick={{fill: 'var(--text-muted)', fontSize: 10, fontWeight: 800}} dy={10} />
                <YAxis stroke="var(--border-color)" tick={{fill: 'var(--text-muted)', fontSize: 10, fontWeight: 800}} />
                <Tooltip 
                   contentStyle={{backgroundColor: 'var(--bg-elevated)', border: 'none', borderRadius: '16px', color: 'var(--text-primary)', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)'}}
                   itemStyle={{fontWeight: 900, textTransform: 'uppercase', fontSize: '10px'}}
                />
                <Area type="monotone" dataKey="bookings" stroke="#0ea5e9" strokeWidth={5} fill="url(#colorMain)" />
                <Area type="monotone" dataKey="confirmed" stroke="#6366f1" strokeWidth={3} fill="none" strokeDasharray="10 10" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Circular Distribution */}
        <div className="card-premium flex flex-col justify-center text-center">
            <h3 className="section-label mb-10">Meeting Share</h3>
            <div className="h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.pieData}
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                  >
                    {analytics.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{backgroundColor: 'var(--bg-elevated)', border: 'none', borderRadius: '16px', color: 'var(--text-primary)'}}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-4xl font-black theme-text">{analytics.confirmedCount}</span>
                 <span className="text-[9px] font-black theme-text-muted uppercase tracking-widest mt-1">Confirmed</span>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {analytics.pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                  <span className="text-[10px] font-black theme-text-muted uppercase tracking-wider">{d.name}</span>
                </div>
              ))}
            </div>
        </div>
      </div>
      
      {/* Bottom Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { title: 'Best Time to Meet', val: 'Wednesdays @ 3PM', desc: 'Highest booking frequency detected.', icon: Clock, color: 'text-amber-500' },
          { title: 'Response Efficiency', val: 'Fastest (2.4h)', desc: 'You respond 20% quicker than others.', icon: Zap, color: 'text-sky-500' },
          { title: 'Guest Engagement', val: 'High (4.8/5)', desc: 'Based on your recent 50 sessions.', icon: Users, color: 'text-indigo-500' }
        ].map((item, i) => (
          <div key={i} className="card-premium !p-6 flex items-start gap-4 transition-all group hover:border-[var(--text-muted)]">
            <div className={`p-4 rounded-2xl theme-surface border theme-border shadow-xl group-hover:scale-110 transition-transform ${item.color}`}>
              <item.icon size={22} />
            </div>
            <div>
              <h4 className="section-label">{item.title}</h4>
              <p className="text-lg font-black theme-text mt-1">{item.val}</p>
              <p className="text-xs font-medium theme-text-secondary mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
