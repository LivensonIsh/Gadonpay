"use client";

import { useState } from "react";

export function CopyableSecret({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded border border-amber/30 bg-amber-dim p-3">
      <div className="mb-1 text-xs text-amber">{label} — copie-le maintenant, il ne sera plus jamais affiché</div>
      <div className="flex items-center gap-2">
        <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm text-text">{value}</code>
        <button
          onClick={handleCopy}
          className="shrink-0 rounded border border-border bg-surface px-2 py-1 text-xs text-text hover:border-borderLight"
        >
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
    </div>
  );
}
