import { NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/backend-url";
import { getAuthHeaders } from "@/lib/server-api";

export async function GET(request, { params }) {
  const { id, prdId } = await params;
  const backend = getBackendBaseUrl();
  const res = await fetch(`${backend}/projects/${id}/prds/${prdId}`, {
    headers: await getAuthHeaders(),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(request, { params }) {
  const { id, prdId } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const backend = getBackendBaseUrl();
  const res = await fetch(`${backend}/projects/${id}/prds/${prdId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
