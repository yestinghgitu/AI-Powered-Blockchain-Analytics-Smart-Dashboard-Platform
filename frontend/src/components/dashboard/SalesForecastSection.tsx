import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SalesForecastSectionProps {
  data: Array<{ date: string; actual?: number; predicted?: number }>;
  confidence: number;
  predictedRevenue?: number;
  growthPct?: number;
  insights?: string[];
  onRefresh: () => void;
  loading?: boolean;
}

export const SalesForecastSection: React.FC<SalesForecastSectionProps> = ({ 
  data, 
  confidence, 
  predictedRevenue = 0,
  growthPct = 0,
  insights = [],
  onRefresh, 
  loading 
}) => {
  const hasData = data && data.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="glass-panel rounded-2xl overflow-hidden p-5 lg:p-6 flex flex-col h-full gap-6 relative"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-cyan-400 uppercase tracking-[0.3em] drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
              Neural Strategy Forecast
            </h3>
            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-cyan-500/20">Predictive</span>
          </div>

          <div className="flex items-center gap-4">
            <h2 
              className="text-3xl lg:text-4xl font-black text-white tracking-tighter"
              style={{ textShadow: '0 0 15px rgba(255,255,255,0.2)' }}
            >
              ${predictedRevenue.toLocaleString()}
            </h2>
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
               <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
               <span className="text-sm font-black text-emerald-400">
                  {growthPct >= 0 ? '+' : ''}{growthPct}%
               </span>
            </div>
          </div>
          <p className="text-slate-400 font-medium tracking-wide">AI Projected Revenue Pipeline</p>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Neural Confidence</span>
             <span className="text-lg font-black text-cyan-400" style={{ filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.5))' }}>
                {confidence}%
             </span>
          </div>
          
          <button 
            onClick={onRefresh}
            disabled={loading}
            className="group relative flex items-center gap-2 bg-slate-900 text-white text-xs font-black px-6 py-3.5 rounded-xl transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#22C55E] opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-2">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
              <span className="tracking-widest">GENERATE FORECAST</span>
            </div>
            <div className="absolute inset-0 shadow-[0_0_20px_rgba(34,211,238,0.4)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-shadow" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[280px] lg:min-h-[320px] w-full">
        {loading ? (
          <div className="w-full h-[280px] lg:h-[320px] bg-slate-900/40 backdrop-blur-sm animate-pulse rounded-2xl flex items-center justify-center border border-white/5">
             <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                  <div className="absolute inset-0 blur-xl bg-cyan-400/20 animate-pulse" />
                </div>
                <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Optimizing Prediction Engine...</span>
             </div>
          </div>
        ) : !hasData ? (
          <div className="w-full h-[280px] lg:h-[320px] bg-black/20 rounded-2xl flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/5">
             <AlertCircle className="w-8 h-8 text-slate-700 mb-3" />
             <span className="text-sm font-bold text-slate-500 text-center max-w-[200px]">Neural core ready. Initialize dataset to begin analysis.</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.05} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a',
                  borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                  padding: '12px'
                }}
                itemStyle={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}
              />
              <Legend verticalAlign="top" height={60} iconType="circle" />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#3B82F6" 
                strokeWidth={4} 
                dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }} 
                activeDot={{ r: 8, strokeWidth: 0, fill: '#3B82F6', shadow: '0 0 10px #3B82F6' }} 
                name="Actual Revenue"
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#22D3EE" 
                strokeWidth={4} 
                strokeDasharray="10 6"
                dot={{ r: 0 }} 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#22D3EE', shadow: '0 0 15px #22D3EE' }} 
                name="AI Prediction"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {hasData && insights.length > 0 && (
        <div className="pt-6 border-t border-white/5 flex flex-col gap-3">
           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-1">Neural Insights Strategy</h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.map((insight, idx) => (
                <div key={idx} className="group bg-white/[0.02] hover:bg-white/[0.04] p-3 rounded-xl border border-white/5 transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] flex items-start gap-3 h-full">
                  <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                      <p className="text-xs font-bold text-slate-300 leading-relaxed italic">"{insight}"</p>
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </motion.div>

  );
};


