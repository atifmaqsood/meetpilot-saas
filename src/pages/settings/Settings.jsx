import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Settings as SettingsIcon, Globe, Bell, Camera, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/UIContext';
import { updateUser } from '../../store/slices/authSlice';
import { addNotification } from '../../store/slices/notificationSlice';
import mockDB from '../../services/mockDatabase';

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const toast = useToast();
  const fileInputRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    timezone: user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    avatar: user?.avatar || ''
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast('Image too large. Max 2MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    mockDB.updateProfile(user.id, formData);
    dispatch(updateUser(formData));
    dispatch(addNotification({
      title: 'Profile Updated',
      message: 'Your settings have been saved successfully.',
      type: 'success'
    }));
    toast('Settings synchronized!', 'success');
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'preferences', name: 'Preferences', icon: SettingsIcon },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="page-header">Account Settings</h1>
        <p className="body-text mt-2">Personalize your experience and update meeting preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tab Selector - Mobile Horizontal, Desktop Vertical */}
        <div className="w-full lg:w-72 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all whitespace-nowrap shrink-0 border border-transparent ${
                activeTab === tab.id
                  ? 'bg-sky-600 text-white shadow-xl shadow-sky-500/30 translate-x-1'
                  : 'theme-text-secondary hover:theme-elevated hover:theme-text'
              }`}
            >
              <tab.icon size={20} className={activeTab === tab.id ? 'text-white' : 'theme-text-muted'} />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Form Content Area */}
        <div className="flex-1">
          <div className="card-premium glass">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="relative group">
                      <div className="w-32 h-32 theme-elevated text-sky-600 rounded-[2.5rem] flex items-center justify-center font-black text-4xl border-4 theme-border shadow-2xl overflow-hidden group-hover:scale-105 transition-transform">
                        {formData.avatar ? (
                          <img src={formData.avatar} className="w-full h-full object-cover" alt="Profile" />
                        ) : (
                          <span>{formData.name?.charAt(0)}</span>
                        )}
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 p-3 bg-sky-600 text-white rounded-2xl shadow-xl hover:bg-sky-500 transition-all border-4 theme-border"
                      >
                        <Camera size={18} />
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-xl font-black theme-text italic">Avatar & Branding</h3>
                      <p className="text-xs font-bold theme-text-muted mt-2 uppercase tracking-widest leading-loose">
                        Recommended: 400x400 JPG or PNG. <br />
                        File size must be under 2MB.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="section-label ml-1">Full Name</label>
                      <input 
                        className="input-field" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="section-label ml-1">Email (Immutable)</label>
                      <input 
                        className="input-field opacity-60 cursor-not-allowed" 
                        disabled
                        value={formData.email}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <label className="section-label ml-1">Professional Bio</label>
                       <textarea 
                         className="input-field h-32 resize-none" 
                         placeholder="A short introduction for your booking pages..."
                         value={formData.bio}
                         onChange={e => setFormData({...formData, bio: e.target.value})}
                       />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'preferences' && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-10"
                >
                  <div className="p-8 theme-elevated rounded-[2rem] flex items-center gap-6 border theme-border">
                    <div className="p-4 theme-surface rounded-2xl text-sky-600 shadow-xl theme-border border">
                      <Globe size={24} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black theme-text uppercase tracking-widest">Global Scheduling Timezone</h3>
                      <p className="text-xs font-bold theme-text-secondary mt-1">All events will default to this zone unless otherwise specified.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="section-label ml-1">Selected Location</label>
                    <select 
                      className="input-field !pr-10 cursor-pointer"
                      value={formData.timezone}
                      onChange={e => setFormData({...formData, timezone: e.target.value})}
                    >
                      <option value="UTC">UTC (GMT+0)</option>
                      <option value="America/New_York">New York (GMT-5)</option>
                      <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                      <option value="Asia/Karachi">Karachi (GMT+5)</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="mt-12 pt-8 border-t theme-border flex justify-end">
               <button 
                 onClick={handleSave}
                 className="btn-primary !px-10"
               >
                 <Save size={18} />
                 <span>Save Preferences</span>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
