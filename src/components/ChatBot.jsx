import { useMemo, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { askDashboardAssistant, isQuestionInScope } from '../services/aiService';

const STORAGE_KEY = 'iss-chat-history';
const LIMIT = 30;

function getInitialHistory() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function ChatBot({ currentIss, currentSpeed, headlines }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState(getInitialHistory);

  const context = useMemo(
    () => ({
      iss: {
        latitude: currentIss?.lat ?? null,
        longitude: currentIss?.lon ?? null,
        speedKmh: Number(currentSpeed.toFixed(2)),
      },
      headlines: headlines.slice(0, 10),
    }),
    [currentIss, currentSpeed, headlines],
  );

  const saveHistory = (next) => {
    const trimmed = next.slice(-LIMIT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    setMessages(trimmed);
  };

  const handleSend = async () => {
    const question = input.trim();
    if (!question || typing) return;

    const userMsg = { role: 'user', content: question };
    const nextMessages = [...messages, userMsg].slice(-LIMIT);
    saveHistory(nextMessages);
    setInput('');

    if (!isQuestionInScope(question, context)) {
      const blocked = {
        role: 'assistant',
        content:
          'I can only answer based on this dashboard data: ISS latitude/longitude, ISS speed, and fetched news headlines.',
      };
      saveHistory([...nextMessages, blocked]);
      return;
    }

    setTyping(true);
    try {
      const reply = await askDashboardAssistant(nextMessages, context);
      saveHistory([...nextMessages, { role: 'assistant', content: reply }]);
    } catch {
      saveHistory([
        ...nextMessages,
        {
          role: 'assistant',
          content: 'I could not reach the AI service right now. Please try again.',
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[999]">
      {open ? (
        <div className="glass-card flex h-[420px] w-[min(90vw,360px)] flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
            <h3 className="text-sm font-semibold">Dashboard Assistant</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 hover:bg-black/10 dark:hover:bg-white/10"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {messages.length === 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Ask about ISS coordinates, speed, or fetched headlines.
              </p>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'ml-auto bg-indigo-500/20 text-indigo-100'
                    : 'mr-auto bg-black/10 dark:bg-white/10'
                }`}
              >
                {msg.content}
              </div>
            ))}

            {typing && (
              <div className="mr-auto inline-flex items-center gap-1 rounded-lg bg-black/10 px-3 py-2 dark:bg-white/10">
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-400" />
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-2">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask from dashboard data only..."
                className="w-full rounded-lg border border-slate-500/30 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
              <button
                type="button"
                onClick={handleSend}
                className="rounded-lg bg-indigo-500 p-2 text-white hover:bg-indigo-400"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="glow-primary rounded-full bg-indigo-500 p-4 text-white shadow-lg hover:bg-indigo-400"
          aria-label="Open assistant chat"
        >
          <MessageCircle size={20} />
        </button>
      )}
    </div>
  );
}
