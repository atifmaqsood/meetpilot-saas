import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAvailability, saveAvailability } from '../../store/slices/availabilitySlice';
import { useToast } from '../../context/UIContext';
import { format, addDays } from 'date-fns';
import { 
  Save, Clock, Globe, Plus, Trash2, Zap, 
  CalendarDays, RotateCcw, CheckCircle2, CalendarRange
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Availability = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const { data: availability } = useSelector((state) => state.availability);
  const [localData, setLocalData] = useState(null);
  const [activeSegment, setActiveSegment] = useState('recurring');

  useEffect(() => {
    if (user) dispatch(fetchAvailability(user.id));
  }, [user, dispatch]);

  useEffect(() => {
    if (availability) setLocalData(availability);
  }, [availability]);

  const handleSave = () => {
    dispatch(saveAvailability({ userId: user.id, availability: localData }));
    toast('Availability updated successfully!');
  };

  const toggleDay = (dayIndex) => {
    const nextDays = localData.workingDays.includes(dayIndex)
      ? localData.workingDays.filter(d => d !== dayIndex)
      : [...localData.workingDays, dayIndex].sort();
    setLocalData({ ...localData, workingDays: nextDays });
  };

  const addOverride = (dateStr) => {
    setLocalData({
      ...localData,
      overrides: {
        ...localData.overrides,
        [dateStr]: { hours: { start: '09:00', end: '17:00' }, unavailable: false }
      }
    });
  };

  const removeOverride = (dateStr) => {
    const nextOverrides = { ...localData.overrides };
    delete nextOverrides[dateStr];
    setLocalData({ ...localData, overrides: nextOverrides });
  };

  if (!localData) return (
    <div className="flex h-[70vh] items-center justify-center">
       <div className="space-y-4 text-center">
         <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto shadow-2xl" />
         <p className="text-sm font-black theme-text-muted uppercase tracking-widest">Loading Schedule...</p>
       </div>
    </div>
  );

  const daysLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 card-premium">
        <div>
          <h1 className="page-header">Availability</h1>
          <p className="body-text mt-2">Manage your global schedule and specify date-specific overrides.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setLocalData(availability)} className="btn-secondary !bg-transparent border-none !px-4">
            <RotateCcw size={18} />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button 
            onClick={handleSave}
            className="btn-primary"
          >
            <Save size={18} />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      <div className="flex p-2 theme-elevated rounded-2xl w-fit border theme-border shadow-inner">
        {['recurring', 'overrides'].map((seg) => (
          <button 
            key={seg}
            onClick={() => setActiveSegment(seg)}
            className={`px-10 py-3.5 rounded-xl text-xs font-black tracking-widest transition-all uppercase ${
              activeSegment === seg 
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20' 
              : 'theme-text-muted hover:theme-text hover:bg-[var(--bg-surface)]'
            }`}
          >
            {seg}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">
        <div className="xl:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {activeSegment === 'recurring' ? (
              <motion.div 
                key="recurring"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="card-premium">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-sky-100 dark:bg-sky-900/30 text-sky-600 rounded-2xl shadow-inner"><CalendarDays size={22} /></div>
                    <h3 className="text-xl font-black theme-text italic">Weekly Routine</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
                    {daysLabels.map((day, index) => {
                      const isActive = localData.workingDays.includes(index);
                      return (
                        <button
                          key={day}
                          onClick={() => toggleDay(index)}
                          className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all group ${
                            isActive
                            ? 'border-sky-500 bg-sky-500 text-white shadow-xl shadow-sky-500/20 scale-105'
                            : 'theme-border theme-elevated theme-text-muted hover:theme-text'
                          }`}
                        >
                          <span className="text-[11px] font-black uppercase tracking-widest mb-2">{day.substring(0, 3)}</span>
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 ${isActive ? 'bg-white/20 border-white/40' : 'theme-border'}`}>
                             {isActive ? <CheckCircle2 size={16} /> : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="card-premium">
                   <div className="flex items-center gap-4 mb-10">
                      <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl shadow-inner"><Clock size={22} /></div>
                      <h3 className="text-xl font-black theme-text italic">Business Hours</h3>
                   </div>
                   
                   <div className="flex flex-col md:flex-row items-center gap-10">
                     <div className="flex-1 w-full space-y-3">
                        <label className="section-label ml-1">Daily Kick-off</label>
                        <div className="relative group">
                          <Clock className="absolute left-5 top-5 theme-text-muted group-focus-within:text-sky-500 transition-colors" size={18} />
                          <input 
                            type="time" 
                            className="input-field !pl-14 !py-4 !text-xl !font-black tabular-nums border-2"
                            value={localData.workingHours.start}
                            onChange={e => setLocalData({ ...localData, workingHours: { ...localData.workingHours, start: e.target.value } })}
                          />
                        </div>
                     </div>
                     <div className="shrink-0 w-8 h-1 theme-border bg-[var(--border-color)] rounded-full mt-8 hidden md:block" />
                     <div className="flex-1 w-full space-y-3">
                        <label className="section-label ml-1">EOD (End of Day)</label>
                        <div className="relative group">
                          <Clock className="absolute left-5 top-5 theme-text-muted group-focus-within:text-sky-500 transition-colors" size={18} />
                          <input 
                            type="time" 
                            className="input-field !pl-14 !py-4 !text-xl !font-black tabular-nums border-2"
                            value={localData.workingHours.end}
                            onChange={e => setLocalData({ ...localData, workingHours: { ...localData.workingHours, end: e.target.value } })}
                          />
                        </div>
                     </div>
                   </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="overrides"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="card-premium">
                  <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl shadow-inner"><CalendarRange size={22} /></div>
                        <h3 className="text-xl font-black theme-text italic">Exclusions & Overrides</h3>
                     </div>
                     <button 
                       onClick={() => addOverride(format(addDays(new Date(), 1), 'yyyy-MM-dd'))}
                       className="btn-primary !text-[10px] !py-2.5 !px-5"
                     >
                       <Plus size={14} /> Add Exception
                     </button>
                  </div>

                  <div className="space-y-4">
                    {Object.keys(localData.overrides || {}).map((dateStr) => {
                      const override = localData.overrides[dateStr];
                      return (
                        <div key={dateStr} className="p-6 theme-elevated rounded-3xl border theme-border flex flex-col md:flex-row items-center gap-8 group hover:border-sky-500/50 transition-all">
                           <div className="flex items-center gap-6 flex-1 w-full">
                              <div className="w-16 h-16 theme-surface rounded-2xl flex flex-col items-center justify-center border-2 theme-border font-extrabold shadow-sm">
                                 <span className="text-[10px] theme-text-muted uppercase tracking-tighter">{format(new Date(dateStr), 'MMM')}</span>
                                 <span className="text-2xl leading-none theme-text">{format(new Date(dateStr), 'dd')}</span>
                              </div>
                              <div>
                                 <p className="text-lg font-black theme-text">{format(new Date(dateStr), 'EEEE, MMMM dd')}</p>
                                 <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mt-2 ${override.unavailable ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'}`}>
                                   <div className={`w-1.5 h-1.5 rounded-full ${override.unavailable ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                   {override.unavailable ? 'Blocked Out' : 'Custom Windows'}
                                 </div>
                              </div>
                           </div>
                           
                           {!override.unavailable && (
                             <div className="flex items-center gap-4 font-black">
                               <input 
                                 type="time" 
                                 className="input-field !py-2 !w-32 tabular-nums"
                                 value={override.hours.start}
                                 onChange={e => {
                                   const next = { ...localData.overrides };
                                   next[dateStr] = { ...override, hours: { ...override.hours, start: e.target.value } };
                                   setLocalData({ ...localData, overrides: next });
                                 }}
                               />
                               <span className="theme-text-muted font-bold">to</span>
                               <input 
                                 type="time" 
                                 className="input-field !py-2 !w-32 tabular-nums"
                                 value={override.hours.end}
                                 onChange={e => {
                                   const next = { ...localData.overrides };
                                   next[dateStr] = { ...override, hours: { ...override.hours, end: e.target.value } };
                                   setLocalData({ ...localData, overrides: next });
                                 }}
                               />
                             </div>
                           )}

                           <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                              <button 
                                onClick={() => {
                                  const next = { ...localData.overrides };
                                  next[dateStr] = { ...override, unavailable: !override.unavailable };
                                  setLocalData({ ...localData, overrides: next });
                                }}
                                className={`h-10 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${
                                  override.unavailable ? 'bg-[var(--text-primary)] text-[var(--bg-surface)] border-[var(--text-primary)]' : 'theme-border theme-text-muted hover:border-[var(--text-secondary)]'
                                }`}
                              >
                                {override.unavailable ? 'Unlock' : 'Block Day'}
                              </button>
                              <button onClick={() => removeOverride(dateStr)} className="p-3 theme-elevated theme-text-muted hover:text-rose-500 border theme-border transition-colors rounded-xl">
                                <Trash2 size={20} />
                              </button>
                           </div>
                        </div>
                      );
                    })}
                    {Object.keys(localData.overrides || {}).length === 0 && (
                      <div className="py-24 text-center border-4 border-dashed theme-border rounded-[3rem] opacity-40">
                         <Zap size={48} className="mx-auto mb-6 theme-text-muted" />
                         <p className="text-lg font-black theme-text-muted italic">No Active Exceptions.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-8">
          <div className="card-premium" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-surface)' }}>
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-700">
               <Globe size={180} />
            </div>
            <div className="relative z-10 p-4">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                 <span className="text-[11px] font-black uppercase tracking-[0.3em] opacity-80">Live Timezone</span>
              </div>
              <h3 className="text-3xl lg:text-4xl font-black mb-4 tracking-tighter">{localData.timezone}</h3>
              <p className="text-sm font-bold leading-relaxed mb-8 italic opacity-70">
                Your scheduling engine automatically syncs with guest calendars worldwide.
              </p>
              <button className="btn-secondary !text-[10px] !py-2.5 w-full">Sync Options</button>
            </div>
          </div>

          <div className="card-premium">
            <h3 className="section-label mb-10 pb-4 border-b theme-border">Operational Best Practices</h3>
            <ul className="space-y-6">
              {[
                { icon: CheckCircle2, text: "Consistent weekly hours improve conversion rates by 40%.", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
                { icon: Zap, text: "Overrides prevent scheduling conflicts during travel or leave.", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" }
              ].map((item, i) => (
                <li key={i} className="flex gap-4 p-4 rounded-2xl theme-elevated group cursor-default">
                  <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                    <item.icon size={20} />
                  </div>
                  <p className="body-text mt-1">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Availability;
