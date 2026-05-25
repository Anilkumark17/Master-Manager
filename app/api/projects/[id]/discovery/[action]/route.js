import { NextResponse } from "next/server";
import {
  getWorkspace,
  patchWorkspace,
  brainstorm,
  prioritize,
  validationPlan,
  validationAnalyze,
  prdPlanning,
} from "@/lib/server/services/discovery/controller";
import {
  runProjectController,
  runProjectControllerWithBody,
  jsonError,
} from "@/lib/server/api-route";
import { requireAuthUser } from "@/lib/server/auth-context";
import { requireProjectForUser } from "@/lib/server/project-access";
import { buildReq, parseJsonBody } from "@/lib/server/build-req";

export const maxDuration = 900;

const POST_ACTIONS = {
  brainstorm,
  prioritize,
  "validation-plan": validationPlan,
  "validation-analyze": validationAnalyze,
  "prd-planning": prdPlanning,
};

export async function GET(_request, { params }) {
  const { id, action } = await params;
  if (action !== "workspace") {
    return jsonError(404, "Not found");
  }
  return runProjectController(_request, { params: { id, action } }, getWorkspace);
}

export async function PATCH(request, { params }) {
  const { id, action } = await params;
  if (action !== "workspace") {
    return jsonError(404, "Not found");
  }
  return runProjectControllerWithBody(
    request,
    { params: { id, action } },
    patchWorkspace
  );
}

export async function POST(request, { params }) {
  const { id, action } = await params;
  const controller = POST_ACTIONS[action];
  if (!controller) {
    return jsonError(404, "Unknown action");
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const auth = await requireAuthUser(request);
  if (auth.error) {
    return jsonError(auth.error.status, auth.error.body);
  }

  const access = await requireProjectForUser(auth.user.id, id);
  if (access.error) {
    return jsonError(access.error.status, access.error.body);
  }

  const req = buildReq({
    request,
    params: { id, projectId: id, action },
    body,
    user: auth.user,
    project: access.project,
  });

  let statusCode = 200;
  let payload = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      payload = data;
      return this;
    },
  };

  await controller(req, res);
  return NextResponse.json(payload ?? {}, { status: statusCode });
}
