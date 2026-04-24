import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { verifyInboxJwt } from "@/lib/jwt";
import { InboxPageClient } from "@/components/inbox-page-client";
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

  const initialEmails = emails.map((email) => {
    const emailAssets = assets
      .filter((asset) => asset.emailId === email.id)
      .map((asset) => ({ id: asset.id, contentId: asset.contentId }));
    const remoteImagesBlocked = hasRemoteImages(email.htmlBody);
    const displayHtml = getDisplayEmailHtml(email.htmlBody, emailAssets, jwt);
    const displayHtmlWithRemote = remoteImagesBlocked
      ? getDisplayEmailHtml(email.htmlBody, emailAssets, jwt, true)
      : displayHtml;

    return {
      id: email.id,
      subject: email.subject || "(Tanpa subject)",
      fromEmail: email.fromEmail || "Tidak diketahui",
      receivedLabel: formatRelativeTime(email.receivedAt),
      displayHtml,
      displayHtmlWithRemote,
      displayBody: getDisplayEmailBody(email.textBody, email.htmlBody),
      otpCode: email.otpCode,
      isForwarded: Boolean(email.subject?.toLowerCase().startsWith("fwd:") || email.subject?.toLowerCase().startsWith("fw:")),
      isHtml: Boolean(email.htmlBody && email.htmlBody.trim()),
      hasLocalCidAssets: emailAssets.length > 0,
      hasRemoteImages: remoteImagesBlocked,
    };
  });

  return <InboxPageClient jwt={jwt} inbox={inbox} initialEmails={initialEmails} />;
}
