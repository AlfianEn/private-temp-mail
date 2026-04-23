import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { verifyInboxJwt } from "@/lib/jwt";
import { deleteStoredAsset } from "@/lib/email-assets";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ inboxId: string }> },
) {
  try {
    const { inboxId } = await params;
    const jwt = new URL(request.url).searchParams.get("jwt");

    if (!jwt) {
      return NextResponse.json({ error: "JWT diperlukan" }, { status: 400 });
    }

    const payload = await verifyInboxJwt(jwt);
    const targetInboxId = Number(inboxId);

    if (Number(payload.inboxId) !== targetInboxId) {
      return NextResponse.json({ error: "Inbox tidak valid" }, { status: 403 });
    }

    const assets = await db
      .select({ storageFileName: schema.emailAssets.storageFileName })
      .from(schema.emailAssets)
      .where(eq(schema.emailAssets.inboxId, targetInboxId));

    for (const asset of assets) {
      await deleteStoredAsset(asset.storageFileName);
    }

    await db.delete(schema.emailAssets).where(eq(schema.emailAssets.inboxId, targetInboxId));
    const deletedEmails = await db.delete(schema.emails).where(eq(schema.emails.inboxId, targetInboxId)).returning({ id: schema.emails.id });

    return NextResponse.json({ success: true, deletedEmails: deletedEmails.length });
  } catch (error) {
    console.error("DELETE /api/inboxes/[inboxId]/emails error:", error);
    return NextResponse.json({ error: "Gagal membersihkan inbox" }, { status: 500 });
  }
}
