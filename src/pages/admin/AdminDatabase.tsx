import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAdminAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Database, Server, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DBStatus {
  useFallback: boolean;
  mysqlConnected: boolean;
  currentConfig: {
    host: string;
    port: number;
    user: string;
    database: string;
  } | null;
  connectionError: string | null;
}

export function AdminDatabase() {
  const { isAdmin } = useAdminAuth();
  const { success, error, info } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [dbStatus, setDbStatus] = useState<DBStatus | null>(null);
  
  const [formData, setFormData] = useState({
    host: '0.tcp.ngrok.io',
    port: '12345',
    user: 'root',
    password: 'root',
    database: 'hotel_management'
  });

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/admin/db/status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
        if (data.currentConfig) {
          setFormData({
            host: data.currentConfig.host || 'localhost',
            port: String(data.currentConfig.port || '3306'),
            user: data.currentConfig.user || 'root',
            password: '',
            database: data.currentConfig.database || 'hotel_management_system'
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    info("Testing connection & initializing tables...");

    try {
      const res = await fetch('/api/admin/db/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        success(data.message || "MySQL Connection established!");
        fetchStatus();
      } else {
        error(data.error || "Failed to establish MySQL connection.");
      }
    } catch (err: any) {
      error(err.message || "Could not connect to database server.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isAdmin === null || loading) {
    return (
      <div className="ml-64 min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="ml-64 min-h-screen bg-slate-50/50 p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200/60">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#c9a84c] uppercase">System Infrastructure</span>
          <h1 className="text-3xl font-extrabold text-[#0a1f44] tracking-tight mt-1">MySQL Integration Hub</h1>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchStatus();
          }}
          disabled={loading || submitting}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={13} className={`text-[#c9a84c] ${loading ? 'animate-spin' : ''}`} />
          Refresh Registry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Connection Setup Form */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                <Database size={20} className="text-[#c9a84c]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0a1f44] tracking-tight">MySQL Connection Parameters</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Define your target relational server details</p>
              </div>
            </div>

            <form onSubmit={handleConnect} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                <div className="sm:col-span-8">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">Host Address</label>
                  <input
                    type="text"
                    name="host"
                    value={formData.host}
                    onChange={handleInputChange}
                    placeholder="e.g. 127.0.0.1 or localhost"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-800 shadow-inner focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all font-mono"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">Port</label>
                  <input
                    type="number"
                    name="port"
                    value={formData.port}
                    onChange={handleInputChange}
                    placeholder="3306"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-800 shadow-inner focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">Username</label>
                  <input
                    type="text"
                    name="user"
                    value={formData.user}
                    onChange={handleInputChange}
                    placeholder="root"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-800 shadow-inner focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-800 shadow-inner focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">Database Name</label>
                <input
                  type="text"
                  name="database"
                  value={formData.database}
                  onChange={handleInputChange}
                  placeholder="hotel_management_system"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-800 shadow-inner focus:outline-none focus:border-[#c9a84c] focus:bg-white transition-all font-mono"
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 bg-[#0a1f44] hover:bg-[#122e5c] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-slate-200/30 font-mono disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Testing and Initializing Schemas...
                    </>
                  ) : (
                    <>
                      <Server size={14} />
                      Verify Connection & Dynamically Sync
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Right Column: Status & Informative Guideline */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Connection Status Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden bg-white ${
              dbStatus?.mysqlConnected
                ? 'border-[#CCFF00]/40 shadow-sm'
                : 'border-amber-300/30'
            }`}
          >
            <span className="text-[9px] font-mono tracking-widest text-[#c9a84c] uppercase font-bold">Active Engine State</span>
            
            <div className="mt-4 flex items-start gap-4">
              {dbStatus?.mysqlConnected ? (
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-emerald-500 shadow-inner">
                  <CheckCircle2 size={24} className="text-emerald-500" />
                </div>
              ) : (
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shadow-inner">
                  <AlertTriangle size={24} className="text-amber-500" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h4 className="text-xl font-extrabold text-[#0a1f44] tracking-tight">
                  {dbStatus?.mysqlConnected ? 'Relational MySQL Mode' : 'Local Sandbox Mode'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 font-semibold leading-relaxed">
                  {dbStatus?.mysqlConnected
                    ? 'The hotel ecosystem is connected to your primary MySQL database. All operational ledgers are read & written directly to persistent tables.'
                    : 'The app is running in a local memory-emulated sandbox database. Changes will preserve inside hotel_db.json fallback, but we recommend connecting your primary MySQL server.'}
                </p>
              </div>
            </div>

            {/* Config Specs Info */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-3 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold">STATUS TYPE</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black ${
                  dbStatus?.mysqlConnected ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                }`}>
                  {dbStatus?.mysqlConnected ? 'ONLINE (MYSQL)' : 'JSON FALLBACK'}
                </span>
              </div>
              {dbStatus?.currentConfig && (
                <>
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-bold">DATABASE SERVER</span>
                    <span className="text-slate-800 font-extrabold">{dbStatus.currentConfig.host}:{dbStatus.currentConfig.port}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-bold">DATABASE SCHEMA</span>
                    <span className="text-slate-800 font-extrabold">{dbStatus.currentConfig.database}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-bold">USER LOGIN</span>
                    <span className="text-slate-800 font-extrabold">{dbStatus.currentConfig.user}</span>
                  </div>
                </>
              )}
            </div>

            {/* SQL Connection Error Info */}
            {dbStatus?.connectionError && (
              <div className="mt-5 p-3.5 bg-rose-50 border border-rose-150 rounded-2xl text-[10px] text-rose-600 font-mono leading-relaxed">
                <p className="font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <AlertTriangle size={11} /> Connection Attempt Error Log:
                </p>
                {dbStatus.connectionError}
              </div>
            )}
          </motion.div>

          {/* Guide Card Box */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-3xl border border-slate-250/50 bg-[#0a1f44] text-white shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={16} className="text-[#CCFF00]" />
              <h5 className="text-xs font-black uppercase tracking-widest font-mono text-[#CCFF00]">Relational Schema Guard</h5>
            </div>
            
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              Connecting your database is safe & fast. During verification, our manager executes dynamic schema checks. If the server detects empty structures, it automatically provisions the following Relational Tables on your host:
            </p>
            
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-[10.5px] text-slate-300 font-bold uppercase">
              <li className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" /> Admin Master
              </li>
              <li className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" /> Room registry
              </li>
              <li className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" /> Customers
              </li>
              <li className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" /> Room Types
              </li>
              <li className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" /> Bookings Ledger
              </li>
              <li className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" /> Service specs
              </li>
              <li className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" /> Payments log
              </li>
              <li className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" /> Employees
              </li>
            </ul>

            <p className="text-[10px] text-slate-400 mt-5 leading-loose font-mono">
              Note: Database configurations persist across browser frames recursively inside the backend workspace configuration directory.
            </p>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
