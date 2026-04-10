import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Zap } from 'lucide-react';

interface ForecastMiniCardProps {
  predictedRevenue: number;
  growthPct: number;
  confidence: number;
  loading?: boolean;
}

export const ForecastMiniCard: React.FC<ForecastMiniCardProps> = ({ 
  predictedRevenue, 
  growthPct, 
  confidence, 
  loading 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2, scale: 1.005 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-panel p-4 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full shadow-[0_0_15px_rgba(34,211,238,0.1)]"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
          <Zap className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-sm font-bold ${growthPct >= 0 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]'} px-2 py-1 rounded-md border tracking-wider`}>
            {growthPct >= 0 ? '+' : ''}{growthPct}%
          </span>
        </div>
      </div>
      
      <p className="text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wider">AI Projected Sales</p>
      
      {loading ? (
        <div className="mt-auto space-y-2">
          <div className="h-8 bg-slate-800 animate-pulse rounded-lg w-3/4 border border-white/5" />
          <div className="h-4 bg-slate-800 animate-pulse rounded-lg w-1/2 border border-white/5" />
        </div>
      ) : (
        <div className="mt-auto flex flex-col gap-2">
          <h3 className="text-xl lg:text-2xl font-black text-white tracking-tighter" style={{ textShadow: '0 0 10px rgba(255,255,255,0.1)' }}>${predictedRevenue.toLocaleString()}</h3>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase">
              <Target className="w-3 h-3" />
              <span>CONFIDENCE: </span>
              <span className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]">{confidence}%</span>
            </div>
            {/* Progress bar for confidence */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${confidence}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] border-r border-white/50"
              />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
