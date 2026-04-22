const INBOX_DOMAIN = process.env.INBOX_DOMAIN || "box.qiassychecksheet.online";

function randomPart(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function generateInboxAddress(prefix = "box") {
  return `${prefix}-${randomPart(6)}@${INBOX_DOMAIN}`;
}

export { INBOX_DOMAIN };
