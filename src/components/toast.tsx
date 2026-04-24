"use client";

import { useEffect, useState } from "react";

type ToastTone = "success" | "error";

type ToastMessage = {
  id: number;
  text: string;
  tone: ToastTone;
};

declare global {
  interface Window {
    __ptmShowToast?: (text: string, tone?: ToastTone) => void;
  }
}

let toastId = 0;

export function showToast(text: string, tone: ToastTone = "success") {
  if (typeof window === "undefined") {
    return;
  }

  window.__ptmShowToast?.(text, tone);
}

export function ToastViewport() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    window.__ptmShowToast = (text, tone = "success") => {
      const id = ++toastId;
      setMessages((current) => [...current, { id, text, tone }]);
      window.setTimeout(() => {
        setMessages((current) => current.filter((item) => item.id !== id));
      }, 2200);
    };

    return () => {
      delete window.__ptmShowToast;
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4">
      {messages.map((message) => {
        const toneClassName =
          message.tone === "error"
            ? "border-red-400/25 bg-red-500/15 text-red-100"
            : "border-emerald-400/25 bg-emerald-500/15 text-emerald-100";

        return (
          <div
            key={message.id}
            role="status"
            aria-live="polite"
            className={`w-full max-w-sm rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg shadow-black/30 backdrop-blur ${toneClassName}`}
          >
            {message.text}
          </div>
        );
      })}
    </div>
  );
}
