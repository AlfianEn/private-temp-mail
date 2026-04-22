import { NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME } from "@/lib/access";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ACCESS_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
