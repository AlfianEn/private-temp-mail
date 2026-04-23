import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { deleteStoredAsset } from "@/lib/email-assets";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ inboxId: string }> },
) {
  try {
    const { inboxId } = await params;
    const targetInboxId = Number(inboxId);

    const inbox = await db.query.inboxes.findFirst({
      where: (inboxes, { eq }) => eq(inboxes.id, targetInboxId),
    });

    if (!inbox) {
      return NextResponse.json({ error: "Inbox tidak ditemukan" }, { status: 404 });
    }

    const assets = await db
      .select({ storageFileName: schema.emailAssets.storageFileName })
      .from(schema.emailAssets)
      .where(eq(schema.emailAssets.inboxId, targetInboxId));

    for (const asset of assets) {
      await deleteStoredAsset(asset.storageFileName);
    }

    await db.delete(schema.emailAssets).where(eq(schema.emailAssets.inboxId, targetInboxId));
    await db.delete(schema.emails).where(eq(schema.emails.inboxId, targetInboxId));
    await db.delete(schema.inboxTokens).where(eq(schema.inboxTokens.inboxId, targetInboxId));
    await db.delete(schema.inboxes).where(eq(schema.inboxes.id, targetInboxId));

    return NextResponse.json({ success: true, deletedInboxId: targetInboxId });
  } catch (error) {
    console.error("DELETE /api/inboxes/[inboxId] error:", error);
    return NextResponse.json({ error: "Gagal menghapus inbox" }, { status: 500 });
  }
}
