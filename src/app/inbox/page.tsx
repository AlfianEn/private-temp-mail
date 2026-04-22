import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { verifyInboxJwt } from "@/lib/jwt";
import { CopyOtpButton, RefreshButton } from "@/components/inbox-actions";
import { formatDateTime } from "@/lib/date";

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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-cyan-400">private-temp-mail</p>
              <h1 className="text-3xl font-bold tracking-tight">Inbox detail</h1>
              <p className="mt-2 text-sm text-slate-400">Riwayat email disimpan sampai 30 hari untuk inbox private ini.</p>
            </div>
            <RefreshButton />
          </div>

          <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/20 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Email address</p>
              <p className="mt-2 break-all rounded-xl bg-black/30 px-4 py-3 font-mono text-sm text-cyan-300">
                {inbox.address}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
              <p className="mt-2 rounded-xl bg-black/20 px-4 py-3 text-sm font-semibold text-slate-100">{inbox.status}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Inbox ID</p>
              <p className="mt-2 rounded-xl bg-black/20 px-4 py-3 text-sm font-semibold text-slate-100">{inbox.id}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Created at</p>
              <p className="mt-2 rounded-xl bg-black/20 px-4 py-3 text-sm font-semibold text-slate-100">{formatDateTime(inbox.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Expires at</p>
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
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-5 py-8 text-center text-sm text-slate-400">
                Belum ada email masuk untuk inbox ini.
              </div>
            ) : (
              <div className="space-y-3">
                {emails.map((email) => (
                  <div key={email.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{email.subject || "(Tanpa subject)"}</p>
                        <p className="mt-1 text-xs text-slate-400">Dari: {email.fromEmail || "Unknown"}</p>
                      </div>
                      <div className="text-xs text-slate-500">{formatDateTime(email.receivedAt)}</div>
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
                      <pre className="whitespace-pre-wrap break-words font-sans">{email.textBody || email.htmlBody || "(Email body kosong)"}</pre>
                    </div>
                  </div>
                ))}
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
