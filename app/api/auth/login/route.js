import { NextResponse } from "next/server";
import { login } from "@/lib/server/services/auth/controller";
import { buildReq, parseJsonBody } from "@/lib/server/build-req";

const COOKIE = "mm_token";

function setAuthCookie(response, token) {
  response.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

async function handleAuthAction(request, controller) {
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

  await controller(buildReq({ request, body: parsed.body }), res);

  if (!payload?.token) {
    return NextResponse.json(
      { error: payload?.error || "Authentication failed" },
      { status: statusCode }
    );
  }

  const response = NextResponse.json({ user: payload.user }, { status: statusCode });
  setAuthCookie(response, payload.token);
  return response;
}

export async function POST(request) {
  return handleAuthAction(request, login);
}
