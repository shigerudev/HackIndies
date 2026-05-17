'use client';

import { FormEvent, useState } from 'react';
import { API_URL } from '@/lib/api';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export function CitizenChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const useStream = true;
      const res = await fetch(
        `${API_URL}/api/agent/chat${useStream ? '?stream=true' : ''}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(useStream ? { Accept: 'text/event-stream' } : {}),
          },
          body: JSON.stringify({ messages: next }),
        },
      );

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(errBody || `HTTP ${res.status}`);
      }

      if (useStream && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistant = '';
        setMessages([...next, { role: 'assistant', content: '' }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === '[DONE]') continue;
            try {
              const parsed = JSON.parse(payload) as {
                type?: string;
                delta?: string;
                textDelta?: string;
              };
              const part =
                parsed.delta ?? parsed.textDelta ??
                (parsed.type === 'text-delta' ? (parsed as { delta?: string }).delta : '');
              if (typeof part === 'string') assistant += part;
            } catch {
              /* ignore non-json lines */
            }
          }
          setMessages([...next, { role: 'assistant', content: assistant }]);
        }
        if (!assistant) {
          const json = await fetch(`${API_URL}/api/agent/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: next }),
          }).then((r) => r.json());
          setMessages([...next, { role: 'assistant', content: json.content }]);
        }
      } else {
        const json = (await res.json()) as { content: string };
        setMessages([...next, { role: 'assistant', content: json.content }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de chat');
      setMessages(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[420px] flex-col rounded-lg border border-slate-700 bg-slate-900/50">
      <div className="border-b border-slate-700 px-4 py-2 text-sm font-medium text-cyan-400">
        Chat ciudadano
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-slate-500">
            Preguntá sobre qué hacer si tu correo apareció en una brecha (sin datos personales).
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-sm ${m.role === 'user' ? 'text-cyan-100' : 'text-slate-300'}`}
          >
            <span className="text-xs font-medium uppercase text-slate-500">{m.role}: </span>
            {m.content}
          </div>
        ))}
        {loading && <p className="text-xs text-slate-500">Escribiendo…</p>}
        {error && <p className="text-sm text-red-300">{error}</p>}
      </div>
      <form className="flex gap-2 border-t border-slate-700 p-3" onSubmit={onSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded border border-slate-600 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-cyan-600"
          placeholder="Tu pregunta…"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-cyan-700 px-4 py-2 text-sm text-white hover:bg-cyan-600 disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
