'use client';

import { useState, useRef, useEffect } from 'react';
import { askAssistant } from '../lib/api';

export default function ChatWidget({ token }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! Ask me things like \"What did the team work on last week?\" or \"Who has open blockers?\"",
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = async (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || sending) return;

    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');
    setSending(true);

    try {
      const res = await askAssistant(token, { question });
      setMessages((prev) => [...prev, { role: 'assistant', text: res.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `Sorry, I ran into an error: ${err.message}` },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition hover:bg-accent-dark"
        aria-label="Open AI assistant"
      >
        {open ? (
          <span className="text-xl">✕</span>
        ) : (
          <span className="font-display text-lg font-bold">AI</span>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 flex h-[480px] w-[360px] flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
          <div className="rounded-t-2xl bg-accent px-4 py-3 text-white">
            <p className="font-display font-semibold">Team Assistant</p>
            <p className="text-xs text-white/70">Ask about your team's reports</p>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  m.role === 'user'
                    ? 'ml-auto bg-accent text-white'
                    : 'bg-black/5 text-ink'
                }`}
              >
                {m.text}
              </div>
            ))}
            {sending && (
              <div className="max-w-[85%] rounded-xl bg-black/5 px-3 py-2 text-sm text-ink/50">
                Thinking…
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex gap-2 border-t border-black/5 p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}