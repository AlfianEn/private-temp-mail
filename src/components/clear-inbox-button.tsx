"use client";

import { useState } from "react";

type ClearInboxButtonProps = {
  inboxId: number;
  jwt: string;
};

export function ClearInboxButton({ inboxId, jwt }: ClearInboxButtonProps) {
  const [isClearing, setIsClearing] = useState(false);

  const handleClear = async () => {
    if (!window.confirm("Hapus semua email di inbox ini? Inbox-nya tetap ada, tapi semua isi email akan dibersihkan.")) return;

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
    <button
      onClick={handleClear}
      disabled={isClearing}
      className="inline-flex h-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isClearing ? "Membersihkan..." : "Clear all emails"}
    </button>
  );
}
