import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';
import { cn, generateId, formatTimestamp } from '@/lib/utils';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'sys-001',
    role: 'system',
    content: 'Constellation link established. All nodes reporting nominal status.',
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: 'aurora-001',
    role: 'aurora',
    content:
      'Welcome to Cloudbank. I am Aurora, your interface to the constellation. All 6 nodes are reporting — QGIA-CORPUS and QGIA-SPINE indexes are current. What would you like to explore?',
    timestamp: new Date(Date.now() - 240000),
  },
  {
    id: 'user-001',
    role: 'user',
    content: "What's the current state of the constellation?",
    timestamp: new Date(Date.now() - 180000),
  },
  {
    id: 'aurora-002',
    role: 'aurora',
    content:
      'CONSTELLATION-PRIME is operational with 11 QGIA modules and 6 contract schemas active. The knowledge indexes aggregate 14 documents across the corpus and spine. The QSFE forecast engine is ready for scenario submissions. Orion Station maintains reality anchor stability at 99.7%.',
    timestamp: new Date(Date.now() - 120000),
  },
];

const AURORA_RESPONSES = [
  'The QSFE forecast engine can model scenarios across six geopolitical regions with cascade analysis. Navigate to the Forecast view to submit a scenario, or describe what you\'d like to analyze here.',
  'Knowledge indexes show 14 documents spanning theoretical foundations, analytical frameworks, regional expertise, and intelligence methodologies. The corpus was last synchronized 3 minutes ago.',
  'Constellation health metrics are nominal. AURORA-RUNTIME reports 11 MCP tools registered. The reality anchor at Orion Station is stable. No degradation events in the last 24 hours.',
  'I can help with geopolitical analysis, constellation status queries, forecast submissions, or knowledge base exploration. What domain interests you?',
  'The L3 meta-cognitive governance layer — comprising Axiomera, Velatrix, Glyphon, Caelion, and Harmion modules — maintains simulation integrity across all three layers. All modules report green status.',
];

export function AuroraChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const responseIndex = useRef(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate Aurora response
    setTimeout(() => {
      const auroraMessage: ChatMessage = {
        id: generateId(),
        role: 'aurora',
        content: AURORA_RESPONSES[responseIndex.current % AURORA_RESPONSES.length],
        timestamp: new Date(),
      };
      responseIndex.current++;
      setMessages((prev) => [...prev, auroraMessage]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-space-border shrink-0">
        <div className="flex items-center gap-3">
          <Sparkles size={18} className="text-teal" />
          <h1 className="text-sm font-semibold text-space-text">Aurora Interface</h1>
          <span className="text-[10px] font-mono text-space-text-muted px-2 py-0.5 rounded-full bg-space-surface-2 border border-space-border">
            L1 · L2 · L3 ACTIVE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-status-active animate-pulse" />
          <span className="text-[11px] font-mono text-space-text-muted">CONNECTED</span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overscroll-contain px-6 py-4 space-y-4"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={cn(
                'max-w-[720px]',
                msg.role === 'user' ? 'ml-auto' : '',
                msg.role === 'system' ? 'mx-auto max-w-[480px]' : ''
              )}
            >
              {msg.role === 'system' ? (
                <div className="text-center">
                  <span className="text-[11px] font-mono text-space-text-muted bg-space-surface px-3 py-1.5 rounded-full border border-space-border">
                    {msg.content}
                  </span>
                </div>
              ) : (
                <div
                  className={cn(
                    'rounded-xl px-4 py-3',
                    msg.role === 'aurora'
                      ? 'bg-space-surface border border-space-border border-l-2 border-l-teal'
                      : 'bg-plasma/10 border border-plasma/20'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={cn(
                        'text-[11px] font-semibold tracking-wide',
                        msg.role === 'aurora' ? 'text-teal' : 'text-plasma-bright'
                      )}
                    >
                      {msg.role === 'aurora' ? 'AURORA' : 'YOU'}
                    </span>
                    <span className="text-[10px] font-mono text-space-text-muted">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-space-text/90">
                    {msg.content}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-[720px]"
            >
              <div className="bg-space-surface border border-space-border border-l-2 border-l-teal rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-semibold tracking-wide text-teal">AURORA</span>
                </div>
                <div className="flex gap-1.5 py-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-teal"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input area */}
      <div className="border-t border-space-border px-6 py-4 shrink-0">
        <div className="flex gap-3 max-w-[760px]">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Aurora..."
              data-testid="chat-input"
              rows={1}
              className={cn(
                'w-full resize-none bg-space-surface border border-space-border rounded-xl',
                'px-4 py-3 text-[13px] text-space-text placeholder:text-space-text-muted',
                'focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20',
                'transition-colors'
              )}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            data-testid="chat-send"
            className={cn(
              'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all',
              input.trim() && !isTyping
                ? 'bg-teal text-space-bg hover:bg-teal-bright'
                : 'bg-space-surface border border-space-border text-space-text-muted cursor-not-allowed'
            )}
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] text-space-text-muted mt-2 ml-1 font-mono">
          Aurora Chat · Constellation link active · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
