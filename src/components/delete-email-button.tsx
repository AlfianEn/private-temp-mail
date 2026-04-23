"use client";

import { useState } from "react";

type DeleteEmailButtonProps = {
  emailId: number;
  jwt: string;
};

export function DeleteEmailButton({ emailId, jwt }: DeleteEmailButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Hapus email ini?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/emails/${emailId}?jwt=${encodeURIComponent(jwt)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: "Gagal menghapus email" }));
        throw new Error(json.error || "Gagal menghapus email");
      }

      window.location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal menghapus email");
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center gap-1 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isDeleting ? "Menghapus..." : "Hapus"}
    </button>
  );
}
