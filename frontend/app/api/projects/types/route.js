import { NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/backend-url";
import { getAuthHeaders } from "@/lib/server-api";

export async function GET() {
  const backend = getBackendBaseUrl();
  const res = await fetch(`${backend}/projects/types`, {
    headers: await getAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
