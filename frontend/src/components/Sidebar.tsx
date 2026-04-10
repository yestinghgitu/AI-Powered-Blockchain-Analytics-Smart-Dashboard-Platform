import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, PieChart, History, Database, 
  ChevronLeft, ChevronRight, MessageSquare, Cpu, 
  Settings, Shield, Zap, Activity, Hexagon,
  Orbit, Globe, Cpu as CpuIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) => {
  const [nodeUp, setNodeUp] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        const r = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/health');
        if (alive) setNodeUp(r.ok);
      } catch { if (alive) setNodeUp(false); }
    };
    check();
    const id = setInterval(check, 30_000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/',        icon: LayoutDashboard, color: '#22d3ee' },
    { name: 'Insights',  path: '/insights', icon: Zap,             color: '#818cf8' },
    { name: 'Datasets',  path: '/upload',   icon: Database,        color: '#fbbf24' },
    { name: 'History',   path: '/history',  icon: History,         color: '#f472b6' },
    { name: 'AI Assistant', path: '/chat',  icon: MessageSquare,   color: '#34d399' },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isOpen ? '240px' : '72px' }}
      className={`hidden md:flex flex-col h-screen relative z-40 transition-all duration-500 bg-[#0b1220] border-r border-white/10 shadow-[20px_0_40px_rgba(0,0,0,0.5)]`}
    >
      {/* Background Glass Layer */}
      <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl pointer-events-none" />

      {/* Brand logo section */}
      <div className="relative p-5 mb-4 border-b border-white/5 flex items-center justify-center overflow-hidden">
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl" />
        <div className="flex flex-col items-center justify-center relative z-10">
            <div className="flex items-center gap-2">
               <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-cyan-400"
                  />
               </div>
               <h1 className="text-sm font-black tracking-[0.2em] text-white uppercase flex items-center gap-2">
                  CRYPTO<span className="text-cyan-400 font-extrabold">IQ</span>
               </h1>
            </div>
            {isOpen && (
               <motion.span 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="text-[9px] text-slate-500 font-black tracking-[0.4em] uppercase mt-1.5"
               >
                 Neural System v1.2
               </motion.span>
            )}
        </div>
      </div>
      
      {/* Navigation section */}
      <nav className="relative flex-1 px-3 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center ${isOpen ? 'justify-start px-4' : 'justify-center px-0'} py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isActive 
                ? 'text-white' 
                : 'text-slate-400 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active Gradient Background */}
                {isActive && (
                  <motion.div 
                    layoutId="activeBg"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-purple-500/20 border-l border-cyan-400 transition-all duration-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}

                {/* Hover Glass Effect */}
                {!isActive && (
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.05] transition-colors duration-300" />
                )}

                <item.icon 
                  className={`w-4 h-4 transition-all duration-300 relative z-10 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_#22d3ee]' : 'group-hover:scale-110'}`} 
                />
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="ml-4 text-[11px] font-black tracking-[0.1em] uppercase relative z-10"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Active Indicator Glow */}
                {isActive && (
                  <motion.div 
                    layoutId="navGlow"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-cyan-400 shadow-[0_0_15px_#22d3ee]"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Connection status footer section */}
      <div className="relative p-4 mt-auto border-t border-white/5">
         <div className={`p-3.5 rounded-2xl bg-slate-950/40 border border-white/5 flex flex-col ${isOpen ? 'items-start' : 'items-center'} transition-all hover:bg-slate-900/60 group`}>
            <div className="flex items-center space-x-3">
               <div className="relative">
                  <div className={`w-2 h-2 rounded-full ${nodeUp ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'}`} />
                  {nodeUp && <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-60" />}
               </div>
               {isOpen && (
                 <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest leading-none">
                    {nodeUp ? 'Node Linked' : 'Link Failed'}
                 </span>
               )}
            </div>
            
            {isOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 flex flex-col gap-1 w-full"
              >
                 <div className="flex items-center justify-between text-[8px] font-mono text-slate-600 uppercase tracking-tighter">
                    <span>latency</span>
                    <span className="text-emerald-500/60">12ms</span>
                 </div>
                 <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-white/[0.02]">
                    <motion.div 
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"
                    />
                 </div>
              </motion.div>
            )}
         </div>

         {/* Collapse Toggle Button (optional style) */}
         <button 
           onClick={() => setIsOpen(!isOpen)}
           className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#0b1220] border border-white/10 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-all shadow-xl z-50 cursor-pointer hover:border-cyan-500/50"
         >
           {isOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
         </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
