"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast";

type DeleteEmailButtonProps = {
  emailId: number;
  jwt: string;
};

export function DeleteEmailButton({ emailId, jwt }: DeleteEmailButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { showToast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/emails/${emailId}?jwt=${encodeURIComponent(jwt)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: "Gagal menghapus email" }));
        throw new Error(json.error || "Gagal menghapus email");
      }

      showToast("Email dihapus", "success");
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Gagal menghapus email", "error");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="inline-flex items-center gap-1 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeleting ? "Menghapus..." : "Hapus"}
      </button>
      <ConfirmDialog
        open={showConfirm}
        title="Hapus email ini?"
        description="Email akan dihapus permanen dari inbox ini."
        confirmLabel="Hapus email"
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
