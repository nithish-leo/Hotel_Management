import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useCustomerAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { User, Phone, Mail, Home, CreditCard, Edit3, Check, Loader2, Landmark } from 'lucide-react';
import { Customer } from '@/types';

export function CustomerProfile() {
  const { isCustomer, user } = useCustomerAuth();
  
  const [profile, setProfile] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  // Editable form inputs
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [idProof, setIdProof] = useState('');
  
  const [saving, setSaving] = useState(false);

  const { success, error, info } = useToast();

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/customer/profile/${user.userId}`);
      if (response.ok) {
        const data: Customer = await response.json();
        setProfile(data);
        
        // Populate inputs
        setName(data.customer_name);
        setPhone(data.phone);
        setEmail(data.email);
        setAddress(data.address);
        setIdProof(data.id_proof);
      } else {
        error("Failed to query resident database file");
      }
    } catch (err) {
      error("Database sync error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user) return;

    if (!name || !phone || !email || !address || !idProof) {
      error("Please check and make sure no profile fields are empty");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/customer/profile/${user.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name,
          phone,
          email,
          address,
          id_proof: idProof,
        }),
      });

      if (response.ok) {
        success("Profile successfully saved and recorded in hotel ledger.");
        // Sync local storage username to update sidebars
        const existingVal = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...existingVal,
          name: name,
        }));
        setEditing(false);
        fetchProfile();
      } else {
        error("Update request rejected by server");
      }
    } catch (err) {
      error("Network timeout saving details");
    } finally {
      setSaving(false);
    }
  };

  if (isCustomer === null || loading) {
    return (
      <div className="ml-64 min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="ml-64 min-h-screen bg-slate-50/50 p-8">
      
      {/* Title */}
      <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200/60">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#c9a84c] uppercase">Profile & Resident credentials</span>
          <h1 className="text-3xl font-extrabold text-[#0a1f44] tracking-tight mt-1">Your Resident Profile Card</h1>
        </div>
        
        <button
          onClick={() => {
            if (editing) {
              // reset fields
              fetchProfile();
              setEditing(false);
              info("Changes dismissed");
            } else {
              setEditing(true);
            }
          }}
          className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Edit3 size={13} />
          {editing ? 'Cancel edit' : 'Edit profile'}
        </button>
      </div>

      <div className="max-w-2xl bg-white border border-slate-200/50 rounded-3xl overflow-hidden shadow-sm relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#c9a84c] to-amber-300" />

        {/* Profile Card header block */}
        <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border-2 border-[#c9a84c]/20 flex items-center justify-center shrink-0">
            <Landmark className="text-[#c9a84c]" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0a1f44] font-sans leading-snug">{profile?.customer_name}</h3>
            <p className="text-slate-400 text-xs mt-0.5">Valued Resident ID: #HB-G-{user?.userId}</p>
          </div>
        </div>

        {/* Form Body block */}
        <form onSubmit={handleProfileSave} className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Customer Name */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-500 font-sans tracking-wide">Resident Full Name</span>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={15} />
                </span>
                <input
                  type="text"
                  required
                  disabled={!editing}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs font-semibold pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/20 disabled:bg-slate-50 text-slate-800 disabled:text-slate-500 focus:border-[#c9a84c] focus:outline-none transition-all placeholder-slate-400"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-500 font-sans tracking-wide">Resident Contact Phone</span>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Phone size={15} />
                </span>
                <input
                  type="tel"
                  required
                  disabled={!editing}
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full text-xs font-semibold pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/20 disabled:bg-slate-50 text-slate-800 disabled:text-slate-500 focus:border-[#c9a84c] focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-500 font-sans tracking-wide">Resident Email address</span>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  required
                  disabled={!editing}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full text-xs font-semibold pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/20 disabled:bg-slate-50 text-slate-800 disabled:text-slate-500 focus:border-[#c9a84c] focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Identification Proof ID */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-500 font-sans tracking-wide">National ID Proof ID</span>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <CreditCard size={15} />
                </span>
                <input
                  type="text"
                  required
                  disabled={!editing}
                  value={idProof}
                  onChange={e => setIdProof(e.target.value)}
                  className="w-full text-xs font-semibold pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/20 disabled:bg-slate-50 text-slate-800 disabled:text-slate-500 focus:border-[#c9a84c] focus:outline-none transition-all uppercase"
                />
              </div>
            </div>

            {/* Permanent Address */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-xs font-bold text-slate-500 font-sans tracking-wide">Permanent Residence Address</span>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Home size={15} />
                </span>
                <input
                  type="text"
                  required
                  disabled={!editing}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full text-xs font-semibold pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/20 disabled:bg-slate-50 text-slate-800 disabled:text-slate-500 focus:border-[#c9a84c] focus:outline-none transition-all"
                />
              </div>
            </div>

          </div>

          {/* Trigger profile Save */}
          {editing && (
            <div className="flex justify-end pt-5 border-t border-slate-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-[#c9a84c] hover:brightness-110 text-slate-950 text-xs font-bold rounded-xl shadow-md border border-amber-300 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Saving Details...
                  </>
                ) : (
                  <>
                    <Check size={14} className="stroke-[2.5]" />
                    Save Profie Details
                  </>
                )}
              </motion.button>
            </div>
          )}

        </form>
      </div>

    </div>
  );
}
