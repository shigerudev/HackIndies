'use client';

import { FormEvent, useState } from 'react';
import { API_URL } from '@/lib/api';
import { cn } from '@/lib/utils';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export type CitizenChatProps = {
  variant?: 'standalone' | 'dashboard';
};

export function CitizenChat({ variant = 'standalone' }: CitizenChatProps) {
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
          const json = (await fetch(`${API_URL}/api/agent/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: next }),
          }).then((r) => r.json())) as { content?: string };
          const content =
            typeof json.content === 'string' && json.content.trim()
              ? json.content
              : 'Sin respuesta de texto.';
          setMessages([...next, { role: 'assistant', content }]);
        }
      } else {
        const json = (await res.json()) as { content?: string };
        setMessages([
          ...next,
          {
            role: 'assistant',
            content: typeof json.content === 'string' ? json.content : 'Sin contenido.',
          },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de chat');
      setMessages(next);
    } finally {
      setLoading(false);
    }
  }

  const dash = variant === 'dashboard';

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border overflow-hidden',
        dash ? 'min-h-[420px] h-[460px] border-white/[0.08] bg-white/[0.03]' : 'h-[420px] rounded-lg border-slate-700 bg-slate-900/50',
      )}
    >
      <div
        className={cn(
          'border-b px-4 py-3 text-[13px] font-medium shrink-0',
          dash ? 'border-white/[0.06] text-white/80' : 'border-slate-700 text-cyan-400',
        )}
      >
        Asistente ciudadano
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4 min-h-0">
        {messages.length === 0 && (
          <p className={cn('text-[13px]', dash ? 'text-white/38' : 'text-slate-500')}>
            Pregunta qué hacer si tu correo pudo aparecer en una brecha o cómo endurecer cuentas. No compartimos
            contraseñas ni datos privados aquí.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              'text-[13px] leading-relaxed',
              m.role === 'user'
                ? dash ? 'text-white/90' : 'text-cyan-100'
                : dash ? 'text-white/62' : 'text-slate-300',
            )}
          >
            <span className={cn('text-[10px] font-semibold uppercase tracking-wider', dash ? 'text-white/35' : 'text-slate-500')}>
              {m.role === 'user' ? 'Tú ' : 'Asistente '}
            </span>
            <span>{m.content}</span>
          </div>
        ))}
        {loading && <p className={cn('text-[11px]', dash ? 'text-white/40' : 'text-slate-500')}>Escribiendo…</p>}
        {error && <p className="text-[13px] text-red-300/95">{error}</p>}
      </div>
      <form
        className={cn('flex gap-2 border-t p-3 shrink-0', dash ? 'border-white/[0.06]' : 'border-slate-700')}
        onSubmit={onSubmit}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={cn(
            'flex-1 rounded-xl px-3 py-2.5 text-[13px] outline-none transition-colors placeholder:text-white/22',
            dash
              ? 'border border-white/[0.1] bg-white/[0.04] text-white focus:border-white/[0.22]'
              : 'rounded border border-slate-600 bg-slate-950 text-slate-100 focus:border-cyan-600 placeholder:text-slate-600',
          )}
          placeholder="Tu pregunta…"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className={cn(
            'rounded-xl px-4 py-2.5 text-[12px] font-semibold disabled:opacity-45 transition-colors',
            dash ? 'bg-white text-black hover:bg-white/92' : 'rounded bg-cyan-700 px-4 py-2 text-sm text-white hover:bg-cyan-600',
          )}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
