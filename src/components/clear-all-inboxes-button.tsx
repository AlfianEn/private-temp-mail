"use client";

import { useRef, useState } from "react";
import { ConfirmPopover } from "@/components/confirm-popover";

type ClearAllInboxesButtonProps = {
  onCleared?: () => void;
};

export function ClearAllInboxesButton({ onCleared }: ClearAllInboxesButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClear = async () => {
    setIsClearing(true);
    try {
      const res = await fetch("/api/inboxes", { method: "DELETE" });

      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: "Gagal menghapus semua inbox" }));
        throw new Error(json.error || "Gagal menghapus semua inbox");
      }

      onCleared?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal menghapus semua inbox");
      setIsClearing(false);
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={isClearing}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-red-400/20 bg-red-500/10 px-3 text-xs font-semibold text-red-200 transition-all duration-200 hover:border-red-400/30 hover:bg-red-500/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isClearing ? (
          <>
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Menghapus...
          </>
        ) : (
          <>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            Hapus semua
          </>
        )}
      </button>
      <ConfirmPopover
        open={showConfirm}
        title="Hapus semua inbox tersimpan?"
        description="Semua inbox, email, token, dan asset tersimpan akan dihapus permanen."
        confirmLabel="Hapus semua"
        anchorRef={buttonRef}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleClear}
        isLoading={isClearing}
      />
    </div>
  );
}
