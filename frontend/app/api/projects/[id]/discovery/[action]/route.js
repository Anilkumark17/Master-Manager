import { NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/backend-url";
import { getAuthHeaders } from "@/lib/server-api";

export const maxDuration = 300;

const ALLOWED = new Set([
  "brainstorm",
  "prioritize",
  "validation-plan",
  "validation-analyze",
  "prd-planning",
]);

export async function POST(request, { params }) {
  const { id, action } = await params;
  if (!ALLOWED.has(action)) {
    return NextResponse.json({ error: "Unknown action" }, { status: 404 });
  }
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const backend = getBackendBaseUrl();
  try {
    const res = await fetch(
      `${backend}/projects/${id}/discovery/${action}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Connection: "keep-alive",
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );
    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text?.slice(0, 500) || "Invalid JSON from API" };
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const detail =
      err?.cause?.message || err?.cause?.code || err?.message || "Unknown";
    return NextResponse.json(
      {
        error: `Cannot reach backend at ${backend}. (${detail})`,
      },
      { status: 502 }
    );
  }
}
