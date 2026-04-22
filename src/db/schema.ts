import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const inboxes = sqliteTable("inboxes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  address: text("address").notNull().unique(),
  label: text("label"),
  status: text("status").notNull().default("active"),
  lastReceivedAt: text("last_received_at"),
  expiresAt: text("expires_at"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const emails = sqliteTable("emails", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  inboxId: integer("inbox_id").notNull().references(() => inboxes.id),
  fromEmail: text("from_email"),
  subject: text("subject"),
  textBody: text("text_body"),
  htmlBody: text("html_body"),
  otpCode: text("otp_code"),
  rawHeaders: text("raw_headers"),
  receivedAt: text("received_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const inboxTokens = sqliteTable("inbox_tokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  inboxId: integer("inbox_id").notNull().references(() => inboxes.id),
  tokenHash: text("token_hash").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});
