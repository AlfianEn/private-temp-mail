"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Salin" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-semibold shadow-sm shadow-black/10 transition-all duration-200 active:scale-95 sm:w-auto ${
        copied
          ? "border-green-400/30 bg-green-400/15 text-green-300"
          : "border-cyan-400/20 bg-cyan-400/10 text-cyan-200 hover:border-cyan-400/30 hover:bg-cyan-400/20"
      }`}
    >
      {copied ? (
        <>
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          Tersalin
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          {label}
        </>
      )}
    </button>
  );
}
