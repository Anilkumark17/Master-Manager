import { NextResponse } from "next/server";
import { PROJECT_TYPES } from "@/lib/server/services/project/constants";
import { requireAuthUser } from "@/lib/server/auth-context";

export async function GET(request) {
  const auth = await requireAuthUser(request);
  if (auth.error) {
    return NextResponse.json(auth.error.body, { status: auth.error.status });
  }
  return NextResponse.json({ types: PROJECT_TYPES });
}
