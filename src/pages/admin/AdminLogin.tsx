import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '@/hooks/useToast';
import { ShieldCheck, Mail, Lock, Loader2, Compass, Key, Settings2, Database, Server, RefreshCw } from 'lucide-react';

interface LoginProps {
  onRouteChange: (route: string) => void;
}

const staffImages = [
  {
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
    caption: 'EXECUTIVE OPERATIONS CENTRE — CONFERENCE RESERVES'
  },
  {
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1200',
    caption: 'LOBBY CONCIERGE HUBS — SEAMLESS CLIENT INTEGRATION'
  },
  {
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200',
    caption: 'MONOLITHIC EXPOSED FAÇADE — STRUCTURAL STRENGTH'
  },
  {
    url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200',
    caption: 'COMMAND SYSTEM BACKEND — SECURITY CORE'
  }
];

export function AdminLogin({ onRouteChange }: LoginProps) {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [imageIdx, setImageIdx] = useState(0);
  const { success, error } = useToast();

  const [showDbSetup, setShowDbSetup] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbForm, setDbForm] = useState({
    host: '0.tcp.ngrok.io',
    port: '12345',
    user: 'root',
    password: 'root',
    database: 'hotel_management'
  });

  const handleDbInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDbForm({
      ...dbForm,
      [e.target.name]: e.target.value
    });
  };

  const handleDbConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setDbLoading(true);
    try {
      const res = await fetch('/api/admin/db/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        success('MySQL Database connected & all schemas seeded successfully! You can now log in.');
        setShowDbSetup(false);
      } else {
        error(data.error || 'Failed to establish MySQL connection. Please check settings.');
      }
    } catch (err: any) {
      error(err.message || 'Failure contacting local MySQL connector server.');
    } finally {
      setDbLoading(false);
    }
  };

  // Slow continuous crossfade slideshow cycling algorithm
  useEffect(() => {
    const interval = setInterval(() => {
      setImageIdx((prev) => (prev + 1) % staffImages.length);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please complete all credential fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify({
          userId: data.user.admin_id,
          name: data.user.admin_name,
          email: data.user.email,
          role: 'admin'
        }));
        success(`Welcome back, Executive ${data.user.admin_name}!`);
        onRouteChange('/admin/dashboard');
      } else {
        error(data.error || 'Authentication rejected');
      }
    } catch (err) {
      error('Network error contacting admin server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] flex overflow-hidden relative" id="staff-login-root">
      
      {/* Back button fixed high coordinate */}
      <motion.button
        whileHover={{ x: -3 }}
        onClick={() => onRouteChange('/')}
        className="absolute top-6 left-6 z-50 text-xs font-mono text-zinc-400 hover:text-[#CCFF00] bg-zinc-950/80 border border-zinc-900 px-4 py-2.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-xl backdrop-blur-md"
      >
        &larr; Return Home
      </motion.button>

      {/* LEFT COLUMN: Clean administrative verification terminal */}
      <div className="w-full lg:w-[48%] min-h-screen flex flex-col justify-between p-8 sm:p-12 relative z-20 bg-zinc-950/95 lg:bg-zinc-950 flex-shrink-0 border-r border-[#CCFF00]/5">
        
        {/* Ambient background highlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-[#CCFF00]/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Small header details */}
        <div className="flex items-center gap-2 select-none">
          <Settings2 size={14} className="text-[#CCFF00]" />
          <span className="text-[10px] font-mono tracking-widest text-[#CCFF00] uppercase font-bold">
            GRAND.HOTEL // STAFF TERMINAL
          </span>
        </div>

        {/* Centered Login Card */}
        <div className="w-full max-w-md mx-auto my-auto py-10">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="w-full bg-black/60 border border-zinc-900/90 rounded-3xl p-8 shadow-2xl overflow-hidden relative"
          >
            {/* Core Decorative top line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-[#CCFF00]" />

            {/* Header */}
            <div className="text-center flex flex-col items-center gap-2 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00] mb-2 shadow-inner">
                <ShieldCheck size={20} className="stroke-[2px]" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white uppercase font-display">
                GRAND <span className="text-[#CCFF00]">EXECUTIVE</span>
              </h2>
              <p className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase font-bold">Administrative Verification</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold text-[#CCFF00] font-sans tracking-wide uppercase">Administrator Email</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-550">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@gmail.com"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/10 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Password input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold text-zinc-300 font-sans tracking-wide uppercase">Password Reference</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-550">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/10 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-[#CCFF00] text-black rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-[#CCFF00]/10 flex items-center justify-center gap-2 hover:bg-white disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Encrypting Access...
                  </>
                ) : (
                  'Verify Executive Port'
                )}
              </motion.button>
            </form>

            {/* MySQL Connection Toggle & Content Drawer */}
            <div className="mt-6 pt-5 border-t border-zinc-900/80 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowDbSetup(!showDbSetup)}
                className="text-[10px] font-mono text-zinc-550 hover:text-[#CCFF00] flex items-center justify-center gap-1.5 transition-all w-full cursor-pointer uppercase tracking-wider"
              >
                <Database size={12} className={showDbSetup ? "text-[#CCFF00] animate-pulse" : "text-zinc-550"} />
                {showDbSetup ? "Hide MySQL Connection Settings Form" : "Show MySQL Connection Settings Form"}
              </button>

              <AnimatePresence>
                {showDbSetup && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-4 pt-4 border-t border-zinc-900/50 space-y-4 overflow-hidden text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Server size={14} className="text-[#CCFF00]" />
                      <span className="text-[9px] font-mono tracking-widest text-[#CCFF00] uppercase font-black">Local MySQL Parameters</span>
                    </div>

                    <form onSubmit={handleDbConnect} className="space-y-4.5">
                      <div className="grid grid-cols-12 gap-3.5">
                        <div className="col-span-8">
                          <label className="text-[9px] font-bold text-zinc-400 font-mono tracking-wider uppercase mb-1.5 block">Host Address</label>
                          <input
                            type="text"
                            name="host"
                            required
                            value={dbForm.host}
                            onChange={handleDbInputChange}
                            placeholder="e.g. 127.0.0.1"
                            className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800/80 focus:border-[#CCFF00] rounded-xl text-xs text-white placeholder-zinc-650 focus:outline-none transition-all font-mono font-medium"
                          />
                        </div>
                        <div className="col-span-4">
                          <label className="text-[9px] font-bold text-zinc-400 font-mono tracking-wider uppercase mb-1.5 block">Port Number</label>
                          <input
                            type="text"
                            name="port"
                            required
                            value={dbForm.port}
                            onChange={handleDbInputChange}
                            placeholder="3306"
                            className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800/80 focus:border-[#CCFF00] rounded-xl text-xs text-white placeholder-zinc-650 focus:outline-none transition-all font-mono font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-[9px] font-bold text-zinc-400 font-mono tracking-wider uppercase mb-1.5 block">SQL Username</label>
                          <input
                            type="text"
                            name="user"
                            required
                            value={dbForm.user}
                            onChange={handleDbInputChange}
                            placeholder="root"
                            className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800/80 focus:border-[#CCFF00] rounded-xl text-xs text-white placeholder-zinc-650 focus:outline-none transition-all font-mono font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-zinc-400 font-mono tracking-wider uppercase mb-1.5 block">SQL Password</label>
                          <input
                            type="password"
                            name="password"
                            value={dbForm.password}
                            onChange={handleDbInputChange}
                            placeholder="Blank (or password)"
                            className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800/80 focus:border-[#CCFF00] rounded-xl text-xs text-white placeholder-zinc-650 focus:outline-none transition-all font-mono font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-zinc-300 font-mono tracking-wider uppercase mb-1.5 block">Target Schema Name</label>
                        <input
                          type="text"
                          name="database"
                          required
                          value={dbForm.database}
                          onChange={handleDbInputChange}
                          placeholder="hotel_management"
                          className="w-full px-3.5 py-2.5 bg-zinc-900/50 border border-[#CCFF00]/15 focus:border-[#CCFF00] rounded-xl text-xs text-[#CCFF00] font-black tracking-wide placeholder-zinc-650 focus:outline-none transition-all font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={dbLoading}
                        className="w-full py-3 bg-[#CCFF00]/10 hover:bg-[#CCFF00] border border-[#CCFF00]/25 text-[#CCFF00] hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 font-mono"
                      >
                        {dbLoading ? (
                          <>
                            <RefreshCw size={11} className="animate-spin" />
                            Establishing SQL Channel...
                          </>
                        ) : (
                          <>
                            <Server size={11} />
                            Verify Connection & Sync
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Footer info label */}
        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-600 tracking-wider select-none uppercase">
          <span>PORTAL VER: 2026.4</span>
          <span>ADMINISTRATIVE PORT CORE ACTIVE</span>
        </div>
      </div>

      {/* RIGHT COLUMN / ATMOSPHERIC LANDSCAPE BACKGROUND: Animated crossfading photography */}
      <div className="absolute inset-0 lg:relative lg:flex-1 h-full z-10 overflow-hidden bg-black select-none pointer-events-none">
        {/* Beautiful high quality image cycler using standard Framer Motion style crossfading */}
        <AnimatePresence mode="popLayout">
          {staffImages.map((img, idx) => (
            idx === imageIdx && (
              <motion.div
                key={img.url}
                className="absolute inset-0 w-full h-full"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 0.65, scale: 1.0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                <img
                  src={img.url}
                  alt="Staff Showcase"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Ambient float branding info banner inside right column */}
                <div className="absolute bottom-10 left-10 right-10 z-20 hidden lg:flex flex-col gap-1 text-left">
                  <div className="flex items-center gap-1.5 text-[#CCFF00] uppercase font-mono text-[10px] tracking-[0.2em] font-black">
                    <Compass size={12} />
                    GRAND OFFICE SYSTEM
                  </div>
                  <h3 className="text-lg font-black tracking-tight text-white uppercase font-display drop-shadow">
                    {img.caption}
                  </h3>
                </div>
              </motion.div>
            )
          ))}
        </AnimatePresence>

        {/* Dynamic Scan sweep line overlaid on background to keep brutalist cyberpunk style consistent */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#CCFF00]/3 to-transparent bg-[length:100%_4px] animate-pulse pointer-events-none z-15" />
      </div>

    </div>
  );
}
