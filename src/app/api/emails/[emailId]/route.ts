import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { verifyInboxJwt } from "@/lib/jwt";
import { deleteStoredAsset } from "@/lib/email-assets";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ emailId: string }> },
) {
  try {
    const { emailId } = await params;
    const jwt = request.nextUrl.searchParams.get("jwt");

    if (!jwt) {
      return NextResponse.json({ error: "JWT diperlukan" }, { status: 400 });
    }

    const payload = await verifyInboxJwt(jwt);
    const inboxId = Number(payload.inboxId);
    const targetEmailId = Number(emailId);

    const email = await db.query.emails.findFirst({
      where: (emails, { eq, and }) => and(eq(emails.id, targetEmailId), eq(emails.inboxId, inboxId)),
    });

    if (!email) {
      return NextResponse.json({ error: "Email tidak ditemukan" }, { status: 404 });
    }

    const assets = await db
      .select({ id: schema.emailAssets.id, storageFileName: schema.emailAssets.storageFileName })
      .from(schema.emailAssets)
      .where(and(eq(schema.emailAssets.emailId, targetEmailId), eq(schema.emailAssets.inboxId, inboxId)));

    for (const asset of assets) {
      await deleteStoredAsset(asset.storageFileName);
    }

    await db.delete(schema.emailAssets).where(and(eq(schema.emailAssets.emailId, targetEmailId), eq(schema.emailAssets.inboxId, inboxId)));
    await db.delete(schema.emails).where(and(eq(schema.emails.id, targetEmailId), eq(schema.emails.inboxId, inboxId)));

    return NextResponse.json({ success: true, deletedEmailId: targetEmailId, deletedAssets: assets.length });
  } catch (error) {
    console.error("DELETE /api/emails/[emailId] error:", error);
    return NextResponse.json({ error: "Gagal menghapus email" }, { status: 500 });
  }
}
