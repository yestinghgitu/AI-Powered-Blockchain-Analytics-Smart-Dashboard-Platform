import React, { useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { aiService } from '../../services/aiService';
import { buildChatContext } from '../../utils/chatContext';

export const AIAssistantCard = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  const handleAskAI = async () => {
    if (!query) return;
    setLoading(true);
    setInsight(null);
    
    try {
      const response = await aiService.chat({
        message: query,
        context: buildChatContext()
      });
      
      setInsight(response.answer);
    } catch (error: any) {
      if (error.message?.includes('401') || error.message?.includes('authenticated')) {
        setInsight("⚠️ Session expired. Please reconnect to continue.");
      } else {
        setInsight("Connecting to neural core failed. System retrying...");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden p-4 lg:p-5 flex flex-col h-full gap-5 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
      <div className="flex items-center gap-2.5">
        <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
          <Bot className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
        </div>
        <h3 className="text-xs font-black text-white uppercase tracking-widest">Neural Link</h3>
      </div>
      
      <div className="flex-1 bg-slate-900/60 rounded-xl p-3.5 border border-white/5 overflow-y-auto max-h-40 lg:max-h-48 relative custom-scrollbar shadow-inner">
        <AnimatePresence mode="wait">
          {!loading && !insight && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] font-bold text-slate-500 text-center mt-6 uppercase tracking-[0.2em]">
              Awaiting query...
            </motion.div>
          )}
          
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center space-x-2 text-cyan-400 text-[10px] font-black tracking-widest uppercase mt-6 justify-center drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Processing</span>
              <div className="flex space-x-0.5 ml-1">
                <span className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
                <span className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-75" />
              </div>
            </motion.div>
          )}

          {insight && !loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-slate-200 bg-white/[0.03] p-3 rounded-lg border border-white/5 leading-relaxed backdrop-blur-md">
              {insight}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
           <span onClick={() => setQuery("Any anomalies?")} className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-1 rounded-full cursor-pointer hover:bg-cyan-500/20 transition-all font-black uppercase tracking-wider">Anomalies</span>
           <span onClick={() => setQuery("Revenue forecast?")} className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700/50 px-2 py-1 rounded-full cursor-pointer hover:bg-slate-700 hover:text-white transition-all font-black uppercase tracking-wider">Forecast</span>
        </div>

        <div className="flex items-center bg-slate-950/40 border border-white/10 rounded-xl px-2 py-0.5 focus-within:border-cyan-400/50 transition-all">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
            placeholder="SYSTEM QUERY..."
            className="flex-1 py-2 px-1 text-[10px] font-bold text-white uppercase tracking-widest outline-none bg-transparent placeholder-slate-700"
          />
          <button 
            onClick={handleAskAI} 
            disabled={!query || loading} 
            className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 disabled:opacity-30 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
