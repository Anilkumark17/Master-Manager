import { NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/backend-url";
import { getAuthHeaders } from "@/lib/server-api";

export async function GET(request, { params }) {
  const { id, deliverableId } = await params;
  const backend = getBackendBaseUrl();
  try {
    const res = await fetch(
      `${backend}/projects/${id}/designer/deliverables/${deliverableId}`,
      {
        headers: {
          Connection: "keep-alive",
          ...(await getAuthHeaders()),
        },
        cache: "no-store",
      }
    );
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

export async function PATCH(request, { params }) {
  const { id, deliverableId } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const backend = getBackendBaseUrl();
  try {
    const res = await fetch(
      `${backend}/projects/${id}/designer/deliverables/${deliverableId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Connection: "keep-alive",
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );
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
