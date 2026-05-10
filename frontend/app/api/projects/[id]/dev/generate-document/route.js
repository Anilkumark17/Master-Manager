import { NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/backend-url";
import { fetchToBackend } from "@/lib/backend-fetch";
import { getAuthHeaders } from "@/lib/server-api";

export const maxDuration = 900;

export async function POST(request, { params }) {
  const { id } = await params;
  let body = {};
  try {
    const text = await request.text();
    if (text) {
      body = JSON.parse(text);
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const backend = getBackendBaseUrl();
  try {
    const res = await fetchToBackend(
      `${backend}/projects/${id}/dev/generate-document`,
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
      err?.cause?.message ||
      err?.cause?.code ||
      err?.message ||
      "Unknown network error";
    return NextResponse.json(
      {
        error: `Cannot reach backend at ${backend}. Is it running? (${detail})`,
      },
      { status: 502 }
    );
  }
}
