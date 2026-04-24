"use client";

import { useMemo, useState } from "react";
import { LogoutButton } from "@/components/logout-button";
import { CopyButton } from "@/components/copy-button";
import { ClearAllInboxesButton } from "@/components/clear-all-inboxes-button";
import { DeleteInboxButton } from "@/components/delete-inbox-button";
import { formatDateTime, parseAppDate } from "@/lib/date";
import { formatRelativeTime } from "@/lib/time";

type CreateInboxResponse = {
  inbox: {
    id: number;
    address: string;
    expiresAt: string;
  };
  jwt: string;
  inboxUrl: string;
};

export type RecentInbox = {
  id: number;
  address: string;
  expiresAt: string | null;
  createdAt: string;
  lastReceivedAt: string | null;
  latestEmailSubject: string | null;
  latestEmailFrom: string | null;
  latestEmailOtp: string | null;
  inboxUrl: string | null;
};

function getInboxStatus(expiresAt: string | null) {
  const date = parseAppDate(expiresAt);
  if (!date) {
    return { label: "Tanpa expiry", className: "bg-slate-500/15 text-slate-300" };
  }

  const diffMs = date.getTime() - Date.now();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffMs <= 0) {
    return { label: "Expired", className: "bg-red-500/15 text-red-300" };
  }

  if (diffHours <= 24) {
    return { label: "Segera expired", className: "bg-amber-500/15 text-amber-300" };
  }

  return { label: "Aktif", className: "bg-emerald-500/15 text-emerald-300" };
}

