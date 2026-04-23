"use client";

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { DeleteEmailButton } from "@/components/delete-email-button";

type EmailCardProps = {
  id: number;
  subject: string;
  jwt: string;
  fromEmail: string;
  receivedLabel: string;
  displayHtml: string | null;
  displayHtmlWithRemote: string | null;
  displayBody: string;
  otpCode: string | null;
  isForwarded: boolean;
  isHtml: boolean;
  hasLocalCidAssets: boolean;
  hasRemoteImages: boolean;
  isNewest: boolean;
};

export function EmailCard({
  id,
  subject,
  jwt,
  fromEmail,
  receivedLabel,
  displayHtml,
  displayHtmlWithRemote,
  displayBody,
  otpCode,
  isForwarded,
  isHtml,
  hasLocalCidAssets,
  hasRemoteImages,
  isNewest,
}: EmailCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showRemoteImages, setShowRemoteImages] = useState(false);

  const activeHtml = showRemoteImages && displayHtmlWithRemote ? displayHtmlWithRemote : displayHtml;

  return (
    <div className={`rounded-3xl border bg-slate-950/60 p-4 shadow-lg shadow-black/10 ${isNewest ? "border-cyan-400/30" : "border-white/10"}`}>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="truncate text-sm font-semibold text-slate-100 sm:text-[15px]">{subject}</p>
          <div className="flex flex-wrap gap-1.5">
            {isNewest && (
              <span className="inline-flex items-center rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                Terbaru
              </span>
            )}
            {otpCode && (
              <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                OTP {otpCode}
              </span>
            )}
            {isForwarded && (
              <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                Forward
              </span>
            )}
            {isHtml && (
              <span className="inline-flex items-center rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-300">
                HTML
              </span>
            )}
            {hasLocalCidAssets && (
              <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                Asset lokal
              </span>
            )}
            {hasRemoteImages && (
              <span className="inline-flex items-center rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-300">
                Gambar remote diblok
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-1 text-left sm:items-end sm:text-right">
          <p className="max-w-[240px] truncate text-xs text-slate-400">Dari: {fromEmail}</p>
          <div className="text-xs tabular-nums text-slate-500">{receivedLabel}</div>
        </div>
      </div>

      {otpCode && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-amber-400/15 bg-amber-500/10 px-4 py-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-300">Kode OTP</p>
            <p className="mt-1 text-lg font-bold tracking-[0.24em] text-amber-100">{otpCode}</p>
          </div>
          <CopyButton text={otpCode} label="Salin OTP" />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        {activeHtml ? (
          <iframe
            title={subject || `email-${id}`}
            srcDoc={activeHtml}
            sandbox="allow-popups allow-popups-to-escape-sandbox"
            className={`w-full bg-white transition-[height] duration-200 ${expanded ? "h-[36rem]" : "h-[15rem]"}`}
          />
        ) : (
          <div className={`bg-slate-900/90 px-4 py-3 text-sm text-slate-300 ${expanded ? "" : "max-h-56 overflow-hidden"}`}>
            <pre className="whitespace-pre-wrap break-words font-sans">{displayBody}</pre>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <DeleteEmailButton emailId={id} jwt={jwt} />
        {hasRemoteImages && (
          <button
            onClick={() => setShowRemoteImages((value) => !value)}
            className="inline-flex items-center gap-1 rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-xs font-semibold text-sky-200 transition hover:bg-sky-400/20"
          >
            {showRemoteImages ? "Sembunyikan gambar remote" : "Tampilkan gambar remote"}
          </button>
        )}
        <button
          onClick={() => setExpanded((value) => !value)}
          className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-white/20 hover:bg-slate-900"
        >
          {expanded ? "Ringkas" : "Lihat penuh"}
        </button>
      </div>
    </div>
  );
}
