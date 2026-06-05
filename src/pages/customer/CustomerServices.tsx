import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCustomerAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { 
  Sparkles, Utensils, HeartHandshake, Truck, Shirt, Loader2, IndianRupee,
  Wifi, Dumbbell, Compass, RefreshCw, Calendar, Clock, MapPin, Users,
  CheckCircle, ChefHat, Coffee, ShieldAlert, Check, Trash2, Plus, Minus,
  Send, Info, GlassWater, Eye
} from 'lucide-react';
import { Service } from '@/types';

// Structured static menus for premium dining
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Appetizers' | 'Mains' | 'Desserts' | 'Beverages';
  tags: string[];
  imageUrl: string;
}

const DINING_MENU: MenuItem[] = [
  {
    id: "item_in_1",
    name: "Rajasthani Smoked Laal Maas",
    description: "Tender mountain lamb slow-smoked over charcoal logs, simmered in a rich, fiery Mathania chili and organic yogurt reduction, finished with fresh ghee.",
    price: 1450,
    category: "Mains",
    tags: ["Chef Special", "Spicy", "Indian Heritage"],
    imageUrl: "https://images.unsplash.com/photo-1545247181-516773cae7bc?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "item_in_2",
    name: "Lucknowi Shahi Dum Biryani",
    description: "A dynamic masterpiece of long-grain aged Basmati rice and premium lamb cuts, slow-cooked on 'Dum' with saffron, natural rose hydrosols, and royal spices, coated with edible silver flakes.",
    price: 1250,
    category: "Mains",
    tags: ["Signature", "Royal Recipe", "Indian Heritage"],
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "item_in_3",
    name: "Gourmet Amritsari Kulcha",
    description: "Crispy tandoori flatbread stuffed with spiced potatoes, crushed coriander, and mint herbs, baked in our wood-fired clay oven and served with slow-cooked spiced chickpeas.",
    price: 920,
    category: "Appetizers",
    tags: ["Vegetarian", "Crowd Favorite"],
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "item_in_4",
    name: "Kashmiri Saffron Shahi Tukda",
    description: "Golden-crisped milk bread triangles double-soaked in an aromatic green cardamom syrup, layered with dense rabri milk custard, Iranian slivered almonds, and genuine saffron crowns.",
    price: 680,
    category: "Desserts",
    tags: ["Traditional", "Sweet Indulgence"],
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "item_1",
    name: "Truffle Lobster Thermidor",
    description: "Lobster meat poached in premium herb-butter, glazed with white winter truffles, Cognac reduction, and grated sharp Gruyère cheese.",
    price: 3200,
    category: "Mains",
    tags: ["Chef Special", "Signature"],
    imageUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "item_2",
    name: "24-Karat Gold Saffron Paneer",
    description: "Slow-pressed organic cottage cheese triangles immersed in cardamon Kashmiri saffron gravy, embellished with genuine edible gold leaf foil.",
    price: 1150,
    category: "Mains",
    tags: ["Chef Special", "Vegetarian"],
    imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "item_3",
    name: "Wild Forest Mushroom Tartlet",
    description: "Savory pastry shell packed with local grilled wild chanterelles, wild pine-herbs, and an organic melted scamorza cheese topper.",
    price: 850,
    category: "Appetizers",
    tags: ["Vegetarian"],
    imageUrl: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "item_4",
    name: "Velouté of Asparagus",
    description: "Velvety puréed garden asparagus coupled with light organic celery root cream and toasted pine nuts.",
    price: 720,
    category: "Appetizers",
    tags: ["Vegan", "Gluten-Free"],
    imageUrl: "https://images.unsplash.com/photo-1547592165-e1d17fed6005?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "item_5",
    name: "Wood-Smoked Himalayan Trout",
    description: "Himalayan trout fillet wood-smoked on pine logs, accompanied by caramelized rosemary baby potatoes and sweet vine-tomatoes.",
    price: 1800,
    category: "Mains",
    tags: ["Fresh Catch"],
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "item_6",
    name: "Saffron Durum Tagliatelle",
    description: "Hand-rolled tagliatelle sheets soaked in organic saffron juices, tossed with crushed sun-ripened olives and white parmesan shreds.",
    price: 1450,
    category: "Mains",
    tags: ["Signature", "Vegetarian"],
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "item_7",
    name: "Venezuelan Chocolate Dome Flambé",
    description: "A dark Venezuelan cocoa shell encapsulating double vanilla bean gelato, flambéed tableside with vintage dark rum.",
    price: 950,
    category: "Desserts",
    tags: ["Flambé", "Sweet Delight"],
    imageUrl: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "item_8",
    name: "Damask Rose Pistachio Phirni",
    description: "Traditional slow-reduced ground rice pudding infused with crushed kardamon, Iranian slivered pistachios and fragrant rose petals.",
    price: 650,
    category: "Desserts",
    tags: ["Traditional", "Gluten-Free"],
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "item_9",
    name: "Smoked Rosemary Tonic Elixir",
    description: "Freshly squeezed pomegranate reduction, crushed white lavender stem infusions, charred pine twigs, and carbonated mountain tonic water.",
    price: 480,
    category: "Beverages",
    tags: ["Craft Mocktail", "Botanical"],
    imageUrl: "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "item_10",
    name: "Golden Sparkle Cold Extraction",
    description: "Single-estate Ethiopian coffee beans slow-steeped for 18 hours, finished with thick sweet cream and edible golden sparkles.",
    price: 380,
    category: "Beverages",
    tags: ["Organic Brew", "Cold Extraction"],
    imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80"
  }
];

