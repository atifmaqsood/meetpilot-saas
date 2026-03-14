import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Plus, 
  Clock, 
  MapPin, 
  Copy, 
  Trash2, 
  Edit3, 
  Check,
  Globe,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import { fetchMeetingTypes, addMeetingType, deleteMeetingType, updateMeetingType } from '../../store/slices/meetingSlice';

const MeetingTypes = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: meetings } = useSelector((state) => state.meetings);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    duration: 30,
    description: '',
    location: 'Google Meet',
    slug: '',
  });

  useEffect(() => {
    if (user) dispatch(fetchMeetingTypes(user.id));
  }, [user, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      dispatch(updateMeetingType({ id: editingId, updates: formData }));
    } else {
      dispatch(addMeetingType({ ...formData, userId: user.id }));
    }
    setModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ title: '', duration: 30, description: '', location: 'Google Meet', slug: '' });
    setEditingId(null);
  };

  const handleEdit = (m) => {
    setFormData(m);
    setEditingId(m.id);
    setModalOpen(true);
  };

  const copyLink = (slug) => {
    const url = `${window.location.origin}/book/${user.email.split('@')[0]}/${slug}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Event Types</h1>
          <p className="text-slate-500 font-medium">Create and manage your available meeting options.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="btn-primary flex items-center justify-center gap-2 py-3 px-6 text-sm font-black"
        >
          <Plus size={20} />
          <span>New Event Type</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="card group hover:ring-2 hover:ring-primary-500/20">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                <Clock size={24} />
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(meeting)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                  <Edit3 size={18} />
                </button>
                <button onClick={() => dispatch(deleteMeetingType(meeting.id))} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-1">{meeting.title}</h3>
            <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-2">{meeting.description || 'No description provided.'}</p>
            
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                <Clock size={16} className="text-slate-400" />
                <span>{meeting.duration} minutes</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                <MapPin size={16} className="text-slate-400" />
                <span>{meeting.location}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button 
                onClick={() => copyLink(meeting.slug || meeting.title.toLowerCase().replace(/ /g, '-'))}
                className="flex items-center gap-2 text-primary-600 text-sm font-extrabold hover:text-primary-700"
              >
                <Copy size={16} />
                <span>Copy Link</span>
              </button>
              <a 
                href={`/book/${user.email.split('@')[0]}/${meeting.slug || meeting.title.toLowerCase().replace(/ /g, '-')}`}
                target="_blank"
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
        ))}

        {meetings.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <Clock size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No event types yet</h3>
            <p className="text-slate-500 max-w-xs mt-1 font-medium">Create your first event type to start accepting bookings.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900">{editingId ? 'Edit' : 'Create'} Event Type</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <Check size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                  <input 
                    required 
                    className="input-field" 
                    placeholder="e.g. 15 Minute Meeting"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Duration (mins)</label>
                  <select 
                    className="input-field"
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})}
                  >
                    <option value={15}>15 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Slug</label>
                  <input 
                    className="input-field" 
                    placeholder="e.g. intro-call"
                    value={formData.slug}
                    onChange={e => setFormData({...formData, slug: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
                <select 
                  className="input-field"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                >
                  <option>Google Meet</option>
                  <option>Zoom</option>
                  <option>Phone Call</option>
                  <option>In Person</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea 
                  className="input-field h-32 resize-none" 
                  placeholder="Details about this meeting..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="flex gap-4 pt-4 text-sm font-black">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 py-3 border-2 border-slate-100">Cancel</button>
                <button type="submit" className="btn-primary flex-1 py-3">{editingId ? 'Save Changes' : 'Create Event'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingTypes;
