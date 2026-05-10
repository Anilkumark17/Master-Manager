import { NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/backend-url";
import { getAuthHeaders } from "@/lib/server-api";

export async function GET(request, { params }) {
  const { id } = await params;
  const backend = getBackendBaseUrl();
  const res = await fetch(`${backend}/projects/${id}/prds`, {
    headers: await getAuthHeaders(),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request, { params }) {
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const backend = getBackendBaseUrl();
  const res = await fetch(`${backend}/projects/${id}/prds`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
