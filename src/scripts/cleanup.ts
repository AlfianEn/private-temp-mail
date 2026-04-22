import { inArray, lt } from "drizzle-orm";
import { db, schema } from "@/db";
import { getRetentionCutoffIso } from "@/lib/retention";
import { deleteStoredAsset } from "@/lib/email-assets";

async function main() {
  const cutoff = getRetentionCutoffIso();

  const expiredEmails = await db
    .select({ id: schema.emails.id })
    .from(schema.emails)
    .where(lt(schema.emails.receivedAt, cutoff));

  const expiredEmailIds = expiredEmails.map((email) => email.id);

  const expiredAssets = expiredEmailIds.length > 0
    ? await db
      .select({ id: schema.emailAssets.id, storageFileName: schema.emailAssets.storageFileName })
      .from(schema.emailAssets)
      .where(inArray(schema.emailAssets.emailId, expiredEmailIds))
    : [];

  for (const asset of expiredAssets) {
    await deleteStoredAsset(asset.storageFileName);
  }

  if (expiredEmailIds.length > 0) {
    await db.delete(schema.emailAssets).where(inArray(schema.emailAssets.emailId, expiredEmailIds));
  }

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
      deletedAssets: expiredAssets.length,
      deletedTokens: deletedTokens.length,
      deletedInboxes: deletedInboxes.length,
    }),
  );
}

main().catch((error) => {
  console.error("cleanup failed", error);
  process.exit(1);
});
