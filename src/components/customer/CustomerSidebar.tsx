import { motion } from 'motion/react';
import {
  Home, Search, CalendarCheck,
  CreditCard, Sparkles, User, LogOut, Compass
} from 'lucide-react';

interface SidebarProps {
  currentRoute: string;
  onRouteChange: (route: string) => void;
}

const links = [
  { id: 'cust-dashboard', href: '/customer/dashboard', icon: Home, label: 'Portal Home' },
  { id: 'cust-rooms', href: '/customer/rooms', icon: Search, label: 'Browse Rooms' },
  { id: 'cust-tour', href: '/customer/tour', icon: Compass, label: '360° Room Tour' },
  { id: 'cust-bookings', href: '/customer/bookings', icon: CalendarCheck, label: 'My Reservations' },
  { id: 'cust-payment', href: '/customer/payment', icon: CreditCard, label: 'Settle Payment' },
  { id: 'cust-services', href: '/customer/services', icon: Sparkles, label: 'Hotel Services' },
  { id: 'cust-profile', href: '/customer/profile', icon: User, label: 'Guest Profile' },
];

export function CustomerSidebar({ currentRoute, onRouteChange }: SidebarProps) {
  const logout = () => {
    localStorage.clear();
    onRouteChange('/');
  };

  const custUser = JSON.parse(localStorage.getItem('user') || '{"customer_name":"Guest"}');

  return (
    <aside className="w-64 min-h-screen bg-black text-white flex flex-col fixed left-0 top-0 border-r border-zinc-900 z-30">
      <div className="p-6 border-b border-zinc-900 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#CCFF00] flex items-center justify-center font-black text-black shadow-md shadow-[#CCFF00]/10">
            H
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase font-display">
            GRAND<span className="text-[#CCFF00]">.</span>HOTEL
          </span>
        </div>
        <p className="text-[#CCFF00]/60 text-[9px] font-mono tracking-widest uppercase mt-1">Guest Experience</p>
      </div>

      <div className="p-4 flex items-center gap-3 bg-zinc-950/40 border-b border-zinc-900/50">
        <div className="w-9 h-9 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center font-black text-[#CCFF00] text-sm font-mono">
          {custUser.customer_name ? custUser.customer_name[0] : 'G'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-white truncate uppercase tracking-tight">{custUser.customer_name || 'Guest User'}</p>
          <p className="text-[9px] text-[#CCFF00]/55 tracking-widest font-mono uppercase">Valued Resident</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto font-sans">
        {links.map(({ id, href, icon: Icon, label }) => {
          const isActive = currentRoute === href;
          return (
            <button
              key={id}
              onClick={() => onRouteChange(href)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs uppercase tracking-wider transition-all relative w-full text-left font-bold ${
                isActive ? 'text-black font-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCustLink"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-0 bg-[#CCFF00] rounded-xl shadow-lg shadow-[#CCFF00]/15"
                />
              )}
              <span className="relative z-10 shrink-0">
                <Icon size={16} className={isActive ? 'text-black' : 'text-zinc-500'} />
              </span>
              <span className="relative z-10 truncate">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-900">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-550 hover:bg-rose-950/20 hover:text-rose-400 w-full text-xs uppercase font-black tracking-widest transition-all"
        >
          <LogOut size={16} />
          Terminal Exit
        </button>
      </div>
    </aside>
  );
}
