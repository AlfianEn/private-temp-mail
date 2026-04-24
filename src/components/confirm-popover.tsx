"use client";

import {
  type CSSProperties,
  type RefObject,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

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
  containerRef?: RefObject<HTMLDivElement | null>;
  className: string;
  style?: CSSProperties;
};

type PopoverPosition = {
  top: number;
  left?: number;
  right?: number;
  width: number;
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
  containerRef,
  className,
  style,
}: ConfirmCardProps) {
  return (
    <div
      ref={containerRef}
      className={className}
      style={style}
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
  const cardRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [position, setPosition] = useState<PopoverPosition>({ top: 16, width: 320, left: 16 });
  const portalTarget = typeof document !== "undefined" ? document.body : null;

  useLayoutEffect(() => {
    if (!open || !portalTarget) return;

    const updatePosition = () => {
      const anchor = anchorRef?.current;
      const card = cardRef.current;
      if (!anchor || !card) return;

      const isMobile = window.innerWidth < 640;
      const margin = 16;
      const gap = 10;
      const anchorRect = anchor.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const cardHeight = Math.ceil(cardRect.height) || 220;
      const mobileWidth = Math.min(320, window.innerWidth - margin * 2);
      const desktopWidth = 320;
      const width = isMobile ? mobileWidth : desktopWidth;

      const top = Math.min(
        Math.max(anchorRect.bottom + gap, margin),
        Math.max(margin, window.innerHeight - cardHeight - margin),
      );

      if (isMobile) {
        setPosition({
          top,
          left: window.innerWidth / 2 - width / 2,
          width,
        });
        return;
      }

      const left = Math.min(
        Math.max(anchorRect.right - width, margin),
        Math.max(margin, window.innerWidth - width - margin),
      );

      setPosition({ top, left, width });
    };

    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      updatePosition();
      raf2 = window.requestAnimationFrame(updatePosition);
    });

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, portalTarget, anchorRef]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || isLoading) return;

      const clickedAnchor = anchorRef?.current?.contains(target);
      const clickedCard = cardRef.current?.contains(target);

      if (!clickedAnchor && !clickedCard) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open, isLoading, onClose, anchorRef]);

  if (!open || !portalTarget) return null;

  const toneClass =
    tone === "warning"
      ? "border-amber-400/20 bg-amber-500 text-slate-950 hover:border-amber-300/40 hover:bg-amber-400"
      : "border-red-400/20 bg-red-500 text-white hover:border-red-300/40 hover:bg-red-400";

  const iconClass =
    tone === "warning"
      ? "border-amber-400/20 bg-amber-500/10 text-amber-200"
      : "border-red-400/20 bg-red-500/10 text-red-200";

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[69] bg-slate-950/14 backdrop-blur-[1px] animate-in fade-in duration-150 ease-out sm:bg-transparent sm:backdrop-blur-0"
        aria-hidden="true"
      />
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
        containerRef={cardRef}
        className="fixed z-[70] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/98 p-4 shadow-2xl shadow-black/45 animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150 ease-out transition-[top,left,width] will-change-transform"
        style={{
          top: position.top,
          left: position.left,
          width: position.width,
        }}
      />
    </>,
    portalTarget,
  );
}
