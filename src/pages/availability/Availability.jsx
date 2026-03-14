import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Save, Clock, Globe, Calendar, Plus, Trash2 } from 'lucide-react';
import { fetchAvailability, saveAvailability } from '../../store/slices/availabilitySlice';

const Availability = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { data: availability } = useSelector((state) => state.availability);
  const [localData, setLocalData] = useState(null);

  useEffect(() => {
    if (user) dispatch(fetchAvailability(user.id));
  }, [user, dispatch]);

  useEffect(() => {
    if (availability) setLocalData(availability);
  }, [availability]);

  const handleSave = () => {
    dispatch(saveAvailability({ userId: user.id, availability: localData }));
    alert('Availability saved!');
  };

  const toggleDay = (dayIndex) => {
    const nextDays = localData.workingDays.includes(dayIndex)
      ? localData.workingDays.filter(d => d !== dayIndex)
      : [...localData.workingDays, dayIndex].sort();
    setLocalData({ ...localData, workingDays: nextDays });
  };

  if (!localData) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Availability</h1>
          <p className="text-slate-500 font-medium">Set your working hours and days for all bookings.</p>
        </div>
        <button 
          onClick={handleSave}
          className="btn-primary flex items-center justify-center gap-2 py-3 px-6 text-sm font-black"
        >
          <Save size={20} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-primary-500" />
              Working Days
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {days.map((day, index) => (
                <button
                  key={day}
                  onClick={() => toggleDay(index)}
                  className={`p-4 rounded-xl border-2 transition-all text-sm font-bold ${
                    localData.workingDays.includes(index)
                    ? 'border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-100'
                    : 'border-slate-100 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2">
              <Clock size={20} className="text-primary-500" />
              Standard Hours
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">From</label>
                <input 
                  type="time" 
                  className="input-field text-lg font-bold"
                  value={localData.workingHours.start}
                  onChange={e => setLocalData({ ...localData, workingHours: { ...localData.workingHours, start: e.target.value } })}
                />
              </div>
              <div className="hidden sm:block text-slate-300 font-bold text-xl mt-6">to</div>
              <div className="flex-1 w-full">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Until</label>
                <input 
                  type="time" 
                  className="input-field text-lg font-bold"
                  value={localData.workingHours.end}
                  onChange={e => setLocalData({ ...localData, workingHours: { ...localData.workingHours, end: e.target.value } })}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <Plus size={20} className="text-primary-500" />
                Break Periods
              </h3>
              <button disabled className="text-xs font-black text-slate-400 uppercase opacity-50">Add Break</button>
            </div>
            <p className="text-slate-400 text-sm font-medium italic">Break periods coming soon...</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-slate-900 text-white border-none shadow-xl">
            <h3 className="text-lg font-extrabold mb-4 flex items-center gap-2">
              <Globe size={20} className="text-primary-400" />
              Timezone
            </h3>
            <p className="text-slate-400 text-sm mb-4 font-medium leading-relaxed">
              Your current timezone is automatically detected and used to display slots to booking guests.
            </p>
            <div className="bg-white/10 p-3 rounded-lg text-sm font-bold border border-white/10">
              {localData.timezone}
            </div>
          </div>

          <div className="card border-dashed border-2 border-slate-200 bg-transparent flex flex-col items-center text-center py-10">
             <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 mb-4">
               <Calendar size={24} />
             </div>
             <p className="text-slate-500 text-sm font-bold max-w-[200px]">Sync with Google or Outlook Calendar</p>
             <button disabled className="mt-4 text-xs font-black text-primary-600 uppercase tracking-wider opacity-50">Connect</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Availability;
