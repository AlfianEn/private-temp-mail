function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function normalizePlainText(value: string) {
  const normalizedLines = value
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return normalizedLines || "(Email body kosong)";
}

export function getDisplayEmailBody(textBody?: string | null, htmlBody?: string | null) {
  const text = textBody?.trim();
  if (text && !/<[a-z][\s\S]*>/i.test(text)) {
    return normalizePlainText(text);
  }

  const html = htmlBody?.trim() || textBody?.trim() || "";
  if (!html) return "(Email body kosong)";

  const stripped = decodeHtmlEntities(
    html
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<head[\s\S]*?<\/head>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/tr>/gi, "\n")
      .replace(/<li>/gi, "- ")
      .replace(/<td[^>]*>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );

  return normalizePlainText(
    stripped
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
  );
}
