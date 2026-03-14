import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  format, 
  addDays, 
  isSameDay, 
  startOfDay, 
  parse, 
  addMinutes 
} from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Globe, 
  ChevronLeft, 
  ChevronRight,
  User,
  Mail,
  MessageSquare,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import mockDB from '../../services/mockDatabase';
import { generateAvailableSlots } from '../../utils/slotGenerator';
import { createBooking } from '../../store/slices/bookingSlice';

const PublicBooking = () => {
  const { username, typeSlug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [host, setHost] = useState(null);
  const [meetingType, setMeetingType] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [existingBookings, setExistingBookings] = useState([]);
  
  const [selectedDate, setSelectedDate] = useState(startOfDay(addDays(new Date(), 1)));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState(1); // 1: Date/Time, 2: Form, 3: Success
  
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const db = mockDB.getDB();
      // Simple username matching (email prefix)
      const foundHost = db.users.find(u => u.email.startsWith(username));
      if (!foundHost) {
        setLoading(false);
        return;
      }
      
      const foundType = db.meetingTypes.find(t => t.userId === foundHost.id && (t.slug === typeSlug || t.title.toLowerCase().replace(/ /g, '-') === typeSlug));
      const foundAvailability = mockDB.getAvailability(foundHost.id);
      const hostBookings = db.bookings.filter(b => b.hostId === foundHost.id);
      
      setHost(foundHost);
      setMeetingType(foundType);
      setAvailability(foundAvailability);
      setExistingBookings(hostBookings);
      setLoading(false);
    };
    fetchData();
  }, [username, typeSlug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div></div>;
  if (!host || !meetingType) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div><h1 className="text-2xl font-black text-slate-800">404 - Schedule not found</h1><p className="text-slate-500 font-bold">This link is invalid or has expired.</p></div></div>;

  const availableSlots = generateAvailableSlots(selectedDate, availability, meetingType.duration, existingBookings);

  const handleBooking = async (e) => {
    e.preventDefault();
    const startTime = parse(selectedSlot, 'HH:mm', selectedDate).toISOString();
    const endTime = addMinutes(parse(selectedSlot, 'HH:mm', selectedDate), meetingType.duration).toISOString();
    
    const booking = {
      hostId: host.id,
      meetingTypeId: meetingType.id,
      typeTitle: meetingType.title,
      duration: meetingType.duration,
      startTime,
      endTime,
      ...formData
    };

    await dispatch(createBooking(booking));
    setStep(3);
  };

  const dates = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i + 1));

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-5xl mx-auto glass-morphism bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Sidebar Info */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-100 p-10 bg-slate-50/30">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner">
                {host.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{host.name}</p>
                <h1 className="text-2xl font-black text-slate-900 leading-tight">{meetingType.title}</h1>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-slate-500 font-bold">
                 <Clock size={20} className="text-slate-400" />
                 <span>{meetingType.duration} mins</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 font-bold">
                 <MapPin size={20} className="text-slate-400" />
                 <span>{meetingType.location}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 font-bold">
                 <Globe size={20} className="text-slate-400" />
                 <span className="text-xs">{availability.timezone}</span>
              </div>
            </div>

            <p className="text-slate-500 font-medium leading-relaxed bg-slate-100/50 p-4 rounded-xl border border-slate-100 italic">
              "{meetingType.description || 'Looking forward to our meeting!'}"
            </p>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 p-10">
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-black text-slate-900">Select Date & Time</h2>
              
              {/* Date Selector */}
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-none">
                {dates.map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                    className={`flex flex-col items-center justify-center min-w-[80px] h-24 rounded-2xl border-2 transition-all ${
                      isSameDay(date, selectedDate)
                      ? 'border-primary-600 bg-primary-600 text-white shadow-xl shadow-primary-200 scale-105'
                      : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest mb-1">{format(date, 'EEE')}</span>
                    <span className="text-xl font-black">{format(date, 'dd')}</span>
                  </button>
                ))}
              </div>

              {/* Slots */}
              <div className="space-y-4">
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{format(selectedDate, 'EEEE, MMMM dd')}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-3 px-4 rounded-xl text-sm font-black border-2 transition-all ${
                        selectedSlot === slot
                        ? 'border-slate-800 bg-slate-800 text-white shadow-lg'
                        : 'border-slate-100 hover:border-primary-500 text-slate-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                  {availableSlots.length === 0 && (
                    <p className="col-span-full text-center py-10 text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-2xl">
                      No slots available for this day.
                    </p>
                  )}
                </div>
              </div>

              {selectedSlot && (
                <div className="pt-6 animate-in fade-in slide-in-from-bottom-2">
                  <button 
                    onClick={() => setStep(2)}
                    className="w-full btn-primary py-4 text-lg font-black tracking-tight"
                  >
                    Next Step
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2">
                 <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft /></button>
                 <h2 className="text-2xl font-black text-slate-900">Enter Details</h2>
              </div>
              
              <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <CalendarIcon size={18} className="text-primary-600" />
                   <span className="text-sm font-bold text-primary-800">{format(selectedDate, 'MMMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-3">
                   <Clock size={18} className="text-primary-600" />
                   <span className="text-sm font-bold text-primary-800">{selectedSlot}</span>
                </div>
              </div>

              <form onSubmit={handleBooking} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                      required 
                      className="input-field pl-10" 
                      placeholder="Jane Smith"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      required 
                      className="input-field pl-10" 
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Add Message (Optional)</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 text-slate-400" size={18} />
                    <textarea 
                      className="input-field pl-10 h-24 resize-none pt-2" 
                      placeholder="Anything you'd like to share..."
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                    />
                  </div>
                </div>
                <button type="submit" className="w-full btn-primary py-4 text-lg font-black">Confirm Booking</button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-500">
               <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle2 size={48} />
               </div>
               <div>
                 <h2 className="text-3xl font-black text-slate-900">You're Scheduled!</h2>
                 <p className="text-slate-500 font-medium mt-2">A calendar invitation has been sent to your email.</p>
               </div>
               <div className="w-full max-w-sm border-2 border-slate-100 rounded-2xl p-6 bg-slate-50/50 space-y-4">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-400 uppercase text-[10px]">What</span>
                    <span className="text-slate-700">{meetingType.title}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-400 uppercase text-[10px]">When</span>
                    <span className="text-slate-700">{format(selectedDate, 'MMM dd')} @ {selectedSlot}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-400 uppercase text-[10px]">Who</span>
                    <span className="text-slate-700">{host.name}</span>
                  </div>
               </div>
               <button 
                 onClick={() => setStep(1)}
                 className="text-primary-600 font-black text-sm uppercase tracking-widest hover:text-primary-700"
               >
                 Schedule another
               </button>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-center mt-12 text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">
        Powered by <span className="text-slate-600">MeetPilot</span>
      </p>
    </div>
  );
};

export default PublicBooking;
