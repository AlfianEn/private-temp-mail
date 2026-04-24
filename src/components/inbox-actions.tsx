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
      type="button"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/70 px-4 text-sm font-semibold text-slate-100 shadow-sm shadow-black/10 transition-all duration-200 hover:border-white/20 hover:bg-slate-900 active:scale-95 sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isRefreshing ? (
        <>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          Memuat ulang...
        </>
      ) : (
        <>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
          Muat ulang inbox
        </>
      )}
    </button>
  );
}

