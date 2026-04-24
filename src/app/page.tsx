import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { decodeMimeWords } from "@/lib/email";
import { HomeClient, type RecentInbox } from "@/components/home-client";

export const dynamic = "force-dynamic";

async function getInitialRecentInboxes(): Promise<RecentInbox[]> {
  try {
    const now = new Date().toISOString();

    const inboxes = await db
      .select()
      .from(schema.inboxes)
      .orderBy(desc(schema.inboxes.createdAt));

    const result: RecentInbox[] = [];

    for (const inbox of inboxes) {
      const tokenRow = await db.query.inboxTokens.findFirst({
        where: (inboxTokens, { and, eq, gt, isNotNull }) => and(
          eq(inboxTokens.inboxId, inbox.id),
          gt(inboxTokens.expiresAt, now),
          isNotNull(inboxTokens.token),
        ),
        orderBy: (inboxTokens, { desc }) => [desc(inboxTokens.createdAt)],
      });

      const latestEmail = await db.query.emails.findFirst({
        where: (emails, { eq }) => eq(emails.inboxId, inbox.id),
        orderBy: (emails, { desc }) => [desc(emails.receivedAt)],
      });

      if (!tokenRow?.token) {
        continue;
      }

      result.push({
        id: inbox.id,
        address: inbox.address,
        expiresAt: inbox.expiresAt,
        createdAt: inbox.createdAt,
        lastReceivedAt: inbox.lastReceivedAt,
        latestEmailSubject: decodeMimeWords(latestEmail?.subject || "") || null,
        latestEmailFrom: decodeMimeWords(latestEmail?.fromEmail || "") || null,
        latestEmailOtp: latestEmail?.otpCode || null,
        inboxUrl: `/inbox?jwt=${tokenRow.token}`,
      });
    }

    return result;
  } catch (error) {
    console.error("GET / initial recent inboxes error:", error);
    return [];
  }
}

export default async function HomePage() {
  const initialRecentInboxes = await getInitialRecentInboxes();

  return <HomeClient initialRecentInboxes={initialRecentInboxes} />;
}
