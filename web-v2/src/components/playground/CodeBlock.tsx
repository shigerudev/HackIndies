'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

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
    <div className="code-block">
      <div className="code-block__head">
        <span className="lang">{snippets[active].label}</span>
        <button
          type="button"
          onClick={copy}
          className="code-block__copy"
          aria-label="Copiar código"
        >
          {copied ? (
            <span className="flex items-center gap-1">
              <Check size={12} /> copied
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Copy size={12} /> copy
            </span>
          )}
        </button>
      </div>
      <pre>{snippets[active].code}</pre>
    </div>
  );
}