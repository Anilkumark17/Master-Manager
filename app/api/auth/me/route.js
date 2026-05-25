import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/auth-context";

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}
