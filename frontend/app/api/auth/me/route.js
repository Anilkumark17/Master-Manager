import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/server-jwt";

export async function GET() {
  const token = (await cookies()).get("mm_token")?.value;
  const payload = token ? verifySessionToken(token) : null;
  if (!payload?.sub) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    },
  });
}
