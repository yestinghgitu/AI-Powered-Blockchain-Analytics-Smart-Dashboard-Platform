import React from 'react';
import { Shield, CheckCircle2, Link as LinkIcon, Database, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface BlockchainStatusProps {
  txHash?: string;
  datasetHash?: string;
  status: 'Verified' | 'Pending' | 'Not Verified';
  loading?: boolean;
}

const BlockchainStatus: React.FC<BlockchainStatusProps> = ({ txHash, datasetHash, status, loading }) => {
  if (loading) {
    return (
      <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6 h-full animate-pulse flex flex-col justify-center items-center">
          <Shield className="w-10 h-10 text-indigo-500/20 mb-2" />
          <span className="text-indigo-400/50 text-sm font-medium">Validating Integrity...</span>
      </div>
    );
  }

  const isVerified = status === 'Verified' || !!txHash;

  return (
    <div className="bg-gradient-to-br from-indigo-500/[0.05] to-blue-500/[0.05] border border-indigo-500/20 rounded-2xl p-6 h-full shadow-2xl relative overflow-hidden group">
      {/* Decorative pulse */}
      {isVerified && (
          <div className="absolute top-0 right-0 p-4">
              <div className="relative">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full animate-ping opacity-20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_#34d399]" />
                  </div>
              </div>
          </div>
      )}

      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Shield className="w-5 h-5 text-indigo-400" />
        Data Integrity Core
      </h3>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Hash Status</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                isVerified ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'
            }`}>
                {isVerified ? 'Immutable' : 'Pending'}
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
             <Database className="w-4 h-4 text-indigo-400 flex-shrink-0" />
             <span className="text-[10px] font-mono text-slate-400 truncate break-all">
                {datasetHash || '0xda39a3ee... (pending upload)'}
             </span>
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-2">Audit Trace</span>
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 group-hover:border-indigo-500/30 transition-all cursor-pointer">
             <LinkIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
             <div className="flex-1 min-w-0">
                <span className="text-[10px] font-mono text-indigo-300 block truncate">
                    {txHash || 'Awaiting Blockchain Confirmation...'}
                </span>
             </div>
             {txHash && (
                 <ExternalLink className="w-3 h-3 text-slate-500" />
             )}
          </div>
        </div>

        <div className="pt-2">
            <p className="text-[11px] text-slate-500 italic">
                {isVerified 
                  ? "✓ Cryptographic proof recorded on Ethereum. This dataset is tamper-proof." 
                  : "⚠ Dataset uploaded locally but not yet anchored to blockchain."}
            </p>
        </div>
      </div>
    </div>
  );
};

export default BlockchainStatus;
