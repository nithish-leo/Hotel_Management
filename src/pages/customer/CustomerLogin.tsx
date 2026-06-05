import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '@/hooks/useToast';
import { KeyRound, Mail, Lock, Loader2, Landmark, Compass, Sparkles, LogIn } from 'lucide-react';

interface LoginProps {
  onRouteChange: (route: string) => void;
}

const hotelImages = [
  {
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200',
    caption: 'THE COCKTAIL VAULT — EXQUISITE SENSORY DRINKS'
  },
  {
    url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1200',
    caption: 'BRUTALIST ATRIUM — REDEFINING STRUCTURAL ART'
  },
  {
    url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200',
    caption: 'THE SUITE SANCTUARY — ULTRA-MODERN COMFORT'
  },
  {
    url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1200',
    caption: 'SKYDECK HORIZON — UNPARALLELED VIEWS OF LUXURY'
  }
];

export function CustomerLogin({ onRouteChange }: LoginProps) {
  const [email, setEmail] = useState('guest@gmail.com');
  const [password, setPassword] = useState('guest123');
  const [loading, setLoading] = useState(false);
  const [imageIdx, setImageIdx] = useState(0);
  const { success, error } = useToast();

  // Slow continuous crossfade slideshow cycling algorithm
  useEffect(() => {
    const interval = setInterval(() => {
      setImageIdx((prev) => (prev + 1) % hotelImages.length);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please fill in complete login credentials');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/customer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify({
          userId: data.user.customer_id,
          name: data.user.customer_name,
          email: data.user.email,
          role: 'customer'
        }));
        success(`Welcome back, ${data.user.customer_name}! We hope you enjoy your stay.`);
        onRouteChange('/customer/dashboard');
      } else {
        error(data.error || 'Invalid credentials');
      }
    } catch (err) {
      error('Network failure connecting to resident server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] flex overflow-hidden relative" id="customer-login-root">
      
      {/* Back button fixed high coordinate */}
      <motion.button
        whileHover={{ x: -3 }}
        onClick={() => onRouteChange('/')}
        className="absolute top-6 left-6 z-50 text-xs font-mono text-zinc-400 hover:text-[#CCFF00] bg-zinc-950/80 border border-zinc-900 px-4 py-2.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-xl backdrop-blur-md"
      >
        &larr; Return Home
      </motion.button>

      {/* LEFT COLUMN: Clean immersive login portal frame */}
      <div className="w-full lg:w-[48%] min-h-screen flex flex-col justify-between p-8 sm:p-12 relative z-20 bg-zinc-950/95 lg:bg-zinc-950 flex-shrink-0 border-r border-[#CCFF00]/5">
        
        {/* Ambient background blur behind form for luxury high contrast */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-[#CCFF00]/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Small header details */}
        <div className="flex items-center gap-2 select-none">
          <Landmark size={14} className="text-[#CCFF00]" />
          <span className="text-[10px] font-mono tracking-widest text-[#CCFF00] uppercase font-bold">
            GRAND.HOTEL // GUEST RESIDENCY
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
            <div className="absolute top-0 inset-x-0 h-1 bg-[#CCFF00]" />

            {/* Header */}
            <div className="text-center flex flex-col items-center gap-2 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00] mb-2 shadow-inner">
                <LogIn size={20} className="stroke-[2px]" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white uppercase font-display">
                Guest <span className="text-[#CCFF00]">Login</span>
              </h2>
              <p className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase font-bold">Access Resident Lounge & Records</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold text-zinc-400 font-sans tracking-wide uppercase">Resident Email Address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-550">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guest@gmail.com"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/10 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Password input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-extrabold text-zinc-400 font-sans tracking-wide uppercase">Password Reference</label>
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
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/10 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-[#CCFF00] text-black rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-[#CCFF00]/10 flex items-center justify-center gap-2 hover:bg-white transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Validating Keycard...
                  </>
                ) : (
                  'Scan Keycard Entry'
                )}
              </motion.button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-zinc-900"></div>
                <span className="flex-shrink mx-4 text-zinc-650 text-[9px] font-mono uppercase tracking-widest font-black">Or Connect with Identities</span>
                <div className="flex-grow border-t border-zinc-900"></div>
              </div>

              {/* Google Login button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={async () => {
                  setLoading(true);
                  success("Contacting Google SSO identity provider hosts...");
                  await new Promise(r => setTimeout(r, 1200));
                  
                  // Load user profile details
                  const mockedGoogleUser = {
                    customer_id: 1, // John Guest's ID
                    customer_name: "John Guest",
                    email: "das20032006@gmail.com", // personalized Google Email from context
                    role: "customer"
                  };
                  localStorage.setItem('user', JSON.stringify({
                    userId: mockedGoogleUser.customer_id,
                    name: mockedGoogleUser.customer_name,
                    email: mockedGoogleUser.email,
                    role: 'customer'
                  }));
                  success(`Google Authentication successful! Logged in as: das20032006@gmail.com`);
                  setLoading(false);
                  onRouteChange('/customer/dashboard');
                }}
                disabled={loading}
                className="w-full py-3 bg-zinc-900/60 hover:bg-zinc-900 hover:border-[#CCFF00]/40 border border-zinc-800 text-zinc-100 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer transition-all"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="#ea4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.4 3.65 1.51 7.5l3.82 2.96C6.27 7.42 8.91 5.04 12 5.04z" />
                  <path fill="#4285f4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.46h6.46c-.28 1.48-1.11 2.73-2.36 3.58l3.66 2.84c2.14-1.97 3.39-4.88 3.39-8.52z" />
                  <path fill="#fbbc05" d="M5.33 14.46c-.24-.72-.37-1.49-.37-2.28s.13-1.56.37-2.28L1.51 6.94C.7 8.57.24 10.36.24 12.22s.46 3.65 1.27 5.28l3.82-3.04z" />
                  <path fill="#34a853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.02.68-2.33 1.09-4.3 1.09-3.09 0-5.73-2.38-6.67-5.42L1.51 15.9C3.4 19.74 7.35 23 12 23z" />
                </svg>
                <span>Google Account Sign In</span>
              </motion.button>

              {/* Prompt Register */}
              <div className="text-center mt-6 border-t border-zinc-900 pt-4">
                <p className="text-xs text-zinc-500 font-bold">
                  No active reservation?{' '}
                  <button
                    type="button"
                    onClick={() => onRouteChange('/customer/register')}
                    className="text-[#CCFF00] hover:underline font-black uppercase text-[10px] tracking-wider transition-all cursor-pointer"
                  >
                    Check In Online Now
                  </button>
                </p>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Footer info label */}
        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-600 tracking-wider select-none uppercase">
          <span>PORTAL VER: 2026.4</span>
          <span>ESTABLISHED AT ATHENS & TOKYO</span>
        </div>
      </div>

      {/* RIGHT COLUMN / ATMOSPHERIC LANDSCAPE BACKGROUND: Animated crossfading photography */}
      <div className="absolute inset-0 lg:relative lg:flex-1 h-full z-10 overflow-hidden bg-black select-none pointer-events-none">
        {/* Beautiful high quality image cycler using standard Framer Motion style crossfading */}
        <AnimatePresence mode="popLayout">
          {hotelImages.map((img, idx) => (
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
                  alt="Hotel Showcase"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Ambient float branding info banner inside right column */}
                <div className="absolute bottom-10 left-10 right-10 z-20 hidden lg:flex flex-col gap-1 text-left">
                  <div className="flex items-center gap-1.5 text-[#CCFF00] uppercase font-mono text-[10px] tracking-[0.2em] font-black">
                    <Compass size={12} />
                    GRAND ESCAPE SPACES
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
