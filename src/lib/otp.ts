const OTP_REGEX = /\b\d{4,8}\b/g;

export function extractOtp(text?: string | null) {
  if (!text) return null;

  const matches = text.match(OTP_REGEX);
  if (!matches || matches.length === 0) return null;

  return matches[0];
}
