"use client";

import { useState } from "react";

type ClearAllInboxesButtonProps = {
  onCleared?: () => void;
};

export function ClearAllInboxesButton({ onCleared }: ClearAllInboxesButtonProps) {
  const [isClearing, setIsClearing] = useState(false);

  const handleClear = async () => {
    if (!window.confirm("Hapus semua address inbox tersimpan beserta email, token, dan asset terkait?")) return;

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
    <button
      onClick={handleClear}
      disabled={isClearing}
      className="inline-flex items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isClearing ? "Menghapus semua..." : "Clear all addresses"}
    </button>
  );
}
