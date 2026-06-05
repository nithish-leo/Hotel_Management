import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, ArrowLeft, Info, HelpCircle, 
  Volume2, VolumeX, Eye, BookOpen, 
  Sparkles, IndianRupee, ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface VirtualTourProps {
  onRouteChange: (route: string) => void;
}

interface Hotspot {
  id: string;
  label: string;
  description: string;
  x: number; // local left coordinate on the 2200px texture
  y: number; // local top percentage
}

interface TourSuite {
  id: number;
  name: string;
  rate: number;
  capacity: number;
  description: string;
  panImageUrl: string;
  hotspots: Hotspot[];
}

const TOUR_SUITES: TourSuite[] = [
  {
    id: 1,
    name: "Standard Room",
    rate: 1200,
    capacity: 2,
    description: "Architectural purity meets ergonomic precision. Designed for executive travellers who appreciate high contrast, minimal noise, and functional excellence.",
    panImageUrl: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=2200&q=80",
    hotspots: [
      {
        id: "std-bed",
        label: "Bespoke Signature Queen Bed",
        description: "Plush hypoallergenic multi-core bedding system with high-density orthopedic alignment support and Belgian organic cotton linens.",
        x: 480,
        y: 54
      },
      {
        id: "std-media",
        label: "Avant-Garde Media Lounge",
        description: "Ultra-thin 50\" high-dynamic-range smart display with integrated hotel room control portal and curated art channel feeds.",
        x: 950,
        y: 38
      },
      {
        id: "std-charger",
        label: "Executive Reading Desk",
        description: "Solid dark walnut surface featuring standard high-speed inductive power coils and low-glare warm ambient brass LED fixtures.",
        x: 1450,
        y: 48
      },
      {
        id: "std-bar",
        label: "Curated Botanical Mini-Bar",
        description: "Equipped with freshly pressed cold raw botanical elixirs, local premium high-cocoa confectionery treats, and custom luxury tea selections.",
        x: 1850,
        y: 62
      }
    ]
  },
  {
    id: 2,
    name: "Deluxe Suite",
    rate: 2500,
    capacity: 3,
    description: "Expanded spatial metrics blending raw Brutalist stone textures with soft warm mohair furnishings, catering to elevated living aesthetics.",
    panImageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=2200&q=80",
    hotspots: [
      {
        id: "dlx-bed",
        label: "Swedish Grand King Mattress",
        description: "Handcrafted 16-layer custom microspring core, paired with pure natural mulberry silk sheets and a specialized therapeutic neck-alignment pillow menu.",
        x: 520,
        y: 50
      },
      {
        id: "dlx-lounge",
        label: "Bespoke Column Lounge",
        description: "Curated seating featuring hand-welded structural steel frames, raw wool upholstery, and high-contrast ambient spot lighting.",
        x: 980,
        y: 58
      },
      {
        id: "dlx-bar",
        label: "Single-Origin Brew Lab",
        description: "Bespoke high-pressure espresso hub pre-loaded with organic single-origin specialty coffees roasted exclusively for our club suites.",
        x: 1320,
        y: 42
      },
      {
        id: "dlx-climate",
        label: "AI Environmental Controller",
        description: "Predictive climate control using dynamic air filtration cycles, keeping relative humidity consistently locked at an optimal 45% for pure breathing comfort.",
        x: 1720,
        y: 32
      }
    ]
  },
  {
    id: 3,
    name: "Executive Room",
    rate: 4500,
    capacity: 4,
    description: "A premier sanctuary tailored as a high-performance workspace and a sanctuary of profound acoustic tranquility.",
    panImageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=2200&q=80",
    hotspots: [
      {
        id: "exe-terminal",
        label: "Professional Work Terminal",
        description: "Dual widescreen panels, standard mechanical quiet-switch tactical keyboards, and custom-designed ergonomic support contour chairs.",
        x: 420,
        y: 56
      },
      {
        id: "exe-audio",
        label: "Bowers & Wilkins Sound array",
        description: "Quad-direction, acoustically aligned, discrete surround audio node network. Effortlessly toggle ambient noise-cancellation profiles or zen soundscapes.",
        x: 880,
        y: 30
      },
      {
        id: "exe-glass",
        label: "Acoustic Insulation Glass",
        description: "A triple-layered heavy gas-insulated sound dampening glass wall overlooking the private quiet zen gardens of the Resort.",
        x: 1390,
        y: 45
      },
      {
        id: "exe-service",
        label: "Concierge Butler Dispatch",
        description: "Bespoke smart-entry panel offering one-tap premium services, immediate laundry valet, or tailored dining request feeds.",
        x: 1880,
        y: 48
      }
    ]
  },
  {
    id: 4,
    name: "Presidential Penthouse",
    rate: 12000,
    capacity: 6,
    description: "The absolute crown of Grand Escape. Massive open-concept luxury featuring private wellness hot-tubs and a dedicated server-pantry setup.",
    panImageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2200&q=80",
    hotspots: [
      {
        id: "pre-bed",
        label: "Imperial Californian King Bed",
        description: "Bespoke oversized frame with finest 1000-thread-count combed Egyptian cotton covers, wrapped in an anti-allergen goose-down topper.",
        x: 550,
        y: 48
      },
      {
        id: "pre-pool",
        label: "Infinity Hydro-massage Tub",
        description: "Heated deep structural stone pool featuring smart jet flows, customized thermal settings, and panoramic sunset seaside vantage points.",
        x: 1050,
        y: 65
      },
      {
        id: "pre-dining",
        label: "Host Catering Kitchenette",
        description: "Gourmet pantry setup pre-stocked with vintage standard cellars and tailored kitchen prep counters for private chef dinner courses.",
        x: 1520,
        y: 44
      },
      {
        id: "pre-shower",
        label: "Smart Glass Bathroom Sanctuary",
        description: "Monolithic solid Italian marble shower cabin with switchable high-voltage privacy glass opaqueness, accompanied by dual walk-in dressing halls.",
        x: 1950,
        y: 38
      }
    ]
  }
];

