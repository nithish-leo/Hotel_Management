import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCustomerAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Calendar, Compass, CreditCard, Sparkles, User, ShieldCheck, Send, AlertOctagon, Activity, ShieldAlert, MessageSquare, Bot, AlertCircle, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Booking } from '@/types';
import { CheckInPass } from '@/components/customer/CheckInPass';

interface DashboardProps {
  onRouteChange: (route: string) => void;
}

export function CustomerDashboard({ onRouteChange }: DashboardProps) {
  const { isCustomer, user } = useCustomerAuth();
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, paid: 0 });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error, info } = useToast();

  // Integrated Extra States: Support Chat & Emergency Alarms
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAiConcierge, setIsAiConcierge] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Voice Concierge Voice Synthesis & Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voicePlayback, setVoicePlayback] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      error("Speech recognition is not fully supported in this browser environment.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Elegant Indian/International localization

      recognition.onstart = () => {
        setIsListening(true);
        info("Voice Concierge: Speak now (e.g., 'Book a spa treatment')");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage(transcript);
          success(`Heard command: "${transcript}"`);
          setTimeout(() => {
            triggerSendMessage(transcript);
          }, 1000);
        }
        setIsListening(false);
      };

      recognition.onerror = (err: any) => {
        console.warn("Speech recognition error handle:", err);
        setIsListening(false);
        if (err.error === 'not-allowed') {
          error("Microphone permission blocked. Please allow mic usage.");
        } else {
          error("Voice capture timed out. Please try again.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const speakResponse = (textToSpeak: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // kill any running speak

    // Clean markdown, symbols, and bullets for beautiful audio flow
    let cleanText = textToSpeak
      .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\*/g, '')
      .replace(/•/g, ', ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.volume = 1.0;
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => 
      v.name.includes("Google US English") || 
      v.name.includes("Microsoft Zira") ||
      v.lang.startsWith("en-")
    );
    if (premiumVoice) {
      utterance.voice = premiumVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Emergencies
  const [emergencySiren, setEmergencySiren] = useState(false);
  const [emergencyType, setEmergencyType] = useState<'medical' | 'one-click-contact'>('one-click-contact');
  const [medicalDetails, setMedicalDetails] = useState("");

  const fetchChats = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/support/messages/${user.userId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch(err) {
      console.error("Failed to query Support API:", err);
    }
  };

  const triggerSendMessage = async (userMsg: string) => {
    if (!userMsg.trim() || !user) return;

    setIsSending(true);
    setInputMessage("");

    const tempMsg = {
      id: `temp_${Date.now()}`,
      customer_id: user.userId,
      customer_name: user.name,
      sender: "guest",
      message: userMsg,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      if (isAiConcierge) {
        const res = await fetch('/api/support/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: user.userId,
            customer_name: user.name,
            message: userMsg,
            chatHistory: messages
          })
        });
        if (res.ok) {
          const result = await res.json();
          await fetchChats();
          
          if (voicePlayback && result.aiMessage && result.aiMessage.message) {
            speakResponse(result.aiMessage.message);
          }
        }
      } else {
        const res = await fetch('/api/support/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: user.userId,
            customer_name: user.name,
            sender: "guest",
            message: userMsg
          })
        });
        if (res.ok) {
          fetchChats();
          success("Message channeled directly to Front Desk staff logs!");
        }
      }
    } catch(err) {
      error("Network route sync lost with resident server");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchChats();
      // Poll chat database updates in real-time
      const timer = setInterval(() => {
        fetchChats();
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchBookingStats = async () => {
      try {
        const response = await fetch(`/api/customer/bookings/${user.userId}`);
        if (response.ok) {
          const bookingsData: Booking[] = await response.json();
          setBookings(bookingsData);
          const total = bookingsData.length;
          const confirmed = bookingsData.filter(b => b.booking_status === 'Confirmed').length;
          const pending = bookingsData.filter(b => b.booking_status === 'Pending').length;
          const paid = bookingsData.filter(b => b.booking_status === 'Confirmed').reduce((sum, b) => sum + Number(b.total_amount), 0);
          setStats({ total, confirmed, pending, paid });
        }
      } catch (err) {
        error("Failed to sync status metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingStats();
  }, [user]);

  if (isCustomer === null || loading) {
    return (
      <div className="ml-64 min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="ml-64 min-h-screen bg-slate-50/50 p-8">
      {/* Title Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/60"
      >
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#c9a84c] uppercase">Welcome Back Resident</span>
          <h1 className="text-3xl font-extrabold text-[#0a1f44] tracking-tight mt-1">
            Welcome to Hotel Grand, <span className="text-[#c9a84c] font-serif italic font-normal">{user?.name}</span>!
          </h1>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/40 text-emerald-800 text-xs font-semibold">
          <ShieldCheck size={14} />
          Verified Secure Resident
        </div>
      </motion.div>

      {/* Dashboard Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Reservations', value: stats.total, color: 'text-white', bg: 'bg-zinc-900/80', border: 'border-zinc-800 hover:border-[#CCFF00]/30', icon: Calendar },
          { label: 'Confirmed Stays', value: stats.confirmed, color: 'text-[#CCFF00]', bg: 'bg-zinc-900/80', border: 'border-zinc-800 hover:border-[#CCFF00]/30', icon: ShieldCheck },
          { label: 'Pending Approvals', value: stats.pending, color: 'text-amber-400', bg: 'bg-zinc-900/80', border: 'border-zinc-800 hover:border-[#CCFF00]/30', icon: Compass },
          { label: 'Total Settled Amount', value: `₹${stats.paid.toLocaleString()}`, color: 'text-[#CCFF00]', bg: 'bg-zinc-900/80', border: 'border-zinc-800 hover:border-[#CCFF00]/30', icon: CreditCard },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-6 rounded-2xl border ${item.bg} ${item.border} flex items-center justify-between shadow-sm transition-all duration-350 hover:shadow-[#CCFF00]/5`}
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-sans">{item.label}</p>
              <p className={`text-3xl font-black ${item.color} mt-2.5 font-mono`}>{item.value}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-black border border-zinc-800 flex items-center justify-center shadow-inner">
              <item.icon className="text-[#CCFF00]" size={20} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Large visual banner + quick actions split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* visual greeting card */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 rounded-3xl bg-slate-900 overflow-hidden border border-slate-200/30 relative h-[320px] shadow-lg flex flex-col justify-end p-8"
        >
          <img
            src="https://picsum.photos/seed/lounge/1000/600?blur=1"
            alt="Beautiful Grand Lounge Resort Room"
            className="absolute inset-0 w-full h-full object-cover opacity-60 saturate-[0.8]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
          
          <div className="relative">
            <span className="text-[10px] font-mono tracking-widest text-[#c9a84c] uppercase bg-[#c9a84c]/20 border border-[#c9a84c]/30 px-2.5 py-1 rounded-md">Lobby Event</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-3">Ready to plan your next retreat?</h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-md">Our executive suites are currently booking fast for the upcoming monsoon season. Reserve today for elite priority upgrades.</p>
          </div>
        </motion.div>

        {/* Action Panel */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-sm"
        >
          <h3 className="text-base font-bold text-[#0a1f44] tracking-tight mb-5 pb-2.5 border-b border-slate-100">Portal Actions</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Browse & Reserve Rooms', href: '/customer/rooms', desc: 'Secure high-end suites', icon: Compass },
              { label: 'My Reservations Ledger', href: '/customer/bookings', desc: 'View bookings state', icon: Calendar },
              { label: 'Gourmet Room Services', href: '/customer/services', desc: 'Order dining & wellness tasks', icon: Sparkles },
              { label: 'Resident Profile Settings', href: '/customer/profile', desc: 'Modify ID & contact details', icon: User },
            ].map((btn, idx) => (
              <button
                key={idx}
                onClick={() => onRouteChange(btn.href)}
                className="w-full text-left p-3.5 rounded-2xl border border-slate-100 hover:border-amber-200/50 hover:bg-amber-50/20 bg-slate-50/50 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800 tracking-wide">{btn.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{btn.desc}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#c9a84c] group-hover:border-amber-100 transition-all">
                  <btn.icon size={15} />
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Dynamic Digital QR check-in zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8"
      >
        <CheckInPass user={user} bookings={bookings} />
      </motion.div>

      {/* INTEGRATED GUEST EXTRAS: LIVE CHAT CONCIERGE & ONE-CLICK EMERGENCY SOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        
        {/* Module A: Live Concierge & Chat with Staff */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl flex flex-col h-[480px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-900 mb-4 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00]">
                {isAiConcierge ? <Bot size={18} /> : <MessageSquare size={17} />}
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">Resident Support desk</h3>
                <p className="text-[10px] text-zinc-500 font-mono">Live Session Uplink // Port 3000</p>
              </div>
            </div>

            {/* Toggle: AI Concierge vs Staff */}
            <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 items-center gap-1">
              {isAiConcierge && (
                <button
                  type="button"
                  onClick={() => {
                    setVoicePlayback(!voicePlayback);
                    if (voicePlayback) {
                      window.speechSynthesis?.cancel();
                    } else {
                      info("Voice Response Audio Feedback Enabled");
                    }
                  }}
                  className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                    voicePlayback ? 'text-[#CCFF00] hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-400'
                  }`}
                  title={voicePlayback ? "Mute Voice Response" : "Unmute Voice Response"}
                >
                  {voicePlayback ? <Volume2 size={13} /> : <VolumeX size={13} />}
                </button>
              )}
              <div className="h-4 w-[1px] bg-zinc-805 opacity-50" />
              <button
                type="button"
                onClick={() => {
                  setIsAiConcierge(true);
                  info("Switched to multi-modal AI Concierge mode");
                }}
                className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg cursor-pointer transition-all ${
                  isAiConcierge ? 'bg-[#CCFF00] text-black font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                AI Concierge
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAiConcierge(false);
                  info("Connected direct-channel to Duty Frontdesk Manager");
                }}
                className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg cursor-pointer transition-all ${
                  !isAiConcierge ? 'bg-[#CCFF00] text-black font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Duty Desk
              </button>
            </div>
          </div>

          {/* Chat scrolling log */}
          <div className="flex-grow overflow-y-auto space-y-3 mb-4 pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-650 p-6 space-y-2">
                <Bot size={28} className="text-[#CCFF00]/30 animate-bounce" />
                <p className="text-[11px] font-mono tracking-wide uppercase">Initiating Secure Chat Link...</p>
                <p className="text-[10px] text-zinc-500 max-w-xs">Introduce yourself to request monsoonal dining tips, split invoices or trigger room service.</p>
              </div>
            ) : (
              messages.map((m, idx) => {
                const isUser = m.sender === 'guest';
                const isAi = m.sender === 'ai';
                return (
                  <div
                    key={m.id || idx}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 px-1 mb-0.5">
                      <span className="text-[9px] font-black text-zinc-500 font-mono uppercase">
                        {isUser ? user?.name : (isAi ? "AI Concierge" : "Duty Agent")}
                      </span>
                      <span className="text-[8px] text-zinc-600 font-mono">
                        {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed border ${
                        isUser
                          ? 'bg-zinc-900 border-zinc-850 text-white'
                          : (isAi 
                              ? 'bg-[#CCFF00]/5 border-[#CCFF00]/20 text-zinc-200' 
                              : 'bg-amber-300/5 border-amber-300/25 text-zinc-200')
                      }`}
                    >
                      {m.message}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Voice active recording indicator */}
          {isListening && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#CCFF00]/10 border border-[#CCFF00]/20 rounded-xl mb-3 flex-shrink-0 animate-pulse">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              <span className="text-[10px] font-mono text-[#CCFF00] font-bold uppercase tracking-wider">Voice Concierge: Speak reservation query...</span>
            </div>
          )}

          {/* Chat sender Form */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!inputMessage.trim() || isSending) return;
              await triggerSendMessage(inputMessage);
            }}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isAiConcierge ? "Ask or click Microphone to speak spa reservations..." : "Draft direct note to staff manager..."}
              className="flex-grow px-4 py-3 bg-zinc-900 hover:bg-zinc-850 focus:bg-zinc-850 border border-zinc-800 focus:border-[#CCFF00] rounded-xl text-xs text-white placeholder-zinc-550 focus:outline-none focus:ring-1 focus:ring-[#CCFF00]/10 transition-all font-semibold font-sans"
            />
            
            {/* Microphone button for Voice Concierge */}
            {isAiConcierge && speechSupported && (
              <button
                type="button"
                onClick={toggleListening}
                className={`w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all border ${
                  isListening 
                  ? 'bg-red-500 hover:bg-red-650 text-white border-red-500 animate-pulse shadow-lg' 
                  : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800 hover:text-white'
                }`}
                title="Speak reservation command (Voice Concierge)"
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            )}

            <button
              type="submit"
              disabled={isSending || !inputMessage.trim()}
              className="w-11 h-11 bg-[#CCFF00] hover:bg-white text-black text-xs font-bold rounded-xl flex items-center justify-center cursor-pointer transition-all disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </form>
        </motion.div>

        {/* Module B: Emergency & Medical Dispatch SOS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl flex flex-col justify-between h-[480px] overflow-hidden relative"
        >
          {/* Subtle Background Red Pulse if Alarm Active */}
          <AnimatePresence>
            {emergencySiren && (
              <motion.div
                key="siren-bg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.08 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-red-650 animate-pulse pointer-events-none z-0"
              />
            )}
          </AnimatePresence>

          <div className="space-y-4 relative z-10 flex-grow">
            {/* Header Title */}
            <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-900">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <ShieldAlert size={18} className={emergencySiren ? "animate-spin" : ""} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">Security & Medical Beacon</h3>
                <p className="text-[10px] text-red-500 font-mono">24/7 Priority Emergency Channel</p>
              </div>
            </div>

            {/* Alarm Siren Callout */}
            {emergencySiren ? (
              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 bg-red-950/40 border border-red-900/40 rounded-2xl flex items-center gap-3.5"
              >
                <div className="w-4 h-4 rounded-full bg-red-500 animate-ping shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-[11px] font-black text-red-400 uppercase tracking-widest font-mono">🚨 SOS TRANSMITTING LIVE</p>
                  <p className="text-[10px] text-zinc-400 font-medium">Security dispatch and medical logs are streaming your GPS location: Suite {bookings[0]?.room_number || "A-12"}.</p>
                </div>
              </motion.div>
            ) : (
              <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-2xl flex items-start gap-3">
                <AlertCircle size={16} className="text-zinc-550 shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-400 leading-normal">
                  Hotel Grand safeguards VIP residents with rapid-dispatch medical responder trucks, trauma care logs, and automated defense networks. Triggering an SOS instantly notifies active campus guards.
                </p>
              </div>
            )}

            {/* Selector: Custom Medical Assist Desk vs One-Click Direct SOS */}
            <div className="space-y-3.5 mt-4">
              <label className="text-[10px] font-mono tracking-wider uppercase font-black text-zinc-400">Select Emergency Core</label>
              
              <div className="grid grid-cols-2 gap-3 bg-zinc-900/60 p-1 border border-zinc-850 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setEmergencyType('one-click-contact')}
                  className={`py-2 p-1.5 text-[10px] font-black uppercase rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                    emergencyType === 'one-click-contact' ? 'bg-red-500 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Activity size={13} />
                  Rapid SOS Guard
                </button>
                <button
                  type="button"
                  onClick={() => setEmergencyType('medical')}
                  className={`py-2 p-1.5 text-[10px] font-black uppercase rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                    emergencyType === 'medical' ? 'bg-red-500 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <AlertOctagon size={13} />
                  Medical Assist
                </button>
              </div>

              {/* Form specifically for medical assists with descriptive diagnostic */}
              {emergencyType === 'medical' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2 pt-1"
                >
                  <label className="text-[9px] font-extrabold text-zinc-500 uppercase">Input Symptoms / Diagnostic Details</label>
                  <textarea
                    placeholder="Enter diagnostic info (e.g. respiratory distress, trauma, chronic allergic shock)..."
                    value={medicalDetails}
                    onChange={(e) => setMedicalDetails(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-red-500 text-xs text-white placeholder-zinc-550 focus:outline-none transition-all h-[75px]"
                  />
                </motion.div>
              )}
            </div>

          </div>

          {/* Action Trigger Beacon Button */}
          <div className="pt-4 border-t border-zinc-900 relative z-10 flex-shrink-0">
            {emergencySiren ? (
              <button
                type="button"
                onClick={() => {
                  setEmergencySiren(false);
                  info("SOS distress beacon deactivated.");
                }}
                className="w-full py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                Reset Beacon System
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  if (!user) return;
                  const suiteNo = bookings.length > 0 ? bookings[0].room_number : "A-12";
                  try {
                    const res = await fetch('/api/emergencies', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        customer_id: user.userId,
                        customer_name: user.name,
                        type: emergencyType,
                        details: emergencyType === 'medical' ? `URGENT MEDICAL DISPATCH: ${medicalDetails || 'No custom details added'}` : `ONE-CLICK INSTANT SOS BEACON BEAMED`,
                        location: `Assigned Suite ${suiteNo}`
                      })
                    });
                    if (res.ok) {
                      setEmergencySiren(true);
                      success(emergencyType === 'medical' ? "Medical Rescue Response Team dispatched!" : "Priority SOS beacon transmitted to armed responders!");
                    }
                  } catch(e) {
                    error("Emergency satellite uplink lost");
                  }
                }}
                className="w-full py-4 bg-gradient-to-r from-red-650 to-red-500 hover:brightness-110 shadow-lg shadow-red-950/40 text-white rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <ShieldAlert size={15} />
                Beam Emergency Distress SOS
              </button>
            )}
          </div>

        </motion.div>

      </div>

    </div>
  );
}
