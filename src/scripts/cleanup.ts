import { lt } from "drizzle-orm";
import { db, schema } from "@/db";
import { getRetentionCutoffIso } from "@/lib/retention";

async function main() {
  const cutoff = getRetentionCutoffIso();

  const deletedEmails = await db
    .delete(schema.emails)
    .where(lt(schema.emails.receivedAt, cutoff))
    .returning({ id: schema.emails.id });

  const deletedTokens = await db
    .delete(schema.inboxTokens)
    .where(lt(schema.inboxTokens.expiresAt, new Date().toISOString()))
    .returning({ id: schema.inboxTokens.id });

  const deletedInboxes = await db
    .delete(schema.inboxes)
    .where(lt(schema.inboxes.expiresAt, cutoff))
    .returning({ id: schema.inboxes.id });

  console.log(
    JSON.stringify({
      success: true,
      cutoff,
      deletedEmails: deletedEmails.length,
      deletedTokens: deletedTokens.length,
      deletedInboxes: deletedInboxes.length,
    }),
  );
}

main().catch((error) => {
  console.error("cleanup failed", error);
  process.exit(1);
});
