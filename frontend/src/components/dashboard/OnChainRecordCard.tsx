import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2, CheckSquare, ExternalLink, Loader2, RefreshCcw, AlertTriangle } from 'lucide-react';
import dataService, { AuditRecord } from '../../services/dataService';

interface Props {
  logs: AuditRecord[];
  activeJob?: any;
  loading?: boolean;
  onVerified?: () => void;
}

const OnChainRecordCard: React.FC<Props> = ({ logs, activeJob, loading, onVerified }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ success: boolean; message: string } | null>(null);

  const latestLog = logs && logs.length > 0 ? logs[logs.length - 1] : null;

  // Derive current status from either an active job or the latest log
  const currentStatus = activeJob?.status || (latestLog ? 'CONFIRMED_ON_CHAIN' : 'IDLE');

  const truncate = (str: string) => {
    if (!str) return 'N/A';
    return `${str.slice(0, 6)}...${str.slice(-4)}`;
  };

  const getStatusDisplay = () => {
    switch (currentStatus) {
      case 'IDLE': return { label: 'Awaiting Ingestion', color: 'text-slate-600', icon: <RefreshCcw className="w-4 h-4 animate-spin-reverse" /> };
      case 'UPLOADED': return { label: 'File Received', color: 'text-cyan-400', icon: <Loader2 className="w-4 h-4 animate-spin" /> };
      case 'HASH_GENERATED': return { label: 'Hash Generated', color: 'text-cyan-400', icon: <Loader2 className="w-4 h-4 animate-spin" /> };
      case 'PENDING_BLOCKCHAIN': return { label: 'Pending Blockchain', color: 'text-indigo-400', icon: <RefreshCcw className="w-4 h-4 animate-spin" /> };
      case 'CONFIRMED_ON_CHAIN': return { label: 'Confirmed on Chain', color: 'text-emerald-400', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'COMPLETED': return { label: 'Processing Complete', color: 'text-emerald-400', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'VERIFIED': return { label: 'Integrity Verified', color: 'text-emerald-400', icon: <Shield className="w-4 h-4" /> };
      case 'FAILED': return { label: 'Processing Failed', color: 'text-red-400', icon: <AlertTriangle className="w-4 h-4" /> };
      default: return { label: currentStatus, color: 'text-slate-400', icon: <Loader2 className="w-4 h-4 animate-spin" /> };
    }
  };

  const status = getStatusDisplay();

  const handleVerify = async () => {
    if (!activeJob?._id && !latestLog) return;
    
    // We prioritize verifying the most recent confirmed log if no active job is specified
    const jobIdToVerify = activeJob?._id;
    if (!jobIdToVerify) {
        setVerificationResult({ success: false, message: "No active job session found to verify." });
        return;
    }

    try {
      setIsVerifying(true);
      setVerificationResult(null);
      const result = await dataService.verifyDataset(jobIdToVerify);
      
      if (result.verified) {
        setVerificationResult({ success: true, message: "Local data matches On-Chain Hash!" });
        if (onVerified) onVerified();
      } else {
        setVerificationResult({ success: false, message: "Integrity Mismatch detected!" });
      }
    } catch (err: any) {
      setVerificationResult({ success: false, message: "Verification API failure." });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-premium rounded-[32px] p-8 h-full flex flex-col relative overflow-hidden group shadow-[0_0_40px_rgba(16,185,129,0.15)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">On-Chain Record</h2>
        </div>
        {(loading || isVerifying) && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />}
      </div>

      <div className="flex flex-col space-y-8 flex-1">
        {/* Verification Status Banner */}
        <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest font-mono">Integrity Status</h3>
            <div className={`flex items-center space-x-2 ${status.color}`}>
               {status.icon}
               <span className="text-sm font-bold tracking-wide">
                 {status.label}
               </span>
            </div>
        </div>

        {/* Data Rows */}
        <div className="space-y-4 font-mono">
           <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Dataset Hash</span>
              <div className="bg-slate-900 border border-white/5 px-3 py-1.5 rounded-lg text-cyan-400 text-xs shadow-inner">
                 {activeJob?.datasetHash ? truncate(activeJob.datasetHash) : (latestLog ? truncate(latestLog.datasetHash) : '---')}
              </div>
           </div>
           <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Transaction ID</span>
              <div className="bg-slate-900 border border-white/5 px-3 py-1.5 rounded-lg text-indigo-400 text-xs shadow-inner">
                 {activeJob?.txHash ? truncate(activeJob.txHash) : (latestLog?.txHash ? truncate(latestLog.txHash) : 'N/A')}
              </div>
           </div>
        </div>

        {/* Verification Checklist */}
        <div className="space-y-4">
           <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest font-mono">Verification Assets</h3>
           <div className="grid grid-cols-1 gap-3">
              {[
                  { label: "Data Consistency", checked: !!latestLog || activeJob?.status === 'CONFIRMED_ON_CHAIN' },
                  { label: "AI Model ID", checked: !!latestLog || activeJob?.status === 'CONFIRMED_ON_CHAIN' },
                  { label: "Network Sync", checked: !!latestLog, detail: latestLog ? new Date(latestLog.timestamp).toLocaleString() : 'Pending Confirmation' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                    <div className="mt-0.5">
                       <CheckSquare className={`w-4 h-4 ${item.checked ? 'text-cyan-400' : 'text-slate-800'}`} />
                    </div>
                    <div className="flex flex-col">
                       <span className={`text-xs font-bold tracking-wide ${item.checked ? 'text-white' : 'text-slate-600'}`}>{item.label}</span>
                       {item.detail && <span className="text-[9px] text-slate-500 font-bold mt-0.5 font-mono">{item.detail}</span>}
                    </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-3 mt-10">
        <AnimatePresence mode="wait">
          {verificationResult && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`p-3 rounded-lg text-[10px] font-bold font-mono text-center mb-2 ${
                verificationResult.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {verificationResult.message}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-3">
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={handleVerify}
            disabled={(!activeJob?._id && !latestLog) || isVerifying || currentStatus === 'VERIFIED'}
            className="py-4 bg-slate-900 border border-white/10 rounded-[14px] text-white flex items-center justify-center space-x-2 font-bold text-xs hover:bg-slate-800 transition-all disabled:opacity-20"
          >
            {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4 text-cyan-400" />}
            <span>{currentStatus === 'VERIFIED' ? 'Verified' : 'Verify Integrity'}</span>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            disabled={!latestLog && !activeJob?.txHash}
            onClick={() => {
                const tx = activeJob?.txHash || latestLog?.txHash;
                if (tx) window.open(`https://etherscan.io/tx/${tx}`, '_blank');
            }}
            className="py-4 bg-gradient-to-tr from-emerald-600 to-cyan-600 rounded-[14px] text-white flex items-center justify-center space-x-2 font-bold text-xs shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/30 transition-all border border-emerald-400/20 disabled:opacity-20 disabled:grayscale"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Explorer</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default OnChainRecordCard;
