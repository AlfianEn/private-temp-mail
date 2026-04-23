"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast";

type DeleteInboxButtonProps = {
  inboxId: number;
  onDeleted?: () => void;
};

export function DeleteInboxButton({ inboxId, onDeleted }: DeleteInboxButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { showToast } = useToast();

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

      showToast("Inbox dihapus", "success");
      onDeleted?.();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Gagal menghapus inbox", "error");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="inline-flex items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeleting ? "Menghapus..." : "Hapus"}
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
