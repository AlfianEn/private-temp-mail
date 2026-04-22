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

function sanitizeHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/\son\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\ssrc=("cid:[^"]*"|'cid:[^']*')/gi, "")
    .replace(/<meta[^>]*>/gi, "")
    .replace(/<link[^>]*>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?<\/embed>/gi, "")
    .replace(/<form[\s\S]*?<\/form>/gi, "")
    .replace(/<body([^>]*)>/gi, '<div$1>')
    .replace(/<\/body>/gi, '</div>');
}

export function extractDisplayImageUrls(htmlBody?: string | null) {
  const html = htmlBody?.trim() || "";
  if (!html) return [];

  const matches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => match[1]?.trim())
    .filter((value): value is string => Boolean(value) && /^https?:\/\//i.test(value));

  return [...new Set(matches)].slice(0, 6);
}

export function getDisplayEmailHtml(htmlBody?: string | null) {
  const html = htmlBody?.trim() || "";
  if (!html) return null;

  const sanitized = sanitizeHtml(html).trim();
  if (!sanitized) return null;

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <base target="_blank" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: #ffffff;
      }
      img {
        max-width: 100%;
        height: auto;
      }
      table {
        max-width: 100%;
      }
    </style>
  </head>
  <body>${sanitized}</body>
</html>`;
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
