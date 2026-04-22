import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { extractOtp } from "@/lib/otp";
import { storeInboundAttachments, type InboundAttachment } from "@/lib/inbound-attachments";

function normalizeRecipient(value?: string | null) {
  return value?.trim().toLowerCase() || "";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const recipient = normalizeRecipient(body.to || body.recipient || body.envelopeTo);
    const fromEmail = body.from || body.sender || body.envelopeFrom || null;
    const subject = body.subject || null;
    const textBody = body.text || body.textBody || body.strippedText || null;
    const htmlBody = body.html || body.htmlBody || body.strippedHtml || null;
    const rawHeaders = body.headers ? JSON.stringify(body.headers) : null;
    const attachments = Array.isArray(body.attachments) ? body.attachments as InboundAttachment[] : [];

    if (!recipient) {
      return NextResponse.json({ error: "Recipient is required" }, { status: 400 });
    }

    const inbox = await db.query.inboxes.findFirst({
      where: (inboxes, { eq }) => eq(inboxes.address, recipient),
    });

    if (!inbox) {
      return NextResponse.json({ error: "Inbox not found" }, { status: 404 });
    }

    const otpCode = extractOtp(textBody || htmlBody || subject || undefined);

    const inserted = await db.insert(schema.emails).values({
      inboxId: inbox.id,
      fromEmail,
      subject,
      textBody,
      htmlBody,
      otpCode,
      rawHeaders,
    }).returning();

    const emailId = inserted[0]?.id;
    const storedAssets = emailId
      ? await storeInboundAttachments({ inboxId: inbox.id, emailId, attachments })
      : [];

    await db
      .update(schema.inboxes)
      .set({ lastReceivedAt: new Date().toISOString() })
      .where(eq(schema.inboxes.id, inbox.id));

    return NextResponse.json({
      success: true,
      inboxId: inbox.id,
      emailId,
      otpCode,
      storedAssets: storedAssets.length,
    });
  } catch (error) {
    console.error("POST /api/inbound error:", error);
    return NextResponse.json({ error: "Failed to process inbound email" }, { status: 500 });
  }
}
