"use client";

import { useState } from "react";

type EmailCardProps = {
  id: number;
  subject: string;
  fromEmail: string;
  receivedLabel: string;
  displayHtml: string | null;
  displayBody: string;
  isForwarded: boolean;
  isHtml: boolean;
  hasLocalCidAssets: boolean;
  hasRemoteImages: boolean;
  isNewest: boolean;
};

export function EmailCard({
  id,
  subject,
  fromEmail,
  receivedLabel,
  displayHtml,
  displayBody,
  isForwarded,
  isHtml,
  hasLocalCidAssets,
  hasRemoteImages,
  isNewest,
}: EmailCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-2xl border bg-black/20 p-4 ${isNewest ? "border-cyan-400/30" : "border-white/10"}`}>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-slate-100">{subject}</p>
          {isNewest && (
            <span className="inline-flex items-center rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
              Terbaru
            </span>
          )}
          {isForwarded && (
            <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
              Forwarded
            </span>
          )}
          {isHtml && (
            <span className="inline-flex items-center rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-300">
              HTML
            </span>
          )}
          {hasLocalCidAssets && (
            <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
              CID lokal
            </span>
          )}
          {hasRemoteImages && (
            <span className="inline-flex items-center rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-300">
              Remote image diblok
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-slate-400">Dari: {fromEmail}</p>
          <div className="text-xs tabular-nums text-slate-500">{receivedLabel}</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white">
        {displayHtml ? (
          <iframe
            title={subject || `email-${id}`}
            srcDoc={displayHtml}
            sandbox="allow-popups allow-popups-to-escape-sandbox"
            className={`w-full bg-white transition-[height] duration-200 ${expanded ? "h-[36rem]" : "h-[14rem]"}`}
          />
        ) : (
          <div className={`bg-slate-900/80 px-4 py-3 text-sm text-slate-300 ${expanded ? "" : "max-h-56 overflow-hidden"}`}>
            <pre className="whitespace-pre-wrap break-words font-sans">{displayBody}</pre>
          </div>
        )}
      </div>

      <div className="mt-3 flex justify-end">
        <button
          onClick={() => setExpanded((value) => !value)}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
        >
          {expanded ? "Ringkas" : "Lihat penuh"}
        </button>
      </div>
    </div>
  );
}
