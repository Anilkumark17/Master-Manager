import { NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/backend-url";
import { fetchToBackend } from "@/lib/backend-fetch";
import { getAuthHeaders } from "@/lib/server-api";

export const maxDuration = 900;

export async function POST(request, { params }) {
  const { id } = await params;
  let bodyText = "";
  try {
    bodyText = await request.text();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const backend = getBackendBaseUrl();
  try {
    const res = await fetchToBackend(
      `${backend}/projects/${id}/dev/generate-document-stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Connection: "keep-alive",
          ...(await getAuthHeaders()),
        },
        body: bodyText || "{}",
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const t = await res.text();
      let data = {};
      try {
        data = t ? JSON.parse(t) : {};
      } catch {
        data = { error: t?.slice(0, 500) || res.statusText };
      }
      return NextResponse.json(data, { status: res.status });
    }

    if (!res.body) {
      return NextResponse.json(
        { error: "Empty stream from backend" },
        { status: 502 }
      );
    }

    return new Response(res.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
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
