import { NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/backend-url";

const COOKIE = "mm_token";

export async function POST(request) {
  const backend = getBackendBaseUrl();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const res = await fetch(`${backend}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      { error: data.error || "Login failed" },
      { status: res.status }
    );
  }

  const response = NextResponse.json({ user: data.user });
  response.cookies.set(COOKIE, data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