export function VirtualTour({ onRouteChange }: VirtualTourProps) {
  const [selectedSuiteId, setSelectedSuiteId] = useState<number>(1);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  const { success, error, info } = useToast();


  
  // Custom Panoramic Dragging
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [dragLimits, setDragLimits] = useState({ left: -1400, right: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [instructionsClosed, setInstructionsClosed] = useState(false);

  // Audio Context for luxurious background drone synthesizer
  const [audioActive, setAudioActive] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Auto scroll effect
  const [autoScrollActive, setAutoScrollActive] = useState(true);
  const xOffsetRef = useRef<number>(-300); // initial start in the middle-left of the 2200px panorama
  const [renderingX, setRenderingX] = useState<number>(-300);
  const animationFrameRef = useRef<number | null>(null);

  // On mount check if there is a pre-selected suite type in localStorage
  useEffect(() => {
    const savedType = localStorage.getItem('pre_selected_tour_type');
    if (savedType) {
      const typeId = Number(savedType);
      const exists = TOUR_SUITES.some(s => s.id === typeId);
      if (exists) {
        setSelectedSuiteId(typeId);
      }
      localStorage.removeItem('pre_selected_tour_type');
    }
  }, []);

  // Update drag limits dynamically depending on parent container size
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const updateLimits = () => {
      const parentWidth = canvasContainerRef.current?.getBoundingClientRect().width || 800;
      const textureWidth = 2200; // Panoramic asset width
      setDragLimits({
        left: -(textureWidth - parentWidth),
        right: 0
      });
    };
    
    updateLimits();
    window.addEventListener('resize', updateLimits);
    return () => window.removeEventListener('resize', updateLimits);
  }, [selectedSuiteId]);

  // Audio drone synthethizer logic (Bespoke Luxury Pad sound via Web Audio API)
  const toggleAmbientAudio = () => {
    try {
      if (audioActive) {
        // Turn off
        if (osc1Ref.current) osc1Ref.current.stop();
        if (osc2Ref.current) osc2Ref.current.stop();
        if (audioContextRef.current) audioContextRef.current.close();
        audioContextRef.current = null;
        setAudioActive(false);
      } else {
        // Start premium ambient synth
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        // Custom filter to create deep rich base drone
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(140, ctx.currentTime);

        const gainNode = ctx.createGain();
        // Super soft lower background volume
        gainNode.gain.setValueAtTime(0.00, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 3.0); // slow fade in

        // Standard fundamental frequencies
        // Tone G2 (98 Hz) paired with G3 (196 Hz) for smooth resonant warmth
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(97.99, ctx.currentTime);

        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(196.00, ctx.currentTime);

        // LFO for subtle luxurious movement (panning / volume shifts)
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.18, ctx.currentTime); // very slow oscillation (approx 5s)
        
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.02, ctx.currentTime);

        // Connect
        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start();
        osc2.start();
        lfo.start();

        osc1Ref.current = osc1;
        osc2Ref.current = osc2;
        gainNodeRef.current = gainNode;
        setAudioActive(true);
      }
    } catch (err) {
      console.warn("Audio Context generation resisted security policy on your device:", err);
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (osc1Ref.current) {
        try { osc1Ref.current.stop(); } catch(e){}
      }
      if (osc2Ref.current) {
        try { osc2Ref.current.stop(); } catch(e){}
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch(e){}
      }
    };
  }, []);

  // Ambient automatic panning when idle
  useEffect(() => {
    if (!autoScrollActive || isDragging) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const speed = 0.35; // smooth slow speed
    const tick = () => {
      let nextX = xOffsetRef.current - speed;
      // Wrap around or lock limits
      if (nextX <= dragLimits.left) {
        // Slow reverse or wrap
        nextX = 0;
      }
      xOffsetRef.current = nextX;
      setRenderingX(nextX);
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [autoScrollActive, isDragging, dragLimits.left]);

  const activeSuite = TOUR_SUITES.find(s => s.id === selectedSuiteId) || TOUR_SUITES[0];

  // Drag handlers to monitor state and stop auto scroll
  const handleDragStart = () => {
    setIsDragging(true);
    setAutoScrollActive(false);
  };

  const handleDrag = (_: any, info: { offset: { x: number } }) => {
    // Accumulate actual coordinates of the current frame
    // This maintains alignment
    const nextX = xOffsetRef.current + info.offset.x;
    const clampedX = Math.max(dragLimits.left, Math.min(dragLimits.right, nextX));
    setRenderingX(clampedX);
  };

  const handleDragEnd = (_: any, info: { point: { x: number } }) => {
    setIsDragging(false);
    // Persist current coordinates
    // Ensure accurate position on release
    if (canvasContainerRef.current) {
      const transform = window.getComputedStyle(canvasContainerRef.current.firstElementChild as Element).transform;
      if (transform && transform !== 'none') {
        const matrix = new DOMMatrixReadOnly(transform);
        xOffsetRef.current = matrix.m41;
        setRenderingX(matrix.m41);
      }
    }
  };

  const handleSuiteChange = (id: number) => {
    setSelectedSuiteId(id);
    setActiveHotspot(null);
    xOffsetRef.current = -300; // reset camera view near center
    setRenderingX(-300);
    setAutoScrollActive(true);
  };

  const jumpToReserve = () => {
    // Save selection so CustomerRooms loads with it open
    localStorage.setItem('pre_selected_booking_room_type', String(selectedSuiteId));
    onRouteChange('/customer/rooms');
  };

  return (
    <div className="ml-64 min-h-screen bg-[#070708] text-zinc-100 flex flex-col p-8 font-sans overflow-x-hidden">
      
      {/* 1. TOP BRANDING NAV HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 shrink-0 border-b border-zinc-900 pb-5">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onRouteChange('/customer/dashboard')}
            className="p-2 bg-zinc-900 text-zinc-400 hover:text-white rounded-xl border border-zinc-800 transition-all cursor-pointer"
            id="back-to-dashboard-btn"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-[#CCFF00] uppercase font-bold bg-[#CCFF00]/10 px-2.5 py-0.5 rounded-full border border-[#CCFF00]/25">
                EXECUTIVE EXPERIENCE
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CCFF00] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#CCFF00]"></span>
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase mt-0.5">
              360° VirtuSphere Accommodation Tour
            </h1>
          </div>
        </div>

        {/* Ambient controls block */}
        <div className="flex items-center gap-3">
          {/* Synthesizer Ambient System Toggle */}
          <button
            onClick={toggleAmbientAudio}
            className={`flex items-center gap-2.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border ${
              audioActive 
                ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.25)]' 
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {audioActive ? <Volume2 size={15} className="animate-bounce" /> : <VolumeX size={15} />}
            <span>{audioActive ? "Lounge Audio Active" : "Enable Lounge Ambience"}</span>
          </button>
          
          <button
            onClick={() => onRouteChange('/customer/rooms')}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold rounded-xl cursor-pointer"
          >
            Exit Tour Screen
          </button>
        </div>
      </div>

      {/* 2. SUITE CATEGORY SELECTOR CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6 shrink-0">
        {TOUR_SUITES.map((suite) => {
          const isSelected = suite.id === selectedSuiteId;
          return (
            <button
              key={suite.id}
              onClick={() => handleSuiteChange(suite.id)}
              className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-zinc-950 border-[#CCFF00] shadow-md shadow-[#CCFF00]/5' 
                  : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono tracking-wider text-zinc-550 uppercase">Category #{suite.id}</span>
                {isSelected && <Compass size={12} className="text-[#CCFF00] animate-spin-slow" />}
              </div>
              <h3 className={`text-sm font-black uppercase mt-1 ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                {suite.name}
              </h3>
              <div className="flex items-center justify-between mt-3 text-xs">
                <div className="text-zinc-500 font-mono">
                  Capacity: <strong className="text-zinc-300 font-sans">{suite.capacity}</strong>
                </div>
                <div className="text-amber-500 font-bold font-mono">
                  ₹{suite.rate.toLocaleString()}/N
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. MAIN INTERACTIVE VIEWER CONTAINER */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        
        {/* Left Side: Display Viewport (360° Panorama) */}
        <div className="lg:col-span-3 flex flex-col min-h-[50vh] relative">
          
          {/* PANORAMIC VIEW MODE */}
          <div 
            ref={canvasContainerRef}
            className="w-full flex-1 rounded-3xl border border-zinc-900 bg-black overflow-hidden relative select-none shadow-2xl cursor-grab active:cursor-grabbing group min-h-[420px]"
            id="panoramic-tour-stage"
          >
            {/* Draggable Texture Canvas */}
            <motion.div
              drag="x"
              dragConstraints={dragLimits}
              dragElastic={0.06}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              style={{ x: renderingX, width: 2200 }}
              className="absolute inset-y-0 left-0 bg-zinc-950 overflow-hidden"
              transition={{ type: 'spring', damping: 30, stiffness: 220 }}
            >
              <img 
                src={activeSuite.panImageUrl} 
                alt="Room Panoramic Landscape Asset" 
                className="h-full w-full object-cover select-none pointer-events-none saturate-[0.82] opacity-80"
                referrerPolicy="no-referrer"
              />

              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black/60 to-transparent pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black/60 to-transparent pointer-events-none" />

              {activeSuite.hotspots.map((spot) => {
                const isActive = activeHotspot?.id === spot.id;
                return (
                  <div
                    key={spot.id}
                    style={{ left: spot.x, top: `${spot.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group/spot cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveHotspot(spot);
                      setAutoScrollActive(false);
                    }}
                  >
                    <div className="relative flex items-center justify-center">
                      <span className={`animate-ping absolute inline-flex h-8 w-8 rounded-full border-2 transition-all ${
                        isActive ? 'border-[#CCFF00] bg-[#CCFF00]/20' : 'border-[#CCFF00] bg-black/10'
                      }`}></span>
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center border-2 shadow transition-all ${
                        isActive 
                          ? 'bg-[#CCFF00] border-white text-black scale-110' 
                          : 'bg-black/95 border-[#CCFF00] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black hover:scale-115'
                      }`}>
                        <Sparkles size={8} className="animate-pulse" />
                      </div>

                      <div className={`absolute bottom-7 left-1/2 -translate-x-1/2 px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest text-black bg-[#CCFF00] font-black rounded-md whitespace-nowrap shadow-md opacity-0 pointer-events-none group-hover/spot:opacity-100 transition-all duration-300 transform translate-y-1 group-hover/spot:translate-y-0`}>
                        {spot.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Instruction Banner Overlay */}
            <AnimatePresence>
              {!instructionsClosed && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute bottom-5 left-5 right-5 md:left-1/2 md:right-auto md:-translate-x-1/2 bg-zinc-950/90 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-zinc-800/80 text-center flex items-center gap-4 z-45 max-w-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00] shrink-0">
                    <Compass size={16} className="animate-spin-slow" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-[11px] font-black uppercase text-white leading-tight">Interactive Panoramic Stage</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                      🖱️ Drag horizon to rotate view &bull; Click pulsing markers ✦ to explore features.
                    </p>
                  </div>
                  <button 
                    onClick={() => setInstructionsClosed(true)}
                    className="text-[10px] font-mono text-[#CCFF00] hover:text-white uppercase font-bold shrink-0 bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded-md cursor-pointer"
                  >
                    Got It
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Drag Auto-Pan Indicator (Controls) */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
              <button
                onClick={() => setAutoScrollActive(prev => !prev)}
                className={`p-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  autoScrollActive 
                    ? 'bg-zinc-900 text-[#CCFF00] border-[#CCFF00]/40' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-550'
                }`}
                title={autoScrollActive ? "Freeze Rotation Engine" : "Enable Slow Panoramic Pan"}
              >
                <div className="flex items-center gap-1.5 px-1">
                  <div className={`h-1.5 w-1.5 rounded-full ${autoScrollActive ? 'bg-[#CCFF00] animate-ping' : 'bg-zinc-600'}`} />
                  <span className="text-[9px] font-mono uppercase tracking-widest leading-none">Auto pan</span>
                </div>
              </button>
            </div>

            <div className="absolute top-4 left-4 z-30 pointer-events-none bg-black/50 backdrop-blur-md border border-zinc-850 py-1.5 px-3 rounded-xl flex items-center gap-2">
              <Eye size={12} className="text-zinc-500 animate-pulse" />
              <span className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase">360° IMMERSION NODE</span>
            </div>
          </div>

          {/* Panorama Sub-Bar for Controls */}
          <div className="flex justify-between items-center bg-zinc-950 p-4 rounded-b-2xl border-x border-b border-zinc-900 mt-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1.5 font-semibold">
              <Info size={11} className="text-[#CCFF00]" /> Use mouse drag / trackpad swipe to browse details of {activeSuite.name}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-zinc-500">Panning offset: {Math.round(renderingX)}px</span>
              <button 
                onClick={() => {
                  xOffsetRef.current = -300;
                  setRenderingX(-300);
                }}
                className="text-[9px] font-mono text-zinc-400 hover:text-white uppercase bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800"
              >
                Reset Camera
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Specifications and Settings Sidebar Panel */}
        <div className="flex flex-col gap-5 min-h-[350px]">
          
          {/* PANORAMA MODE SIDEBARS */}
          <div className="bg-zinc-900/45 rounded-3xl border border-zinc-900 p-6 flex flex-col justify-between flex-1">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Compass size={14} className="text-[#CCFF00]" />
                <span className="text-[9px] font-mono text-zinc-450 tracking-wider font-bold uppercase">Suite Specifications</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-tight font-sans">
                {activeSuite.name}
              </h2>
              <p className="text-zinc-400 text-xs mt-3 leading-relaxed">
                {activeSuite.description}
              </p>

              <div className="space-y-2 mt-5">
                <div className="flex items-center gap-2 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-950 text-xs text-zinc-350">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
                  <span>Includes dynamic central HVAC control</span>
                </div>
                <div className="flex items-center gap-2 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-950 text-xs text-[#CCFF00]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
                  <span>Equipped with 360° keyless entry locks</span>
                </div>
                <div className="flex items-center gap-2 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-950 text-xs text-zinc-350">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
                  <span>Private isolated balcony deck</span>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-900/90 pt-5 mt-5">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Stays launch at:</span>
                <span className="text-xl font-extrabold text-[#CCFF00] font-sans flex items-center">
                  <IndianRupee size={15} />
                  {activeSuite.rate.toLocaleString()}/N
                </span>
              </div>
              
              <button
                onClick={jumpToReserve}
                className="w-full bg-[#CCFF00] hover:brightness-110 active:scale-98 text-black font-black text-xs uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#CCFF00]/10"
              >
                <span>Reserve This Suite</span>
                <ArrowRight size={14} className="stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* ACTIVE HOTSPOT EXPLANATION CARD */}
          <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-3xl min-h-[160px] flex flex-col justify-between relative shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 h-16 w-16 bg-[#CCFF00]/5 rounded-bl-full pointer-events-none" />
            
            <AnimatePresence mode="wait">
              {activeHotspot ? (
                <motion.div
                  key={activeHotspot.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2 h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={12} className="text-[#CCFF00] animate-pulse" />
                      <span className="text-[9px] font-mono text-[#CCFF00] uppercase font-bold tracking-widest">Interactive Hotspot Info</span>
                    </div>
                    <h4 className="text-sm font-black text-white uppercase mt-1">
                      {activeHotspot.label}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed font-sans font-medium">
                      {activeHotspot.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setAutoScrollActive(true);
                      setActiveHotspot(null);
                    }}
                    className="text-[9px] font-mono text-[#CCFF00] hover:text-white uppercase mt-3 hover:underline text-left cursor-pointer"
                  >
                    Close Spot Details &bull; Resume Pan
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="no-selection"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center py-6 text-zinc-500 h-full"
                >
                  <Compass size={24} className="text-zinc-700 animate-pulse text-center" />
                  <h4 className="text-xs font-bold text-zinc-400 uppercase mt-2.5">Explore Highlights</h4>
                  <p className="text-[10px] text-zinc-500 max-w-[180px] mt-1 line-clamp-2 leading-relaxed font-medium">
                    Click any pulsing marker inside the tour projection view above to highlight premium room items!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  );
}
