import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Anomaly {
  date: string;
  revenue: number;
  product: string;
  type: string;
}

interface AnomalyTrackerProps {
  anomalies: Anomaly[];
  loading?: boolean;
}

const AnomalyTracker: React.FC<AnomalyTrackerProps> = ({ anomalies, loading }) => {
  if (loading) {
    return (
      <div className="h-full bg-red-500/5 border border-red-500/10 rounded-2xl p-6 flex flex-col items-center justify-center animate-pulse">
          <AlertTriangle className="w-8 h-8 text-red-500/30 mb-2" />
          <span className="text-red-500/50 text-sm font-medium">Scanning for Anomalies...</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 h-full shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Risk Monitor
        </h3>
        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-[0_0_10px_#ef4444]">
          {anomalies.length} Issues
        </span>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[300px] hide-scrollbar">
        <AnimatePresence>
          {anomalies.length === 0 ? (
            <div className="text-center py-10">
                <Bell className="w-10 h-10 text-emerald-500/20 mx-auto mb-2" />
                <p className="text-slate-500 text-sm italic">Aggregate systems stable. No anomalies detected.</p>
            </div>
          ) : (
            anomalies.map((anomaly, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-3 rounded-xl border flex items-center gap-4 ${
                  anomaly.type === 'Spike' 
                    ? 'bg-emerald-500/5 border-emerald-500/20' 
                    : 'bg-red-500/5 border-red-500/20'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                    anomaly.type === 'Spike' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                }`}>
                    {anomaly.type === 'Spike' ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white mb-0.5">{anomaly.product}</span>
                    <span className="text-[10px] font-medium text-slate-500">{anomaly.date}</span>
                  </div>
                  <p className={`text-xs ${
                      anomaly.type === 'Spike' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {anomaly.type} detected: ${anomaly.revenue.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnomalyTracker;
