import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { deleteStoredAsset } from "@/lib/email-assets";

export async function DELETE() {
  try {
    const assets = await db
      .select({ storageFileName: schema.emailAssets.storageFileName })
      .from(schema.emailAssets);

    for (const asset of assets) {
      await deleteStoredAsset(asset.storageFileName);
    }

    await db.delete(schema.emailAssets);
    await db.delete(schema.emails);
    await db.delete(schema.inboxTokens);
    await db.delete(schema.inboxes);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/inboxes error:", error);
    return NextResponse.json({ error: "Gagal menghapus semua inbox" }, { status: 500 });
  }
}
