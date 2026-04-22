"use client";

import { useState } from "react";

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      window.location.reload();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isRefreshing ? "Refreshing..." : "Refresh inbox"}
    </button>
  );
}

export function CopyOtpButton({ otp }: { otp: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(otp);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex h-9 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
    >
      {copied ? "Copied" : "Copy OTP"}
    </button>
  );
}
