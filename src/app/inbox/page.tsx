import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { verifyInboxJwt } from "@/lib/jwt";
import { AutoRefresh } from "@/components/auto-refresh";
import { EmailCard } from "@/components/email-card";
import { RefreshButton } from "@/components/inbox-actions";
import { ClearInboxButton } from "@/components/clear-inbox-button";
import { LogoutButton } from "@/components/logout-button";
import { CopyButton } from "@/components/copy-button";
import { formatDateTime } from "@/lib/date";
import { formatRelativeTime } from "@/lib/time";
import { getDisplayEmailBody, getDisplayEmailHtml, hasRemoteImages } from "@/lib/email";

type InboxPageProps = {
  searchParams: Promise<{ jwt?: string }>;
};

type InboxPageData = {
  inbox: NonNullable<Awaited<ReturnType<typeof db.query.inboxes.findFirst>>>;
  emails: typeof schema.emails.$inferSelect[];
  assets: typeof schema.emailAssets.$inferSelect[];
};

function InvalidInboxState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-50">
      <div className="mx-auto max-w-3xl rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-slate-300">{description}</p>
        <Link href="/" className="mt-5 inline-block text-sm font-semibold text-cyan-300 hover:underline">
          Kembali ke generator inbox
        </Link>
      </div>
    </main>
  );
}

async function getInboxPageData(jwt: string): Promise<InboxPageData | null> {
  try {
    const payload = await verifyInboxJwt(jwt);
    const inboxId = Number(payload.inboxId);

    const inbox = await db.query.inboxes.findFirst({
      where: (inboxes, { eq }) => eq(inboxes.id, inboxId),
    });

    if (!inbox) {
      return null;
    }

    const emails = await db
      .select()
      .from(schema.emails)
      .where(eq(schema.emails.inboxId, inboxId))
      .orderBy(desc(schema.emails.receivedAt));

    const assets = await db
      .select()
      .from(schema.emailAssets)
      .where(eq(schema.emailAssets.inboxId, inboxId));

    return { inbox, emails, assets };
  } catch {
    return null;
  }
}

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const { jwt } = await searchParams;

  if (!jwt) {
    return <InvalidInboxState title="Inbox link tidak valid" description="Parameter JWT tidak ditemukan." />;
  }

  const pageData = await getInboxPageData(jwt);

  if (!pageData || !pageData.inbox) {
    return <InvalidInboxState title="Akses inbox gagal" description="JWT tidak valid, sudah expired, atau inbox tidak ditemukan." />;
  }

  const { inbox, emails, assets } = pageData;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-50 sm:px-6 sm:py-14">
      <AutoRefresh intervalMs={15000} />
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-xl shadow-cyan-950/5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/90">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              private-temp-mail
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">Inbox</h1>
            <p className="mt-2 text-sm text-slate-400">Riwayat email untuk inbox ini disimpan sampai 30 hari.</p>
            <p className="mt-1 break-all font-mono text-sm text-cyan-300/90">{inbox.address}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-start lg:justify-end">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900/70 px-4 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-slate-900"
            >
              Buat inbox
            </Link>
            <ClearInboxButton inboxId={inbox.id} jwt={jwt} />
            <RefreshButton />
            <LogoutButton />
          </div>
        </div>

        <div className="grid gap-3 rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-lg shadow-cyan-950/5 sm:grid-cols-2 xl:grid-cols-3">
          <div className="sm:col-span-2 xl:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Alamat email</p>
              <CopyButton text={inbox.address} label="Salin alamat" />
            </div>
            <p className="mt-2 break-all rounded-2xl border border-cyan-400/10 bg-cyan-500/5 px-4 py-3 font-mono text-sm text-cyan-300">
              {inbox.address}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status inbox</p>
            <p className="mt-2 rounded-2xl bg-black/20 px-4 py-3 text-sm font-semibold text-slate-100">{inbox.status}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">ID inbox</p>
            <p className="mt-2 rounded-2xl bg-black/20 px-4 py-3 text-sm font-semibold text-slate-100">{inbox.id}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Dibuat</p>
            <p className="mt-2 rounded-2xl bg-black/20 px-4 py-3 text-sm font-semibold text-slate-100">{formatDateTime(inbox.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Berakhir</p>
            <p className="mt-2 rounded-2xl bg-black/20 px-4 py-3 text-sm font-semibold text-slate-100">{formatDateTime(inbox.expiresAt)}</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-lg shadow-cyan-950/5">
          <div className="sticky top-3 z-10 mb-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/85 px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Riwayat email</h2>
              <p className="mt-1 text-sm text-slate-400">Email terbaru akan muncul otomatis setiap beberapa detik.</p>
            </div>
            <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
              {emails.length} email
            </span>
          </div>

          {emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 px-5 py-10 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <svg className="h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <p className="text-sm font-medium text-slate-300">Belum ada email masuk</p>
              <p className="mt-1 max-w-xs text-xs text-slate-500">Email yang dikirim ke address inbox ini akan muncul di sini secara otomatis.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {emails.map((email, index) => {
                const isForwarded = Boolean(email.subject?.toLowerCase().startsWith("fwd:") || email.subject?.toLowerCase().startsWith("fw:"));
                const isHtml = Boolean(email.htmlBody && email.htmlBody.trim());
                const emailAssets = assets
                  .filter((asset) => asset.emailId === email.id)
                  .map((asset) => ({ id: asset.id, contentId: asset.contentId }));
                const remoteImagesBlocked = hasRemoteImages(email.htmlBody);
                const displayHtml = getDisplayEmailHtml(email.htmlBody, emailAssets, jwt);
                const displayHtmlWithRemote = remoteImagesBlocked
                  ? getDisplayEmailHtml(email.htmlBody, emailAssets, jwt, true)
                  : displayHtml;

                return (
                  <EmailCard
                    key={email.id}
                    id={email.id}
                    subject={email.subject || "(Tanpa subject)"}
                    jwt={jwt}
                    fromEmail={email.fromEmail || "Tidak diketahui"}
                    receivedLabel={formatRelativeTime(email.receivedAt)}
                    displayHtml={displayHtml}
                    displayHtmlWithRemote={displayHtmlWithRemote}
                    displayBody={getDisplayEmailBody(email.textBody, email.htmlBody)}
                    otpCode={email.otpCode}
                    isForwarded={isForwarded}
                    isHtml={isHtml}
                    hasLocalCidAssets={emailAssets.length > 0}
                    hasRemoteImages={remoteImagesBlocked}
                    isNewest={index === 0}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
