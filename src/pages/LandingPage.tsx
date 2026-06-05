import { useState } from 'react';
import { motion } from 'motion/react';

interface LandingProps {
  onRouteChange: (route: string) => void;
}

// High-end editorial stagger variations
const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.2
    }
  }
};

const heroChildVariants = {
  hidden: { y: 45, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1] // Luxurious custom ease-out
    }
  }
};

const statsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.22,
      delayChildren: 0.85 // Elegant delayed entry right after hero finishes
    }
  }
};

const statItemVariants = {
  hidden: { opacity: 0, x: 35 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export function LandingPage({ onRouteChange }: LandingProps) {
  return (
    <div className="w-full h-screen bg-transparent text-white relative overflow-hidden select-none font-sans flex flex-col justify-between">
      

      {/* 2. NAVBAR LAYER */}
      <nav 
        id="nav-container"
        className="w-full h-[90px] absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-12 pointer-events-auto"
      >
        {/* Left: Brand Wordmark */}
        <div 
          id="brand-logo"
          onClick={() => onRouteChange('/')}
          className="flex items-center gap-1.5 cursor-pointer group active:scale-98 transition-all"
        >
          <span 
            className="font-black tracking-[-0.04em] text-2xl md:text-3.5xl text-white transition-colors group-hover:text-[#D4FF00]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            GRAND<span className="text-[#D4FF00]">.</span>HOTEL
          </span>
        </div>

        {/* Center: Heritage Flag */}
        <div 
          id="nav-heritage-flag"
          className="hidden sm:flex items-center gap-3"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#D4FF00] animate-pulse" />
          <span 
            className="text-[12px] text-[#D4FF00] font-black tracking-[0.3em] uppercase"
            style={{ textShadow: '0 0 10px rgba(212,255,0,0.3)' }}
          >
            EST. 2026
          </span>
        </div>

        {/* Right: Premium Trigger Action */}
        <div className="flex items-center gap-4">
          {/* Core Master Action */}
          <button
            id="btn-book-now"
            onClick={() => onRouteChange('/customer/login')}
            className="px-6 md:px-9 py-3 bg-[#D4FF00] hover:bg-white text-black font-black text-xs md:text-sm uppercase tracking-widest rounded-full transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            style={{
              boxShadow: '0 0 30px rgba(212,255,0,0.2)'
            }}
          >
            BOOK NOW
          </button>
        </div>
      </nav>


      {/* 5. RIGHT DECORATIVE VERTICAL LINE */}
      <div 
        id="right-decorative-ray"
        className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-4 pointer-events-none"
      >
        <div className="h-[180px] w-[1px] bg-white/15" />
        <span className="text-[10px] text-white/30 font-mono tracking-[0.2em] uppercase origin-center rotate-90 translate-y-6">
          VECTORS
        </span>
      </div>

      {/* 6. HERO CONTENT SECTION (GRID) */}
      <main 
        id="hero-pane"
        className="w-full max-w-7xl mx-auto flex-1 flex items-center px-8 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 z-30 pointer-events-none pt-[110px] pb-[75px]"
      >
        
        {/* Left Column - Content Suite with custom elegant stagger container */}
        <motion.div 
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-8 flex flex-col justify-center items-start gap-4 pointer-events-auto"
        >
          
          {/* Tagline */}
          <motion.div
            variants={heroChildVariants}
            className="flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-[#D4FF00] rounded-sm" />
            <span 
              className="text-[12px] font-black tracking-[0.45em] text-[#D4FF00] uppercase"
              style={{ textShadow: '0 0 15px rgba(212,255,0,0.1)' }}
            >
              REDEFINING AVANT-GARDE LUXURY
            </span>
          </motion.div>

          {/* Layout Typography - Headings */}
          <motion.div variants={heroChildVariants} className="relative mt-2">
            <h1 
              style={{ fontFamily: 'var(--font-display)' }}
              className="text-[clamp(4.2rem,9.5vw,11.5rem)] font-black leading-[0.82] tracking-[-0.05em] uppercase flex flex-col"
            >
              <span className="text-white">
                GRAND
              </span>
              
              <span
                className="transparent stroke-text"
                style={{ WebkitTextStroke: '2px #FFFFFF' }}
              >
                ESCAPE
              </span>
            </h1>
          </motion.div>

          {/* Description Text */}
          <motion.p 
            variants={heroChildVariants}
            className="text-[15px] md:text-[18px] text-white/75 font-sans leading-relaxed max-w-[520px] mt-4"
          >
            Experience world-class hospitality where bespoke comfort meets brutalist architectural elegance. Hotel Grand invites you to relax in our state-of-the-art suites, dine at legendary restaurants, and indulge in pristine sanctuary wellness.
          </motion.p>

          {/* Call to Actions Panel */}
          <motion.div 
            variants={heroChildVariants}
            className="flex flex-wrap gap-4 mt-6 items-center"
          >
            <motion.button
              id="cta-resident-access"
              onClick={() => onRouteChange('/customer/login')}
              whileHover={{ 
                scale: 1.05, 
                y: -3,
                boxShadow: '0 0 45px rgba(212, 255, 0, 0.55)',
                backgroundColor: '#FFFFFF',
                color: '#000000'
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="px-9 py-[18px] bg-[#D4FF00] text-black font-black uppercase text-xs tracking-widest flex items-center gap-3 cursor-pointer transition-colors"
              style={{
                boxShadow: '0 0 40px rgba(212,255,0,0.2)'
              }}
            >
              RESIDENT ACCESS ↗
            </motion.button>
            
            <motion.button
              id="cta-staff-terminal"
              onClick={() => onRouteChange('/admin/login')}
              whileHover={{ 
                scale: 1.05, 
                y: -3,
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderColor: 'rgba(255,255,255,0.45)'
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="px-9 py-[18px] bg-transparent border border-white/15 text-white font-bold uppercase text-xs tracking-widest cursor-pointer transition-all"
            >
              STAFF TERMINAL
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right Column - Premium Statistics Panels with luxurious delayed stagger */}
        <motion.div 
          variants={statsContainerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-4 flex flex-col justify-center items-start lg:items-end gap-9 text-left lg:text-right pointer-events-auto h-full lg:border-l lg:border-white/5 lg:pl-10"
        >
          
          {/* Stat Item 1 */}
          <motion.div
            variants={statItemVariants}
            className="flex flex-col gap-1 cursor-help group"
          >
            <span className="text-4.5xl sm:text-5.5xl font-black tracking-tighter text-white transition-colors duration-300 group-hover:text-[#D4FF00]">
              100%
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/50 group-hover:text-white/80 transition-colors">
              GUARANTEED PRIVACY
            </span>
          </motion.div>

          {/* Stat Item 2 */}
          <motion.div
            variants={statItemVariants}
            className="flex flex-col gap-1 cursor-help group"
          >
            <span className="text-4.5xl sm:text-5.5xl font-black tracking-tighter text-[#D4FF00]">
              24/7
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#D4FF00]/80 group-hover:text-[#D4FF00] transition-colors">
              BESPOKE ROOM SERVICE
            </span>
          </motion.div>

          {/* Stat Item 3 */}
          <motion.div
            variants={statItemVariants}
            className="flex flex-col gap-1 cursor-help group"
          >
            <span className="text-4.5xl sm:text-5.5xl font-black tracking-tighter text-white transition-colors duration-300 group-hover:text-[#D4FF00]">
              GOLD
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/50 group-hover:text-white/80 transition-colors">
              GLOBAL WELLNESS AWARD
            </span>
          </motion.div>

        </motion.div>
      </main>

      {/* 7. BOTTOM TICKER LAYER */}
      <footer 
        id="ticker-wrapper"
        className="w-full h-[55px] fixed bottom-0 left-0 right-0 z-40 bg-[#D4FF00] text-black overflow-hidden flex items-center pointer-events-auto border-t border-black/10 select-none"
      >
        <div className="w-full flex overflow-hidden">
          {/* Butter-smooth, continuous infinite scrolling ticker */}
          <style>{`
            @keyframes marqueeScroll {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-33.333%, 0, 0); }
            }
            .animate-marquee-continuous {
              animation: marqueeScroll 22s linear infinite;
              will-change: transform;
            }
          `}</style>
          
          <div className="flex whitespace-nowrap animate-marquee-continuous text-xs md:text-[13px] font-black uppercase tracking-wider items-center gap-16 py-1 pr-16 bg-[#D4FF00]">
            {/* Set of contents repeated 3 times to prevent edge rendering gap at extreme speeds */}
            {[0, 1, 2, 3].map((setIndex) => (
              <div key={setIndex} className="flex gap-16 items-center shrink-0 text-black font-extrabold">
                <span>HOTEL GRAND REDEFINED</span>
                <span className="w-1.5 h-1.5 bg-black rounded-full" />
                <span>BRUTALIST PREMIUM AESTHETIC</span>
                <span className="w-1.5 h-1.5 bg-black rounded-full" />
                <span>ULTRA-LUXURY SUITES & SPAS</span>
                <span className="w-1.5 h-1.5 bg-black rounded-full" />
                <span>ACTIVE CONCIERGE TERMINAL V4.0</span>
                <span className="w-1.5 h-1.5 bg-black rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
