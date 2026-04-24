"use client";

import { useRef, useState } from "react";
import { ConfirmPopover } from "@/components/confirm-popover";
import { showToast } from "@/components/toast";

type DeleteEmailButtonProps = {
  emailId: number;
  jwt: string;
  subject?: string;
  onDeleted?: () => void;
};

function shortenSubject(subject?: string) {
  if (!subject) return "(Tanpa subject)";
  return subject.length > 72 ? `${subject.slice(0, 69)}...` : subject;
}

export function DeleteEmailButton({ emailId, jwt, subject, onDeleted }: DeleteEmailButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

      onDeleted?.();
      showToast("Email berhasil dihapus");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Gagal menghapus email", "error");
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-red-400/20 bg-red-500/10 px-3 text-xs font-semibold text-red-200 shadow-sm shadow-black/10 transition-all duration-200 hover:border-red-400/30 hover:bg-red-500/20 active:scale-95 sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeleting ? (
          <>
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Menghapus...
          </>
        ) : (
          <>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            Hapus email
          </>
        )}
      </button>
      <ConfirmPopover
        open={showConfirm}
        title="Hapus email ini?"
        description={`Subject: ${shortenSubject(subject)}\n\nEmail akan dihapus permanen dari inbox ini.`}
        confirmLabel="Hapus email"
        anchorRef={buttonRef}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
