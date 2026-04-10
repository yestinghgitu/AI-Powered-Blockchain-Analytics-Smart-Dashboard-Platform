import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, ShieldCheck, ShieldAlert, Wifi, WifiOff, Zap, Copy, Check,
  ExternalLink, RefreshCw, Hash, Wallet, Link2, AlertTriangle,
  Activity, Clock, ChevronDown, ChevronUp, Database
} from 'lucide-react';
import { useWalletStore } from '../../store/useWalletStore';
import { useAppStore } from '../../store/useAppStore';
import {
  hashFile, truncateHash, truncateAddress, fetchNetworkLatency,
  storeHashOnChain, verifyHash, loadHashHistory, saveHashToHistory,
  type HashRecord, type VerifyResult
} from '../../hooks/useSolanaIntegrity';

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface LogEntry {
  id: number;
  time: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warn';
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const now = () => new Date().toLocaleTimeString('en-US', { hour12: false });

// ─── PARTICLES CANVAS ─────────────────────────────────────────────────────────

const CyberParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number; r: number; opacity: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Init particles
    particlesRef.current = Array.from({ length: 25 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 255, ${p.opacity})`;
        ctx.fill();
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none rounded-[20px]"
      style={{ opacity: 0.4 }}
    />
  );
};

// ─── ANIMATED SVG NODE GRAPH ───────────────────────────────────────────────────

const NodeGraph: React.FC<{ active: boolean }> = ({ active }) => (
  <svg width="100%" height="48" viewBox="0 0 260 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ng-beam" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="rgba(0,255,255,0)" />
        <stop offset="50%" stopColor="rgba(0,255,255,0.9)" />
        <stop offset="100%" stopColor="rgba(0,255,255,0)" />
      </linearGradient>
    </defs>
    {/* Lines */}
    <line x1="20" y1="24" x2="80" y2="24" stroke="#1e3a5f" strokeWidth="1.5" />
    <line x1="90" y1="24" x2="150" y2="24" stroke="#1e3a5f" strokeWidth="1.5" />
    <line x1="160" y1="24" x2="220" y2="24" stroke="#1e3a5f" strokeWidth="1.5" />
    <line x1="230" y1="24" x2="245" y2="24" stroke="#1e3a5f" strokeWidth="1.5" />

    {/* Nodes */}
    {[20, 85, 155, 225].map((cx, i) => (
      <g key={i}>
        <circle cx={cx} cy={24} r={9} fill="rgba(10,15,45,0.9)" stroke={active ? '#00ffff' : '#1e3a5f'} strokeWidth="1.5" />
        <circle cx={cx} cy={24} r={4} fill={active ? '#00ffff' : '#1e3a5f'} />
        {active && (
          <circle cx={cx} cy={24} r={9} fill="none" stroke="rgba(0,255,255,0.4)" strokeWidth="1">
            <animate attributeName="r" from="9" to="16" dur="1.5s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
          </circle>
        )}
      </g>
    ))}

    {/* Animated data beam */}
    {active && (
      <motion.rect
        x={20} y={22} width={35} height={4}
        fill="url(#ng-beam)"
        initial={{ x: 20 }}
        animate={{ x: 225 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
    )}
  </svg>
);

// ─── COPY BUTTON ─────────────────────────────────────────────────────────────

const CopyBtn: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-cyan-500/10 text-cyan-500/60 hover:text-cyan-400 transition-all"
      title="Copy"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
};

// ─── SECTION WRAPPER ────────────────────────────────────────────────────────

const Section: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <motion.div 
    whileHover={{ y: -2, boxShadow: '0 0 25px rgba(34, 211, 238, 0.25)' }}
    className={`glass-panel p-4 space-y-3 transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

const SectionTitle: React.FC<{ icon: React.ReactNode; label: string; right?: React.ReactNode }> = ({ icon, label, right }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{label}</span>
    </div>
    {right}
  </div>
);

// ─── NEON BUTTON ──────────────────────────────────────────────────────────────

const NeonBtn: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  color?: 'purple-green' | 'red';
  children: React.ReactNode;
  className?: string;
}> = ({ onClick, disabled, loading, color = 'purple-green', children, className = '' }) => {
  const colors = {
    'purple-green': 'from-[#9945FF] to-[#14F195] text-white border-transparent shadow-[0_0_15px_rgba(153,69,255,0.3)] hover:shadow-[0_0_25px_rgba(20,241,149,0.5)]',
    'red':          'from-rose-500 to-red-600 text-white border-transparent shadow-[0_0_15px_rgba(244,63,94,0.3)]',
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r text-xs font-black tracking-widest uppercase transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${colors[color]} ${className}`}
    >
      {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
      {children}
    </motion.button>
  );
};

// ─── MAIN PANEL ────────────────────────────────────────────────────────────────

const BlockchainIntegrityPanel: React.FC = () => {
  const { 
    isPhantomInstalled, 
    walletAddress, 
    isConnected, 
    isConnecting, 
    connect, 
    disconnect 
  } = useWalletStore();
  
  // Helper to get provider safely for storeHashOnChain
  const getProvider = () => (window as any).solana;

  // Hash state
  const [currentHash, setCurrentHash] = useState<string | null>(null);
  const [storedHash, setStoredHash] = useState<string | null>(null);
  const [hashTimestamp, setHashTimestamp] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const [hashFilename, setHashFilename] = useState<string | null>(null);
  const hashFileInputRef = useRef<HTMLInputElement>(null);

  // TX state
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [isStoring, setIsStoring] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [particles, setParticles] = useState(false);

  // Verification state
  const [verifyResult, setVerifyResult] = useState<VerifyResult>('unverified');
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastVerified, setLastVerified] = useState<string | null>(null);

  // Network state
  const [latency, setLatency] = useState<number | null>(null);
  const [networkActive, setNetworkActive] = useState(false);
  const latencyRef = useRef<ReturnType<typeof setInterval>>();

  // Hash history
  const [hashHistory, setHashHistory] = useState<HashRecord[]>(loadHashHistory());
  const [showHistory, setShowHistory] = useState(false);

  // Global Store Sync
  const { lastAnalysis } = useAppStore();

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 0, time: now(), message: 'System online — monitoring live activity.', type: 'info' }
  ]);
  const logIdRef = useRef(1);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const entry: LogEntry = { id: logIdRef.current++, time: now(), message, type };
    setLogs(prev => [...prev.slice(-49), entry]);
    setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  // Global Store Sync: Auto-update panel when background processing completes
  useEffect(() => {
    if (lastAnalysis && lastAnalysis.status === 'VERIFIED') {
      addLog('Real-time blockchain verification received!', 'success');
      setCurrentHash(lastAnalysis.datasetHash);
      setTxSignature(lastAnalysis.transactionHash);
      setStoredHash(lastAnalysis.datasetHash);
      setVerifyResult('verified');
      setLastVerified(new Date().toLocaleTimeString());
      
      // Update history
      const newRecord: HashRecord = {
        hash: lastAnalysis.datasetHash,
        timestamp: new Date().toISOString(),
        filename: lastAnalysis.filename || 'Processed Dataset',
        txSignature: lastAnalysis.transactionHash,
        verifyStatus: 'verified'
      };
      setHashHistory(prev => [newRecord, ...prev.slice(0, 19)]);
    } else if (lastAnalysis && lastAnalysis.status === 'FAILED') {
      addLog('On-chain anchoring failed in background pipeline.', 'error');
    }
  }, [lastAnalysis, addLog]);



  // Network latency polling
  useEffect(() => {
    const measure = async () => {
      const ms = await fetchNetworkLatency();
      setLatency(ms);
      setNetworkActive(ms >= 0);
    };
    measure();
    latencyRef.current = setInterval(measure, 8000);
    return () => clearInterval(latencyRef.current);
  }, []);

  // ── A: HASH ENGINE ────────────────────────────────────────────────────────────

  const handleHashFile = async (file: File) => {
    setIsHashing(true);
    addLog(`Hashing local dataset: ${file.name} …`, 'info');
    try {
      const hash = await hashFile(file);
      const ts = new Date().toISOString();
      setCurrentHash(hash);
      setHashTimestamp(ts);
      setHashFilename(file.name);
      setVerifyResult('unverified');
      setStoreError(null);

      const record: HashRecord = { hash, timestamp: ts, filename: file.name };
      const updated = saveHashToHistory(record);
      setHashHistory(updated);

      addLog(`Hash secure: ${truncateHash(hash, 8, 8)}`, 'success');
    } catch (e: any) {
      addLog(`Hashing failed: ${e.message}`, 'error');
    } finally {
      setIsHashing(false);
    }
  };

  // ── D: STORE ON-CHAIN ────────────────────────────────────────────────────────

  const handleStore = async () => {
    if (!currentHash) { addLog('Generate a hash first.', 'warn'); return; }
    if (!isConnected) { addLog('Connect Phantom wallet first.', 'warn'); return; }

    setIsStoring(true);
    setStoreError(null);
    setParticles(true);
    addLog('Anchoring proof to Solana Devnet …', 'info');

    const provider = getProvider();
    const result = await storeHashOnChain(currentHash, provider);
    setParticles(false);

    if (result.success && result.txSignature) {
      setTxSignature(result.txSignature);
      setStoredHash(currentHash);

      // Update history with tx
      setHashHistory(prev => {
        const updated = prev.map((r, i) => i === 0 ? { ...r, txSignature: result.txSignature } : r);
        localStorage.setItem('blockchain_hash_history', JSON.stringify(updated));
        return updated;
      });

      addLog(`TX confirmed: ${truncateHash(result.txSignature, 8, 8)}`, 'success');
    } else {
      setStoreError(result.error || 'Transaction failed.');
      addLog(`TX failed: ${result.error}`, 'error');
    }
    setIsStoring(false);
  };

  // ── E: VERIFY ────────────────────────────────────────────────────────────────

  const handleVerify = async () => {
    if (!currentHash) { addLog('No current hash to verify.', 'warn'); return; }
    if (!storedHash) { addLog('No stored proof found on-chain yet.', 'warn'); return; }

    setIsVerifying(true);
    addLog('Checking dataset integrity …', 'info');
    await new Promise(r => setTimeout(r, 1100));

    const result = verifyHash(currentHash, storedHash);
    setVerifyResult(result);
    const ts = new Date().toLocaleTimeString();
    setLastVerified(ts);

    if (result === 'verified') {
      addLog('✓ Integrity VERIFIED — dataset is tamper-proof.', 'success');
    } else if (result === 'tampered') {
      addLog('⚠ TAMPERED — hash mismatch detected!', 'error');
    }

    setHashHistory(prev => {
      const updated = prev.map((r, i) => i === 0 ? { ...r, verifyStatus: result } : r);
      localStorage.setItem('blockchain_hash_history', JSON.stringify(updated));
      return updated;
    });
    setIsVerifying(false);
  };

  // ── WALLET ───────────────────────────────────────────────────────────────────

  const handleConnect = async () => {
    addLog('Connecting Phantom wallet …', 'info');
    await connect();
  };

  useEffect(() => {
    if (isConnected && walletAddress) {
      addLog(`Wallet connected: ${truncateAddress(walletAddress)}`, 'success');
    }
  }, [isConnected, walletAddress]);

  // ─────────────────────────────────────────────────────────────────────────────

  const logColors = { info: 'text-slate-400', success: 'text-emerald-400', error: 'text-rose-400', warn: 'text-yellow-400' };
  const logPrefixes = { info: '›', success: '✓', error: '✗', warn: '⚠' };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: 'circOut' }}
      className="relative w-full h-full flex flex-col gap-6 rounded-[24px] overflow-x-hidden overflow-y-auto border border-white/10 custom-scrollbar"
      style={{
        background: 'linear-gradient(165deg, #1E293B 0%, #0F172A 100%)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Floating Particles */}
      <CyberParticles />

      <div className="relative z-10 p-5 flex flex-col gap-5 min-h-full">

        {/* ── A: STATUS HEADER ───────────────────────────────────────────────── */}
        <Section className="bg-slate-900/40 border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Animated pulse dot */}
              <div className="relative">
                <div className={`w-2.5 h-2.5 rounded-full ${networkActive ? 'bg-[#14F195]' : 'bg-rose-500'}`} />
                {networkActive && (
                  <div className="absolute inset-0 w-2.5 h-2.5 bg-[#14F195] rounded-full animate-ping opacity-40" />
                )}
              </div>
              <span className="text-[11px] font-black tracking-tighter text-white uppercase italic">
                {isConnected ? 'Live Sync Active' : 'Offline Mode'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Latency badge */}
              {latency !== null && (
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-800/30">
                  {latency}ms
                </span>
              )}
            </div>
          </div>

          {/* Node graph */}
          <NodeGraph active={networkActive} />

          {/* Network info row */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 bg-black/20 px-2 py-1 rounded">
            <span>RTC: {isConnected ? 'devnet.solana.com' : 'Standby'}</span>
            {lastVerified && <span>{lastVerified}</span>}
          </div>
        </Section>

        {/* ── B: HASH ENGINE ─────────────────────────────────────────────────── */}
        <Section>
          <SectionTitle icon={<Hash className="w-4 h-4" />} label="Security Fingerprint" />

          {/* Hash display */}
          <div className="bg-slate-950/50 rounded-xl p-3 border border-white/5 space-y-2">
            <div className="flex items-center justify-between space-x-2">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">SHA-256</span>
              {currentHash && <CopyBtn text={currentHash} />}
            </div>
            <code className="text-[12px] font-mono text-[#22D3EE] drop-shadow-[0_0_5px_rgba(34,211,238,0.3)] block truncate">
              {currentHash ? truncateHash(currentHash, 14, 10) : '— NO DATA ANCHORED —'}
            </code>
            {hashTimestamp && (
              <div className="flex items-center gap-1.5 mt-1">
                <Clock className="w-3 h-3 text-slate-600" />
                <span className="text-[10px] font-mono text-slate-500">
                  {new Date(hashTimestamp).toLocaleTimeString()}
                </span>
                <span className="text-[10px] text-slate-600 truncate flex-1 block">· {hashFilename}</span>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={hashFileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleHashFile(e.target.files[0])}
          />

          <NeonBtn
            onClick={() => hashFileInputRef.current?.click()}
            loading={isHashing}
          >
            <Database className="w-3.5 h-3.5" />
            Process New Proof
          </NeonBtn>
        </Section>

        {/* ── C: WALLET GATE ──────────────────────────────────────────────── */}
        <Section className="bg-gradient-to-br from-slate-800/40 to-slate-900/40">
          <SectionTitle icon={<Wallet className="w-4 h-4" />} label="Crypto Gate" />

          {!isPhantomInstalled ? (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] text-rose-300 text-center font-bold">
              PHANTOM EXTENSION NOT DETECTED
            </div>
          ) : isConnected && walletAddress ? (
            <AnimatePresence>
              <motion.div
                key="connected"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-2"
              >
                {/* Ripple success visual */}
                <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                  <div className="flex flex-col">
                    <p className="text-[9px] text-emerald-400 font-black uppercase tracking-tighter">Authenticated</p>
                    <code className="text-[11px] font-mono text-emerald-100">
                      {truncateAddress(walletAddress, 8)}
                    </code>
                  </div>
                  <button
                    onClick={disconnect}
                    className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors uppercase font-black"
                  >
                    Revoke
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <NeonBtn onClick={handleConnect} loading={isConnecting}>
              <Zap className="w-3.5 h-3.5" />
              Connect Identity
            </NeonBtn>
          )}
        </Section>

        {/* ── D: STORE ON-CHAIN ──────────────────────────────────────────────── */}
        <Section>
          <SectionTitle
            icon={<Link2 className="w-4 h-4" />}
            label="Blockchain Anchor"
          />

          {/* TX display */}
          {txSignature && (
            <div className="bg-slate-950/40 p-3 rounded-xl border border-emerald-500/20 group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] text-slate-500 font-bold uppercase">TX Signature</span>
                <a
                  href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:rotate-12 transition-transform"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <code className="text-[11px] font-mono text-emerald-400 block truncate">
                {txSignature}
              </code>
            </div>
          )}

          {storeError && (
            <div className="flex items-start gap-2 text-[11px] text-rose-400 bg-rose-500/5 border border-rose-500/20 rounded-xl p-3">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{storeError}</span>
            </div>
          )}

          <NeonBtn
            onClick={handleStore}
            loading={isStoring}
            disabled={!currentHash || !isConnected}
          >
            <Activity className="w-3.5 h-3.5" />
            Anchor to Solana
          </NeonBtn>
        </Section>

        {/* ── E: VERIFY INTEGRITY ────────────────────────────────────────────── */}
        <Section className={verifyResult === 'verified' ? 'border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : ''}>
          <SectionTitle icon={<Shield className="w-4 h-4" />} label="Integrity Shield" />

          <AnimatePresence mode="wait">
            {verifyResult === 'verified' && (
              <motion.div
                key="verified"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-4 gap-2"
              >
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-emerald-400/20 rounded-full"
                  />
                </div>
                <span className="text-sm font-black text-emerald-400 tracking-[0.2em] uppercase">Verified</span>
              </motion.div>
            )}

            {verifyResult === 'tampered' && (
              <motion.div
                key="tampered"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1, x: [0, -4, 4, -4, 4, 0] }}
                exit={{ opacity: 0 }}
                transition={{ x: { duration: 0.4 } }}
                className="flex flex-col items-center py-4 gap-2"
              >
                <ShieldAlert className="w-8 h-8 text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]" />
                <span className="text-xs font-black text-rose-500 tracking-[0.2em] uppercase">Tamper Detected</span>
              </motion.div>
            )}
          </AnimatePresence>

          <NeonBtn
            onClick={handleVerify}
            loading={isVerifying}
            disabled={!currentHash || !storedHash}
            color={verifyResult === 'tampered' ? 'red' : 'purple-green'}
          >
            <Shield className="w-3.5 h-3.5" />
            {isVerifying ? 'Authenticating…' : 'Run Deep Check'}
          </NeonBtn>
        </Section>

        {/* ── STATUS FEED ───────────────────────────────────────── */}
        <Section className="bg-black/20">
          <SectionTitle icon={<Wifi className="w-4 h-4" />} label="Live Activity" />

          <div
            className="h-32 overflow-y-auto font-mono text-[10px] space-y-2 pr-1 custom-scrollbar"
          >
            {logs.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-2 items-start"
              >
                <span className="text-slate-600 flex-shrink-0">{log.time}</span>
                <span className={logColors[log.type]}>{log.message}</span>
              </motion.div>
            ))}
            <div ref={logEndRef} />
          </div>
        </Section>

      </div>
    </motion.div>
  );
};


export default BlockchainIntegrityPanel;
