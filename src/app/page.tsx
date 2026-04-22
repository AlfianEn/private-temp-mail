"use client";

import { useState } from "react";
import { LogoutButton } from "@/components/logout-button";

type CreateInboxResponse = {
  inbox: {
    id: number;
    address: string;
    expiresAt: string;
  };
  jwt: string;
  inboxUrl: string;
};

export default function Home() {
  const [data, setData] = useState<CreateInboxResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/inboxes/create", { method: "POST" });
      const json = (await res.json()) as CreateInboxResponse | { error?: string };

      if (!res.ok || !("inbox" in json)) {
        throw new Error("error" in json ? json.error || "Gagal membuat inbox" : "Gagal membuat inbox");
      }

      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-6 py-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-cyan-400">private-temp-mail</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Private inbox generator</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
              Generate inbox private untuk OTP/testing. Riwayat email dirancang untuk disimpan 30 hari, dan
              akses inbox menggunakan link JWT per inbox.
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Generate inbox baru</h2>
              <p className="mt-1 text-sm text-slate-400">Satu klik untuk membuat alamat email inbox baru.</p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-cyan-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Membuat inbox..." : "Generate Inbox"}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {data && (
            <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-slate-900/80 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Inbox address</p>
                <p className="mt-2 break-all rounded-xl bg-black/30 px-4 py-3 font-mono text-sm text-cyan-300">
                  {data.inbox.address}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Inbox link</p>
                <a
                  href={data.inboxUrl}
                  className="mt-2 block break-all rounded-xl bg-black/30 px-4 py-3 font-mono text-sm text-sky-300 underline-offset-4 hover:underline"
                >
                  {data.inboxUrl}
                </a>
                <p className="mt-2 text-xs text-slate-500">Link ini nanti dipakai untuk buka inbox berdasarkan JWT.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-black/20 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Inbox ID</p>
                  <p className="mt-2 text-sm font-semibold text-slate-100">{data.inbox.id}</p>
                </div>
                <div className="rounded-xl bg-black/20 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Inbox expires</p>
                  <p className="mt-2 text-sm font-semibold text-slate-100">{data.inbox.expiresAt}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
