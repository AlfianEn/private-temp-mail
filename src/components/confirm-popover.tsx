"use client";

import { type RefObject, useEffect, useId, useRef, useState } from "react";

type ConfirmPopoverProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "warning";
  isLoading?: boolean;
  anchorRef?: RefObject<HTMLElement | null>;
  onConfirm: () => void;
  onClose: () => void;
};

type ConfirmCardProps = {
  titleId: string;
  descriptionId: string;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  toneClass: string;
  iconClass: string;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
  className: string;
  styleTop?: number | null;
};

function ConfirmCard({
  titleId,
  descriptionId,
  title,
  description,
  confirmLabel,
  cancelLabel,
  toneClass,
  iconClass,
  isLoading,
  onConfirm,
  onClose,
  className,
  styleTop,
}: ConfirmCardProps) {
  return (
    <div
      className={className}
      style={styleTop == null ? undefined : { top: styleTop }}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClick={(event) => event.stopPropagation()}
    >
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border ${iconClass}`}>
        <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/></svg>
      </div>

      <h3 id={titleId} className="text-sm font-semibold text-slate-50">{title}</h3>
      <p id={descriptionId} className="mt-1.5 whitespace-pre-line text-xs leading-5 text-slate-400">{description}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-slate-200 transition-all duration-200 hover:border-white/20 hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`inline-flex h-10 items-center justify-center rounded-xl border px-3 text-xs font-semibold transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${toneClass}`}
        >
          {isLoading ? (
            <>
              <svg className="mr-1.5 h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Proses...
            </>
          ) : confirmLabel}
        </button>
      </div>
    </div>
  );
}

export function ConfirmPopover({
  open,
  title,
  description,
  confirmLabel = "Lanjutkan",
  cancelLabel = "Batal",
  tone = "danger",
  isLoading = false,
  anchorRef,
  onConfirm,
  onClose,
}: ConfirmPopoverProps) {
  const desktopRef = useRef<HTMLDivElement | null>(null);
  const mobileCardRef = useRef<HTMLDivElement | null>(null);
  const [mobileTop, setMobileTop] = useState<number | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;

    const updateMobilePosition = () => {
      if (window.innerWidth >= 640) return;

      const anchor = anchorRef?.current;
      const card = mobileCardRef.current;
      if (!anchor || !card) {
        setMobileTop(null);
        return;
      }

      const margin = 16;
      const gap = 10;
      const anchorRect = anchor.getBoundingClientRect();
      const cardHeight = card.offsetHeight;
      const belowTop = anchorRect.bottom + gap;
      const aboveTop = anchorRect.top - cardHeight - gap;
      const maxTop = window.innerHeight - cardHeight - margin;
      const minTop = margin;

      let nextTop = belowTop;
      if (belowTop > maxTop && aboveTop >= minTop) {
        nextTop = aboveTop;
      }

      nextTop = Math.min(Math.max(nextTop, minTop), Math.max(minTop, maxTop));
      setMobileTop(nextTop);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (window.innerWidth < 640) return;
      if (!desktopRef.current) return;
      const target = event.target;
      if (target instanceof Node && !desktopRef.current.contains(target) && !isLoading) {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const rafId = window.requestAnimationFrame(updateMobilePosition);

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    window.addEventListener("resize", updateMobilePosition);
    window.addEventListener("scroll", updateMobilePosition, true);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.cancelAnimationFrame(rafId);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("resize", updateMobilePosition);
      window.removeEventListener("scroll", updateMobilePosition, true);
    };
  }, [open, isLoading, onClose, anchorRef]);

  if (!open) return null;

  const toneClass =
    tone === "warning"
      ? "border-amber-400/20 bg-amber-500 text-slate-950 hover:border-amber-300/40 hover:bg-amber-400"
      : "border-red-400/20 bg-red-500 text-white hover:border-red-300/40 hover:bg-red-400";

  const iconClass =
    tone === "warning"
      ? "border-amber-400/20 bg-amber-500/10 text-amber-200"
      : "border-red-400/20 bg-red-500/10 text-red-200";

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-[2px] sm:hidden"
        onClick={() => {
          if (!isLoading) onClose();
        }}
        role="presentation"
      />

      <div ref={mobileCardRef} className="sm:hidden">
        <ConfirmCard
          titleId={titleId}
          descriptionId={descriptionId}
          title={title}
          description={description}
          confirmLabel={confirmLabel}
          cancelLabel={cancelLabel}
          toneClass={toneClass}
          iconClass={iconClass}
          isLoading={isLoading}
          onConfirm={onConfirm}
          onClose={onClose}
          className="fixed left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 p-4 shadow-2xl shadow-black/40 animate-in fade-in zoom-in-95"
          styleTop={mobileTop}
        />
      </div>

      <div ref={desktopRef} className="hidden sm:block">
        <ConfirmCard
          titleId={titleId}
          descriptionId={descriptionId}
          title={title}
          description={description}
          confirmLabel={confirmLabel}
          cancelLabel={cancelLabel}
          toneClass={toneClass}
          iconClass={iconClass}
          isLoading={isLoading}
          onConfirm={onConfirm}
          onClose={onClose}
          className="absolute right-0 top-full z-30 mt-2 w-[20rem] origin-top-right rounded-2xl border border-white/10 bg-slate-950 p-4 shadow-2xl shadow-black/40 animate-in fade-in zoom-in-95"
        />
      </div>
    </>
  );
}
