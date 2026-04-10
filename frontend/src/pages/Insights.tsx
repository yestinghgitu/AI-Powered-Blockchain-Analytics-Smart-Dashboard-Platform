import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, AlertTriangle, Lightbulb, BarChart2,
  Shield, Cpu, RefreshCw, ExternalLink, Activity, 
  Zap, Database, Globe, ArrowUpRight, BarChart3,
  Calendar
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie,
  ScatterChart, Scatter, ZAxis, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// --- Types ---
interface ProductStat {
  _id: string;
  totalRevenue: number;
  totalSales: number;
}

interface MonthlyTrend {
  _id: { year: number; month: number };
  totalRevenue: number;
  totalSales: number;
}

interface AuditRecord {
  id: number;
  action: string;
  datasetHash: string;
  aiSummaryHash: string;
  timestamp: string;
  recorder: string;
}

// --- UI Components ---
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

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`bg-white/5 animate-pulse rounded-2xl ${className}`} />
);

const COLORS = ['#00ffc8', '#a855f7', '#3b82f6', '#f59e0b', '#ef4444', '#22d3ee'];

const fmt = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const truncateHash = (hash: string, chars = 6) => hash ? `${hash.slice(0, chars + 2)}...${hash.slice(-4)}` : '—';

/* --- Main Insights Component --- */
const Insights = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats]         = useState<any>(null);
  const [products, setProducts]   = useState<ProductStat[]>([]);
  const [trend, setTrend]         = useState<MonthlyTrend[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token  = localStorage.getItem('token') || '';
      const opts   = { headers: { Authorization: `Bearer ${token}` } };

      const [analyticsRes, auditRes] = await Promise.all([
        axios.get(`${apiUrl}/analytics`, opts).catch(() => ({ data: null })),
        axios.get(`${apiUrl}/audit-logs`, opts).catch(() => ({ data: { records: [] } }))
      ]);

      if (analyticsRes.data) {
        const d = analyticsRes.data;
        setStats({
          totalRevenue: d.totalRevenue || 0,
          avgRevenue:   d.avgRevenue   || 0,
          recordCount:  d.recordCount  || 0,
        });

        // Build product summaries
        const byProduct: Record<string, ProductStat> = {};
        (d.data || []).forEach((row: any) => {
          if (!byProduct[row.product]) byProduct[row.product] = { _id: row.product, totalRevenue: 0, totalSales: 0 };
          byProduct[row.product].totalRevenue += row.revenue;
          byProduct[row.product].totalSales   += row.sales;
        });
        setProducts(Object.values(byProduct).sort((a, b) => b.totalRevenue - a.totalRevenue));

        // Build monthly trend
        const byMonth: Record<string, MonthlyTrend> = {};
        (d.data || []).forEach((row: any) => {
          const dt    = new Date(row.date);
          const key   = `${dt.getFullYear()}-${dt.getMonth() + 1}`;
          if (!byMonth[key]) byMonth[key] = { _id: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, totalRevenue: 0, totalSales: 0 };
          byMonth[key].totalRevenue += row.revenue;
          byMonth[key].totalSales   += row.sales;
        });
        setTrend(Object.values(byMonth).sort((a, b) => a._id.year !== b._id.year ? a._id.year - b._id.year : a._id.month - b._id.month).slice(-12));
      }

      if (auditRes.data?.records) {
        setAuditLogs(auditRes.data.records.slice().reverse().slice(0, 10));
      }
    } catch (e: any) {
      setError(e.message || 'Data stream interrupted');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const trendChartData = trend.map(t => ({
    label: `${t._id.year}-${String(t._id.month).padStart(2, '0')}`,
    revenue: t.totalRevenue,
    sales:   t.totalSales,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 pt-4 relative z-10 p-4 md:p-0">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tighter uppercase">
              AI <span className="gradient-text-cyan">INSIGHTS</span>
           </h1>
           <p className="text-[#00ffc8]/50 mt-2 font-mono text-sm tracking-widest uppercase flex items-center gap-2">
              <Activity className="w-4 h-4 animate-pulse" />
              Dynamic Neural Feedback Active
           </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0,255,200,0.3)' }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchData}
          disabled={loading}
          className="flex items-center space-x-3 px-6 py-3 bg-[#00ffc8]/10 border border-[#00ffc8]/30 rounded-2xl text-[#00ffc8] text-xs font-mono font-bold tracking-[0.2em] uppercase hover:bg-[#00ffc8]/20 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Matrix</span>
        </motion.button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Cumulative Revenue', icon: Globe, value: stats ? fmt(stats.totalRevenue) : '$0', color: '#00ffc8', iconBg: 'rgba(0, 255, 200, 0.1)' },
          { label: 'Mean Vector Value',  icon: Zap,   value: stats ? fmt(stats.avgRevenue) : '$0',   color: '#a855f7', iconBg: 'rgba(168, 85, 247, 0.1)' },
          { label: 'Total Ingested Data', icon: Database, value: stats ? stats.recordCount.toLocaleString() : '0', color: '#3b82f6', iconBg: 'rgba(59, 130, 246, 0.1)' },
        ].map(({ label, icon: Icon, value, color, iconBg }) => (
          <GlassCard key={label} className="p-5 lg:p-6 group" glowColor={`${color}15`}>
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-2.5 rounded-xl border" style={{ backgroundColor: iconBg, borderColor: `${color}30` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em] font-bold">{label}</p>
            </div>
            {loading
              ? <Skeleton className="h-10 w-40" />
              : (
                 <div className="flex items-baseline space-x-2">
                   <p className="text-2xl lg:text-3xl font-black text-white tracking-tighter" style={{ textShadow: `0 0 30px ${color}40` }}>{value}</p>
                   <span className="text-[10px] text-[#00ffc8] font-mono">+4% cycle</span>
                </div>
              )
            }
          </GlassCard>
        ))}
      </div>

      {/* Main Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Trend Area Chart */}
        <GlassCard className="lg:col-span-2 p-5 lg:p-6" glowColor="rgba(0, 255, 200, 0.1)">
          <div className="flex items-center justify-between mb-10">
             <div className="flex items-center space-x-4">
                <div className="p-2.5 bg-[#00ffc8]/10 rounded-xl border border-[#00ffc8]/30">
                   <TrendingUp className="w-5 h-5 text-[#00ffc8]" />
                </div>
                <div>
                   <h2 className="font-black text-white uppercase text-lg tracking-tight">Timeline Evolution</h2>
                   <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-0.5">Sequential revenue extrapolation</p>
                </div>
             </div>
             <Calendar className="w-6 h-6 text-white/10" />
          </div>

          <div className="h-72">
            {loading ? <Skeleton className="h-full" /> : trendChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendChartData}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ffc8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00ffc8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', border: '1px solid rgba(0, 255, 200, 0.2)', borderRadius: '16px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#00ffc8" strokeWidth={4} fill="url(#areaGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center font-mono text-xs text-gray-600 uppercase tracking-widest">Awaiting dataset injection...</div>}
          </div>
        </GlassCard>

        {/* Product Density Breakdown */}
        <GlassCard className="p-5 lg:p-6" glowColor="rgba(168, 85, 247, 0.1)">
           <div className="flex items-center space-x-4 mb-6">
              <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/30">
                 <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="font-black text-white uppercase text-lg tracking-tight">Matrix Density</h2>
           </div>

           <div className="h-56 mb-8">
              {loading ? <Skeleton className="h-full" /> : products.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={products.slice(0, 5)} dataKey="totalRevenue" nameKey="_id" innerRadius={50} outerRadius={80} paddingAngle={8} stroke="none">
                          {products.slice(0, 5).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                       </Pie>
                       <Tooltip contentStyle={{ background: '#020617', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                    </PieChart>
                 </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center font-mono text-xs text-gray-600">NULL_STATE</div>}
           </div>

           <div className="space-y-3">
              {products.slice(0, 3).map((p, i) => (
                <div key={p._id} className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
                   <div className="flex items-center space-x-3 truncate flex-1">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="text-white text-xs font-bold truncate tracking-tight">{p._id}</span>
                   </div>
                   <span className="text-gray-500 text-[10px] font-mono">{fmt(p.totalRevenue)}</span>
                </div>
              ))}
           </div>
        </GlassCard>
      </div>

      {/* Bottom Row: Market Distribution & Audit Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
         {/* Performance Distribution */}
        <GlassCard className="p-8" glowColor="rgba(59, 130, 246, 0.1)">
           <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/30">
                   <Lightbulb className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="font-black text-white uppercase text-base tracking-tight">Anomaly Density</h2>
             </div>
              <ArrowUpRight className="w-5 h-5 text-blue-500/50" />
           </div>

           <div className="h-48">
              {loading ? <Skeleton className="h-full" /> : products.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                       <XAxis type="number" dataKey="totalSales" name="Sales" stroke="rgba(255,255,255,0.2)" tick={{fontSize: 10}} />
                       <YAxis type="number" dataKey="totalRevenue" name="Revenue" stroke="rgba(255,255,255,0.2)" tick={{fontSize: 10}} />
                       <ZAxis type="category" dataKey="_id" name="Product" />
                       <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#020617', borderColor: '#3b82f6', borderRadius: '8px'}} />
                       <Scatter name="Anomalies" data={products} fill="#3b82f6" shape="circle" />
                    </ScatterChart>
                 </ResponsiveContainer>
              ) : <div className="h-full" />}
           </div>
        </GlassCard>

        {/* On-Chain Audit Terminal */}
        <GlassCard className="p-0 border-white/10" glowColor="rgba(255, 255, 255, 0.05)">
           <div className="p-6 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                 <div className="p-2.5 bg-black/40 rounded-xl border border-white/10">
                    <Shield className="w-5 h-5 text-[#00ffc8]" />
                 </div>
                 <div>
                    <h3 className="font-black text-white uppercase text-sm tracking-tight">Audit Tunnel</h3>
                    <p className="text-[9px] text-[#00ffc8]/60 font-mono tracking-widest uppercase">Verified Nexus Sequence</p>
                 </div>
              </div>
              <div className="flex items-baseline space-x-1.5 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30">
                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                 <span className="text-[9px] text-emerald-500 font-mono font-bold tracking-widest">SECURE</span>
              </div>
           </div>

           <div className="p-4 space-y-3 bg-black/40 min-h-[220px]">
              {loading ? <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div> : auditLogs.length > 0 ? (
                 auditLogs.slice(0, 3).map((l, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between hover:border-[#00ffc8]/20 transition-all group">
                       <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono text-[10px] font-bold border ${l.action === 'DATA_UPLOAD' ? 'bg-[#00ffc8]/10 border-[#00ffc8]/20 text-[#00ffc8]' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'}`}>
                             {l.id}
                          </div>
                          <div>
                             <p className="text-[10px] text-white font-black uppercase tracking-tight">{l.action}</p>
                             <p className="text-[9px] text-gray-600 font-mono mt-0.5">{truncateHash(l.datasetHash)}</p>
                          </div>
                       </div>
                       <a href={`https://sepolia.etherscan.io/address/${l.recorder}`} target="_blank" className="p-2 text-gray-700 hover:text-white transition-all">
                          <ExternalLink className="w-4 h-4" />
                       </a>
                    </div>
                 ))
              ) : <div className="py-12 text-center text-gray-700 font-mono text-[10px] uppercase tracking-widest">Awaiting Nexus Audit...</div>}
           </div>
           <div className="p-4 border-t border-white/5 text-center">
              <span className="text-[9px] text-gray-700 font-mono tracking-widest uppercase">Kernel Entropy Layer Ready</span>
           </div>
        </GlassCard>
      </div>

    </div>
  );
};

export default Insights;
