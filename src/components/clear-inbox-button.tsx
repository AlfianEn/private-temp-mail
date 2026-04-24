"use client";

import { useRef, useState } from "react";
import { ConfirmPopover } from "@/components/confirm-popover";
import { showToast } from "@/components/toast";

type ClearInboxButtonProps = {
  inboxId: number;
  jwt: string;
  onCleared?: () => void;
};

export function ClearInboxButton({ inboxId, jwt, onCleared }: ClearInboxButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClear = async () => {
    setIsClearing(true);
    try {
      const res = await fetch(`/api/inboxes/${inboxId}/emails?jwt=${encodeURIComponent(jwt)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: "Gagal membersihkan inbox" }));
        throw new Error(json.error || "Gagal membersihkan inbox");
      }

      onCleared?.();
      showToast("Inbox berhasil dikosongkan");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Gagal membersihkan inbox", "error");
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
        className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 text-sm font-semibold text-amber-200 shadow-sm shadow-black/10 transition-all duration-200 hover:border-amber-400/30 hover:bg-amber-500/20 active:scale-95 sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isClearing ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Membersihkan...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            Kosongkan inbox
          </>
        )}
      </button>
      <ConfirmPopover
        open={showConfirm}
        title="Kosongkan inbox ini?"
        description="Semua email akan dihapus, tapi inbox-nya tetap ada."
        confirmLabel="Kosongkan"
        tone="warning"
        anchorRef={buttonRef}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleClear}
        isLoading={isClearing}
      />
    </div>
  );
}
