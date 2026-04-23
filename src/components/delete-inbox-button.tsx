"use client";

import { useState } from "react";

type DeleteInboxButtonProps = {
  inboxId: number;
  onDeleted?: () => void;
};

export function DeleteInboxButton({ inboxId, onDeleted }: DeleteInboxButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Hapus inbox tersimpan ini beserta email dan asset terkait?")) return;

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
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isDeleting ? "Menghapus..." : "Hapus"}
    </button>
  );
}
