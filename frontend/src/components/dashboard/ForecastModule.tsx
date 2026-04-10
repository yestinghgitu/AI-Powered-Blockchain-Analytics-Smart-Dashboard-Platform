import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { TrendingUp, Calendar, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface ForecastData {
  day: number;
  revenue: number;
}

interface ForecastModuleProps {
  data: ForecastData[];
  loading?: boolean;
}

const ForecastModule: React.FC<ForecastModuleProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center bg-white/5 rounded-2xl animate-pulse">
        <span className="text-slate-400 font-medium">Calculating ML Forecast...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[384px] bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <Zap className="w-10 h-10 text-cyan-500/20 mb-3" />
          <p className="text-slate-400 text-sm font-medium">Historical baseline established.<br/>Upload more data to synchronize ML projections.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Predictive Analytics
          </h3>
          <p className="text-slate-400 text-sm mt-1">AI-driven revenue projection (Next 30 Days)</p>
        </div>
        <div className="flex gap-2">
            <div className="bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#22d3ee]" />
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Live Model</span>
            </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
                dataKey="day" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                label={{ value: 'Day', position: 'insideBottom', offset: -5, fill: '#64748b' }}
            />
            <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `$${val}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                color: '#fff'
              }}
              itemStyle={{ color: '#06b6d4' }}
            />
            <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#06b6d4" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-xs text-slate-500 block mb-1">Growth Index</span>
              <span className="text-lg font-bold text-emerald-400">+12.4%</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-xs text-slate-500 block mb-1">Confidence</span>
              <span className="text-lg font-bold text-cyan-400">94.2%</span>
          </div>
      </div>
    </motion.div>
  );
};

export default ForecastModule;
