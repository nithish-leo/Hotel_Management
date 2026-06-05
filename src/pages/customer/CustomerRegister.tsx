import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useToast } from '@/hooks/useToast';
import { UserPlus, User, Phone, Mail, Lock, Home, CreditCard, Loader2 } from 'lucide-react';

interface RegisterProps {
  onRouteChange: (route: string) => void;
}

export function CustomerRegister({ onRouteChange }: RegisterProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [idProof, setIdProof] = useState('');
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email || !password || !address || !idProof) {
      error('Please fill in all details for your resident profile');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name,
          phone,
          email,
          password,
          address,
          id_proof: idProof,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        success('Your guest profile has been successfully recorded. Please login.');
        onRouteChange('/customer/login');
      } else {
        error(data.error || 'Failed to create guest profile');
      }
    } catch (err) {
      error('Network failure connecting to reservation server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center relative px-4 py-8 overflow-hidden">
      
      {/* Background Ambience radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#CCFF00]/5 rounded-full blur-[110px] pointer-events-none" />

      {/* Back button */}
      <motion.button
        whileHover={{ x: -3 }}
        onClick={() => onRouteChange('/customer/login')}
        className="absolute top-8 left-8 text-xs font-mono text-zinc-500 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
      >
        &larr; Back to Login
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        className="w-full max-w-lg bg-black border border-zinc-800/85 rounded-3xl p-8 shadow-2xl overflow-hidden relative"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-[#CCFF00]" />

        {/* Header */}
        <div className="text-center flex flex-col items-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00] mb-2 shadow-inner">
            <UserPlus size={24} className="stroke-[1.5]" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white uppercase font-display">
            Guest <span className="text-[#CCFF00]">Registration</span>
          </h2>
          <p className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">Create Your Resident Profile</p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-black text-zinc-300 tracking-wide font-sans">Resident Full Name</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <User size={15} />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Charlotte Taylor"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/10 transition-all font-semibold"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-black text-zinc-300 tracking-wide font-sans">Contact Phone</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <Phone size={15} />
              </span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/10 transition-all font-semibold"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-black text-zinc-300 tracking-wide font-sans">Resident Email address</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <Mail size={15} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="charlotte@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/10 transition-all font-semibold"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-black text-zinc-300 tracking-wide font-sans">Resort Code Password</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <Lock size={15} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/10 transition-all font-semibold"
              />
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-[10px] uppercase font-black text-zinc-300 tracking-wide font-sans">Permanent Residence Address</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-550">
                <Home size={15} />
              </span>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Penthouse A, Skyline Boulevard, NY"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/10 transition-all file:mr-4 font-semibold"
              />
            </div>
          </div>

          {/* ID Proof */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-[10px] uppercase font-black text-zinc-300 tracking-wide font-sans">National Identification Proof ID (e.g. Passport, SSN)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <CreditCard size={15} />
              </span>
              <input
                type="text"
                required
                value={idProof}
                onChange={(e) => setIdProof(e.target.value)}
                placeholder="PASSPORT-US-99212A"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 focus:border-[#CCFF00] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/10 transition-all font-semibold"
              />
            </div>
          </div>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-[#CCFF00] text-black rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-[#CCFF00]/10 flex items-center justify-center gap-2 hover:bg-white disabled:opacity-50 transition-all cursor-pointer sm:col-span-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Validating Registry...
              </>
            ) : (
              'Confirm Profile Enrollment'
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
