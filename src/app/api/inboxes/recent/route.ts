import { NextResponse } from "next/server";
import { desc, eq, gt } from "drizzle-orm";
import { db, schema } from "@/db";

export async function GET() {
  try {
    const now = new Date().toISOString();

    const inboxes = await db
      .select()
      .from(schema.inboxes)
      .orderBy(desc(schema.inboxes.createdAt))
      .limit(12);

    const result = [] as Array<{
      id: number;
      address: string;
      expiresAt: string | null;
      createdAt: string;
      inboxUrl: string | null;
    }>;

    for (const inbox of inboxes) {
      const tokenRow = await db.query.inboxTokens.findFirst({
        where: (inboxTokens, { and, eq, gt, isNotNull }) => and(
          eq(inboxTokens.inboxId, inbox.id),
          gt(inboxTokens.expiresAt, now),
          isNotNull(inboxTokens.token),
        ),
        orderBy: (inboxTokens, { desc }) => [desc(inboxTokens.createdAt)],
      });

      result.push({
        id: inbox.id,
        address: inbox.address,
        expiresAt: inbox.expiresAt,
        createdAt: inbox.createdAt,
        inboxUrl: tokenRow?.token ? `/inbox?jwt=${tokenRow.token}` : null,
      });
    }

    return NextResponse.json({ inboxes: result.filter((item) => item.inboxUrl) });
  } catch (error) {
    console.error("GET /api/inboxes/recent error:", error);
    return NextResponse.json({ error: "Gagal mengambil inbox tersimpan" }, { status: 500 });
  }
}
