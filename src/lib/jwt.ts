import { jwtVerify, SignJWT } from "jose";

const secretValue = process.env.JWT_SECRET || "change-me-private-temp-mail";
const secret = new TextEncoder().encode(secretValue);

export async function signInboxJwt(payload: { inboxId: number; address: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyInboxJwt(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as { inboxId: number; address: string; exp?: number; iat?: number };
}