function cleanFromAddress(raw?: string | null) {
  if (!raw) return "Pengirim tidak diketahui";
  const match = raw.match(/^\"?([^\"<]+)\"?\s*<([^>]+)>$/);
  if (match) return match[1].trim() || match[2];
  if (raw.length > 42) return `${raw.slice(0, 40)}…`;
  return raw;
}

const INBOXES_PER_PAGE = 10;

export function HomeClient({ initialRecentInboxes }: { initialRecentInboxes: RecentInbox[] }) {
  const [data, setData] = useState<CreateInboxResponse | null>(null);
  const [recentInboxes, setRecentInboxes] = useState(initialRecentInboxes);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRecentInboxes = async () => {
    try {
      const res = await fetch("/api/inboxes/recent", { cache: "no-store" });
      const json = (await res.json()) as { inboxes?: RecentInbox[] };
      if (res.ok && Array.isArray(json.inboxes)) {
        setRecentInboxes(json.inboxes);
        setCurrentPage(1);
      }
    } catch {
      // ignore recent inbox load errors
    }
  };

  const filteredInboxes = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return recentInboxes;

    return recentInboxes.filter((inbox) => {
      return [inbox.address, inbox.latestEmailSubject, inbox.latestEmailFrom, inbox.latestEmailOtp]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [recentInboxes, search]);

  const totalPages = Math.max(1, Math.ceil(filteredInboxes.length / INBOXES_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedInboxes = useMemo(() => {
    const start = (safeCurrentPage - 1) * INBOXES_PER_PAGE;
    return filteredInboxes.slice(start, start + INBOXES_PER_PAGE);
  }, [filteredInboxes, safeCurrentPage]);

  const visiblePageNumbers = useMemo(() => {
    const pages = [] as number[];
    const start = Math.max(1, safeCurrentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const normalizedStart = Math.max(1, end - 4);

    for (let page = normalizedStart; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [safeCurrentPage, totalPages]);

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
      setCurrentPage(1);
      await loadRecentInboxes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/90">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              private-temp-mail
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-[-0.025em] text-slate-50 sm:text-4xl">Inbox sementara buat OTP dan testing.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
              Sekali klik langsung dapat inbox baru. Private, simpel, dan email disimpan sampai 30 hari.
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-lg shadow-cyan-950/10 backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.01em] text-slate-50">Buat inbox baru</h2>
              <p className="mt-1 text-sm text-slate-400">Alamat email dibuat otomatis dan langsung siap dipakai.</p>
            </div>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 active:scale-[0.98] sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  Membuat inbox...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  Buat inbox
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              <div>
                <p className="font-semibold text-red-100">Gagal membuat inbox</p>
                <p className="mt-0.5 text-red-200/90">{error}</p>
              </div>
            </div>
          )}

          {data && (
            <div className="mt-6 space-y-4 rounded-[28px] border border-cyan-400/15 bg-black/20 p-5 shadow-lg shadow-cyan-950/10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">Inbox baru siap dipakai</p>
                  <h3 className="mt-2 text-lg font-semibold tracking-[-0.01em] text-slate-100">Simpan alamat atau buka inbox sekarang.</h3>
                  <p className="mt-1 text-sm text-slate-400">Inbox ini juga otomatis masuk ke daftar inbox tersimpan di bawah.</p>
                </div>
                <a
                  href={data.inboxUrl}
                  className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-sky-400/20 bg-sky-400/10 px-4 text-sm font-semibold text-sky-200 transition hover:bg-sky-400/20 active:scale-[0.98] sm:w-auto"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                  Buka inbox baru
                </a>
              </div>

              <div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Alamat email</p>
                  <CopyButton text={data.inbox.address} label="Salin alamat" />
                </div>
                <p className="mt-2 break-all rounded-2xl bg-black/30 px-4 py-3 font-mono text-sm text-cyan-300">
                  {data.inbox.address}
                </p>
              </div>

              <div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Link inbox</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <CopyButton text={data.inboxUrl} label="Salin link" />
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

          {recentInboxes.length === 0 ? (
            <div className="mt-6 rounded-[28px] border border-dashed border-white/10 bg-black/20 px-5 py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <svg className="h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <p className="mt-3 text-sm font-medium text-slate-300">Belum ada inbox tersimpan</p>
              <p className="mt-1 text-xs text-slate-500">Inbox baru yang kamu buat akan langsung muncul di sini.</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Recent inbox tampil berdasarkan data terbaru
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[28px] border border-white/10 bg-black/20 p-4 sm:p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold tracking-[-0.01em] text-slate-100">Inbox tersimpan</h3>
                  <p className="mt-1 text-sm text-slate-400">Daftar inbox terbaru yang masih punya link aktif.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                    {filteredInboxes.length}/{recentInboxes.length} inbox
                  </span>
                  <ClearAllInboxesButton
                    onCleared={() => {
                      setRecentInboxes([]);
                      setData(null);
                    }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <svg className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Cari address, subject, sender, atau OTP"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3 pl-11 pr-12 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setCurrentPage(1);
                      }}
                      className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:bg-white/10"
                      aria-label="Reset pencarian"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  )}
                </div>
                {search.trim() && (
                  <p className="mt-2 text-xs text-slate-500">
                    Menampilkan {filteredInboxes.length} hasil untuk <span className="font-semibold text-slate-300">“{search.trim()}”</span>
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {filteredInboxes.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 px-4 py-8 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5">
                      <svg className="h-4.5 w-4.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </div>
                    <p className="mt-3 text-sm font-medium text-slate-300">Tidak ada inbox yang cocok.</p>
                    <p className="mt-1 text-xs text-slate-500">Coba kata kunci lain seperti address, pengirim, subject, atau OTP.</p>
                  </div>
                ) : (
                  paginatedInboxes.map((inbox) => {
                    const status = getInboxStatus(inbox.expiresAt);

                    return (
                      <div key={inbox.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 transition hover:border-white/15 hover:bg-slate-950/75 sm:p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <p className="truncate font-mono text-sm font-medium text-cyan-300">{inbox.address}</p>
                              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${status.className}`}>
                                {status.label}
                              </span>
                              {inbox.latestEmailOtp && (
                                <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                                  OTP {inbox.latestEmailOtp}
                                </span>
                              )}
                            </div>

                            <p className="mt-2 text-xs leading-5 text-slate-500">
                              Dibuat {formatDateTime(inbox.createdAt)} • Berakhir {formatDateTime(inbox.expiresAt)}
                            </p>

                            {(inbox.latestEmailSubject || inbox.latestEmailFrom || inbox.lastReceivedAt) && (
                              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Email terakhir</p>
                                <p className="mt-1.5 truncate text-sm font-semibold tracking-[-0.01em] text-slate-100">
                                  {inbox.latestEmailSubject || "(Tanpa subject)"}
                                </p>
                                <p className="mt-1 truncate text-xs text-slate-400">
                                  {cleanFromAddress(inbox.latestEmailFrom)}
                                  {inbox.lastReceivedAt && (
                                    <span className="ml-2 text-slate-500">• {formatRelativeTime(inbox.lastReceivedAt)}</span>
                                  )}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center lg:justify-end">
                            <CopyButton text={inbox.address} label="Salin alamat" />
                            {inbox.inboxUrl && <CopyButton text={inbox.inboxUrl} label="Salin link" />}
                            {inbox.inboxUrl && (
                              <a
                                href={inbox.inboxUrl}
                                className="inline-flex items-center justify-center rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-xs font-semibold text-sky-200 shadow-sm shadow-black/10 transition hover:bg-sky-400/20"
                              >
                                Buka inbox
                              </a>
                            )}
                            <DeleteInboxButton
                              inboxId={inbox.id}
                              onDeleted={() => {
                                setRecentInboxes((current) => current.filter((item) => item.id !== inbox.id));
                                if (data?.inbox.id === inbox.id) {
                                  setData(null);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {filteredInboxes.length > INBOXES_PER_PAGE && (
                <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    Halaman <span className="font-semibold text-slate-300">{safeCurrentPage}</span> dari <span className="font-semibold text-slate-300">{totalPages}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={safeCurrentPage === 1}
                      className="inline-flex h-9 min-w-[2.5rem] items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-slate-200 shadow-sm shadow-black/10 transition-all duration-200 hover:border-white/20 hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Prev
                    </button>

                    {visiblePageNumbers[0] > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setCurrentPage(1)}
                          className="inline-flex h-9 min-w-[2.5rem] items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-slate-200 shadow-sm shadow-black/10 transition-all duration-200 hover:border-white/20 hover:bg-white/10 active:scale-95"
                        >
                          1
                        </button>
                        {visiblePageNumbers[0] > 2 && <span className="px-1 text-xs text-slate-500">...</span>}
                      </>
                    )}

                    {visiblePageNumbers.map((pageNumber) => {
                      const isActive = pageNumber === safeCurrentPage;

                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => setCurrentPage(pageNumber)}
                          aria-current={isActive ? "page" : undefined}
                          className={`inline-flex h-9 min-w-[2.5rem] items-center justify-center rounded-xl border px-3 text-xs font-semibold shadow-sm shadow-black/10 transition-all duration-200 active:scale-95 ${
                            isActive
                              ? "border-cyan-400/30 bg-cyan-400/15 text-cyan-200"
                              : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    {visiblePageNumbers.at(-1)! < totalPages && (
                      <>
                        {visiblePageNumbers.at(-1)! < totalPages - 1 && <span className="px-1 text-xs text-slate-500">...</span>}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(totalPages)}
                          className="inline-flex h-9 min-w-[2.5rem] items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-slate-200 shadow-sm shadow-black/10 transition-all duration-200 hover:border-white/20 hover:bg-white/10 active:scale-95"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={safeCurrentPage === totalPages}
                      className="inline-flex h-9 min-w-[2.5rem] items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-slate-200 shadow-sm shadow-black/10 transition-all duration-200 hover:border-white/20 hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
