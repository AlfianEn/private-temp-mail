"use client";

import { useEffect } from "react";

export function AutoRefresh({ intervalMs = 15000 }: { intervalMs?: number }) {
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      window.location.reload();
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return null;
}
