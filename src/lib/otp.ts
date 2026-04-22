const OTP_LABEL_REGEX = /(?:otp|kode|code|verification|verifikasi|pin|passcode|one[-\s]?time)[^\d]{0,24}(\d{4,8})/i;
const OTP_FALLBACK_REGEX = /\b\d{4,8}\b/g;
const YEAR_LIKE_REGEX = /^(19\d{2}|20\d{2}|21\d{2})$/;

function shouldSkipNumericCandidate(value: string) {
  return YEAR_LIKE_REGEX.test(value);
}

export function extractOtp(text?: string | null) {
  if (!text) return null;

  const normalized = text.replace(/\s+/g, " ").trim();

  const labeledMatches = [...normalized.matchAll(new RegExp(OTP_LABEL_REGEX.source, "gi"))]
    .map((match) => match[1])
    .filter((value): value is string => Boolean(value) && !shouldSkipNumericCandidate(value));

  if (labeledMatches.length > 0) {
    return labeledMatches[0];
  }

  const matches = (normalized.match(OTP_FALLBACK_REGEX) || []).filter((value) => !shouldSkipNumericCandidate(value));
  if (matches.length === 0) return null;

  const preferredByLength = matches.find((value) => value.length === 6)
    || matches.find((value) => value.length === 5)
    || matches.find((value) => value.length === 4)
    || matches.find((value) => value.length === 7)
    || matches.find((value) => value.length === 8);

  return preferredByLength || matches[0];
}
