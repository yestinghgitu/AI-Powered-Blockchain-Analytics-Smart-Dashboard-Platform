import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Sparkles, Zap } from 'lucide-react';
import { aiService } from '../services/aiService';
import { buildChatContext } from '../utils/chatContext';

interface Msg { sender: string; text: string; }

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { sender: 'ai', text: 'Hi! Ask me anything about your business data.' }
  ]);
  const [input, setInput]   = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, isOpen]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const q = input.trim();
    setMessages(p => [...p, { sender: 'user', text: q }]);
    setInput('');
    setTyping(true);

    try {
      const response = await aiService.chat({
        message: q,
        context: buildChatContext()
      });
      const text = response.answer || JSON.stringify(response);
      setMessages(p => [...p, { sender: 'ai', text }]);
    } catch (err: any) {
      setMessages(p => [...p, { sender: 'ai', text: '⚠ ' + err.message }]);
    } finally {
      setTyping(false);
    };
  };

  return (
    <>
      {/* Floating trigger */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="trigger"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(0,255,200,0.5)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00ffc8] to-[#00b3ff] text-black flex items-center justify-center shadow-[0_0_25px_rgba(0,255,200,0.4)] z-50"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="window"
            initial={{ opacity: 0, scale: 0.85, y: 30, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="fixed bottom-8 right-8 w-[380px] h-[560px] flex flex-col z-50 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.6)] border border-white/[0.08]"
            style={{ background: 'rgba(6, 10, 26, 0.97)', backdropFilter: 'blur(24px)' }}
          >
            {/* Header */}
            <div className="relative px-5 py-4 border-b border-white/[0.06] flex items-center justify-between overflow-hidden">
              {/* glow orb */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#00ffc8]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center space-x-3 relative z-10">
                <div className="w-9 h-9 rounded-xl bg-[#00ffc8]/10 border border-[#00ffc8]/20 flex items-center justify-center shadow-[0_0_12px_rgba(0,255,200,0.2)]">
                  <Bot className="w-5 h-5 text-[#00ffc8]" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm tracking-wide">CryptoIQ</h3>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_5px_rgba(52,211,153,0.8)] animate-pulse" />
                    <span className="text-[10px] text-gray-500 font-mono">Always online CryptoIQ</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="relative z-10 w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'ai' && (
                    <div className="w-6 h-6 rounded-lg bg-[#00ffc8]/10 border border-[#00ffc8]/20 flex-shrink-0 flex items-center justify-center mr-2 mt-1">
                      <Zap className="w-3 h-3 text-[#00ffc8]" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-br from-purple-600/80 to-indigo-700/80 text-white rounded-tr-sm border border-purple-500/20'
                      : 'bg-white/[0.05] border border-white/[0.08] text-gray-200 rounded-tl-sm'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing dots */}
              <AnimatePresence>
                {typing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start items-end gap-2"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#00ffc8]/10 border border-[#00ffc8]/20 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-[#00ffc8] animate-spin" />
                    </div>
                    <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-3 flex space-x-1.5 items-center">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="typing-dot w-1.5 h-1.5 rounded-full bg-[#00ffc8]" style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={endRef} />
            </div>

            {/* Input */}
            <form onSubmit={send} className="p-3 border-t border-white/[0.06] bg-black/20 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask anything…"
                className="flex-1 bg-white/[0.04] border border-white/[0.08] focus:border-[#00ffc8]/40 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none transition-all"
              />
              <motion.button
                whileHover={input.trim() ? { scale: 1.08, boxShadow: '0 0 18px rgba(0,255,200,0.4)' } : {}}
                whileTap={input.trim() ? { scale: 0.92 } : {}}
                type="submit"
                disabled={!input.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ffc8] to-[#00b3ff] text-black flex items-center justify-center disabled:opacity-30 transition-all shadow-[0_0_15px_rgba(0,255,200,0.25)]"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChat;
