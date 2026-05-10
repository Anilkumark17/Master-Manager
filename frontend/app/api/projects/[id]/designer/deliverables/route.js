import { NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/backend-url";
import { getAuthHeaders } from "@/lib/server-api";

export async function GET(request, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");
  const backend = getBackendBaseUrl();
  const qs = kind ? `?kind=${encodeURIComponent(kind)}` : "";
  try {
    const res = await fetch(`${backend}/projects/${id}/designer/deliverables${qs}`, {
      headers: {
        Connection: "keep-alive",
        ...(await getAuthHeaders()),
      },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const detail =
      err?.cause?.message || err?.cause?.code || err?.message || "Network error";
    return NextResponse.json(
      { error: `Cannot reach backend (${detail})` },
      { status: 502 }
    );
  }
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
  try {
    const res = await fetch(`${backend}/projects/${id}/designer/deliverables`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Connection: "keep-alive",
        ...(await getAuthHeaders()),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const detail =
      err?.cause?.message || err?.cause?.code || err?.message || "Network error";
    return NextResponse.json(
      { error: `Cannot reach backend (${detail})` },
      { status: 502 }
    );
  }
}
