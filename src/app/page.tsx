"use client";

import { useEffect, useState } from "react";
import { LogoutButton } from "@/components/logout-button";
import { CopyButton } from "@/components/copy-button";
import { DeleteInboxButton } from "@/components/delete-inbox-button";
import { formatDateTime } from "@/lib/date";

type CreateInboxResponse = {
  inbox: {
    id: number;
    address: string;
    expiresAt: string;
  };
  jwt: string;
  inboxUrl: string;
};

type RecentInbox = {
  id: number;
  address: string;
  expiresAt: string | null;
  createdAt: string;
  inboxUrl: string | null;
};

export default function Home() {
  const [data, setData] = useState<CreateInboxResponse | null>(null);
  const [recentInboxes, setRecentInboxes] = useState<RecentInbox[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRecentInboxes = async () => {
    try {
      const res = await fetch("/api/inboxes/recent", { cache: "no-store" });
      const json = (await res.json()) as { inboxes?: RecentInbox[] };
      if (res.ok && Array.isArray(json.inboxes)) {
        setRecentInboxes(json.inboxes);
      }
    } catch {
      // ignore recent inbox load errors
    }
  };

  useEffect(() => {
    void loadRecentInboxes();
  }, []);

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
      await loadRecentInboxes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-16">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/90">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              private-temp-mail
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Inbox sementara untuk OTP & testing.</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400 sm:text-base">
              Satu klik untuk membuat inbox baru. Private, simpel, dan riwayat email disimpan sampai 30 hari.
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-lg shadow-cyan-950/10 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Generate inbox baru</h2>
              <p className="mt-1 text-sm text-slate-400">Alamat email dibuat otomatis dan siap dipakai sekarang.</p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  Membuat inbox...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  Generate Inbox
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {data && (
            <div className="mt-6 space-y-4 rounded-[28px] border border-white/10 bg-black/20 p-5">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Alamat email</p>
                  <CopyButton text={data.inbox.address} label="Copy address" />
                </div>
                <p className="mt-2 break-all rounded-2xl bg-black/30 px-4 py-3 font-mono text-sm text-cyan-300">
                  {data.inbox.address}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Link inbox</p>
                  <div className="flex items-center gap-2">
                    <CopyButton text={data.inboxUrl} label="Copy link" />
                    <a
                      href={data.inboxUrl}
                      className="inline-flex items-center justify-center gap-1 rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-xs font-semibold text-sky-200 transition hover:bg-sky-400/20 active:scale-[0.98]"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                      Buka inbox
                    </a>
                  </div>
                </div>
                <a
                  href={data.inboxUrl}
                  className="mt-2 block break-all rounded-2xl bg-black/30 px-4 py-3 font-mono text-sm text-sky-300 underline-offset-4 hover:underline"
                >
                  {data.inboxUrl}
                </a>
                <p className="mt-2 text-xs text-slate-500">Link ini dipakai untuk buka inbox langsung.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-black/20 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">ID inbox</p>
                  <p className="mt-2 text-sm font-semibold text-slate-100">{data.inbox.id}</p>
                </div>
                <div className="rounded-2xl bg-black/20 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Berakhir</p>
                  <p className="mt-2 text-sm font-semibold text-slate-100">{formatDateTime(data.inbox.expiresAt)}</p>
                </div>
              </div>
            </div>
          )}

          {recentInboxes.length > 0 && (
            <div className="mt-6 rounded-[28px] border border-white/10 bg-black/20 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-100">Inbox tersimpan</h3>
                  <p className="mt-1 text-sm text-slate-400">Daftar inbox terbaru yang masih punya link aktif.</p>
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                  {recentInboxes.length} inbox
                </span>
              </div>

              <div className="space-y-3">
                {recentInboxes.map((inbox) => (
                  <div key={inbox.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-mono text-sm text-cyan-300">{inbox.address}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Dibuat {formatDateTime(inbox.createdAt)} • Berakhir {formatDateTime(inbox.expiresAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <CopyButton text={inbox.address} label="Copy address" />
                        {inbox.inboxUrl && <CopyButton text={inbox.inboxUrl} label="Copy link" />}
                        {inbox.inboxUrl && (
                          <a
                            href={inbox.inboxUrl}
                            className="inline-flex items-center justify-center rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-xs font-semibold text-sky-200 transition hover:bg-sky-400/20"
                          >
                            Buka inbox
                          </a>
                        )}
                        <DeleteInboxButton inboxId={inbox.id} onDeleted={() => {
                          setRecentInboxes((current) => current.filter((item) => item.id !== inbox.id));
                          if (data?.inbox.id === inbox.id) {
                            setData(null);
                          }
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
