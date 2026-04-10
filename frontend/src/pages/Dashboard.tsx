import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, Activity, TrendingUp, DollarSign, BarChart3, PieChart as PieChartIcon, Upload
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AIAssistantCard } from '../components/dashboard/AIAssistantCard';
import { ForecastMiniCard } from '../components/dashboard/ForecastMiniCard';
import { SalesForecastSection } from '../components/dashboard/SalesForecastSection';

import { useAppStore } from '../store/useAppStore';
import dataService from '../services/dataService';
import { useWalletStore } from '../store/useWalletStore';

// Mock data removed for production

const GlassCard = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -2, scale: 1.01 }}
    transition={{ duration: 0.3 }}
    className={`glass-panel rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full ${className}`}
  >
    {children}
  </motion.div>
);


interface LiveData {
  totalRevenue: number;
  recordCount: number;
  revenueData: { name: string; value: number }[];
  salesData: { name: string; software: number; hardware: number; services: number }[];
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  
  const { initSocket, aiAnomalies, aiForecast, lastAnalysis, detailedForecast, setDetailedForecast } = useAppStore();

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { walletAddress } = useWalletStore();

  const buildLiveData = (analytics: any, predictions: any[] = [], records: any[] = []) => {
    const normalizedPredictions = predictions.map((p: any, i: number) => ({
      name: p.period ?? `Day ${p.day ?? i + 1}`,
      value: Number(p.value ?? p.predictedRevenue ?? 0)
    }));

    const revenueData = normalizedPredictions.length > 0
      ? normalizedPredictions.slice(0, 6)
      : records.slice(0, 6).map((r: any, i: number) => ({
          name: r.date || `Row ${i + 1}`,
          value: Number(r.revenue ?? r.sales ?? 0)
        }));

    const qSize = Math.ceil(records.length / 4) || 1;
    const salesData = ['Q1','Q2','Q3','Q4'].map((q, qi) => {
      const slice = records.slice(qi * qSize, (qi + 1) * qSize);
      const sum = (key: string) => slice.reduce((s: number, r: any) => s + Number(r[key] ?? 0), 0);
      return { name: q, software: sum('software') || sum('sales'), hardware: sum('hardware') || 0, services: sum('services') || 0 };
    });

    return {
      totalRevenue: analytics?.totalRevenue ?? analytics?.totalRevenueAnalyzed ?? 0,
      recordCount: analytics?.recordCount ?? 0,
      revenueData: revenueData,
      salesData: salesData,
    };
  };

  useEffect(() => {
    initSocket();
    dataService.getAnalytics()
      .then((analytics: any) => {
        const built = buildLiveData(analytics, [], analytics.data ?? []);
        setLiveData(built);
      })
      .catch(() => { })
      .finally(() => setLoading(false));

    handleFetchForecast();
  }, [initSocket]);

  const handleFetchForecast = async () => {
    setForecastLoading(true);
    try {
      const result = await dataService.getForecast();
      if (result && result.success) {
        setDetailedForecast(result.forecast);
      }
    } catch (err) {
      console.error('Failed to fetch forecast:', err);
    } finally {
      setForecastLoading(false);
    }
  };

