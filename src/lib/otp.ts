const OTP_LABEL_REGEX = /(?:otp|kode|code|verification|verifikasi|pin)[^\d]{0,20}(\d{4,8})/i;
const OTP_FALLBACK_REGEX = /\b\d{4,8}\b/g;

export function extractOtp(text?: string | null) {
  if (!text) return null;

  const normalized = text.replace(/\s+/g, " ").trim();
  const labeledMatch = normalized.match(OTP_LABEL_REGEX);
  if (labeledMatch?.[1]) {
    return labeledMatch[1];
  }

  const matches = normalized.match(OTP_FALLBACK_REGEX);
  if (!matches || matches.length === 0) return null;

  if (matches.length === 1) {
    return matches[0];
  }

  const preferred = matches.find((value) => value.length === 6) || matches.find((value) => value.length === 5);
  return preferred || matches[0];
}
