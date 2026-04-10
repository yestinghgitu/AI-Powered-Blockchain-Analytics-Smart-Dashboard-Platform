import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2 } from 'lucide-react';

export const VerifyIntegrityPanel = ({ hash, version = 'GPT-4-Nexus-v2' }: { hash?: string, version?: string }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 relative overflow-hidden group shadow-sm">
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
       
       <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
             <Shield className="w-5 h-5 text-blue-600" />
             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Data Integrity</h3>
          </div>
          <div className="px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
             <span className="text-[9px] font-mono font-bold text-blue-600 uppercase tracking-widest">{version}</span>
          </div>
       </div>

       <div className="space-y-4">
          <div className="flex flex-col">
             <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mb-1">State Merkle Root</span>
             <code className="text-xs text-slate-600 font-mono bg-slate-50 p-2 rounded-lg border border-gray-100 truncate">
                {hash || 'Awaiting synchronization...'}
             </code>
          </div>

          <motion.div 
            className={`flex items-center justify-center p-3 rounded-xl border ${hash ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-gray-100'}`}
          >
             {hash ? (
                <div className="flex items-center space-x-2">
                   <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                   <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Verified Integrity</span>
                </div>
             ) : (
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Unverified</span>
             )}
          </motion.div>
       </div>
    </div>
  );
};
