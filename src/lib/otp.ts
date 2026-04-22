const OTP_LABEL_REGEX = /(?:otp|kode|code|verification|verifikasi|pin|passcode|one[-\s]?time|security code|login code|confirmation code)[^\d]{0,32}(\d{4,8})/i;
const OTP_FALLBACK_REGEX = /\b\d{4,8}\b/g;
const YEAR_LIKE_REGEX = /^(19\d{2}|20\d{2}|21\d{2})$/;

const NEGATIVE_CONTEXT_REGEX = /(?:rp\s?|idr\s?|usd\s?|eur\s?|\$|price|harga|amount|total|invoice|order|subscription|langganan|billing|tagihan|postal|postcode|zip|kode pos|address|alamat|street|st\.?|road|rd\.?|avenue|ave\.?|boulevard|blvd\.?|san francisco|california|\bca\b|phone|telp|tel|fax)/i;
const POSITIVE_CONTEXT_REGEX = /(?:otp|kode|code|verification|verifikasi|pin|passcode|one[-\s]?time|security|login|confirm|confirmation|auth|authentication)/i;

function shouldSkipNumericCandidate(value: string) {
  return YEAR_LIKE_REGEX.test(value);
}

function getCandidateScore(fullText: string, candidate: string, index: number) {
  const start = Math.max(0, index - 40);
  const end = Math.min(fullText.length, index + candidate.length + 40);
  const context = fullText.slice(start, end);

  if (NEGATIVE_CONTEXT_REGEX.test(context)) {
    return -100;
  }

  let score = 0;

  if (POSITIVE_CONTEXT_REGEX.test(context)) score += 6;
  if (candidate.length === 6) score += 4;
  else if (candidate.length === 5) score += 1;
  else if (candidate.length === 4) score += 1;
  else score -= 1;

  const lineStart = fullText.lastIndexOf("\n", index) + 1;
  const lineEndRaw = fullText.indexOf("\n", index);
  const lineEnd = lineEndRaw === -1 ? fullText.length : lineEndRaw;
  const line = fullText.slice(lineStart, lineEnd).trim();

  if (line === candidate) score += 3;
  if (new RegExp(`(?:^|\\s)${candidate}(?:\\s|$)`).test(line)) score += 1;

  return score;
}

export function extractOtp(text?: string | null) {
  if (!text) return null;

  const normalized = text.replace(/\r/g, "").trim();
  const flatText = normalized.replace(/\s+/g, " ");

  const labeledMatches = [...flatText.matchAll(new RegExp(OTP_LABEL_REGEX.source, "gi"))]
    .map((match) => match[1])
    .filter((value): value is string => Boolean(value) && !shouldSkipNumericCandidate(value));

  if (labeledMatches.length > 0) {
    return labeledMatches[0];
  }

  const matches = [...normalized.matchAll(OTP_FALLBACK_REGEX)]
    .map((match) => ({ value: match[0], index: match.index ?? 0 }))
    .filter(({ value }) => !shouldSkipNumericCandidate(value));

  if (matches.length === 0) return null;

  const ranked = matches
    .map(({ value, index }) => ({
      value,
      score: getCandidateScore(normalized.toLowerCase(), value.toLowerCase(), index),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);

  return ranked[0]?.value || null;
}
