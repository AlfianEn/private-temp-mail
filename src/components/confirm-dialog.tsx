"use client";

import { useEffect } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "warning";
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Lanjutkan",
  cancelLabel = "Batal",
  tone = "danger",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, isLoading, onClose]);

  if (!open) return null;

  const toneClass =
    tone === "warning"
      ? "border-amber-400/20 bg-amber-500 text-slate-950 hover:border-amber-300/40 hover:bg-amber-400"
      : "border-red-400/20 bg-red-500 text-white hover:border-red-300/40 hover:bg-red-400";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-4 backdrop-blur sm:items-center"
      onClick={() => {
        if (!isLoading) onClose();
      }}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-[28px] border border-white/10 bg-slate-950 p-5 shadow-2xl shadow-black/40 transition-all duration-200 sm:translate-y-0"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/></svg>
        </div>

        <h3 id="confirm-dialog-title" className="text-lg font-semibold text-slate-50">{title}</h3>
        <p id="confirm-dialog-description" className="mt-2 text-sm leading-6 text-slate-400">{description}</p>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-200 transition-all duration-200 hover:border-white/20 hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex h-11 min-w-[9rem] items-center justify-center rounded-xl border px-4 text-sm font-semibold transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${toneClass}`}
          >
            {isLoading ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Memproses...
              </>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
