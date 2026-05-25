export function buildReq({ request, params, body, user, project, query }) {
  const id = params?.id ?? params?.projectId;
  return {
    params: {
      ...params,
      id,
      projectId: id,
    },
    body: body ?? {},
    query: query ?? {},
    user,
    project,
    headers: Object.fromEntries(request?.headers?.entries?.() ?? []),
  };
}

export async function parseJsonBody(request) {
  try {
    return { body: await request.json() };
  } catch {
    return { error: { status: 400, body: { error: "Invalid JSON" } } };
  }
}

export function queryFromRequest(request) {
  const url = new URL(request.url);
  return Object.fromEntries(url.searchParams.entries());
}

import { NextResponse } from "next/server";

export function errorResponse(error) {
  return NextResponse.json(error.body, { status: error.status });
}
