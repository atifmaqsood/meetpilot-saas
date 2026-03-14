import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../../store/slices/authSlice';
import { Mail, Lock, User, Loader2, CheckCircle2, ArrowRight, Star, Globe, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(signup({ name, email, password })).unwrap();
      navigate('/');
    } catch (err) {
      console.error('Failed to signup:', err);
    }
  };

  return (
    <div className="min-h-screen flex theme-bg theme-text font-sans selection:bg-sky-500/30">
      
      {/* Right Side: Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 lg:p-24 theme-bg order-2 lg:order-1">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-10"
        >
          <div className="text-center lg:text-left">
            <div className="lg:hidden w-12 h-12 bg-sky-600 rounded-2xl flex items-center justify-center text-white font-black mx-auto mb-6 text-xl shadow-xl shadow-sky-500/20">M</div>
            <h1 className="page-header">Get Started</h1>
            <p className="body-text mt-3 text-lg leading-relaxed">Sign up and build your first booking workflow in seconds.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-black border border-rose-100 dark:border-rose-900/30 flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="section-label ml-1">Full Name</label>
              <div className="relative group">
                <input
                  type="text"
                  required
                  className="input-field !pr-12 !h-14 font-black"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 theme-text-muted group-focus-within:text-sky-500 transition-colors">
                  <User size={18} />
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="section-label ml-1">Email Address</label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  className="input-field !pr-12 !h-14 font-black"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 theme-text-muted group-focus-within:text-sky-500 transition-colors">
                  <Mail size={18} />
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="section-label ml-1">Password</label>
              <div className="relative group">
                <input
                  type="password"
                  required
                  className="input-field !pr-12 !h-14 font-black"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 theme-text-muted group-focus-within:text-sky-500 transition-colors">
                  <Lock size={18} />
                </span>
              </div>
            </div>

            <div className="p-4 theme-elevated rounded-2xl space-y-3 border theme-border">
               <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center text-white"><CheckCircle2 size={10} /></div>
                  <span className="text-xs font-black theme-text-secondary uppercase tracking-widest">Minimum 8 characters</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center text-white"><CheckCircle2 size={10} /></div>
                  <span className="text-xs font-black theme-text-secondary uppercase tracking-widest">At least one number</span>
               </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary !h-14 !text-base shadow-2xl shadow-sky-500/30"
            >
              {loading ? <Loader2 className="animate-spin text-white" /> : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center body-text">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-600 dark:text-sky-500 hover:text-sky-700 transition-all font-black hover:underline underline-offset-8">
              Log in instead
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Left Side: Testimonials & Social Proof (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-sky-600 overflow-hidden relative p-16 flex-col justify-between order-1 lg:order-2 border-l theme-border">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-white/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-700/50 blur-[80px] rounded-full" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sky-600 font-black shadow-2xl">M</div>
          <span className="font-black text-2xl tracking-tight text-white">MeetPilot</span>
        </div>

        <div className="relative z-10 text-white">
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.3 }}
             className="bg-sky-700/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white/20 shadow-2xl"
          >
            <div className="flex gap-1 mb-6">
              {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="white" stroke="none" />)}
            </div>
            <p className="text-2xl font-black leading-snug mb-8 italic">
              "MeetPilot has completely transformed how our sales team manages their calendar. The level of customization is unmatched."
            </p>
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white/20 rounded-2xl border border-white/20 flex items-center justify-center font-black">S</div>
               <div>
                  <h4 className="font-black text-sm">Sarah Jenkins</h4>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Head of Growth @ TechStack</p>
               </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-8">
           <div className="space-y-2">
              <Globe className="text-white/40" size={24} />
              <h4 className="text-3xl font-black text-white">120+</h4>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Countries Supported</p>
           </div>
           <div className="space-y-2">
              <Shield className="text-white/40" size={24} />
              <h4 className="text-3xl font-black text-white">100%</h4>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Data Encryption</p>
           </div>
        </div>
      </div>

    </div>
  );
};

export default Signup;
