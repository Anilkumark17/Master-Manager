import { NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/backend-url";
import { fetchToBackendWithRetry } from "@/lib/backend-fetch";
import { getAuthHeaders } from "@/lib/server-api";

export const maxDuration = 900;

const POST_ACTIONS = new Set([
  "brainstorm",
  "prioritize",
  "validation-plan",
  "validation-analyze",
  "prd-planning",
]);

function jsonFromBackendText(text, res) {
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {
      error:
        text?.slice(0, 500) ||
        `Invalid JSON from backend (HTTP ${res.status})`,
    };
  }
  return data;
}

/** GET/PATCH …/discovery/workspace — proxied here so this route is the only handler (avoids static vs [action] conflicts returning HTML). */
export async function GET(_request, { params }) {
  const { id, action } = await params;
  if (action !== "workspace") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const backend = getBackendBaseUrl();
  try {
    const res = await fetch(`${backend}/projects/${id}/discovery/workspace`, {
      headers: { ...(await getAuthHeaders()) },
      cache: "no-store",
    });
    const text = await res.text();
    const data = jsonFromBackendText(text, res);
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
  const { id, action } = await params;
  if (action !== "workspace") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
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
    const data = jsonFromBackendText(text, res);
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const detail = err?.message || "Unknown network error";
    return NextResponse.json(
      { error: `Cannot reach backend (${detail})` },
      { status: 502 }
    );
  }
}

export async function POST(request, { params }) {
  const { id, action } = await params;
  if (!POST_ACTIONS.has(action)) {
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
    const res = await fetchToBackendWithRetry(
      `${backend}/projects/${id}/discovery/${action}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
      { extraAttempts: 2 }
    );
    const text = await res.text();
    const data = jsonFromBackendText(text, res);
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
