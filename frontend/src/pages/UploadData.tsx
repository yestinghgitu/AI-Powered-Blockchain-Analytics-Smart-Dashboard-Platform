import React, { useState, useRef } from 'react';
import dataService from '../services/dataService';
import { 
  Upload, CheckCircle2, Database, AlertCircle, 
  Activity, Loader2, BarChart3, TrendingUp, Cpu, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore } from '../store/useWalletStore';
import { useAppStore } from '../store/useAppStore';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';

function UploadData() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { walletAddress } = useWalletStore();
  const { setDetailedForecast } = useAppStore();

  const [resultData, setResultData] = useState<any>(null);

  const processFile = async (selectedFile: File) => {
    if (!walletAddress) {
      setError("Secure Tunnel Required: Connect wallet to cryptographically sign dataset.");
      setStatus('error');
      return;
    }
    
    if (!selectedFile.name.endsWith('.csv')) {
      setError("Schema Violation: Only standardized .csv inputs are accepted at this layer.");
      setStatus('error');
      return;
    }

    setFile(selectedFile);
    setStatus('parsing');
    setError(null);
    setProgress(0);

    try {
      const result = await dataService.uploadDataset(selectedFile, (pct) => setProgress(pct));
      if (result.success) {
          setResultData(result);
          setDetailedForecast(result.detailedForecast);
          setStatus('success');
      } else {
          throw new Error("Pipeline connection failure.");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      setStatus('error');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 pt-2 text-slate-100 min-w-0">
      <header className="mb-6">
         <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
               <Database className="w-5 h-5 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tighter text-white">Dataset Vault</h1>
         </div>
         <p className="text-slate-400 text-sm font-medium tracking-wide">
            Securely inject raw data sequences into the neural analysis pipeline.
         </p>
      </header>

      <AnimatePresence mode="wait">
        {status === 'idle' || status === 'error' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {error && (
              <div className="glass-panel border-rose-500/30 bg-rose-500/5 p-4 rounded-xl flex items-center gap-3 text-rose-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-xs font-black uppercase tracking-widest">{error}</span>
                <button onClick={() => setStatus('idle')} className="ml-auto text-[10px] bg-white/10 px-3 py-1 rounded-lg hover:bg-white/20 transition-all font-bold">DISMISS</button>
              </div>
            )}

            <div 
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`glass-panel border-2 border-dashed rounded-3xl p-8 lg:p-12 transition-all duration-500 flex flex-col items-center justify-center text-center group cursor-pointer
                ${dragActive ? 'border-cyan-400 bg-cyan-400/5 scale-[0.99]' : 'border-white/10 hover:border-cyan-500/40 hover:bg-white/[0.02]'}
              `}
            >
              <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} accept=".csv" className="hidden" />
              
              <div className="relative mb-6">
                 <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full group-hover:bg-cyan-500/30 transition-colors" />
                 <div className="relative w-16 h-16 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7 text-cyan-400" />
                 </div>
              </div>

              <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tighter">Initialize Data Sequence</h3>
              <p className="text-xs text-slate-500 max-w-xs mb-8 font-medium leading-relaxed">
                Drag and drop your encrypted .csv schema or click to browse protocol directories.
              </p>

              <button className="relative overflow-hidden px-8 py-3 rounded-xl transition-all font-black text-[10px] tracking-[0.2em] uppercase">
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500" />
                 <span className="relative z-10 text-white">Access File System</span>
              </button>

              <div className="mt-8 flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                 <Activity className="w-3.5 h-3.5" />
                 <span>Requirement: Date, Product, Revenue</span>
              </div>
            </div>
          </motion.div>
        ) : status === 'parsing' ? (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-12 lg:p-16 rounded-3xl flex flex-col items-center justify-center">
             <div className="relative w-20 h-20 mb-8">
                <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full animate-pulse" />
                <motion.div 
                   animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-0 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full"
                />
                <Cpu className="absolute inset-0 m-auto w-8 h-8 text-cyan-400 animate-pulse" />
             </div>
             <h3 className="text-xl font-black text-white uppercase tracking-[0.4em] mb-4">Parsing Schema</h3>
             <div className="w-full max-w-sm bg-slate-800/50 h-1.5 rounded-full overflow-hidden border border-white/5">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-cyan-400 shadow-[0_0_15px_#22d3ee]" />
             </div>
             <span className="mt-3 text-[10px] font-black text-cyan-400 tracking-[0.3em] uppercase">{progress}% Synced</span>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
             <div className="glass-panel p-6 lg:p-8 rounded-3xl border-emerald-500/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
                <div className="flex flex-col items-center text-center">
                   <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                   </div>
                   <h2 className="text-2xl font-black text-white tracking-tighter mb-2 uppercase">Injection Successful</h2>
                   <p className="text-slate-400 text-sm max-w-md mb-8">Protocol active. Global dataset has been parsed into the neural cognitive core.</p>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 text-left">
                         <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="w-4 h-4 text-cyan-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Forecast</span>
                         </div>
                         <div className="h-32">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={resultData?.predictions || []}>
                                   <defs>
                                      <linearGradient id="upColor" x1="0" y1="0" x2="0" y2="1">
                                         <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                                         <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                                      </linearGradient>
                                   </defs>
                                   <Area type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} fill="url(#upColor)" />
                                </AreaChart>
                             </ResponsiveContainer>
                         </div>
                      </div>
                      <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 text-left">
                         <div className="flex items-center gap-2 mb-4">
                            <Zap className="w-4 h-4 text-rose-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anomaly Scan</span>
                         </div>
                         <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                            {resultData?.anomalies?.slice(0, 3).map((a: any, i: number) => (
                               <div key={i} className="text-[9px] bg-rose-500/5 border border-rose-500/20 p-2 rounded-lg text-rose-300 font-bold uppercase tracking-tighter">
                                  {a.details} (Row {a.rowIndex})
                               </div>
                            )) || <span className="text-xs text-slate-600">No volatility detected.</span>}
                         </div>
                      </div>
                   </div>

                   <div className="mt-8 flex gap-3 w-full max-w-xs">
                      <button onClick={() => setStatus('idle')} className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-[10px] uppercase tracking-widest transition-all">Restart</button>
                      <button onClick={() => window.location.href='/'} className="flex-1 py-3 rounded-xl bg-cyan-500 text-slate-900 font-black text-[10px] uppercase tracking-widest shadow-[0_0_15px_#22d3ee] hover:scale-105 transition-all">Dashboard</button>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UploadData;
