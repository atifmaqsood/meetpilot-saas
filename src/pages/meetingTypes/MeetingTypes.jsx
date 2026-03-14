import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Plus, Clock, MapPin, Copy, Trash2, Edit3, Check, Globe,
  MoreVertical, ExternalLink, Shield, Zap, Layout, MessageSquare, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMeetingTypes, addMeetingType, deleteMeetingType, updateMeetingType } from '../../store/slices/meetingSlice';
import { addNotification } from '../../store/slices/notificationSlice';
import { useToast, useUI } from '../../context/UIContext';

const MeetingTypes = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const { items: meetings } = useSelector((state) => state.meetings);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', duration: 30, description: '', location: 'Google Meet', slug: '',
    bufferBefore: 0, bufferAfter: 0, minNotice: 4, dailyLimit: 0,
  });

  useEffect(() => {
    if (user) dispatch(fetchMeetingTypes(user.id));
  }, [user, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      dispatch(updateMeetingType({ id: editingId, ...formData }));
      dispatch(addNotification({ title: 'Meeting Type Updated', message: `The settings for "${formData.title}" have been updated.`, type: 'info' }));
    } else {
      dispatch(addMeetingType({ ...formData, userId: user.id }));
      dispatch(addNotification({ title: 'New Meeting Type', message: `"${formData.title}" meeting type has been created.`, type: 'success' }));
    }
    toast('Event created successfully');
    setModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ 
      title: '', duration: 30, description: '', location: 'Google Meet', slug: '',
      bufferBefore: 0, bufferAfter: 0, minNotice: 4, dailyLimit: 0
    });
    setEditingId(null);
  };

  const handleEdit = (m) => {
    setFormData(m);
    setEditingId(m.id);
    setModalOpen(true);
  };

  const copyLink = (slug) => {
    const username = user?.email?.split('@')[0];
    const url = `${window.location.origin}/book/${username}/${slug}`;
    navigator.clipboard.writeText(url);
    toast('Link copied to clipboard!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">Meeting Types</h1>
          <p className="body-text mt-2">Configure and share your scheduling links.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="btn-primary"
        >
          <Plus size={20} />
          <span>New Meeting Type</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {meetings.map((meeting) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={meeting.id} 
              className="card-premium group relative"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 text-sky-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <Clock size={24} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(meeting)} className="p-2 hover:bg-[var(--bg-elevated)] rounded-xl theme-text-muted hover:theme-text transition-colors">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => dispatch(deleteMeetingType(meeting.id))} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl theme-text-muted hover:text-rose-600 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-black theme-text mb-1">{meeting.title}</h3>
              <p className="text-sm theme-text-muted font-bold mb-6">/{meeting.slug || meeting.title.toLowerCase().replace(/ /g, '-')}</p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 theme-elevated rounded-xl border theme-border">
                   <span className="block section-label mb-1">Duration</span>
                   <span className="text-sm font-black theme-text">{meeting.duration}m</span>
                </div>
                <div className="p-3 theme-elevated rounded-xl border theme-border">
                   <span className="block section-label mb-1">Notice</span>
                   <span className="text-sm font-black theme-text">{meeting.minNotice || '0'}h</span>
                </div>
              </div>

              <div className="pt-6 border-t theme-border flex items-center gap-2">
                <button 
                  onClick={() => copyLink(meeting.slug || meeting.title.toLowerCase().replace(/ /g, '-'))}
                  className="flex-1 btn-secondary text-xs !py-2.5"
                >
                  <Copy size={14} />
                  <span>Copy Link</span>
                </button>
                <a 
                  href={`/book/${user?.email?.split('@')[0]}/${meeting.slug || meeting.title.toLowerCase().replace(/ /g, '-')}`}
                  target="_blank"
                  className="p-2.5 theme-surface theme-text-muted hover:text-sky-600 rounded-xl border theme-border transition-all"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {meetings.length === 0 && (
          <div className="col-span-full py-24 glass border-2 border-dashed theme-border rounded-3xl flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 theme-elevated rounded-3xl flex items-center justify-center theme-text-muted mb-6">
              <Plus size={40} />
            </div>
            <h3 className="text-xl font-black theme-text">No meeting types yet</h3>
            <p className="body-text max-w-xs mt-2 font-medium">Create your first meeting configuration to share with your network.</p>
          </div>
        )}
      </div>

      {/* Advanced Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="theme-surface border theme-border w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-8 border-b theme-border flex justify-between items-center theme-elevated">
              <div>
                <h2 className="text-2xl font-black theme-text">{editingId ? 'Edit' : 'Create'} Meeting Type</h2>
                <p className="section-label mt-2">Configure Advanced Parameters</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-3 hover:bg-[var(--bg-surface)] rounded-2xl transition-colors border border-transparent hover:theme-border">
                <X size={24} className="theme-text-muted" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Basic Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold">
                <div className="md:col-span-2">
                  <label className="section-label block mb-2">Meeting Title</label>
                  <input 
                    required 
                    className="input-field !text-lg !font-black" 
                    placeholder="e.g. Discovery Strategy Session"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="section-label block mb-2">Duration</label>
                    <select 
                      className="input-field cursor-pointer"
                      value={formData.duration}
                      onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})}
                    >
                      {[15, 30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} Minutes</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="section-label block mb-2">URL Slug</label>
                    <div className="flex items-center gap-2 theme-elevated rounded-xl px-4 py-3 border theme-border">
                       <span className="theme-text-muted text-xs font-black">meetpilot.io/</span>
                       <input 
                         className="flex-1 bg-transparent border-none outline-none text-sm font-black theme-text"
                         placeholder="strategy-call"
                         value={formData.slug}
                         onChange={e => setFormData({...formData, slug: e.target.value})}
                       />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="section-label block mb-2">Location</label>
                    <select 
                      className="input-field cursor-pointer"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                    >
                      <option>Google Meet</option>
                      <option>Zoom</option>
                      <option>Microsoft Teams</option>
                      <option>Phone Call</option>
                      <option>Custom / In Person</option>
                    </select>
                  </div>
                  <div>
                    <label className="section-label block mb-2">Minimum Notice (Hours)</label>
                    <input 
                      type="number"
                      className="input-field" 
                      min="0"
                      value={formData.minNotice}
                      onChange={e => setFormData({...formData, minNotice: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Section */}
              <div className="pt-8 border-t theme-border space-y-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg"><Zap size={18} /></div>
                   <h3 className="section-label">Scheduling Polish</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold">
                    <div>
                      <label className="section-label block mb-2">Buffer Before (Mins)</label>
                      <input 
                        type="number" 
                        className="input-field"
                        value={formData.bufferBefore}
                        onChange={e => setFormData({...formData, bufferBefore: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="section-label block mb-2">Buffer After (Mins)</label>
                      <input 
                        type="number" 
                        className="input-field"
                        value={formData.bufferAfter}
                        onChange={e => setFormData({...formData, bufferAfter: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="section-label block mb-2">Daily Booking Limit</label>
                      <input 
                        type="number" 
                        className="input-field"
                        placeholder="0 for unlimited"
                        value={formData.dailyLimit}
                        onChange={e => setFormData({...formData, dailyLimit: parseInt(e.target.value)})}
                      />
                    </div>
                 </div>
              </div>

              <div>
                <label className="section-label block mb-2">Description & Instructions</label>
                <textarea 
                  className="input-field h-32 resize-none pt-4" 
                  placeholder="Share what this meeting is about, or any instructions for your guests..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </form>

            <div className="p-8 border-t theme-border flex gap-4 theme-elevated">
               <button 
                 type="button"
                 onClick={() => setModalOpen(false)}
                 className="flex-1 btn-secondary"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleSubmit}
                 className="flex-1 btn-primary"
               >
                 {editingId ? 'Save Changes' : 'Create Event Type'}
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MeetingTypes;
