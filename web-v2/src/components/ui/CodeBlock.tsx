'use client';

import { useState } from 'react';

type Line = { cmd: string; arg: string };

export function CodeBlock({
  lines,
  label,
  copyText,
}: {
  lines: Line[];
  label: string;
  copyText: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="code-block" role="region" aria-label={label}>
      <div className="code-block__head">
        <span>
          <span className="lang">bash</span> · {label}
        </span>
        <button
          type="button"
          className="code-block__copy"
          onClick={onCopy}
          aria-live="polite"
        >
          {copied ? 'Copiado ✓' : 'Copiar'}
        </button>
      </div>
      <pre>
        {lines.map((l, i) => (
          <span key={i}>
            <span className="c">$</span>{' '}
            <span className="k">{l.cmd}</span>{' '}
            <span className="s">{l.arg}</span>
            {'\n'}
          </span>
        ))}
      </pre>
    </div>
  );
}
