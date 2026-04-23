"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";

type ClearInboxButtonProps = {
  inboxId: number;
  jwt: string;
};

export function ClearInboxButton({ inboxId, jwt }: ClearInboxButtonProps) {
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

      window.location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal membersihkan inbox");
      setIsClearing(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isClearing}
        className="inline-flex h-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isClearing ? "Membersihkan..." : "Kosongkan inbox"}
      </button>
      <ConfirmDialog
        open={showConfirm}
        title="Kosongkan inbox ini?"
        description="Semua email akan dihapus, tapi inbox-nya tetap ada."
        confirmLabel="Kosongkan"
        tone="warning"
        onClose={() => setShowConfirm(false)}
        onConfirm={handleClear}
        isLoading={isClearing}
      />
    </>
  );
}
