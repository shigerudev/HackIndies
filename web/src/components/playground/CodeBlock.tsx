'use client';

import { useState } from 'react';

type Snippet = { lang: string; label: string; code: string };

type Props = {
  snippets: Snippet[];
};

export function CodeBlock({ snippets }: Props) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(snippets[active].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mt-2 rounded-lg border border-slate-700 bg-slate-950 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-700">
        <div className="flex gap-1">
          {snippets.map((s, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                i === active
                  ? 'bg-cyan-900 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={copy}
          className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
        >
          {copied ? '✓ copied' : 'copy'}
        </button>
      </div>
      <pre className="p-3 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
        {snippets[active].code}
      </pre>
    </div>
  );
}