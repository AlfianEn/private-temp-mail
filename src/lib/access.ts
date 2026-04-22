export const ACCESS_COOKIE_NAME = "ptm_access";

function weakHash(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16);
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;

  let result = 0;
  for (let i = 0; i < left.length; i += 1) {
    result |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return result === 0;
}

export function getAccessPassword() {
  return process.env.ACCESS_PASSWORD || "";
}

export function getAccessCookieValue() {
  const password = getAccessPassword();
  return password ? weakHash(password) : "";
}

export function isValidAccessCookie(value?: string) {
  const expected = getAccessCookieValue();
  if (!value || !expected) return false;
  return safeEqual(value, expected);
}

export function isValidAccessPassword(password?: string) {
  const expected = getAccessPassword();
  if (!password || !expected) return false;
  return safeEqual(password, expected);
}
