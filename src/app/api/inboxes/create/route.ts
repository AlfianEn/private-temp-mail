import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { generateInboxAddress } from "@/lib/inbox";
import { signInboxJwt } from "@/lib/jwt";
import { createHash } from "crypto";

export async function POST() {
  try {
    let address = generateInboxAddress();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const existing = await db.query.inboxes.findFirst({
        where: (inboxes, { eq }) => eq(inboxes.address, address),
      });

      if (!existing) break;
      address = generateInboxAddress();
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const result = await db.insert(schema.inboxes).values({
      address,
      status: "active",
      expiresAt,
    }).returning();

    const inbox = result[0];
    const jwt = await signInboxJwt({ inboxId: inbox.id, address: inbox.address });
    const tokenHash = createHash("sha256").update(jwt).digest("hex");

    await db.insert(schema.inboxTokens).values({
      inboxId: inbox.id,
      tokenHash,
      token: jwt,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    return NextResponse.json({
      inbox: {
        id: inbox.id,
        address: inbox.address,
        expiresAt: inbox.expiresAt,
      },
      jwt,
      inboxUrl: `/inbox?jwt=${jwt}`,
    });
  } catch (error) {
    console.error("POST /api/inboxes/create error:", error);
    return NextResponse.json({ error: "Failed to create inbox" }, { status: 500 });
  }
}
