import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  format, addDays, isSameDay, startOfDay, parse, addMinutes 
} from 'date-fns';
import { 
  Calendar as CalendarIcon, Clock, Globe, ChevronLeft, ChevronRight,
  User, Mail, MessageSquare, CheckCircle2, MapPin, ExternalLink,
  ShieldCheck, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import mockDB from '../../services/mockDatabase';
import { generateAvailableSlots } from '../../utils/slotGenerator';
import { createBooking } from '../../store/slices/bookingSlice';
import { useToast } from '../../context/UIContext';

const PublicBooking = () => {
  const { username, typeSlug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  
  const [host, setHost] = useState(null);
  const [meetingType, setMeetingType] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [existingBookings, setExistingBookings] = useState([]);
  
  const [selectedDate, setSelectedDate] = useState(startOfDay(addDays(new Date(), 1)));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState(1); 
  
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const db = mockDB.getDB();
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center theme-bg">
      <motion.div 
        animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }} 
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-16 h-16 bg-sky-600 rounded-[2rem] flex items-center justify-center text-white font-black shadow-2xl"
      >
        M
      </motion.div>
    </div>
  );

  if (!host || !meetingType) return (
    <div className="min-h-screen flex items-center justify-center theme-bg p-6">
      <div className="text-center space-y-4">
        <div className="w-24 h-24 theme-elevated text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 border theme-border italic font-black text-2xl shadow-xl">404</div>
        <h1 className="page-header">Schedule Not Found</h1>
        <p className="body-text max-w-sm mx-auto">This booking link is invalid or has expired. Please contact the host directly.</p>
        <Link to="/" className="inline-block pt-8 text-sky-600 font-black text-sm uppercase tracking-widest hover:translate-y-[-2px] transition-transform">Back to MeetPilot</Link>
      </div>
    </div>
  );

  const availableSlots = generateAvailableSlots(selectedDate, availability, meetingType, existingBookings);

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
    toast('Meeting Scheduled Successfully!', 'success');
  };

  const dates = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i + 1));

  return (
    <div className="min-h-screen theme-bg theme-text py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-slate-50 dark:bg-[#020617]">
         <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-sky-600/10 dark:bg-sky-600/5 blur-[120px] rounded-full animate-pulse" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 dark:bg-indigo-600/5 blur-[120px] rounded-full delay-1000 animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-6xl w-full glass rounded-[3rem] flex flex-col lg:flex-row min-h-[750px] shadow-3xl overflow-hidden"
      >
        
        {/* Left Side: Host & Event Context */}
        <div className="w-full lg:w-[26rem] border-b lg:border-b-0 lg:border-r theme-border p-10 lg:p-14 theme-elevated flex flex-col">
          <div className="flex-1 space-y-12">
            <Link to="/" className="inline-flex items-center gap-3">
               <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-sky-500/20">M</div>
               <span className="font-extrabold text-lg tracking-tighter">MeetPilot</span>
            </Link>

            <div className="space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 theme-surface rounded-[2rem] flex items-center justify-center font-black text-3xl border-4 theme-border shadow-2xl overflow-hidden">
                  {host.avatar ? <img src={host.avatar} className="w-full h-full object-cover" /> : host.name.charAt(0)}
                </div>
                <div>
                  <p className="section-label mb-1 text-sky-600">{host.name}</p>
                  <h1 className="text-3xl font-black theme-text tracking-tighter leading-none">{meetingType.title}</h1>
                </div>
              </div>

              <div className="space-y-5 py-8 border-y theme-border">
                 <div className="flex items-center gap-4 group">
                    <div className="p-2.5 theme-bg rounded-xl theme-text-muted group-hover:text-sky-500 transition-colors">
                      <Clock size={20} />
                    </div>
                    <span className="text-sm font-black theme-text-secondary">{meetingType.duration} Minutes</span>
                 </div>
                 <div className="flex items-center gap-4 group">
                    <div className="p-2.5 theme-bg rounded-xl theme-text-muted group-hover:text-sky-500 transition-colors">
                      <MapPin size={20} />
                    </div>
                    <span className="text-sm font-black theme-text-secondary">{meetingType.location}</span>
                 </div>
                 <div className="flex items-center gap-4 group">
                    <div className="p-2.5 theme-bg rounded-xl theme-text-muted group-hover:text-sky-500 transition-colors">
                      <Globe size={20} />
                    </div>
                    <span className="text-sm font-black theme-text-secondary truncate">{availability.timezone}</span>
                 </div>
              </div>

              <div className="theme-surface p-7 rounded-3xl border theme-border shadow-inner">
                <p className="body-text italic leading-loose">
                  "{meetingType.description || `Hello! Please select a time for our meeting. I look forward to connecting with you soon.`}"
                </p>
              </div>
            </div>
          </div>

          <div className="pt-10 flex items-center gap-3 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
             <ShieldCheck size={18} className="text-sky-500" />
             <span className="section-label">Verified Enterprise Scheduler</span>
          </div>
        </div>

        {/* Right Side: Step-based Booking Flow */}
        <div className="flex-1 p-10 lg:p-14 flex flex-col">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex-1 flex flex-col space-y-12"
              >
                <div className="flex items-center justify-between">
                   <div>
                     <h2 className="text-2xl font-black theme-text tracking-tight">Select Date & Time</h2>
                     <p className="section-label mt-1">Pick a slot that suits your schedule</p>
                   </div>
                   <div className="section-label px-4 py-2 theme-elevated rounded-full border theme-border">1 / 2</div>
                </div>

                {/* Date Selection Grid/Rail */}
                <div className="space-y-4">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-sm font-black theme-text uppercase tracking-widest">{format(selectedDate, 'MMMM yyyy')}</h3>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-6 -mx-2 px-2 scrollbar-none snap-x">
                    {dates.map((date) => (
                      <button
                        key={date.toISOString()}
                        onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                        className={`flex flex-col items-center justify-center min-w-[100px] h-32 rounded-[2.5rem] border-2 transition-all snap-center group ${
                          isSameDay(date, selectedDate)
                          ? 'border-sky-500 bg-sky-600 text-white shadow-3xl shadow-sky-500/40 scale-105'
                          : 'theme-border theme-surface theme-text-muted hover:border-sky-500/50'
                        }`}
                      >
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] mb-2">{format(date, 'EEE')}</span>
                        <span className="text-3xl font-black">{format(date, 'dd')}</span>
                        <span className="text-[10px] font-bold mt-2 opacity-60">{format(date, 'MMM')}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots Selection */}
                <div className="flex-1 space-y-8">
                  <div className="flex items-center gap-3 py-2 border-b theme-border">
                     <Clock size={18} className="theme-text-muted" />
                     <p className="text-sm font-black theme-text uppercase tracking-widest">{format(selectedDate, 'EEEE, MMMM dd')}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-5 px-4 rounded-[1.5rem] text-sm font-black transition-all border-2 ${
                          selectedSlot === slot
                          ? 'bg-[var(--text-primary)] text-[var(--bg-surface)] border-[var(--text-primary)] shadow-2xl scale-[1.02]'
                          : 'theme-border theme-elevated theme-text-muted hover:border-sky-500 hover:text-sky-600'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                    {availableSlots.length === 0 && (
                      <div className="col-span-full py-20 theme-elevated border-2 border-dashed theme-border rounded-[3rem] text-center">
                         <CalendarIcon size={40} className="mx-auto mb-6 theme-text-muted opacity-30" />
                         <p className="text-lg font-black theme-text-muted italic">No availability on this date.</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedSlot && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="sticky bottom-0 pt-6 theme-surface border-t theme-border -mx-10 px-10"
                  >
                    <button 
                      onClick={() => setStep(2)}
                      className="w-full btn-primary !h-16 !text-lg !rounded-3xl shadow-3xl"
                    >
                      <div className="flex-1 text-center pl-8">Continue to Details</div>
                      <ChevronRight size={24} />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-12"
              >
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-5">
                      <button onClick={() => setStep(1)} className="p-3 theme-surface hover:theme-elevated rounded-2xl border theme-border transition-all shadow-sm"><ChevronLeft size={24} /></button>
                      <h2 className="text-2xl font-black theme-text tracking-tight">Enter Details</h2>
                   </div>
                   <div className="section-label px-4 py-2 theme-elevated rounded-full border theme-border">2 / 2</div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 p-8 bg-sky-50 dark:bg-sky-950/30 rounded-[2.5rem] border border-sky-100 dark:border-sky-900/50 shadow-inner">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-sky-900/40 rounded-2xl text-sky-600 shadow-sm"><CalendarIcon size={24} /></div>
                      <div>
                        <span className="block section-label text-sky-800/60 dark:text-sky-400">Date</span>
                        <span className="text-base font-black text-sky-950 dark:text-sky-100">{format(selectedDate, 'MMM dd, yyyy')}</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 border-l border-sky-200/40 dark:border-sky-800/40 pl-6">
                      <div className="p-3 bg-white dark:bg-sky-900/40 rounded-2xl text-sky-600 shadow-sm"><Clock size={24} /></div>
                      <div>
                        <span className="block section-label text-sky-800/60 dark:text-sky-400">Time</span>
                        <span className="text-base font-black text-sky-950 dark:text-sky-100">{selectedSlot}</span>
                      </div>
                   </div>
                </div>

                <form onSubmit={handleBooking} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="section-label ml-1">Your Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-5 top-5 theme-text-muted group-focus-within:text-sky-600 transition-colors" size={20} />
                        <input required className="input-field !pl-14 !h-16 font-black" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="section-label ml-1">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-5 top-5 theme-text-muted group-focus-within:text-sky-600 transition-colors" size={20} />
                        <input type="email" required className="input-field !pl-14 !h-16 font-black" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="section-label ml-1">Meeting Notes (Optional)</label>
                    <div className="relative group">
                      <MessageSquare className="absolute left-5 top-5 theme-text-muted" size={20} />
                      <textarea className="input-field !pl-14 !h-40 resize-none pt-5 font-bold" placeholder="Please share anything that will help our meeting be more productive..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" className="w-full btn-primary !h-20 !text-xl !rounded-[2.5rem] shadow-3xl">
                    <div className="flex-1 text-center pl-8">Schedule Meeting</div>
                    <Zap size={24} />
                  </button>
                  <p className="text-[10px] text-center font-black theme-text-muted uppercase tracking-[0.2em]">By clicking schedule, you agree to host's cancellation policy.</p>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-12"
              >
                 <div className="relative">
                   <div className="absolute inset-[-40px] bg-emerald-400/20 blur-[60px] rounded-full animate-pulse" />
                   <div className="w-32 h-32 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-[3rem] flex items-center justify-center relative border-4 border-white dark:border-emerald-800 shadow-2xl">
                      <CheckCircle2 size={72} strokeWidth={2} />
                   </div>
                 </div>
                 
                 <div>
                   <h2 className="text-4xl lg:text-5xl font-black theme-text tracking-tighter">You're All Set!</h2>
                   <p className="body-text mt-4 text-xl">A calendar invitation has been sent to your email.</p>
                 </div>

                 <div className="w-full max-w-md theme-elevated border-2 theme-border rounded-[2.5rem] p-10 space-y-6 shadow-2xl">
                    <div className="flex justify-between items-center group">
                      <span className="section-label group-hover:text-emerald-500 transition-colors">Event</span>
                      <span className="text-lg font-black theme-text">{meetingType.title}</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="section-label group-hover:text-emerald-500 transition-colors">Time</span>
                      <span className="text-lg font-black theme-text">{format(selectedDate, 'MMM dd')} @ {selectedSlot}</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="section-label group-hover:text-emerald-500 transition-colors">Host</span>
                      <span className="text-lg font-black theme-text">{host.name}</span>
                    </div>
                 </div>

                 <div className="flex flex-col items-center gap-6 pt-4">
                    <button onClick={() => setStep(1)} className="text-sky-600 dark:text-sky-400 font-extrabold text-sm uppercase tracking-widest hover:scale-110 transition-all underline underline-offset-8 decoration-2">Schedule Another</button>
                    <div className="h-1 w-12 theme-elevated rounded-full" />
                    <button className="section-label hover:theme-text transition-colors">Add to Google Calendar</button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="fixed bottom-8 flex items-center gap-4 py-3 px-6 glass rounded-full shadow-2xl">
        <span className="text-[10px] font-black uppercase theme-text-muted tracking-[0.3em]">Powered by MeetPilot</span>
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
      </div>
    </div>
  );
};

export default PublicBooking;
