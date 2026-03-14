import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Mail, Search, Eye, Clock, User, CheckCircle2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import mockDB from '../../services/mockDatabase';

const EmailLogs = () => {
  const { user } = useSelector((state) => state.auth);
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      const allEmails = mockDB.getAll('emailLogs');
      setEmails(allEmails.filter(e => e.userId === user.id).reverse());
    }
  }, [user]);

  const filteredEmails = emails.filter(e => 
    e.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-header">Email Logs</h1>
          <p className="body-text mt-2">History of system-generated communications sent to your guests.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List Section */}
        <div className="lg:col-span-1 card-premium !p-0 overflow-hidden h-[75vh] flex flex-col glass">
          <div className="p-5 border-b theme-border theme-elevated">
            <div className="relative group">
              <Search className="absolute left-4 top-3.5 theme-text-muted group-focus-within:text-sky-500 transition-colors" size={18} />
              <input 
                placeholder="Search recipients..."
                className="input-field !pl-12 !py-3 !text-xs font-black"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y theme-border">
            {filteredEmails.map((email) => (
              <button
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`w-full text-left p-5 hover:theme-elevated transition-colors relative group ${
                  selectedEmail?.id === email.id ? 'theme-elevated' : ''
                }`}
              >
                {selectedEmail?.id === email.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-600" />
                )}
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] font-black text-sky-600 uppercase tracking-[0.2em]">{email.subject}</span>
                  <span className="text-[10px] font-black theme-text-muted">{new Date(email.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p className="text-sm font-black theme-text group-hover:theme-text transition-colors truncate">{email.to}</p>
                <div className="flex items-center gap-2 mt-2">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                   <span className="text-[10px] font-black theme-text-muted uppercase tracking-widest">Delivered</span>
                </div>
              </button>
            ))}
            {filteredEmails.length === 0 && (
              <div className="p-20 text-center theme-text-muted opacity-30">
                <Mail size={48} strokeWidth={1} className="mx-auto mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">Zero communications found</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail/Preview Section */}
        <div className="lg:col-span-2 card-premium !p-0 overflow-hidden flex flex-col theme-surface border-2">
          <AnimatePresence mode="wait">
            {selectedEmail ? (
              <motion.div 
                key={selectedEmail.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                <div className="p-10 border-b theme-border theme-elevated">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-sky-100 dark:bg-sky-900/30 text-sky-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                        <Mail size={28} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black theme-text italic tracking-tight">{selectedEmail.subject}</h2>
                        <p className="section-label mt-1">Sent on {new Date(selectedEmail.sentAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 theme-surface border theme-border rounded-xl shadow-sm">
                       <CheckCircle2 size={16} className="text-emerald-500" />
                       <span className="text-[10px] font-black theme-text uppercase tracking-widest">Verified Delivery</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 theme-surface rounded-2xl border theme-border shadow-sm">
                      <span className="section-label block mb-2 opacity-50">From</span>
                      <span className="text-sm font-black theme-text">MeetPilot Cloud &lt;no-reply@meetpilot.io&gt;</span>
                    </div>
                    <div className="p-5 theme-surface rounded-2xl border theme-border shadow-sm">
                      <span className="section-label block mb-2 opacity-50">To (Recipient)</span>
                      <span className="text-sm font-black theme-text">{selectedEmail.to}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 p-10 lg:p-14 overflow-y-auto theme-surface">
                  <div className="max-w-[700px] mx-auto">
                    <div className="p-10 theme-elevated rounded-[3rem] border theme-border shadow-inner-lg min-h-[300px] flex flex-col">
                       <div className="flex-1 whitespace-pre-wrap font-medium text-lg leading-relaxed theme-text-secondary">
                        {selectedEmail.body}
                       </div>
                       <div className="mt-12 pt-8 border-t theme-border pt-12 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-black theme-text-muted uppercase tracking-widest mb-1">Generated by</p>
                            <span className="font-black theme-text">MeetPilot Automation</span>
                          </div>
                          <div className="w-12 h-12 theme-surface rounded-2xl border theme-border flex items-center justify-center font-black text-sky-600">M</div>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-20 opacity-60">
                <div className="w-24 h-24 theme-elevated rounded-[2rem] flex items-center justify-center theme-text-muted mb-8 border-2 border-dashed theme-border animate-pulse">
                  <Eye size={48} strokeWidth={1} />
                </div>
                <h3 className="text-xl font-black theme-text uppercase tracking-widest">Select an Email Log</h3>
                <p className="body-text max-w-xs mt-3">Choose a communication record from the sidebar to inspect the delivery details.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EmailLogs;
