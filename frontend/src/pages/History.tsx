import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Clock, ExternalLink, RefreshCw, Copy, 
  CheckCircle2, Database, Zap, AlertCircle, 
  ChevronRight, ArrowUpRight, Search, FileText
} from 'lucide-react';

interface AuditRecord {
  id: number | string;
  action: string;
  datasetHash: string;
  txHash: string;
  timestamp: string;
  recorder: string;
  version: number;
}

const truncate = (s: string, n = 8) =>
  s ? `${s.slice(0, n + 2)}…${s.slice(-5)}` : '—';

const CopyBtn = ({ text }: { text: string }) => {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); } catch {}
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  };
  return (
    <button onClick={copy} className="p-1.5 rounded-lg text-gray-600 hover:text-[#00ffc8] hover:bg-[#00ffc8]/10 transition-all border border-transparent hover:border-[#00ffc8]/20">
      {done ? <CheckCircle2 className="w-3.5 h-3.5 text-[#00ffc8]" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

const actionColor = (a: string) =>
  a === 'DATA_UPLOAD'
    ? { bg: 'bg-[#00ffc8]/10', border: 'border-[#00ffc8]/30', text: 'text-[#00ffc8]', icon: Database }
    : { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', icon: Zap };

const GlassCard = ({ children, className = '', glowColor = 'rgba(0,255,200,0.1)' }: { children: React.ReactNode; className?: string, glowColor?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className={`glass rounded-2xl overflow-hidden glass-hover ${className}`}
    style={{ boxShadow: `0 0 30px ${glowColor}` }}
  >
    {children}
  </motion.div>
);

const MOCK: AuditRecord[] = [
  { id: 0, action: 'DATA_UPLOAD', datasetHash: '0xabc123def456', txHash: '0x111...222', timestamp: new Date().toISOString(), recorder: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', version: 1 },
  { id: 1, action: 'AI_QUERY',    datasetHash: '0x555aaa888bbb', txHash: '0x333...444', timestamp: new Date(Date.now() - 3600000).toISOString(), recorder: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', version: 1 },
];

const History = () => {
  const [logs, setLogs]       = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [selected, setSelected] = useState<AuditRecord | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    const token  = localStorage.getItem('token') || '';
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    try {
      const res = await axios.get(`${apiUrl}/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const records = res.data.records || [];
      setLogs(records.length > 0 ? records.slice().reverse() : MOCK);
    } catch {
      setLogs(MOCK);
      setError('Veritas Node Offline · Synchronizing Mock Data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 pt-4 relative z-10 p-4 md:p-0">

      {/* Header Evolution */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tighter uppercase">
              VERITAS <span className="gradient-text-cyan">LOG</span>
           </h1>
           <p className="text-[#00ffc8]/50 mt-2 font-mono text-sm tracking-widest uppercase flex items-center gap-2">
              <Shield className="w-4 h-4 animate-pulse" />
              Immutable Ledger Sequence Active
           </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0,255,200,0.3)' }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center space-x-3 px-5 py-2.5 bg-[#00ffc8]/10 border border-[#00ffc8]/30 rounded-xl text-[#00ffc8] text-[10px] font-mono font-bold tracking-[0.2em] uppercase hover:bg-[#00ffc8]/20 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Matrix</span>
        </motion.button>
      </div>

      {/* Global Metadata Feedback */}
      <AnimatePresence>
        {error && (
          <GlassCard className="p-4 bg-amber-500/5 border-amber-500/20 text-amber-500 text-[10px] font-mono tracking-widest uppercase flex items-center gap-3">
             <AlertCircle className="w-4 h-4" />
             {error}
          </GlassCard>
        )}
      </AnimatePresence>

      {/* High-Level Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Inscribed', value: loading ? '...' : logs.length.toString(), icon: Database, color: '#00ffc8', bg: 'rgba(0, 255, 200, 0.1)' },
          { label: 'Valid Injections', value: loading ? '...' : logs.filter(l => l.action === 'DATA_UPLOAD').length.toString(), icon: FileText, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
          { label: 'Neural Queries', value: loading ? '...' : logs.filter(l => l.action === 'AI_QUERY').length.toString(), icon: Zap, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <GlassCard key={label} className="p-5 lg:p-6" glowColor={`${color}15`}>
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-2.5 rounded-xl border" style={{ backgroundColor: bg, borderColor: `${color}30` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em] font-black">{label}</p>
            </div>
            <p className="text-2xl lg:text-3xl font-black text-white tracking-tighter" style={{ textShadow: `0 0 30px ${color}40` }}>
               {value}
            </p>
          </GlassCard>
        ))}
      </div>

      {/* Ledger Feed */}
      <GlassCard className="p-0 border-white/10" glowColor="rgba(255,255,255,0.05)">
        <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-black/40 rounded-2xl border border-white/10">
                 <Shield className="w-6 h-6 text-[#00ffc8]" />
              </div>
              <div>
                 <h2 className="font-black text-white uppercase text-base tracking-tight">Ledger Stream</h2>
                 <p className="text-[9px] text-[#00ffc8]/60 font-mono tracking-widest uppercase">Verified Nexus Sequence</p>
              </div>
           </div>
           <div className="hidden sm:flex items-center bg-black/40 border border-white/5 px-4 py-2 rounded-xl text-gray-600 focus-within:border-[#00ffc8]/30 transition-all">
              <Search className="w-4 h-4" />
              <input type="text" placeholder="Filter..." className="bg-transparent border-none text-[10px] font-mono ml-3 outline-none w-32 uppercase tracking-widest" />
           </div>
        </div>

        <div className="divide-y divide-white/[0.04] bg-black/40">
          {logs.map((log, idx) => {
            const ac = actionColor(log.action);
            const isSelected = selected?.id === log.id;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                onClick={() => setSelected(isSelected ? null : log)}
                className={`px-6 py-4 cursor-pointer transition-all duration-300 relative group ${isSelected ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'}`}
              >
                {/* Visual indicator for selection */}
                {isSelected && (
                  <motion.div 
                    layoutId="selectionBar"
                    className="absolute inset-y-2 left-2 w-1 bg-[#00ffc8] rounded-full shadow-[0_0_10px_#00ffc8]" 
                  />
                )}

                <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                  {/* Action block */}
                  <div className="flex items-center gap-4 md:w-48">
                    <div className={`p-2 rounded-xl border ${ac.bg} ${ac.border}`}>
                       <ac.icon className={`w-4 h-4 ${ac.text}`} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${ac.text}`}>
                      {log.action}
                    </span>
                  </div>

                  {/* Hash block */}
                  <div className="flex-1 min-w-0 flex items-center space-x-3">
                    <code className="text-[#00ffc8]/60 text-xs font-mono font-bold truncate tracking-widest">
                      {truncate(log.datasetHash, 14)}
                    </code>
                    <CopyBtn text={log.datasetHash || ''} />
                  </div>

                  {/* Metadata block */}
                  <div className="flex items-center gap-8 shrink-0">
                    <div className="flex flex-col items-end">
                       <span className="text-[8px] text-gray-700 font-mono uppercase tracking-[0.2em] leading-none mb-1">Anchor ID</span>
                       <span className="text-[10px] text-gray-400 font-mono font-bold tracking-widest">{log.id}</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[8px] text-gray-700 font-mono uppercase tracking-[0.2em] leading-none mb-1">Time Vector</span>
                       <span className="text-[10px] text-gray-400 font-mono font-bold tracking-widest whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                       </span>
                    </div>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${log.datasetHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-600 hover:text-white hover:border-[#00ffc8]/40 transition-all"
                      onClick={e => e.stopPropagation()}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-white/5"
                    >
                      {[
                        { label: 'Primary Dataset Hash', value: log.datasetHash || '—' },
                        { label: 'Transaction Hash',     value: log.txHash || '—' },
                        { label: 'Validator Identity',   value: log.recorder || '—' },
                        { label: 'Dataset Version',      value: `v${log.version || 1}` },
                        { label: 'Temporal Signature',   value: new Date(log.timestamp).toISOString() },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-black/50 rounded-2xl p-5 border border-white/5 group/detail hover:border-[#00ffc8]/20 transition-all">
                          <p className="text-[9px] text-gray-600 font-mono uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                             <Database className="w-3 h-3" /> {label}
                          </p>
                          <div className="flex items-center justify-between gap-4">
                            <code className="text-[11px] text-[#00ffc8]/90 font-mono font-bold break-all leading-relaxed flex-1 tracking-wider overflow-hidden">{value}</code>
                            <CopyBtn text={value} />
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      <div className="flex items-center justify-center space-x-12 text-[10px] text-gray-700 font-mono font-black tracking-[0.3em] uppercase pt-12 border-t border-white/10">
        <div className="flex items-center gap-3">
           <div className="w-2 h-2 rounded-full bg-[#00ffc8] shadow-[0_0_8px_#00ffc8]" />
           <span>Dataset Anchor Verified</span>
        </div>
        <div className="flex items-center gap-3">
           <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_purpe]" />
           <span>Query Trace Logged</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 opacity-50">
           <Activity className="w-4 h-4" />
           <span>Matrix ID: 0x88...f102</span>
        </div>
      </div>
    </div>
  );
};

export default History;
