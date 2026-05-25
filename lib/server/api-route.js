import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/server/auth-context";
import { requireProjectForUser } from "@/lib/server/project-access";
import { buildReq, parseJsonBody, queryFromRequest } from "@/lib/server/build-req";
import { runHandler } from "@/lib/server/run-handler";

export function jsonError(status, message) {
  return NextResponse.json(
    typeof message === "string" ? { error: message } : message,
    { status }
  );
}

export async function withAuth(handler) {
  return async (request, context) => {
    const auth = await requireAuthUser(request);
    if (auth.error) {
      return jsonError(auth.error.status, auth.error.body);
    }
    return handler(request, context, auth);
  };
}

export async function withProject(handler) {
  return async (request, context) => {
    const auth = await requireAuthUser(request);
    if (auth.error) {
      return jsonError(auth.error.status, auth.error.body);
    }
    const params = await context.params;
    const projectId = params.id ?? params.projectId;
    const access = await requireProjectForUser(auth.user.id, projectId);
    if (access.error) {
      return jsonError(access.error.status, access.error.body);
    }
    return handler(request, context, {
      user: auth.user,
      project: access.project,
    });
  };
}

export async function runAuthedController(request, context, controller) {
  const auth = await requireAuthUser(request);
  if (auth.error) {
    return jsonError(auth.error.status, auth.error.body);
  }
  const params = await context.params;
  const req = buildReq({
    request,
    params,
    user: auth.user,
    query: queryFromRequest(request),
  });
  return runHandler(controller, req);
}

export async function runProjectController(
  request,
  context,
  controller,
  { body } = {}
) {
  const auth = await requireAuthUser(request);
  if (auth.error) {
    return jsonError(auth.error.status, auth.error.body);
  }
  const params = await context.params;
  const projectId = params.id ?? params.projectId;
  const access = await requireProjectForUser(auth.user.id, projectId);
  if (access.error) {
    return jsonError(access.error.status, access.error.body);
  }
  const req = buildReq({
    request,
    params,
    body,
    user: auth.user,
    project: access.project,
    query: queryFromRequest(request),
  });
  return runHandler(controller, req);
}

export async function runProjectControllerWithBody(
  request,
  context,
  controller
) {
  const parsed = await parseJsonBody(request);
  if (parsed.error) {
    return jsonError(parsed.error.status, parsed.error.body);
  }
  return runProjectController(request, context, controller, {
    body: parsed.body,
  });
}

export async function runAuthedControllerWithBody(
  request,
  context,
  controller
) {
  const parsed = await parseJsonBody(request);
  if (parsed.error) {
    return jsonError(parsed.error.status, parsed.error.body);
  }
  const auth = await requireAuthUser(request);
  if (auth.error) {
    return jsonError(auth.error.status, auth.error.body);
  }
  const params = await context.params;
  const req = buildReq({
    request,
    params,
    body: parsed.body,
    user: auth.user,
    query: queryFromRequest(request),
  });
  return runHandler(controller, req);
}
