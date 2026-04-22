import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME, getAccessCookieValue, isValidAccessPassword } from "@/lib/access";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = typeof body.password === "string" ? body.password : "";

    if (!isValidAccessPassword(password)) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(ACCESS_COOKIE_NAME, getAccessCookieValue(), {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Login gagal" }, { status: 500 });
  }
}