  useEffect(() => {
    if (!lastAnalysis) return;
    const built = buildLiveData(lastAnalysis.summary, lastAnalysis.predictions || [], []);
    setLiveData(built);
  }, [lastAnalysis]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
       const file = e.target.files[0];
       setSelectedFileName(file.name);
       setUploading(true);
       setUploadProgress(0);

       try {
         const result = await dataService.uploadDataset(file, (pct) => setUploadProgress(pct));
         if (result.success) {
            useAppStore.setState({ 
               aiForecast: result.predictions || [], 
               aiAnomalies: result.anomalies || [],
               detailedForecast: result.detailedForecast || null
            });
            await handleFetchForecast();
            const built = buildLiveData(result.analytics, result.predictions || [], result.analytics?.data || []);
            setLiveData(built);
            setTimeout(() => {
               setUploading(false);
               setUploadProgress(0);
               setSelectedFileName(null);
            }, 3000);
         }
       } catch (err: any) {
         setUploadError(err.response?.data?.error || err.message);
         setUploading(false);
       }
       if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const displayRevenueData = liveData?.revenueData ?? [];
  const displaySalesData = liveData?.salesData ?? [];
  const currentRevenue = liveData?.totalRevenue ?? 0;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 pb-16 pt-2 text-slate-100 min-w-0">
      <header className="mb-6 relative">
         <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-[50px] pointer-events-none" />
         <h1 
            className="text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400 tracking-tighter"
            style={{ filter: 'drop-shadow(0 0 10px rgba(34,211,238,0.3))' }}
         >
            System Dashboard
         </h1>
         <p className="text-cyan-400/80 font-bold mt-2 text-sm tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]"></span>
            Real-time business intelligence and forecasting.
         </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <GlassCard className="p-4 lg:p-5">
          <div className="flex items-center justify-between mb-4">
             <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                <DollarSign className="w-4 h-4 text-blue-400" />
             </div>
             <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">+15%</span>
          </div>
          <p className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">Total Revenue (Live AI Predicted)</p>
          <h3 className="text-xl lg:text-2xl font-black text-white tracking-tighter" style={{ textShadow: '0 0 10px rgba(255,255,255,0.1)' }}>${currentRevenue.toLocaleString()}</h3>
          <div className="h-20 mt-4">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={displayRevenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fill="url(#colorRev)" />
               </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-4 lg:p-5 border-l-4 border-l-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
          <div className="flex items-center justify-between mb-4">
             <div className="bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                <Activity className="w-4 h-4 text-rose-400" />
             </div>
             {aiAnomalies.length > 0 && <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md animate-pulse border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)] uppercase tracking-widest">{aiAnomalies.length} NEW</span>}
          </div>
          <p className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">ML Anomalies Detected</p>
          <h3 className="text-xl lg:text-2xl font-black text-white tracking-tighter">{aiAnomalies.length}</h3>
          <div className="mt-4 space-y-2 max-h-20 overflow-y-auto pr-1 custom-scrollbar">
             {aiAnomalies.length === 0 ? <p className="text-xs text-slate-500">No anomalies detected.</p> : aiAnomalies.map((a, i) => (
                <div key={i} className="text-[10px] bg-rose-500/5 text-rose-300 p-2 rounded-xl border border-rose-500/20 shadow-sm">{a.details} (Row: {a.rowIndex})</div>
             ))}
           </div>
        </GlassCard>


        <ForecastMiniCard 
          predictedRevenue={detailedForecast?.forecast?.find(f => !f.actual)?.predicted ?? currentRevenue * 1.15}
          growthPct={detailedForecast?.trends?.growth_rate_pct ?? 15}
          confidence={detailedForecast?.trends?.confidence_score ?? 92}
          loading={forecastLoading}
        />

        <div className="col-span-1 md:col-span-2 lg:col-span-2 h-full">
           <AIAssistantCard />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[320px]">
         <GlassCard className="col-span-1 lg:col-span-2 p-4 lg:p-5 flex flex-col">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-sm font-bold text-white uppercase tracking-widest">Sales Trends</h3>
               <BarChart3 className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            </div>
            <div className="flex-1 w-full min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displaySalesData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.05} />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                     <Tooltip 
                        contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}}
                        itemStyle={{color: '#fff'}}
                     />
                     <Bar dataKey="software" fill="#3B82F6" radius={[4,4,0,0]} />
                     <Bar dataKey="hardware" fill="#22D3EE" radius={[4,4,0,0]} />
                     <Bar dataKey="services" fill="#8B5CF6" radius={[4,4,0,0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </GlassCard>

         <GlassCard className="col-span-1 p-6 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Database className="w-8 h-8 text-cyan-400 mb-3 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]" />
            <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-tighter">Initialize Dataset</h3>
            <p className="text-xs text-slate-400 mb-4">Import raw CSV schema for neural analysis.</p>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" disabled={uploading} />
            <div className="mt-auto w-full">
              <button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={uploading} 
                className="w-full relative overflow-hidden group/btn py-3 rounded-xl transition-all duration-300"
              >
                 <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#22C55E] group-hover/btn:scale-105 transition-transform" />
                 <span className="relative z-10 text-white font-black tracking-widest uppercase text-xs">
                    {uploading ? `Processing... ${uploadProgress}%` : 'Upload CSV Dataset'}
                 </span>
                 <div className="absolute inset-0 shadow-[0_0_20px_rgba(34,197,94,0.3)] group-hover/btn:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-shadow" />
              </button>
              {uploadError && <p className="text-xs text-rose-400 mt-4 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">{uploadError}</p>}
            </div>
         </GlassCard>
      </div>


      <SalesForecastSection 
        data={detailedForecast?.forecast ?? []}
        confidence={detailedForecast?.trends?.confidence_score ?? 92}
        predictedRevenue={detailedForecast?.forecast?.find(f => !f.actual)?.predicted ?? currentRevenue * 1.15}
        growthPct={detailedForecast?.trends?.growth_rate_pct ?? 15}
        insights={detailedForecast?.insights}
        onRefresh={handleFetchForecast}
        loading={forecastLoading}
      />


      {uploading && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel rounded-3xl p-10 max-w-md w-full shadow-2xl flex flex-col items-center border border-cyan-500/20"
          >
            <div className="relative w-16 h-16 mb-4">
               <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
               <motion.div 
                 className="absolute inset-0 border-4 border-cyan-400 rounded-full border-t-transparent shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                 animate={{ rotate: 360 }}
                 transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
               />
               <Upload className="absolute inset-0 m-auto w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            </div>
            <h3 className="text-base font-black text-white mb-2 tracking-widest uppercase text-center drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">Initializing Neural Link</h3>
            <p className="text-slate-400 text-xs text-center mb-6 font-medium">Injecting raw dataset into deep learning cognitive core...</p>
            
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2 border border-white/5">
               <motion.div 
                 className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full border-r border-white/50"
                 initial={{ width: 0 }}
                 animate={{ width: `${uploadProgress}%` }}
               />
            </div>
            <span className="text-xs font-black text-cyan-400 uppercase tracking-[0.3em] drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{uploadProgress}% Synchronized</span>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
