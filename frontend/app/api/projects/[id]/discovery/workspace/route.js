import { NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/backend-url";
import { getAuthHeaders } from "@/lib/server-api";

export async function GET(_request, { params }) {
  const { id } = await params;
  const backend = getBackendBaseUrl();
  try {
    const res = await fetch(`${backend}/projects/${id}/discovery/workspace`, {
      headers: { ...(await getAuthHeaders()) },
      cache: "no-store",
    });
    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text?.slice(0, 500) || "Invalid JSON from API" };
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const detail = err?.message || "Unknown network error";
    return NextResponse.json(
      { error: `Cannot reach backend (${detail})` },
      { status: 502 }
    );
  }
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const backend = getBackendBaseUrl();
  try {
    const res = await fetch(`${backend}/projects/${id}/discovery/workspace`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(await getAuthHeaders()),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text?.slice(0, 500) || "Invalid JSON from API" };
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const detail = err?.message || "Unknown network error";
    return NextResponse.json(
      { error: `Cannot reach backend (${detail})` },
      { status: 502 }
    );
  }
}
