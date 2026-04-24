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
    <div className={`rounded-3xl border bg-slate-950/60 p-4 shadow-lg shadow-black/10 transition-colors sm:p-5 ${isNewest ? "border-cyan-400/30" : "border-white/10"}`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-[-0.01em] text-slate-100 sm:text-base">{subject}</p>
            <div className="shrink-0 sm:hidden">
              <DeleteEmailButton emailId={id} jwt={jwt} subject={subject} />
            </div>
          </div>
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
        <div className="flex shrink-0 flex-col items-start gap-1.5 text-left sm:items-end sm:text-right">
          <p className="max-w-[240px] truncate text-xs leading-5 text-slate-400">Dari: {fromEmail}</p>
          <div className="text-[11px] tabular-nums text-slate-500">{receivedLabel}</div>
        </div>
      </div>

      {otpCode && (
        <div className="mb-3 flex flex-col gap-3 rounded-2xl border border-amber-400/15 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-300">Kode OTP</p>
            <p className="mt-1 text-lg font-bold tracking-[0.24em] text-amber-100 sm:text-xl">{otpCode}</p>
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

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        <div className="hidden sm:block">
          <DeleteEmailButton emailId={id} jwt={jwt} subject={subject} />
        </div>
        {hasRemoteImages && (
          <button
            type="button"
            onClick={() => setShowRemoteImages((value) => !value)}
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 text-xs font-semibold text-sky-200 shadow-sm shadow-black/10 transition-all duration-200 hover:border-sky-400/30 hover:bg-sky-400/20 active:scale-95 sm:w-auto"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
            {showRemoteImages ? "Sembunyikan gambar" : "Tampilkan gambar"}
          </button>
        )}
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/70 px-3 text-xs font-semibold text-slate-200 shadow-sm shadow-black/10 transition-all duration-200 hover:border-white/20 hover:bg-slate-900 active:scale-95 sm:w-auto"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
          {expanded ? "Ringkas" : "Lihat penuh"}
        </button>
      </div>
    </div>
  );
}
