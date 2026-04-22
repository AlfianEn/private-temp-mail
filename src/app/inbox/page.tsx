import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { verifyInboxJwt } from "@/lib/jwt";
import { CopyOtpButton, RefreshButton } from "@/components/inbox-actions";
import { LogoutButton } from "@/components/logout-button";
import { CopyButton } from "@/components/copy-button";
import { formatDateTime } from "@/lib/date";
import { formatRelativeTime } from "@/lib/time";
import { getDisplayEmailBody } from "@/lib/email";

type InboxPageProps = {
  searchParams: Promise<{ jwt?: string }>;
};

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const { jwt } = await searchParams;

  if (!jwt) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-50">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
          <h1 className="text-2xl font-bold">Inbox link tidak valid</h1>
          <p className="mt-2 text-sm text-slate-300">Parameter JWT tidak ditemukan.</p>
          <Link href="/" className="mt-5 inline-block text-sm font-semibold text-cyan-300 hover:underline">
            Kembali ke generator inbox
          </Link>
        </div>
      </main>
    );
  }

  try {
    const payload = await verifyInboxJwt(jwt);
    const inboxId = Number(payload.inboxId);

    const inbox = await db.query.inboxes.findFirst({
      where: (inboxes, { eq }) => eq(inboxes.id, inboxId),
    });

    if (!inbox) {
      throw new Error("Inbox tidak ditemukan");
    }

    const emails = await db
      .select()
      .from(schema.emails)
      .where(eq(schema.emails.inboxId, inboxId))
      .orderBy(desc(schema.emails.receivedAt));

    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-50">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  private-temp-mail
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Inbox detail</h1>
                <p className="mt-2 text-sm text-slate-400">Riwayat email disimpan sampai 30 hari untuk inbox private ini.</p>
              </div>
              <div className="flex items-center gap-3">
                <RefreshButton />
                <LogoutButton />
              </div>
            </div>
          </div>

          <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/20 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Alamat email</p>
                <CopyButton text={inbox.address} label="Copy address" />
              </div>
              <p className="mt-2 break-all rounded-xl bg-black/30 px-4 py-3 font-mono text-sm text-cyan-300">
                {inbox.address}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
              <p className="mt-2 rounded-xl bg-black/20 px-4 py-3 text-sm font-semibold text-slate-100">{inbox.status}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">ID inbox</p>
              <p className="mt-2 rounded-xl bg-black/20 px-4 py-3 text-sm font-semibold text-slate-100">{inbox.id}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Dibuat</p>
              <p className="mt-2 rounded-xl bg-black/20 px-4 py-3 text-sm font-semibold text-slate-100">{formatDateTime(inbox.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Berakhir</p>
              <p className="mt-2 rounded-xl bg-black/20 px-4 py-3 text-sm font-semibold text-slate-100">{formatDateTime(inbox.expiresAt)}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Riwayat email</h2>
                <p className="mt-1 text-sm text-slate-400">Email terbaru untuk inbox ini akan muncul di sini.</p>
              </div>
              <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-300">
                {emails.length} email
              </span>
            </div>

            {emails.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 px-5 py-10 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <svg className="h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <p className="text-sm font-medium text-slate-300">Belum ada email masuk</p>
                <p className="mt-1 text-xs text-slate-500 max-w-xs">Email yang dikirim ke address inbox ini akan muncul di sini secara otomatis.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {emails.map((email) => {
                  const isForwarded = Boolean(email.subject?.toLowerCase().startsWith("fwd:") || email.subject?.toLowerCase().startsWith("fw:"));
                  const isHtml = Boolean(email.htmlBody && email.htmlBody.trim());

                  return (
                    <div key={email.id} className={`rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/[0.03] ${email.otpCode ? 'border-l-[3px] border-l-cyan-400/40' : ''}`}>
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-100">{email.subject || "(Tanpa subject)"}</p>
                        {email.otpCode && (
                          <span className="inline-flex items-center rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                            OTP
                          </span>
                        )}
                        {isForwarded && (
                          <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                            Forwarded
                          </span>
                        )}
                        {isHtml && (
                          <span className="inline-flex items-center rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-300">
                            HTML
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-xs text-slate-400">Dari: {email.fromEmail || "Unknown"}</p>
                        <div className="text-xs tabular-nums text-slate-500">{formatRelativeTime(email.receivedAt)}</div>
                      </div>
                    </div>

                    {email.otpCode && (
                      <div className="mb-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">OTP detected</p>
                            <p className="mt-2 font-mono text-lg font-bold text-cyan-200">{email.otpCode}</p>
                          </div>
                          <CopyOtpButton otp={email.otpCode} />
                        </div>
                      </div>
                    )}

                    <div className="rounded-xl bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                      <pre className="whitespace-pre-wrap break-words font-sans">{getDisplayEmailBody(email.textBody, email.htmlBody)}</pre>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    );
  } catch {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-50">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
          <h1 className="text-2xl font-bold">Akses inbox gagal</h1>
          <p className="mt-2 text-sm text-slate-300">JWT tidak valid, sudah expired, atau inbox tidak ditemukan.</p>
          <Link href="/" className="mt-5 inline-block text-sm font-semibold text-cyan-300 hover:underline">
            Kembali ke generator inbox
          </Link>
        </div>
      </main>
    );
  }
}
