import { NextResponse } from "next/server";
import { register } from "@/lib/server/services/auth/controller";
import { buildReq, parseJsonBody } from "@/lib/server/build-req";

const COOKIE = "mm_token";

export async function POST(request) {
  const parsed = await parseJsonBody(request);
  if (parsed.error) {
    return NextResponse.json(parsed.error.body, { status: parsed.error.status });
  }

  let statusCode = 200;
  let payload = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      payload = data;
      return this;
    },
  };

  await register(buildReq({ request, body: parsed.body }), res);

  if (!payload?.token) {
    return NextResponse.json(
      { error: payload?.error || "Registration failed" },
      { status: statusCode }
    );
  }

  const response = NextResponse.json({ user: payload.user }, { status: statusCode });
  response.cookies.set(COOKIE, payload.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
