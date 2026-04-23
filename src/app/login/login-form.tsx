"use client";

import { useState } from "react";

export function LoginForm({ next }: { next: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error || "Login gagal");
      }

      window.location.assign(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
      <div className="rounded-[22px] border border-white/10 bg-slate-950/50 p-4 sm:p-5">
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
          Password akses
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-400/40"
          placeholder="Masukkan password"
          autoFocus
          required
        />
        <p className="mt-2 text-xs leading-5 text-slate-500">Akses ini dipakai buat buka generator inbox dan riwayat email private.</p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          <span className="text-red-200">{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Memproses...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Buka akses
          </>
        )}
      </button>
    </form>
  );
}
