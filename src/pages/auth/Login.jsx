import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../store/slices/authSlice';
import { Mail, Lock, Loader2, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
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
      await dispatch(login({ email, password })).unwrap();
      navigate('/');
    } catch (err) {
      console.error('Failed to login:', err);
    }
  };

  return (
    <div className="min-h-screen flex theme-bg theme-text font-sans selection:bg-sky-500/30">
      {/* Left Side: Illustration & Branding (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 overflow-hidden relative p-16 flex-col justify-between border-r theme-border">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-sky-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[120px] rounded-full" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-sky-500/20 ring-4 ring-sky-500/10">M</div>
          <span className="font-black text-2xl tracking-tight text-white">MeetPilot</span>
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-md"
          >
            <h2 className="text-5xl font-black text-white leading-tight mb-8">
              Scheduling <br />
              <span className="text-sky-500">Mastered.</span>
            </h2>
            <div className="space-y-6">
              {[
                "Enterprise-grade reliability",
                "Advanced buffer & notice rules",
                "Stunning public booking pages"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-6 h-6 bg-sky-500/20 rounded-full flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-slate-400 font-bold group-hover:text-white transition-colors uppercase tracking-widest text-[10px]">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="relative z-10">
          <div className="flex -space-x-3 mb-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black text-white">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <p className="text-slate-400 text-sm font-medium">Join <span className="text-white font-bold">10,000+</span> teams scheduling smarter.</p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 lg:p-24 theme-bg">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-10"
        >
          <div className="text-center lg:text-left">
            <div className="lg:hidden w-12 h-12 bg-sky-600 rounded-2xl flex items-center justify-center text-white font-black mx-auto mb-6 text-xl shadow-xl shadow-sky-500/20">M</div>
            <h1 className="page-header">Welcome Back</h1>
            <p className="body-text mt-3 text-lg leading-relaxed">Enter your credentials to access your pilot deck.</p>
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
              <div className="flex items-center justify-between ml-1">
                <label className="section-label">Password</label>
                <a href="#" className="text-[10px] font-black text-sky-600 dark:text-sky-500 hover:text-sky-700 uppercase tracking-widest hover:underline underline-offset-4">Forgot Password?</a>
              </div>
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

            <div className="flex items-center gap-3 py-2">
               <input type="checkbox" className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-sky-600 focus:ring-sky-500 theme-elevated" />
               <span className="text-sm font-bold theme-text-secondary">Keep me logged in for 30 days</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary !h-14 !text-base shadow-2xl shadow-sky-500/30"
            >
              {loading ? <Loader2 className="animate-spin text-white" /> : (
                <>
                  <span>Launch Dashboard</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center body-text">
            New to MeetPilot?{' '}
            <Link to="/signup" className="text-sky-600 dark:text-sky-500 hover:text-sky-700 transition-all font-black hover:underline underline-offset-8">
              Create an account
            </Link>
          </p>
          
          <div className="pt-10 border-t theme-border flex flex-col sm:flex-row items-center justify-between gap-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
             <div className="flex items-center gap-2 section-label">
                <ShieldCheck size={14} /> SOC2 Compliant
             </div>
             <div className="flex items-center gap-2 section-label">
                <Zap size={14} /> SSL Secured
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
