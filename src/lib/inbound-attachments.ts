import { db, schema } from "@/db";
import { isAllowedAssetMimeType, normalizeContentId, saveEmailAsset } from "@/lib/email-assets";

export type InboundAttachment = {
  filename?: string | null;
  mimeType?: string | null;
  contentId?: string | null;
  contentDisposition?: string | null;
  contentBase64?: string | null;
};

export async function storeInboundAttachments({
  inboxId,
  emailId,
  attachments,
}: {
  inboxId: number;
  emailId: number;
  attachments: InboundAttachment[];
}) {
  const storedAssets: Array<{ id: number; contentId: string }> = [];

  for (const attachment of attachments) {
    const mimeType = attachment.mimeType?.trim().toLowerCase() || "";
    const contentId = normalizeContentId(attachment.contentId);
    const contentBase64 = attachment.contentBase64?.trim();

    if (!contentId || !contentBase64 || !isAllowedAssetMimeType(mimeType)) {
      continue;
    }

    const buffer = Buffer.from(contentBase64, "base64");
    const saved = await saveEmailAsset(buffer, mimeType);

    const inserted = await db.insert(schema.emailAssets).values({
      inboxId,
      emailId,
      contentId,
      fileName: attachment.filename || null,
      mimeType,
      contentDisposition: attachment.contentDisposition || null,
      storageFileName: saved.fileName,
      sizeBytes: saved.sizeBytes,
    }).returning({ id: schema.emailAssets.id, contentId: schema.emailAssets.contentId });

    if (inserted[0]) {
      storedAssets.push(inserted[0]);
    }
  }

  return storedAssets;
}
