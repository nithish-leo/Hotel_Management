import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Check, 
  Copy, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  UserCheck, 
  Ticket, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Booking } from '@/types';

interface CheckInPassProps {
  user: any;
  bookings: Booking[];
}

export function CheckInPass({ user, bookings }: CheckInPassProps) {
  // Only deal with 'Confirmed' bookings for actual check-in tokens
  const confirmedBookings = bookings.filter(b => b.booking_status === 'Confirmed');
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tokenString, setTokenString] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Default select first confirmed booking if any
  useEffect(() => {
    if (confirmedBookings.length > 0 && !selectedBooking) {
      setSelectedBooking(confirmedBookings[0]);
    }
  }, [confirmedBookings, selectedBooking]);

  const generatePass = async () => {
    setLoading(true);
    try {
      // Create a unique high-tech token structure
      const nonce = Math.random().toString(36).substring(2, 8).toUpperCase();
      const timestamp = new Date().toISOString();
      
      let payload: any = {
        iss: "GRAND_ESCAPE_HOTEL_AND_SPA",
        aud: "FRONT_DESK_RECEPTION_TERMINAL",
        guestId: user?.userId || 0,
        guestName: user?.name || "Premium Guest",
        timestamp,
        nonce
      };

      if (selectedBooking) {
        payload.bookingId = selectedBooking.booking_id;
        payload.roomNumber = selectedBooking.room_number || "Suite Assigned at Desk";
        payload.checkIn = selectedBooking.check_in;
        payload.checkOut = selectedBooking.check_out;
        payload.passType = "FAST_TRACK_KEYLESS_ARRIVAL";
        payload.tokenRef = `FT-${selectedBooking.booking_id}-${nonce}`;
      } else {
        payload.passType = "RESIDENT_CLUB_DIGITAL_PASS";
        payload.tokenRef = `MEMBER-${user?.userId || '0'}-${nonce}`;
      }

      // Convert standard JSON string or compact text
      const rawTokenString = JSON.stringify(payload, null, 2);
      setTokenString(rawTokenString);

      // Generate fully self-contained base64 PNG QR Data URL
      const dataUrl = await QRCode.toDataURL(rawTokenString, {
        margin: 2,
        scale: 7,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#030712', // custom very dark slate for scan contrast
          light: '#F8FAFC' // slate-50 light background
        }
      });
      setQrCodeUrl(dataUrl);
    } catch (err) {
      console.error("QR Code Generation failed", err);
    } finally {
      // Simulate high-tech compilation latency for realistic feeling
      setTimeout(() => {
        setLoading(false);
      }, 400);
    }
  };

  useEffect(() => {
    generatePass();
  }, [selectedBooking, user, refreshKey]);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(tokenString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `GrandEscape_CheckIn_Pass_${selectedBooking ? `Booking_${selectedBooking.booking_id}` : 'Member'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden p-6 sm:p-8 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#c9a84c] uppercase font-bold flex items-center gap-1">
            <Sparkles size={11} className="text-[#c9a84c] animate-pulse" />
            Arrival Gate Pass (QR)
          </span>
          <h3 className="text-xl font-extrabold text-[#0a1f44] tracking-tight mt-1">
            Arrival Direct Keyless Access
          </h3>
        </div>
        
        {confirmedBookings.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono">Select Stay:</span>
            <select
              value={selectedBooking?.booking_id || ''}
              onChange={(e) => {
                const found = confirmedBookings.find(b => b.booking_id === Number(e.target.value));
                if (found) setSelectedBooking(found);
              }}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c9a84c] cursor-pointer"
            >
              {confirmedBookings.map(b => (
                <option key={b.booking_id} value={b.booking_id}>
                  Stay #HB-{b.booking_id} (Suite {b.room_number || 'N/A'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left: Dynamic interactive visual QR Code display card */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative group p-4 bg-slate-50 border border-slate-200/50 rounded-2xl shadow-inner flex items-center justify-center overflow-hidden max-w-[220px] aspect-square w-full">
            
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-50/90 backdrop-blur-sm z-15 flex flex-col items-center justify-center gap-2 text-slate-500"
                >
                  <RefreshCw className="animate-spin text-[#c9a84c]" size={20} />
                  <span className="text-[10px] font-mono tracking-wider">COMPILING TOKEN...</span>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Glowing active scanner target markers for brutalist premium layout */}
            <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#c9a84c]" />
            <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#c9a84c]" />
            <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#c9a84c]" />
            <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#c9a84c]" />

            {qrCodeUrl ? (
              <motion.img 
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={qrCodeUrl} 
                alt="Bespoke Check-In QR Passkey" 
                className="w-full h-full object-contain rounded-xl select-none"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-slate-300 py-10">
                <QrCode size={64} className="stroke-1" />
              </div>
            )}
          </div>

          <div className="flex gap-2.5 mt-4 w-full max-w-[220px]">
            <button
              onClick={handleDownloadQR}
              disabled={!qrCodeUrl || loading}
              className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white text-[10.5px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 shadow-sm active:scale-97 disabled:opacity-50"
            >
              <Download size={12} />
              <span>Save Pass</span>
            </button>
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              aria-label="Refresh Security Nonce"
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800 rounded-xl cursor-pointer transition-all active:scale-97 disabled:opacity-50 flex items-center justify-center"
              disabled={loading}
              title="Rotate Signature Token"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Right: Detailed instructions & security telemetry breakdown */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c] text-xs">
            <UserCheck size={14} className="shrink-0" />
            <span className="font-bold leading-none">
              {selectedBooking ? "Confirmed Stay Verified Check-In Available" : "Active Resident Membership Pass Key"}
            </span>
          </div>

          <div className="space-y-3.5">
            {selectedBooking ? (
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">RESERVATION:</span>
                  <span className="font-bold text-[#0a1f44] font-mono">#HB-{selectedBooking.booking_id}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">ASSIGNED UNIT:</span>
                  <span className="font-extrabold text-slate-800">Suite {selectedBooking.room_number || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">PERIOD:</span>
                  <span className="font-semibold text-slate-600">{selectedBooking.check_in} – {selectedBooking.check_out}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-150">
                  <span className="text-slate-400 font-mono text-[10px]">FAST PASS STATUS:</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/40 text-emerald-700 text-[10px] font-black uppercase tracking-wider font-mono">
                    READY FOR COUNTER
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center">
                <p className="text-xs font-semibold text-slate-600">
                  You currently have no active <span className="text-[#c9a84c] font-black">Confirmed</span> bookings. Provide your Digital Member Ticket below at reception desk for direct account registry matching.
                </p>
                <div className="mt-3.5 flex justify-center">
                  <button 
                    onClick={() => {}}
                    className="px-4 py-2 bg-slate-900 border border-slate-800 text-white rounded-xl text-xs font-bold font-mono tracking-wide"
                  >
                    GUEST_UID_SECURE: #G-{user?.userId}
                  </button>
                </div>
              </div>
            )}

            <div className="text-xs leading-relaxed text-slate-500 font-medium pl-1">
              <p className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
                <Ticket size={12} className="text-[#c9a84c]" />
                How to bypass check-in queues:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11.5px] text-slate-500 pl-0.5">
                <li>Upon arrival at Grand Escape Resort, locate the Fast-Track Arrival kiosk.</li>
                <li>Present this QR code directly to our automated optical lens matching terminal.</li>
                <li>Your secure booking records will reconcile immediately and dispense physical suite cards.</li>
              </ul>
            </div>
          </div>

          {/* Raw security encoded telemetry signature toggler */}
          <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider font-sans">
                Active QR Pass Token Signature
              </span>
              <button
                onClick={handleCopyToken}
                className="text-[10.5px] font-mono text-[#c9a84c] hover:text-[#b4923a] flex items-center gap-1 cursor-pointer transition-all"
              >
                {copied ? (
                  <>
                    <Check size={11} className="text-emerald-500" />
                    <span className="text-emerald-600 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={11} />
                    <span>Copy Token Payload</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="bg-slate-950 rounded-xl p-3 border border-zinc-900 font-mono text-[10px] text-zinc-400/90 max-h-[85px] overflow-y-auto leading-normal whitespace-pre-wrap select-all">
              {loading ? (
                <span className="text-zinc-600 animate-pulse">Computing new dynamic payload parameters...</span>
              ) : (
                tokenString
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