export function CustomerServices() {
  const { isCustomer, user } = useCustomerAuth();
  const [dbServices, setDbServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error, info } = useToast();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'dining' | 'facilities' | 'inroom'>('dining');

  // Dining State
  const [diningCategory, setDiningCategory] = useState<'All' | 'Appetizers' | 'Mains' | 'Desserts' | 'Beverages'>('All');
  const [diningTray, setDiningTray] = useState<{ [itemId: string]: number }>({});
  const [kitchenNotes, setKitchenNotes] = useState('');
  const [deliveryTiming, setDeliveryTiming] = useState('Standard (Under 30 Mins)');
  const [tableVenue, setTableVenue] = useState('The Summit Sky Lounge');
  const [tableDate, setTableDate] = useState('');
  const [tableTime, setTableTime] = useState('19:30');
  const [tableSeats, setTableSeats] = useState('2');
  const [dietaryRemarks, setDietaryRemarks] = useState('');
  const [callingId, setCallingId] = useState<number | null>(null);

  // Facilities State
  const [spaTherapy, setSpaTherapy] = useState('Sovereign Hot Stone Deep-Tissue Release (90 Min)');
  const [spaTime, setSpaTime] = useState('16:00');
  const [flightNumber, setFlightNumber] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [pickupVehicle, setPickupVehicle] = useState('Mercedes-Benz S-Class (Pullman Lounge)');
  const [wifiTesting, setWifiTesting] = useState(false);
  const [wifiStats, setWifiStats] = useState<{ download: number; upload: number; latency: number; jitter: number } | null>(null);
  const [wifiProgress, setWifiProgress] = useState(0);
  const [wifiStage, setWifiStage] = useState('');

  // In-Room State
  const [housekeepingItems, setHousekeepingItems] = useState<{ [key: string]: boolean }>({
    towels: false,
    soaps: false,
    pillow: false,
    turndown: false
  });
  const [housekeepingUrgency, setHousekeepingUrgency] = useState('Standard Protocol (20 Min)');
  const [housekeepingSilent, setHousekeepingSilent] = useState(false);
  const [laundryType, setLaundryType] = useState('Express Suite Steam-Pressing');
  const [laundryTime, setLaundryTime] = useState('11:00');
  const [laundryNotes, setLaundryNotes] = useState('');
  const [maintAC, setMaintAC] = useState(false);
  const [maintTV, setMaintTV] = useState(false);
  const [maintLights, setMaintLights] = useState(false);
  const [maintLocks, setMaintLocks] = useState(false);
  const [maintMsg, setMaintMsg] = useState('');

  // Live Resident Activity Sync State (Localstorage backed for high fidelity persistent feeling)
  const [activeRequests, setActiveRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem('grand_hotel_active_requests');
    return saved ? JSON.parse(saved) : [];
  });

  // Load active requests state to localStorage on modification
  useEffect(() => {
    localStorage.setItem('grand_hotel_active_requests', JSON.stringify(activeRequests));
  }, [activeRequests]);

  // Load db dynamic services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/customer/services');
        if (response.ok) {
          const data = await response.json();
          setDbServices(data);
        } else {
          error("Failed to query dynamic hotel assets");
        }
      } catch (err) {
        error("Database query timed out");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Simulator ticking downstream for active in-flight food and butler requests
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRequests((prevRequests) => {
        let changed = false;
        const next = prevRequests.map((req) => {
          if (req.status === 'Placed') {
            changed = true;
            return { ...req, status: 'Chef Preparing', progress: 30 };
          }
          if (req.status === 'Chef Preparing') {
            changed = true;
            return { ...req, status: 'In Culinary Flame', progress: 65 };
          }
          if (req.status === 'In Culinary Flame') {
            changed = true;
            return { ...req, status: 'En-Route (Thermal Butler)', progress: 90 };
          }
          if (req.status === 'En-Route (Thermal Butler)') {
            changed = true;
            // Notify guest visually on instant arrival!
            setTimeout(() => {
              success(`🛎️ Room Dispatch Alert: Your order #${req.id} has arrived directly at your door.`);
            }, 50);
            return { ...req, status: 'Delivered', progress: 100 };
          }
          
          // Housekeeping transitions
          if (req.status === 'Dispatch Queued') {
            changed = true;
            return { ...req, status: 'Butler En-Route', progress: 60 };
          }
          if (req.status === 'Butler En-Route') {
            changed = true;
            setTimeout(() => {
              success(`🛎️ Butler Alert: Housekeeping / In-Room request has been completed.`);
            }, 50);
            return { ...req, status: 'Completed', progress: 100 };
          }

          return req;
        });
        return changed ? next : prevRequests;
      });
    }, 9000); // Ticks every 9 seconds for neat visible states

    return () => clearInterval(interval);
  }, []);

  // Cart helper actions
  const adjustTrayItem = (id: string, amount: number) => {
    setDiningTray((prev) => {
      const current = prev[id] || 0;
      const nextVal = current + amount;
      const next = { ...prev };
      if (nextVal <= 0) {
        delete next[id];
      } else {
        next[id] = nextVal;
      }
      return next;
    });
  };

  const clearTray = () => {
    setDiningTray({});
    setKitchenNotes('');
    success("Dining selection tray cleared cleanly!");
  };

  const getTrayTotal = (): number => {
    return Object.entries(diningTray).reduce((total: number, [itemId, qty]) => {
      const item = DINING_MENU.find(i => i.id === itemId);
      const price = item ? Number(item.price) : 0;
      return total + (price * Number(qty));
    }, 0);
  };

  const handlePlaceOrder = () => {
    const total = getTrayTotal();
    if (total === 0) {
      error("Your dining tray is empty");
      return;
    }

    const orderId = Math.floor(1000 + Math.random() * 9000);
    const itemsSummary = Object.entries(diningTray)
      .map(([itemId, qty]) => {
        const item = DINING_MENU.find(i => i.id === itemId);
        return `${qty}x ${item?.name}`;
      })
      .join(', ');

    const newReq = {
      id: `FD-${orderId}`,
      type: 'Gourmet Dining',
      description: itemsSummary,
      amount: total,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Placed',
      progress: 10,
      notes: kitchenNotes || 'No special requests'
    };

    setActiveRequests((prev) => [newReq, ...prev]);
    setDiningTray({});
    setKitchenNotes('');
    success(`Placing order #FD-${orderId}! Sent straight to Executive Chef Desk.`);
  };

  const handleTableReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableDate) {
      error("Please check and specify a validation date slot");
      return;
    }

    const resId = Math.floor(100 + Math.random() * 900);
    const newReq = {
      id: `TB-${resId}`,
      type: 'Table Booking',
      description: `${tableVenue} &bull; ${tableSeats} Seats`,
      amount: 'Complimentary Access',
      timestamp: `${tableDate} at ${tableTime}`,
      status: 'Confirmed',
      progress: 100,
      notes: dietaryRemarks || 'None'
    };

    setActiveRequests((prev) => [newReq, ...prev]);
    setTableDate('');
    setDietaryRemarks('');
    success(`Table Reservation Confirmed! Lounge hosts notified for slot.`);
  };

  // WiFi speed testing simulator
  const runSpeedTest = () => {
    if (wifiTesting) return;
    setWifiTesting(true);
    setWifiStats(null);
    setWifiProgress(10);
    setWifiStage("Initializing luxury high-performance packet routes...");

    const steps = [
      { progress: 30, stage: "Querying closest executive edge gateway..." },
      { progress: 60, stage: "Analyzing downstream gigabit fiber pipe burst..." },
      { progress: 85, stage: "Measuring upstream jitter fluctuation cycles..." },
      { progress: 100, stage: "Speed calibration finalized successfully!" }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setWifiProgress(step.progress);
        setWifiStage(step.stage);
        
        if (step.progress === 100) {
          setWifiTesting(false);
          const generatedStats = {
            download: Math.floor(520 + Math.random() * 75),
            upload: Math.floor(480 + Math.random() * 60),
            latency: 2,
            jitter: 0.7
          };
          setWifiStats(generatedStats);
          success("Room WiFi core calibrated cleanly!");
          
          // Log reference request
          const newReq = {
            id: `WIFI-${Math.floor(100 + Math.random() * 900)}`,
            type: 'WiFi Tuning',
            description: `Calibrated Speed: ${generatedStats.download} Mbps DL`,
            amount: 'Pre-Approved',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'Completed',
            progress: 100,
            notes: 'Pure fiber link active'
          };
          setActiveRequests((prev) => [newReq, ...prev]);
        }
      }, (idx + 1) * 1200);
    });
  };

  const handleSpaReservation = (e: React.FormEvent) => {
    e.preventDefault();
    const spaId = Math.floor(100 + Math.random() * 900);
    const newReq = {
      id: `SPA-${spaId}`,
      type: 'Aura Spa Spa Booking',
      description: spaTherapy,
      amount: 'Charged under suite',
      timestamp: `Today at ${spaTime}`,
      status: 'Confirmed',
      progress: 100,
      notes: 'Please arrive 10 mins prior to Treatment'
    };
    setActiveRequests((prev) => [newReq, ...prev]);
    success("Chamber massage therapy slot booked in wellness wing!");
  };

  const handleAirportPickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightNumber || !pickupTime) {
      error("Verify flight carrier code and landing hour");
      return;
    }
    const taxiId = Math.floor(100 + Math.random() * 900);
    const newReq = {
      id: `TX-${taxiId}`,
      type: 'Shuttle Pickup',
      description: `${pickupVehicle} &bull; ${flightNumber}`,
      amount: 'Charged on checkout',
      timestamp: `Landing scheduled ${pickupTime}`,
      status: 'Confirmed',
      progress: 100,
      notes: 'Mercedes VIP designated driver assigned'
    };
    setActiveRequests((prev) => [newReq, ...prev]);
    setFlightNumber('');
    setPickupTime('');
    success("Premium limousine pickup registered under your stay flight!");
  };

  // Submit dynamic dynamic services from database api exactly as before
  const handleRequestDbService = (service: Service) => {
    setCallingId(service.service_id);
    info(`Requesting custom butler task: ${service.service_name}...`);
    
    setTimeout(() => {
      const dbId = Math.floor(1000 + Math.random() * 8999);
      const newReq = {
        id: `SV-${dbId}`,
        type: 'Registry Service',
        description: service.service_name,
        amount: service.service_charge ? `₹${service.service_charge.toLocaleString()}` : 'Free Tier',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Dispatch Queued',
        progress: 15,
        notes: 'Admin-managed Custom Service Asset'
      };
      
      setActiveRequests((prev) => [newReq, ...prev]);
      success(`${service.service_name} ordered. Dedicated attendant assigned!`);
      setCallingId(null);
    }, 1500);
  };

  const handleHousekeepingSubmit = () => {
    const toggled = Object.entries(housekeepingItems)
      .filter(([_, active]) => active)
      .map(([key, _]) => {
        if (key === 'towels') return 'Fresh Towels';
        if (key === 'soaps') return 'Lavish Bath Products';
        if (key === 'pillow') return 'Memory Pillow';
        if (key === 'turndown') return 'Turn-Down service';
        return key;
      });

    if (toggled.length === 0) {
      error("Select at least one dry utility item to ask for");
      return;
    }

    const hkId = Math.floor(100 + Math.random() * 900);
    const newReq = {
      id: `HK-${hkId}`,
      type: 'Housekeeping Desk',
      description: toggled.join(', '),
      amount: 'House Facility',
      timestamp: 'Immediate request dispatched',
      status: 'Dispatch Queued',
      progress: 15,
      notes: `${housekeepingUrgency} ${housekeepingSilent ? '| Quiet mode non-intrusion' : ''}`
    };

    setActiveRequests((prev) => [newReq, ...prev]);
    // Reset selections
    setHousekeepingItems({ towels: false, soaps: false, pillow: false, turndown: false });
    success("Housekeeper notified! Attendant deploying shortly.");
  };

  const handleLaundrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ldId = Math.floor(100 + Math.random() * 900);
    const newReq = {
      id: `LD-${ldId}`,
      type: 'Laundry Valet',
      description: laundryType,
      amount: 'Billed to room folio',
      timestamp: `Pickup scheduled at ${laundryTime}`,
      status: 'Dispatch Queued',
      progress: 15,
      notes: laundryNotes || 'Handle with luxury protocols'
    };
    setActiveRequests((prev) => [newReq, ...prev]);
    setLaundryNotes('');
    success("Pressing courier requested. Attendant arriving at slot hour!");
  };

  const handleMaintenanceSubmit = () => {
    const systems = [];
    if (maintAC) systems.push("AC Controller");
    if (maintTV) systems.push("Smart Media Casting");
    if (maintLights) systems.push("Ambient Brass Dimmers");
    if (maintLocks) systems.push("Keyless Lock Scan");

    if (systems.length === 0 && !maintMsg) {
      error("Select a maintenance category or leave notes");
      return;
    }

    const mtId = Math.floor(100 + Math.random() * 900);
    const description = systems.length > 0 ? systems.join(', ') : 'General Suite Inspection';
    const newReq = {
      id: `MT-${mtId}`,
      type: 'Suite Engineer Team',
      description,
      amount: 'Stay Safeguard',
      timestamp: 'Incident logged',
      status: 'Dispatch Queued',
      progress: 15,
      notes: maintMsg || 'High priority check required'
    };

    setActiveRequests((prev) => [newReq, ...prev]);
    setMaintAC(false);
    setMaintTV(false);
    setMaintLights(false);
    setMaintLocks(false);
    setMaintMsg('');
    success("Maintenance ticket logged! Engineer assigned to inspect room.");
  };

  const removeArchivedRequest = (id: string) => {
    setActiveRequests((prev) => prev.filter(r => r.id !== id));
    success("Completed ticket cleared from history.");
  };

  // Filter menu items
  const filteredMenu = diningCategory === 'All' 
    ? DINING_MENU 
    : DINING_MENU.filter(item => item.category === diningCategory);

  if (isCustomer === null || loading) {
    return (
      <div className="ml-64 min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="ml-64 min-h-screen bg-slate-50/50 p-8 flex flex-col lg:flex-row gap-8">
      
      {/* LEFT PRIMARY PANE: CUSTOM TABS & FORMS */}
      <div className="flex-1 min-w-0 flex flex-col">
        
        {/* Title Header */}
        <div className="mb-6 pb-4 border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#c9a84c] uppercase font-bold bg-amber-55/10 border border-amber-200/30 px-2.5 py-0.5 rounded-full">
              Bespoke Suite Amenities
            </span>
            <span className="animate-pulse h-1.5 w-1.5 rounded-full bg-[#c9a84c]" />
          </div>
          <h1 className="text-3xl font-black text-[#0a1f44] tracking-tight mt-1 uppercase">
            Grand Executive Butler Desk
          </h1>
          <p className="text-slate-450 text-xs mt-1">
            Access elite features: curated dining delivery, live WiFi tests, private transport fleet bookings, and rapid in-room housekeeping.
          </p>
        </div>

        {/* Dynamic Navigation Pillars Tab Bar */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1.5 border border-slate-200/50 mb-6 shrink-0 md:max-w-xl">
          <button
            onClick={() => setActiveTab('dining')}
            className={`flex-1 py-3 text-xs font-black uppercase text-center rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'dining' 
                ? 'bg-white text-[#0a1f44] shadow-sm font-extrabold border border-slate-200/30' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Utensils size={13} className={activeTab === 'dining' ? "text-[#c9a84c]" : ""} />
            <span>Restaurant & Dining</span>
          </button>
          
          <button
            onClick={() => setActiveTab('facilities')}
            className={`flex-1 py-3 text-xs font-black uppercase text-center rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'facilities' 
                ? 'bg-white text-[#0a1f44] shadow-sm font-extrabold border border-slate-200/30' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass size={13} className={activeTab === 'facilities' ? "text-[#c9a84c]" : ""} />
            <span>Facilities & Amenities</span>
          </button>

          <button
            onClick={() => setActiveTab('inroom')}
            className={`flex-1 py-3 text-xs font-black uppercase text-center rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'inroom' 
                ? 'bg-white text-[#0a1f44] shadow-sm font-extrabold border border-slate-200/30' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shirt size={13} className={activeTab === 'inroom' ? "text-[#c9a84c]" : ""} />
            <span>In-Room Butler Tasks</span>
          </button>
        </div>

        {/* NAVIGATION PILLARS TABS */}
        <div className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: RESTAURANT & DINING */}
            {activeTab === 'dining' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                {/* 1.1 Chef's Special Feature Spotlight Frame */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-xl border-t-4 border-[#c9a84c]">
                  {/* Backdrop glowing details */}
                  <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-cover bg-center opacity-30 select-none pointer-events-none hidden md:block" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80')` }} />
                  <div className="absolute top-0 right-0 h-16 w-16 bg-[#c9a84c]/20 rounded-bl-full pointer-events-none" />
                  
                  <div className="max-w-xl relative z-10">
                    <span className="text-[9px] font-mono tracking-widest text-[#c9a84c] uppercase font-bold flex items-center gap-1">
                      <ChefHat size={11} /> SPOTLIGHT FOR TONIGHT
                    </span>
                    <h2 className="text-xl font-black uppercase tracking-tight mt-1.5 text-white">
                      Lobster Flambé Thermidor & Golden Saffron Paneer
                    </h2>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                      Our Head Butler has coordinated with the pastry and hot-kitchen chefs to deliver custom flambé orders straight to our VIP Resident Suites. Experience artisanal plating under absolute luxury protocols.
                    </p>
                  </div>
                </div>

                {/* 1.2 Interactive Food Menu Categories */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-black uppercase text-[#0a1f44] tracking-tight flex items-center gap-1.5 pb-1">
                      <Utensils size={14} className="text-[#c9a84c]" />
                      <span>Executive Dining Catalogue</span>
                    </h3>
                    
                    {/* Category quick selectors */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-sm md:max-w-md">
                      {(['All', 'Appetizers', 'Mains', 'Desserts', 'Beverages'] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setDiningCategory(cat)}
                          className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                            diningCategory === cat 
                              ? 'bg-[#0a1f44] text-white' 
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Food items Grid layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredMenu.map((item) => {
                      const qty = diningTray[item.id] || 0;
                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl border border-slate-200/50 p-4 shadow-sm hover:shadow-md hover:border-[#c9a84c]/30 transition-all flex gap-4 relative group"
                        >
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-20 h-20 rounded-xl object-cover shrink-0 select-none pointer-events-none"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-extrabold text-[#0a1f44] truncate">{item.name}</span>
                                {item.tags.map(tag => (
                                  <span key={tag} className="text-[8px] font-mono uppercase bg-[#c9a84c]/10 text-[#c9a84c] px-1.5 py-0.5 rounded font-black max-w-[80px] truncate">{tag}</span>
                                ))}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1 lines-clamp-2 leading-snug">{item.description}</p>
                            </div>

                            <div className="flex justify-between items-center mt-2.5">
                              <span className="text-[#c9a84c] font-black text-xs font-mono">₹{item.price.toLocaleString()}</span>
                              
                              <div className="flex items-center gap-1">
                                {qty > 0 ? (
                                  <div className="flex items-center gap-2 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                                    <button 
                                      onClick={() => adjustTrayItem(item.id, -1)}
                                      className="p-1 hover:text-red-500 hover:scale-110 active:scale-95 transition-all text-slate-500 cursor-pointer"
                                    >
                                      <Minus size={11} />
                                    </button>
                                    <span className="text-[11px] font-bold text-slate-850 w-3 text-center">{qty}</span>
                                    <button 
                                      onClick={() => adjustTrayItem(item.id, 1)}
                                      className="p-1 hover:text-[#c9a84c] hover:scale-110 active:scale-95 transition-all text-slate-500 cursor-pointer"
                                    >
                                      <Plus size={11} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => adjustTrayItem(item.id, 1)}
                                    className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-white bg-[#0a1f44] hover:bg-slate-800 rounded-lg active:scale-97 cursor-pointer transition-all uppercase"
                                  >
                                    Add To Tray
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 1.3 Interactive Delivery Options & In-Suite Dispatch Form */}
                {Object.keys(diningTray).length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-white border-2 border-dashed border-[#c9a84c]/40 rounded-3xl"
                  >
                    <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                      <div>
                        <h4 className="text-xs font-black uppercase text-[#0a1f44]">Selected Room Service Tray</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Calculated on standard residency prices &taxes</p>
                      </div>
                      <button 
                        onClick={clearTray}
                        className="text-[10px] font-mono text-red-500 hover:underline uppercase font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={11} /> Clear All
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Kitchen special instructions field */}
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-505 font-bold mb-1 block">Special culinary requests (e.g. no nuts, mild spice)</label>
                        <textarea
                          value={kitchenNotes}
                          onChange={(e) => setKitchenNotes(e.target.value)}
                          placeholder="e.g., Deliver dressing on the side. Extra hot sauce appreciated."
                          className="w-full text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#c9a84c] rounded-xl p-3 h-20 outline-none resize-none"
                        />
                      </div>

                      {/* Dropdown delivery selector */}
                      <div>
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-505 font-bold mb-1 block">Appointed delivery hour</label>
                        <select
                          value={deliveryTiming}
                          onChange={(e) => setDeliveryTiming(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#c9a84c] rounded-xl p-3 h-10 outline-none"
                        >
                          <option>Standard (Under 30 Mins)</option>
                          <option>VIP Super Express (Priority Kitchen)</option>
                          <option>Breakfast Pre-order (Next morning 8:00 AM)</option>
                          <option>Breakfast Pre-order (Next morning 9:30 AM)</option>
                          <option>Midnight Special Pre-schedule (11:30 PM)</option>
                        </select>

                        <div className="flex justify-between items-baseline mt-4 bg-slate-50 border border-slate-100 rounded-xl p-3">
                          <span className="text-[10px] font-bold text-slate-500 font-sans uppercase">Sub-Total Charge:</span>
                          <span className="text-base font-extrabold text-[#c9a84c] font-mono flex items-center">
                            <IndianRupee size={14} className="stroke-[2.5]" />
                            {getTrayTotal().toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <button
                        onClick={handlePlaceOrder}
                        className="px-6 py-2.5 bg-[#0a1f44] hover:bg-[#c9a84c] hover:text-black hover:shadow-lg text-white text-xs font-black uppercase tracking-wider rounded-xl active:scale-97 cursor-pointer transition-all flex items-center gap-1.5 shadow"
                      >
                        <Send size={12} />
                        <span>Dispatch Culinary Order</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 1.4 Interactive Table Reservation System */}
                <form 
                  onSubmit={handleTableReservation}
                  className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                    <Calendar size={15} className="text-[#c9a84c]" />
                    <h3 className="text-sm font-black uppercase text-[#0a1f44] tracking-tight">VIP In-Resort Table Reservation</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-505 font-bold mb-1 block">Pick Premium Venue</label>
                      <select
                        value={tableVenue}
                        onChange={(e) => setTableVenue(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#c9a84c] rounded-xl p-3 h-10 outline-none"
                      >
                        <option>The Summit Sky Lounge (48th level sunset view)</option>
                        <option>The Oasis Poolside Pavilion (Acoustic harp nights)</option>
                        <option>The Sovereign Dining Room (Grand Ballroom style)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-505 font-bold mb-1 block">Appointed Date</label>
                      <input
                        type="date"
                        required
                        value={tableDate}
                        onChange={(e) => setTableDate(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#c9a84c] rounded-xl p-3 h-10 outline-none"
                      />
                    </div>

                    <div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-505 font-bold mb-1 block">Hour Slot</label>
                          <select
                            value={tableTime}
                            onChange={(e) => setTableTime(e.target.value)}
                            className="w-full text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#c9a84c] rounded-xl p-3 h-10 outline-none"
                          >
                            <option>18:00</option>
                            <option>19:30 (Peak sunset)</option>
                            <option>21:00</option>
                            <option>22:30</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-505 font-bold mb-1 block">Attendee Count</label>
                          <select
                            value={tableSeats}
                            onChange={(e) => setTableSeats(e.target.value)}
                            className="w-full text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#c9a84c] rounded-xl p-3 h-10 outline-none"
                          >
                            <option>1 guest</option>
                            <option>2 guests</option>
                            <option>4 guests</option>
                            <option>6 guests (VIP Lounge Booth)</option>
                            <option>8 guests (Private Room)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-505 font-bold mb-1 block">Allergies or spatial seating remarks</label>
                    <input
                      type="text"
                      value={dietaryRemarks}
                      onChange={(e) => setDietaryRemarks(e.target.value)}
                      placeholder="e.g. Vegetarian only, quiet window seat preferred, celebrating anniversary..."
                      className="w-full text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#c9a84c] rounded-xl p-3 h-10 outline-none"
                    />
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      type="submit"
                      className="px-5 py-2 hover:bg-slate-800 bg-[#0a1f44] text-white text-[11px] font-black uppercase tracking-wider rounded-xl cursor-pointer active:scale-97 transition-all leading-none h-10"
                    >
                      Book Restaurant Table
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* TAB 2: FACILITIES & AMENITIES */}
            {activeTab === 'facilities' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                
                {/* 2.1 Facilities Grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Item 1: Pool */}
                  <div className="bg-white rounded-3xl border border-slate-200/50 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center bg-sky-500/5 p-2 rounded-xl mb-4">
                        <div className="flex items-center gap-2">
                          <Compass className="text-[#c9a84c]" size={16} />
                          <span className="text-xs font-extrabold text-[#0a1f44] uppercase">Aqua Infinity Pool</span>
                        </div>
                        <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black">Active & Open</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Features wood-deck lounger rows, temperature control locked at 27°C, and dedicated pool butler towels. Open daily 06:00 - 22:00.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const newReq = {
                          id: `POOL-${Math.floor(100 + Math.random() * 900)}`,
                          type: 'Pool Attendant',
                          description: 'Lounge Cabana Reservation',
                          amount: 'Complimentary Access',
                          timestamp: 'Assigned for today',
                          status: 'Confirmed',
                          progress: 100,
                          notes: 'Cabana #4 reserved under your suite ID'
                        };
                        setActiveRequests(p => [newReq, ...p]);
                        success("Pool deck cabana couch reserved today!");
                      }}
                      className="mt-4 w-full py-2 bg-slate-55 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl active:scale-97 transition-all cursor-pointer"
                    >
                      Reserve Private Pool Cabana
                    </button>
                  </div>

                  {/* Item 2: Gym */}
                  <div className="bg-white rounded-3xl border border-slate-200/50 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center bg-purple-500/5 p-2 rounded-xl mb-4">
                        <div className="flex items-center gap-2">
                          <Dumbbell className="text-[#c9a84c]" size={16} />
                          <span className="text-xs font-extrabold text-[#0a1f44] uppercase">Apex Fitness Studio</span>
                        </div>
                        <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black">24/7 Access</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Features biomechanically engineered cardio centers, rack barbell structures, and complimentary fresh dry sports-towels, water vials.
                      </p>
                      <div className="bg-amber-55/10 border border-amber-200/30 p-2 rounded-lg mt-3 text-[10px] text-amber-800 font-mono">
                        ⚡ Occupancy Monitor: Low Occupancy (2 players active) &bull; Fresh Sanitization 15 min ago
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        const newReq = {
                          id: `PT-${Math.floor(100 + Math.random() * 900)}`,
                          type: 'Fitness Attendant',
                          description: 'Personal Trainer consultation hour',
                          amount: 'Inquire Charge',
                          timestamp: 'Requested for today',
                          status: 'Dispatch Queued',
                          progress: 15,
                          notes: 'Head trainer will call your suite phone'
                        };
                        setActiveRequests(p => [newReq, ...p]);
                        success("Personal coaching request dispatched cleanly!");
                      }}
                      className="mt-4 w-full py-2 bg-[#0a1f44] text-white hover:bg-slate-800 text-xs font-bold rounded-xl active:scale-97 transition-all cursor-pointer"
                    >
                      Request Personal Trainer Hour
                    </button>
                  </div>

                  {/* Item 3: Conference Hall & Banquet */}
                  <div className="bg-white rounded-3xl border border-slate-200/50 p-5 shadow-sm md:col-span-2 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
                      <div>
                        <h4 className="text-xs font-black uppercase text-[#0a1f44]">Sovereign Banquets & Conference Halls</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Corporate business meetings & gala dynamic ceremony setup</p>
                      </div>
                      <span className="text-[9px] font-mono uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-black">Booking Desk Required</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-105">
                        <span className="text-[9px] font-mono text-[#c9a84c] tracking-widest font-black uppercase block">Elite Boardroom Center</span>
                        <p className="text-xs text-slate-500 mt-1">Multi-node video wall, acoustic sound dampers, standard fiber connectivity, seating for up to 24 executives.</p>
                      </div>
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-105">
                        <span className="text-[9px] font-mono text-[#c9a84c] tracking-widest font-black uppercase block">Grand Sovereign Banquet Hall</span>
                        <p className="text-xs text-slate-500 mt-1">Over 8000 sq ft exquisite pillar-less colonial ballroom space, bespoke stage structures, custom light bars.</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => {
                          const newReq = {
                            id: `ENQ-${Math.floor(100 + Math.random() * 900)}`,
                            type: 'Enquiry Team',
                            description: 'Elite Boardroom and tech conference details',
                            amount: 'Quotation desk',
                            timestamp: 'Emailed to registered coordinates',
                            status: 'Completed',
                            progress: 100,
                            notes: 'Information folder sent'
                          };
                          setActiveRequests(p => [newReq, ...p]);
                          success("Corporate event details folder dispatched to your mail address!");
                        }}
                        className="py-1.5 px-4 rounded-xl text-xs font-bold bg-[#0a1f44] text-white hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        Inquire Event Spaces Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2.2 Sovereign Premium Spa Booking Station */}
                <form
                  onSubmit={handleSpaReservation}
                  className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                    <HeartHandshake size={15} className="text-[#c9a84c]" />
                    <h3 className="text-sm font-black uppercase text-[#0a1f44] tracking-tight">Aura Sovereign Spa Scheduler</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-505 font-bold mb-1 block">Therapy selections</label>
                      <select
                        value={spaTherapy}
                        onChange={(e) => setSpaTherapy(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#c9a84c] rounded-xl p-3 h-10 outline-none"
                      >
                        <option>Sovereign Hot Stone Deep-Tissue Release (90 Min) — ₹4,800</option>
                        <option>Madagascar Orchid Botanical Facial (60 Min) — ₹3,500</option>
                        <option>Tibetan Sea Salt Body Scrub & Polish (75 Min) — ₹4,000</option>
                        <option>Dual Couple Swedish Harmony Escape (120 Min) — ₹8,500</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-505 font-bold mb-1 block">Appointed Hour (Open 09:00 - 21:00)</label>
                      <select
                        value={spaTime}
                        onChange={(e) => setSpaTime(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#c9a84c] rounded-xl p-3 h-10 outline-none"
                      >
                        <option>10:00</option>
                        <option>12:30</option>
                        <option>14:00</option>
                        <option>16:30 (Peak sunset slots)</option>
                        <option>19:00</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#0a1f44] hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Book Spa Appointment
                    </button>
                  </div>
                </form>

                {/* 2.3 Interactive WiFi Speed Test Calibration */}
                <div className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Wifi size={15} className="text-[#c9a84c]" />
                      <h3 className="text-sm font-black uppercase text-[#0a1f44] tracking-tight">Luxury Fiber WiFi Management</h3>
                    </div>
                    
                    <span className="text-[9px] font-mono bg-amber-55/10 text-amber-800 px-2 py-0.5 rounded font-black border border-amber-200/30">
                      SSID: Grand_Escape_Club_Wifi
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="md:col-span-2">
                      <p className="text-xs text-indigo-950 font-bold">Complimentary Ultra-Premium Tier</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                        We deploy dedicated 10-Gigabit fiber link pipelines directly to our room gateways. Enter pass <strong className="text-slate-700 font-mono">luxurywellness</strong> on your laptop terminal.
                      </p>
                    </div>

                    <div className="md:col-span-2 flex flex-col items-end gap-3">
                      {wifiTesting ? (
                        <div className="w-full">
                          <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                            <span className="truncate max-w-[150px]">{wifiStage}</span>
                            <span>{wifiProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                            <motion.div 
                              className="bg-[#c9a84c] h-full"
                              style={{ width: `${wifiProgress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>
                      ) : wifiStats ? (
                        <div className="grid grid-cols-2 gap-4 w-full text-right">
                          <div className="bg-slate-50 border border-slate-105 p-2.5 rounded-xl">
                            <span className="text-[8px] font-mono text-slate-400 uppercase">DOWNSTREAM</span>
                            <p className="text-lg font-black text-emerald-600 font-sans">{wifiStats.download} <span className="text-xs font-mono font-medium text-slate-400">Mbps</span></p>
                          </div>
                          <div className="bg-slate-50 border border-slate-105 p-2.5 rounded-xl">
                            <span className="text-[8px] font-mono text-slate-400 uppercase">UPSTREAM</span>
                            <p className="text-lg font-black text-[#0a1f44] font-sans">{wifiStats.upload} <span className="text-xs font-mono font-medium text-slate-400">Mbps</span></p>
                          </div>
                        </div>
                      ) : null}

                      <button
                        onClick={runSpeedTest}
                        disabled={wifiTesting}
                        className="w-full md:w-auto px-4 py-2 bg-slate-900 border border-zinc-800 hover:bg-slate-800 disabled:opacity-55 text-[#c9a84c] hover:text-white text-[11px] font-black uppercase tracking-wider rounded-xl cursor-pointer active:scale-97 transition-all flex items-center justify-center gap-1 leading-none"
                      >
                        <RefreshCw size={12} className={wifiTesting ? "animate-spin" : ""} />
                        <span>{wifiTesting ? "Calibrating..." : "Calibrate Room WiFi Speed"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2.4 Airport Pickup VIP Transportation Form */}
                <form
                  onSubmit={handleAirportPickup}
                  className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                    <Truck size={15} className="text-[#c9a84c]" />
                    <h3 className="text-sm font-black uppercase text-[#0a1f44] tracking-tight">Airport VIP Transfer & Limo Schedulers</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-505 font-bold mb-1 block">Scheduled Landing hour (e.g. Flight arrival)</label>
                      <input
                        type="text"
                        required
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        placeholder="e.g. Friday 18:30"
                        className="w-full text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#c9a84c] rounded-xl p-3 h-10 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-505 font-bold mb-1 block">Flight Number CODE</label>
                      <input
                        type="text"
                        required
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value)}
                        placeholder="e.g. AI-101 / EK-505"
                        className="w-full text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#c9a84c] rounded-xl p-3 h-10 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-505 font-bold mb-1 block">Luxury Vehicle Selection</label>
                      <select
                        value={pickupVehicle}
                        onChange={(e) => setPickupVehicle(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#c9a84c] rounded-xl p-3 h-10 outline-none"
                      >
                        <option>Mercedes-Benz S-Class (Pullman Lounge)</option>
                        <option>Audi e-tron GT (Electric Sports Coupé)</option>
                        <option>Sovereign armored Escalade SUV</option>
                        <option>High-Capacity Executive Sprinter Bus</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#0a1f44] hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer active:scale-97 transition-all leading-none"
                    >
                      Reserve Fleet Airport Pickup
                    </button>
                  </div>
                </form>

              </motion.div>
            )}

            {/* TAB 3: IN-ROOM SERVICES (HOUSEKEEPING, LAUNDRY, MAINTENANCE & DB SERVICES) */}
            {activeTab === 'inroom' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                
                {/* 3.1 Integrated Housekeeper dispatch system */}
                <div className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Sparkles size={15} className="text-[#c9a84c]" />
                      <h3 className="text-sm font-black uppercase text-[#0a1f44] tracking-tight">Housekeeping Dry Utilities Dispatcher</h3>
                    </div>
                    <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded font-black">Ready for dispatch</span>
                  </div>

                  <p className="text-xs text-slate-400 mb-4 leading-normal">
                    Select the utilities you require delivered to your stay quarters. Housekeeping team will deploy items as specified.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
                    {/* Item 1 */}
                    <button
                      type="button"
                      onClick={() => setHousekeepingItems(prev => ({ ...prev, towels: !prev.towels }))}
                      className={`p-3.5 border rounded-2xl cursor-pointer text-left transition-all ${
                        housekeepingItems.towels 
                          ? 'border-[#c9a84c] bg-amber-500/5 shadow-sm' 
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-extrabold text-slate-700 block text-left">Fresh Fluffy Towels</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          housekeepingItems.towels ? 'bg-[#c9a84c] border-white text-black' : 'border-slate-300'
                        }`}>
                          {housekeepingItems.towels && <Check size={8} className="stroke-[3]" />}
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-400 block mt-1 leading-tight">4 High-pile combed cotton towels</span>
                    </button>

                    {/* Item 2 */}
                    <button
                      type="button"
                      onClick={() => setHousekeepingItems(prev => ({ ...prev, soaps: !prev.soaps }))}
                      className={`p-3.5 border rounded-2xl cursor-pointer text-left transition-all ${
                        housekeepingItems.soaps 
                          ? 'border-[#c9a84c] bg-amber-500/5 shadow-sm' 
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-extrabold text-slate-700 block text-left">Bespoke Bath Products</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          housekeepingItems.soaps ? 'bg-[#c9a84c] border-white text-black' : 'border-slate-300'
                        }`}>
                          {housekeepingItems.soaps && <Check size={8} className="stroke-[3]" />}
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-400 block mt-1 leading-tight">Shower gels, dynamic lavender bath salts</span>
                    </button>

                    {/* Item 3 */}
                    <button
                      type="button"
                      onClick={() => setHousekeepingItems(prev => ({ ...prev, pillow: !prev.pillow }))}
                      className={`p-3.5 border rounded-2xl cursor-pointer text-left transition-all ${
                        housekeepingItems.pillow 
                          ? 'border-[#c9a84c] bg-amber-500/5 shadow-sm' 
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-extrabold text-slate-700 block text-left">Orthopedic Pillow</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          housekeepingItems.pillow ? 'bg-[#c9a84c] border-white text-black' : 'border-slate-300'
                        }`}>
                          {housekeepingItems.pillow && <Check size={8} className="stroke-[3]" />}
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-400 block mt-1 leading-tight">Therapeutic neck memory foam pillow</span>
                    </button>

                    {/* Item 4 */}
                    <button
                      type="button"
                      onClick={() => setHousekeepingItems(prev => ({ ...prev, turndown: !prev.turndown }))}
                      className={`p-3.5 border rounded-2xl cursor-pointer text-left transition-all ${
                        housekeepingItems.turndown 
                          ? 'border-[#c9a84c] bg-amber-500/5 shadow-sm' 
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-extrabold text-slate-700 block text-left">Turn-Down Service</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          housekeepingItems.turndown ? 'bg-[#c9a84c] border-white text-black' : 'border-slate-300'
                        }`}>
                          {housekeepingItems.turndown && <Check size={8} className="stroke-[3]" />}
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-400 block mt-1 leading-tight">Bed smoothing & chocolate sleep treats</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-505 font-bold mb-1 block">Attendant priority speed</label>
                      <select
                        value={housekeepingUrgency}
                        onChange={(e) => setHousekeepingUrgency(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#c9a84c] rounded-xl p-3 h-10 outline-none"
                      >
                        <option>Standard Protocol (Under 20 Mins)</option>
                        <option>VIP Express High Priority (Under 10 Mins)</option>
                        <option>Wait Until Evening Cabin Refresh (18:00 - 20:00)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3.5 md:pt-4">
                      <input
                        type="checkbox"
                        id="hk_silent"
                        checked={housekeepingSilent}
                        onChange={(e) => setHousekeepingSilent(e.target.checked)}
                        className="w-4 h-4 rounded text-[#c9a84c] focus:ring-[#c9a84c]"
                      />
                      <label htmlFor="hk_silent" className="text-xs text-slate-600 font-bold select-none cursor-pointer">
                        🔇 Non-Intrusion (Deliver quietly outside door if sleeping)
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleHousekeepingSubmit}
                      className="px-5 py-2.5 bg-[#0a1f44] hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Dispatch Housekeeper
                    </button>
                  </div>
                </div>

                {/* 3.2 Premium Laundry Valet Forms */}
                <form
                  onSubmit={handleLaundrySubmit}
                  className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                    <Shirt size={15} className="text-[#c9a84c]" />
                    <h3 className="text-sm font-black uppercase text-[#0a1f44] tracking-tight">Premium Laundry Valet Dispatch</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-505 font-bold mb-1 block">Select garment service treatment</label>
                      <select
                        value={laundryType}
                        onChange={(e) => setLaundryType(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#c9a84c] rounded-xl p-3 h-10 outline-none"
                      >
                        <option>Express Suite Steam-Pressing (Suit/Dress fold check)</option>
                        <option>Exclusive Dry Cleaning & Silk/Wool Care</option>
                        <option>Standard Wash, Tumble Dry & Crisp Press</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-505 font-bold mb-1 block">Scheduled pick hour (Today)</label>
                      <select
                        value={laundryTime}
                        onChange={(e) => setLaundryTime(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#c9a84c] rounded-xl p-3 h-10 outline-none"
                      >
                        <option>09:30 AM</option>
                        <option>11:00 AM</option>
                        <option>14:00 PM</option>
                        <option>17:30 PM (Priority Express Same-Day)</option>
                        <option>20:00 PM (Overnight Return)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-505 font-bold mb-1 block">Clothing notes / Delicate material labels</label>
                      <input
                        type="text"
                        value={laundryNotes}
                        onChange={(e) => setLaundryNotes(e.target.value)}
                        placeholder="e.g. Silk garment, handle with delicate low heat..."
                        className="w-full text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#c9a84c] rounded-xl p-3 h-10 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#0a1f44] hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Schedule Laundry Pick-Up
                    </button>
                  </div>
                </form>

                {/* 3.3 Suite Maintenance Team Issue Logger */}
                <div className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                    <ShieldAlert size={15} className="text-[#c9a84c]" />
                    <h3 className="text-sm font-black uppercase text-[#0a1f44] tracking-tight">Suite Technical Maintenance Dispatcher</h3>
                  </div>

                  <p className="text-xs text-slate-400 mb-4 leading-normal">
                    Experiencing a hardware anomaly in your luxury suite? Select the affected systems to dispatch an engineer directly.
                  </p>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
                    <button
                      type="button"
                      onClick={() => setMaintAC(p => !p)}
                      className={`p-3 border rounded-xl text-left cursor-pointer transition-all ${
                        maintAC ? 'border-red-400 bg-red-500/5 text-red-950' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[11px] font-bold block">Air Conditioning Unit</span>
                      <span className="text-[9px] text-[#c9a84c] block mt-1">Temperature error / Filter</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMaintTV(p => !p)}
                      className={`p-3 border rounded-xl text-left cursor-pointer transition-all ${
                        maintTV ? 'border-red-400 bg-red-500/5 text-red-950' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[11px] font-bold block">Smart TV / casting</span>
                      <span className="text-[9px] text-[#c9a84c] block mt-1">Screencasting wifi pairing</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMaintLights(p => !p)}
                      className={`p-3 border rounded-xl text-left cursor-pointer transition-all ${
                        maintLights ? 'border-red-400 bg-red-500/5 text-red-950' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[11px] font-bold block">Dimmer Brass Lights</span>
                      <span className="text-[9px] text-[#c9a84c] block mt-1">Bespoke lightbulb check</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMaintLocks(p => !p)}
                      className={`p-3 border rounded-xl text-left cursor-pointer transition-all ${
                        maintLocks ? 'border-red-400 bg-red-500/5 text-red-950' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[11px] font-bold block">Keyless Door Locks</span>
                      <span className="text-[9px] text-[#c9a84c] block mt-1">QR lock scanner check</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-505 font-bold mb-1 block">Describe the technical request specifications</label>
                    <input
                      type="text"
                      value={maintMsg}
                      onChange={(e) => setMaintMsg(e.target.value)}
                      placeholder="e.g. AC unit is producing humming noises. Please check temperature thermostat."
                      className="w-full text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#c9a84c] rounded-xl p-3 h-10 outline-none"
                    />
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleMaintenanceSubmit}
                      className="px-5 py-2.5 bg-red-655 hover:bg-red-700 bg-red-900 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Log Maintenance Ticket
                    </button>
                  </div>
                </div>

                {/* 3.4 Dynamic custom services (loaded from the DB API) exactly as before */}
                <div className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-4 pb-2 border-b border-slate-100">
                    <Sparkles size={15} className="text-[#c9a84c]" />
                    <h3 className="text-sm font-black uppercase text-[#0a1f44] tracking-tight">Dynamic Bespoke Requests</h3>
                  </div>

                  {dbServices.length === 0 ? (
                    <p className="text-[11px] text-slate-400">Currently no dynamic server assets compiled by the desk handlers.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dbServices.map((svc) => (
                        <div
                          key={svc.service_id}
                          className="p-4 rounded-2xl border border-slate-105 bg-slate-50/50 hover:bg-white hover:border-[#c9a84c]/30 flex justify-between items-center transition-all group"
                        >
                          <div>
                            <span className="text-[10px] font-extrabold text-[#0a1f44] group-hover:text-[#c9a84c] transition-colors uppercase block">
                              {svc.service_name}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400 font-mono mt-0.5 block flex items-center">
                              <IndianRupee size={10} />
                              {(svc.service_charge || 0).toLocaleString()} / Event
                            </span>
                          </div>

                          <button
                            onClick={() => handleRequestDbService(svc)}
                            disabled={callingId === svc.service_id}
                            className="px-3.5 py-1.5 bg-[#0a1f44] text-white hover:bg-slate-800 disabled:opacity-55 text-[10px] font-black uppercase rounded-lg cursor-pointer transition-all active:scale-97 flex items-center gap-1"
                          >
                            {callingId === svc.service_id ? (
                              <Loader2 size={10} className="animate-spin" />
                            ) : (
                              <Send size={10} />
                            )}
                            <span>Order</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

      {/* RIGHT SIDEBAR: EXPERIENTIAL DIGITAL BUTLER & ACTIVE ROOM INQUIRIES CENTER */}
      <div className="w-full lg:w-96 shrink-0 flex flex-col gap-6">
        
        {/* Butler Banner */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-12 w-12 bg-[#c9a84c]/10 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#0a1f44] flex items-center justify-center text-white shrink-0 shadow-md">
              <ChefHat size={20} className="text-[#c9a84c] animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-450 font-black">Your Executive Host</p>
              <h3 className="text-sm font-black uppercase text-[#0a1f44] leading-tight">Mélange Butler Desk</h3>
            </div>
          </div>
          
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
            <Info size={14} className="text-[#c9a84c] shrink-0 mt-0.5" />
            <span>Suite <strong className="text-slate-800">TBD</strong> &bull; Elite Level Club. Any requests generated on this digital panel are routed cleanly to room deliveries with visual workflow updates.</span>
          </div>
        </div>

        {/* ACTIVE REQUESTS TERMINAL CARD */}
        <div className="bg-[#0c0c0e] text-zinc-100 rounded-3xl p-6 shadow-2xl border border-zinc-900 flex-1 flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#CCFF00] animate-ping" />
                <h3 className="text-xs font-black uppercase tracking-widest text-[#CCFF00]">Active Room Panel Tickets</h3>
              </div>
              <span className="text-[9px] font-mono text-zinc-500">{activeRequests.length} active logs</span>
            </div>

            {/* Scrolling request logs block */}
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {activeRequests.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center text-center py-16 text-zinc-600"
                  >
                    <Compass size={32} className="text-zinc-800 animate-spin-slow" />
                    <p className="text-xs font-bold uppercase mt-3.5 tracking-wider text-zinc-400">Quiet Suite Status</p>
                    <p className="text-[10px] text-zinc-650 mt-1 max-w-[190px]">You have no active dining orders or butler tasks currently processing.</p>
                  </motion.div>
                ) : (
                  activeRequests.map((req) => {
                    const isCompleted = req.status === 'Delivered' || req.status === 'Completed' || req.status === 'Confirmed';
                    const progress = req.progress || 100;
                    
                    return (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0, x: 20, scale: 0.96 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-zinc-900/60 rounded-2xl border border-zinc-850 p-4 transition-all relative overflow-hidden"
                      >
                        {/* Upper Details row */}
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wide bg-zinc-950 p-1 rounded font-bold">{req.type}</span>
                              <span className="text-[10px] font-mono text-[#CCFF00] font-black">{req.id}</span>
                            </div>
                            
                            <p className="text-xs font-bold text-white mt-1.5 leading-snug">{req.description}</p>
                            <p className="text-[10px] text-zinc-550 mt-1 font-mono flex items-center gap-1">
                              <Clock size={9} /> {req.timestamp}
                            </p>
                          </div>

                          {/* Quick clear archives button for finished tickets */}
                          {isCompleted ? (
                            <button
                              onClick={() => removeArchivedRequest(req.id)}
                              className="text-zinc-500 hover:text-white p-1 transition-all"
                              title="Dismiss Finished Ticket Archive"
                            >
                              <CheckCircle size={14} className="text-emerald-500" />
                            </button>
                          ) : (
                            <Loader2 size={12} className="text-[#CCFF00] animate-spin shrink-0" />
                          )}
                        </div>

                        {/* Mid state row and notes */}
                        {req.notes && (
                          <div className="bg-black/40 px-2 py-1.5 rounded-lg border border-zinc-900/60 mt-3 text-[9px] text-zinc-400 font-sans italic border-l-2 border-l-[#CCFF00]">
                            &ldquo;{req.notes}&rdquo;
                          </div>
                        )}

                        {/* Animated progress tracking bar */}
                        <div className="mt-4">
                          <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 mb-1">
                            <span className="text-[10px] text-zinc-300 uppercase font-black tracking-wider flex items-center gap-1.5">
                              {!isCompleted && <span className="h-1.5 w-1.5 rounded-full bg-[#CCFF00] animate-ping" />}
                              <span>{req.status}</span>
                            </span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden">
                            <motion.div 
                              className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-[#CCFF00]'}`} 
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.4 }}
                            />
                          </div>
                        </div>

                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Quick status bottom summary bar */}
          <div className="border-t border-zinc-900/90 pt-4 mt-4 font-sans flex justify-between items-center text-[10px] text-zinc-500">
            <span className="uppercase tracking-widest font-mono">Residency Security Cleared</span>
            <span>Local Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
