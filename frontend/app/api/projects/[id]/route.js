import { NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/backend-url";
import { getAuthHeaders } from "@/lib/server-api";

async function forward(method, id, body) {
  const backend = getBackendBaseUrl();
  const headers = {
    ...(method !== "DELETE" ? { "Content-Type": "application/json" } : {}),
    ...(await getAuthHeaders()),
  };
  const opts = { method, headers };
  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${backend}/projects/${id}`, opts);
  if (res.status === 204) {
    return { res, data: null };
  }
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text || "Request failed" };
  }
  return { res, data };
}

export async function GET(request, { params }) {
  const { id } = await params;
  const { res, data } = await forward("GET", id);
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { res, data } = await forward("PATCH", id, body);
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const { res, data } = await forward("DELETE", id);
  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }
  return NextResponse.json(data, { status: res.status });
}
