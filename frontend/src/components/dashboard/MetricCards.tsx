import React from 'react';
import { motion } from 'framer-motion';
import { 
  XAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, AreaChart, Area 
} from 'recharts';
import { ArrowUpRight, TrendingUp, DollarSign, PieChart as PieIcon } from 'lucide-react';

interface MetricProps {
  value?: number;
  change?: number;
  chartData?: any[];
  loading?: boolean;
}

const LoadingSkeleton = ({ height = '120px' }) => (
  <div className={`w-full bg-white/5 animate-pulse rounded-2xl`} style={{ height }} />
);

/* Individual Card Components */
export const RevenueCard: React.FC<MetricProps> = ({ value = 0, change = 0, chartData = [], loading }) => (
  <motion.div whileHover={{ y: -5 }} className="glass-premium rounded-[24px] p-6 h-full flex flex-col min-h-[280px]">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Revenue</h3>
        <div className="flex items-center space-x-2">
          <span className="text-3xl font-black text-white">
            {loading ? '---' : `$${value.toLocaleString()}`}
          </span>
          {!loading && (
            <span className={`text-xs font-bold flex items-center ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <ArrowUpRight className={`w-3 h-3 mr-0.5 ${change < 0 ? 'rotate-90' : ''}`} /> {Math.abs(change)}%
            </span>
          )}
        </div>
      </div>
      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
        <DollarSign className="w-5 h-5 text-cyan-400" />
      </div>
    </div>
    
    <div className="flex-1 min-h-[120px]">
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData.slice(-10)}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ background: '#0a0d2e', border: '1px solid #00e5ff', borderRadius: '12px' }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#64748b' }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#00e5ff" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
    <div className="mt-2 flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
      <span>Timeline</span>
      <span>Live</span>
    </div>
  </motion.div>
);

export const SalesTrendsCard: React.FC<MetricProps> = ({ chartData = [], loading }) => {
  const currentSales = chartData.length > 0 ? chartData[chartData.length - 1].sales : 0;
  
  return (
    <motion.div whileHover={{ y: -5 }} className="glass-premium rounded-[24px] p-6 h-full flex flex-col min-h-[280px]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Sales Trends</h3>
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-black text-white">
              {loading ? '---' : currentSales.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Units</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-purple-400" />
        </div>
      </div>

      <div className="flex-1 min-h-[120px]">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.slice(-7)}>
              <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                {chartData.slice(-7).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00e5ff' : '#3b82f6'} />
                ))}
              </Bar>
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#0a0d2e', border: '1px solid #3b82f6', borderRadius: '12px' }} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <div className="mt-2 flex justify-center space-x-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
         <span>Volume Intensity</span>
      </div>
    </motion.div>
  );
};

export const EarningsForecastCard: React.FC<MetricProps> = ({ loading }) => {
  const forecastData = [
    { name: 'Target', value: 57, color: '#00e5ff' },
    { name: 'Growth', value: 17, color: '#7b5dea' },
    { name: 'Base', value: 67, color: '#3b82f6' },
  ];

  return (
    <motion.div whileHover={{ y: -5 }} className="glass-premium rounded-[24px] p-6 h-full flex flex-col min-h-[280px]">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Earnings Forecast</h3>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black text-white">$4,000</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] font-bold text-emerald-400 mt-1 uppercase tracking-widest">+ 18% SYNC</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <PieIcon className="w-5 h-5 text-blue-400" />
        </div>
      </div>

      <div className="flex-1 min-h-[120px] flex items-center justify-center relative">
        {loading ? (
          <div className="w-32 h-32 rounded-full border-8 border-white/5 border-t-cyan-400 animate-spin" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={forecastData}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {forecastData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
        {!loading && (
          <div className="absolute bottom-4 flex space-x-4 text-[9px] font-black text-white/40">
            <span>57%</span>
            <span>67%</span>
            <span>17%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
