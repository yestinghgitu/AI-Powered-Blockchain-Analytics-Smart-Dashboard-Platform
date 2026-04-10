import React, { useState, useEffect } from 'react';
import BlockchainIntegrityPanel from './components/blockchain/BlockchainIntegrityPanel';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './pages/Dashboard';
import UploadData from './pages/UploadData';
import ChatUI from './pages/ChatUI';
import Insights from './pages/Insights';
import History from './pages/History';
import AuthGate from './components/AuthGate';
import FloatingChat from './components/FloatingChat';
import { 
  LogOut, Shield, ChevronDown, User, Activity, 
  Settings, Grid, Bell, Search, Hexagon, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore } from './store/useWalletStore';
import { truncateAddress } from './hooks/useSolanaIntegrity';

// Light Theme SaaS Base

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [userDisplayName, setUserDisplayName] = useState('USER');
  const { 
    walletAddress, 
    isConnected, 
    isConnecting, 
    connect, 
    disconnect, 
    checkInstallation 
  } = useWalletStore();

  useEffect(() => {
    checkInstallation();
    
    const token = localStorage.getItem('token');
    if (token) {
      setAuthenticated(true);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload?.user?.role) setUserRole(payload.user.role);
        if (payload?.user?.email) {
          const namePrefix = payload.user.email.split('@')[0];
          setUserDisplayName(namePrefix.toUpperCase());
        }
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthenticated(false);
    setUserRole('user');
  };

  if (!authenticated) {
    return <AuthGate onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <Router>
      <div className="grid h-screen w-full overflow-hidden bg-transparent text-slate-100 font-sans grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
        
        <div className="col-start-1 row-[1/-1] relative z-40 h-full">
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        </div>
        
        {/* Compact Single-Row Header */}
        <header className="col-start-2 row-start-1 h-14 px-4 md:px-6 flex items-center justify-between z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/60 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          {/* Branding */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <div className="w-1.5 h-3.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
              <div className="w-1.5 h-2 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-white leading-none">
                AI <span className="text-cyan-400">Business Intelligence</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase mt-0.5">on Solana Blockchain</p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Profile pill */}
            <div 
              onClick={isConnected ? disconnect : undefined}
              className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/10 transition-all"
            >
              <div className="w-6 h-6 rounded-full border border-cyan-400/60 bg-slate-900 flex items-center justify-center">
                <User className="w-3 h-3 text-cyan-400" />
              </div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {isConnected && walletAddress ? truncateAddress(walletAddress, 4) : userDisplayName}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </div>

            {/* Wallet / Status */}
            {!isConnected ? (
              <div className="flex flex-col items-end gap-1">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={connect}
                  disabled={isConnecting}
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-1.5 rounded-full shadow-lg font-bold tracking-widest uppercase text-xs transition-all disabled:opacity-50"
                >
                  {isConnecting ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                  <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                </motion.button>
                {useWalletStore.getState().error && (
                  <span className="text-[9px] text-rose-400 font-bold uppercase tracking-tighter">
                    {useWalletStore.getState().error}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-full">
                  <div className="relative flex-shrink-0">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]" />
                    <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-60" />
                  </div>
                  <span className="text-xs font-black text-emerald-300 tracking-widest uppercase">Secured</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div 
                  onClick={disconnect}
                  className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 rounded-full cursor-pointer hover:border-indigo-400 transition-all"
                >
                  <span className="text-xs font-mono font-bold text-indigo-300">CONNECTED</span>
                  <Settings className="w-3 h-3 text-indigo-400" />
                </div>
              </div>
            )}
          </div>
        </header>


        <main className="col-start-2 row-start-2 overflow-hidden relative min-w-0 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 px-4 lg:px-5 py-4 lg:py-5 w-full max-w-[1600px] mx-auto h-full min-h-0">
            {/* Routes area — scrollable */}
            <div className="lg:col-span-8 flex flex-col min-w-0 overflow-y-auto custom-scrollbar min-h-0">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/"        element={<Dashboard />} />
                  <Route path="/insights" element={<Insights />} />
                  <Route path="/upload"  element={<UploadData />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/chat"    element={<ChatUI />} />
                </Routes>
              </AnimatePresence>
            </div>
            {/* Blockchain Integrity Panel — right sticky column */}
            <div className="lg:col-span-4 flex flex-col h-full min-w-0 overflow-y-auto custom-scrollbar relative">
              <BlockchainIntegrityPanel />
            </div>
          </div>
        </main>
          
        <FloatingChat />
      </div>
    </Router>
  );
}


export default App;
