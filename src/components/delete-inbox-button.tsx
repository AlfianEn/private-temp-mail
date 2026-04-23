"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";

type DeleteInboxButtonProps = {
  inboxId: number;
  onDeleted?: () => void;
};

export function DeleteInboxButton({ inboxId, onDeleted }: DeleteInboxButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/inboxes/${inboxId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: "Gagal menghapus inbox" }));
        throw new Error(json.error || "Gagal menghapus inbox");
      }

      onDeleted?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal menghapus inbox");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-red-400/20 bg-red-500/10 px-3 text-xs font-semibold text-red-200 transition-all duration-200 hover:border-red-400/30 hover:bg-red-500/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeleting ? (
          <>
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Menghapus...
          </>
        ) : (
          <>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            Hapus inbox
          </>
        )}
      </button>
      <ConfirmDialog
        open={showConfirm}
        title="Hapus inbox tersimpan ini?"
        description="Inbox, email, token, dan asset terkait akan dihapus permanen."
        confirmLabel="Hapus inbox"
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
