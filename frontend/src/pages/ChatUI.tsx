import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../services/aiService';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Zap, ChevronDown } from 'lucide-react';
import { buildChatContext } from '../utils/chatContext';

interface Message {
  sender: string;
  text: string;
  insights?: string[];
  ts?: string;
}

const SUGGESTED = [
  'What is my top-selling product?',
  'Show revenue trends this month',
  'Are there any anomalies detected?',
  'What is the next period revenue forecast?',
];

const TypingIndicator = () => (
  <div className="flex items-center space-x-1.5 px-4 py-3">
    {[0, 1, 2].map(i => (
      <span
        key={i}
        className="typing-dot w-2 h-2 rounded-full bg-[#00ffc8]"
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
  </div>
);

const ChatUI = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Hello! I am CryptoIQ — your business intelligence assistant. Ask me anything about your revenue forecasts, sales trends, or anomalies.',
      ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const send = async (question: string) => {
    if (!question.trim()) return;
    setShowSuggestions(false);

    const userMsg: Message = {
      sender: 'user',
      text: question,
      ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const data = await aiService.chat({
        message: question,
        context: buildChatContext()
      });
      let text = data.answer || JSON.stringify(data);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text,
        insights: (data as any).insights || [],
        ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch (err: any) {
      let errorMsg = '⚠ Service Disconnected: ' + (err.message || 'Unknown error');
      if (err.message?.includes('401') || err.message?.includes('authenticated')) {
        errorMsg = '⚠️ It looks like your session is not authenticated.\n\nPlease refresh the page or reconnect to continue using CryptoIQ.\n\nIf the issue persists, try logging in again or contact support.';
      }
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: errorMsg,
        ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); send(input); };

  return (
    <div className="max-w-4xl mx-auto h-[88vh] flex flex-col relative z-10">

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00ffc8]/20 to-[#00b3ff]/20 border border-[#00ffc8]/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,200,0.2)]">
              <Bot className="w-6 h-6 text-[#00ffc8]" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#020617] shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight">
              AI <span className="gradient-text-cyan">Assistant</span>
            </h1>
            <p className="text-[10px] text-[#00ffc8]/50 font-mono tracking-[0.2em] uppercase mt-0.5">
              CryptoIQ · Integrated Neural Logic
            </p>
          </div>
        </div>
      </motion.header>

      {/* Chat Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1 flex flex-col bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] min-h-0"
      >
        {/* Chat Top Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-[#00ffc8]/[0.03]">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1.5">
              {['#ff5f57', '#febc2e', '#28c840'].map(c => (
                <span key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
              ))}
            </div>
            <span className="text-xs text-gray-500 font-mono">cryptoiq://ai-chat</span>
          </div>
          <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="text-xs text-emerald-400 font-mono font-semibold">LLM ONLINE</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4.5 lg:p-5 space-y-4 min-h-0">

          {/* Suggestion chips */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-2"
              >
                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-3">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED.map(q => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#00ffc8]/5 border border-[#00ffc8]/15 text-[#00ffc8]/70 hover:bg-[#00ffc8]/10 hover:border-[#00ffc8]/30 hover:text-[#00ffc8] transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center border ${
                  msg.sender === 'ai'
                    ? 'bg-[#00ffc8]/10 border-[#00ffc8]/20 text-[#00ffc8]'
                    : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                }`}>
                  {msg.sender === 'ai'
                    ? <Bot className="w-4 h-4" />
                    : <User className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-purple-600/80 to-indigo-600/80 text-white rounded-tr-sm border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                      : 'bg-white/[0.05] border border-white/[0.08] text-gray-200 rounded-tl-sm backdrop-blur-sm'
                  }`}>
                    {msg.text}

                    {/* Insights chips */}
                    {msg.sender === 'ai' && msg.insights && msg.insights.length > 0 && (
                      <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
                        {msg.insights.map((ins, i) => (
                          <div key={i} className="flex items-center space-x-2 text-xs bg-[#00ffc8]/5 border border-[#00ffc8]/15 text-[#00ffc8]/80 px-3 py-1.5 rounded-lg font-mono">
                            <Zap className="w-3 h-3 flex-shrink-0 text-[#00ffc8]" />
                            <span>{ins}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.ts && (
                    <p className={`text-[10px] text-gray-600 font-mono mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.ts}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex justify-start"
              >
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#00ffc8]/10 border border-[#00ffc8]/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-[#00ffc8] animate-spin" />
                  </div>
                  <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl rounded-tl-sm shadow-[0_0_15px_rgba(0,255,200,0.05)]">
                    <TypingIndicator />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/[0.06] bg-black/20">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Query your business intelligence…"
                disabled={isTyping}
                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#00ffc8]/40 focus:bg-white/[0.07] rounded-xl px-4 py-2.5 text-white text-xs placeholder-gray-600 outline-none transition-all duration-200 shadow-inner disabled:opacity-50"
              />
            </div>
            <motion.button
              whileHover={input.trim() && !isTyping ? { scale: 1.08, boxShadow: '0 0 25px rgba(0,255,200,0.4)' } : {}}
              whileTap={input.trim() && !isTyping ? { scale: 0.94 } : {}}
              type="submit"
              disabled={!input.trim() || isTyping}
              className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ffc8] to-[#00b3ff] text-black flex items-center justify-center shadow-[0_0_15px_rgba(0,255,200,0.3)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </form>
          <p className="text-[10px] text-gray-600 font-mono mt-2 text-center">
            Context-aware · Powered by Groq Llama3 · Hits /api/ask-ai
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatUI;
