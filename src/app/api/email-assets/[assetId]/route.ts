import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { verifyInboxJwt } from "@/lib/jwt";
import { getAssetStoragePath, isAllowedAssetMimeType } from "@/lib/email-assets";
import { promises as fs } from "node:fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> },
) {
  try {
    const { assetId } = await params;
    const jwt = request.nextUrl.searchParams.get("jwt");

    if (!jwt) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const payload = await verifyInboxJwt(jwt);
    const inboxId = Number(payload.inboxId);

    const asset = await db.query.emailAssets.findFirst({
      where: (emailAssets, { eq, and }) => and(eq(emailAssets.id, Number(assetId)), eq(emailAssets.inboxId, inboxId)),
    });

    if (!asset || !isAllowedAssetMimeType(asset.mimeType)) {
      return new NextResponse("Not found", { status: 404 });
    }

    const fileBuffer = await fs.readFile(getAssetStoragePath(asset.storageFileName));

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": asset.mimeType,
        "Cache-Control": "private, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
