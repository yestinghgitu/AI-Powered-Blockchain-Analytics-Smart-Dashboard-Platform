import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Loader2, Zap, Shield, Key, ChevronRight, Hexagon, Activity, AlertCircle } from 'lucide-react';

interface Props {
  onAuthenticated: () => void;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AuthGate: React.FC<Props> = ({ onAuthenticated }) => {
  const [mode, setMode]       = useState<'login' | 'register'>('login');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const url = mode === 'login'
        ? `${API}/admin/login`
        : `${API}/admin/register`;
      const res = await axios.post(url, { email, password });
      localStorage.setItem('token', res.data.token);
      onAuthenticated();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Authentication Segment Failure');
    } finally {
      setLoading(false);
    }
  };

  // DevLogin removed for production security

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden font-sans">
      
      {/* Background Matrix Effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#3b82f6]/10 rounded-full blur-[120px] animate-pulse" />
         <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#00ffc8]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
         <div className="absolute inset-0 opacity-10" 
              style={{ backgroundImage: 'radial-gradient(circle, rgba(0, 255, 200, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-lg z-10"
      >
        {/* Branding header */}
        <div className="text-center mb-12 relative">
           <motion.div
             animate={{ rotate: 360 }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="absolute left-1/2 top-4 -translate-x-1/2 w-48 h-48 border border-dashed border-[#00ffc8]/10 rounded-full pointer-events-none"
           />
           <div className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] bg-white/[0.03] border border-white/10 mb-6 shadow-2xl relative group">
              <div className="absolute inset-0 bg-[#00ffc8]/10 rounded-[28px] blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <Hexagon className="w-10 h-10 text-[#00ffc8] fill-[#00ffc8]/10 relative z-10" />
           </div>
           <h1 className="text-5xl font-black text-white tracking-tighter uppercase">
              NEXUS <span className="gradient-text-cyan">OS</span>
           </h1>
           <div className="flex items-center justify-center space-x-3 mt-3">
              <Activity className="w-3.5 h-3.5 text-gray-500 animate-pulse" />
              <span className="text-gray-500 text-[10px] font-mono tracking-[0.4em] uppercase">Security Protocol v4.0.2</span>
           </div>
        </div>

        {/* Authentication Matrix Card */}
        <div className="glass rounded-[40px] p-10 border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.6)] relative overflow-hidden group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#00ffc8]/60 to-transparent" />
          
          {/* Mode Selector */}
          <div className="flex bg-black/40 border border-white/5 rounded-2xl p-1.5 mb-10">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-[0.2em] transition-all rounded-xl ${
                  mode === m
                    ? 'bg-white/5 text-white shadow-xl border border-white/10'
                    : 'text-gray-600 hover:text-gray-400 hover:bg-white/[0.02]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div className="relative group/field">
               <label className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em] mb-2 px-1 block flex items-center gap-2">
                  <Shield className="w-3 h-3" /> Identity Signature
               </label>
               <input
                 type="email"
                 value={email}
                 onChange={e => setEmail(e.target.value)}
                 placeholder="ID@CORE.NEXUS"
                 required
                 className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-700 outline-none focus:border-[#00ffc8]/50 focus:bg-black/60 transition-all font-mono text-sm tracking-wide"
               />
            </div>

            <div className="relative group/field">
               <label className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em] mb-2 px-1 block flex items-center gap-2">
                  <Key className="w-3 h-3" /> Access Cipher
               </label>
               <input
                 type="password"
                 value={password}
                 onChange={e => setPassword(e.target.value)}
                 placeholder="••••••••"
                 required
                 className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-700 outline-none focus:border-[#00ffc8]/50 focus:bg-black/60 transition-all font-mono text-sm tracking-wide"
               />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center space-x-3 bg-red-500/5 border border-red-500/10 rounded-2xl px-6 py-3 text-red-500 text-[10px] font-mono tracking-widest uppercase"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(0,255,200,0.3)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.4em] transition-all shadow-2xl flex items-center justify-center gap-3
                ${loading ? 'bg-white/5 text-gray-500' : 'bg-gradient-to-r from-[#00ffc8] to-[#00b3ff] text-black'}`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : mode === 'login' ? (
                <><LogIn className="w-5 h-5" /><span>Initialize Session</span></>
              ) : (
                <><UserPlus className="w-5 h-5" /><span>Register Entity</span></>
              )}
            </motion.button>
          </form>

          {/* System Access Protocol */}
        </div>

        {/* Global Footer info */}
        <div className="mt-12 flex items-center justify-center space-x-8 text-[9px] text-gray-700 font-mono font-bold tracking-[0.2em] uppercase">
           <span className="flex items-center gap-2 focus:text-white"><Shield className="w-3 h-3" /> FIPS_140-2</span>
           <span className="flex items-center gap-2"><Activity className="w-3 h-3" /> RT_SYNC_ENABLED</span>
           <span className="flex items-center gap-2">BLOCK_HEIGHT=20,105,482</span>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthGate;
