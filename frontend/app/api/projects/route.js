import { NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/backend-url";
import { getAuthHeaders } from "@/lib/server-api";

async function forward(method, body) {
  const backend = getBackendBaseUrl();
  const headers = {
    "Content-Type": "application/json",
    ...(await getAuthHeaders()),
  };
  const opts = { method, headers };
  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${backend}/projects`, opts);
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text || "Request failed" };
  }
  return { res, data };
}

export async function GET() {
  const { res, data } = await forward("GET");
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { res, data } = await forward("POST", body);
  return NextResponse.json(data, { status: res.status });
}
