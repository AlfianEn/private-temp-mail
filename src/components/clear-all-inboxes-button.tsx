"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast";

type ClearAllInboxesButtonProps = {
  onCleared?: () => void;
};

export function ClearAllInboxesButton({ onCleared }: ClearAllInboxesButtonProps) {
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { showToast } = useToast();

  const handleClear = async () => {
    setIsClearing(true);
    try {
      const res = await fetch("/api/inboxes", { method: "DELETE" });

      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: "Gagal menghapus semua inbox" }));
        throw new Error(json.error || "Gagal menghapus semua inbox");
      }

      showToast("Semua inbox dihapus", "success");
      onCleared?.();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Gagal menghapus semua inbox", "error");
      setIsClearing(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isClearing}
        className="inline-flex items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isClearing ? "Menghapus semua..." : "Hapus semua inbox"}
      </button>
      <ConfirmDialog
        open={showConfirm}
        title="Hapus semua inbox tersimpan?"
        description="Semua inbox, email, token, dan asset tersimpan akan dihapus permanen."
        confirmLabel="Hapus semua"
        onClose={() => setShowConfirm(false)}
        onConfirm={handleClear}
        isLoading={isClearing}
      />
    </>
  );
}
