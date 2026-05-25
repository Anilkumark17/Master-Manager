import { getOne, update, remove } from "@/lib/server/services/project/controller";
import {
  runAuthedController,
  runAuthedControllerWithBody,
  jsonError,
} from "@/lib/server/api-route";
import { requireAuthUser } from "@/lib/server/auth-context";
import { buildReq } from "@/lib/server/build-req";
import { runHandler } from "@/lib/server/run-handler";
import { parseJsonBody } from "@/lib/server/build-req";

export async function GET(request, context) {
  return runAuthedController(request, context, getOne);
}

export async function PATCH(request, context) {
  return runAuthedControllerWithBody(request, context, update);
}

export async function DELETE(request, context) {
  const auth = await requireAuthUser(request);
  if (auth.error) {
    return jsonError(auth.error.status, auth.error.body);
  }
  const params = await context.params;
  const req = buildReq({ request, params, user: auth.user });
  const response = await runHandler(remove, req);
  return response;
}
