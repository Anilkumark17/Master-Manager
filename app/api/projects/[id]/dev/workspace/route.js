import {
  getWorkspace,
  patchWorkspace,
} from "@/lib/server/services/dev/controller";
import {
  runProjectController,
  runProjectControllerWithBody,
} from "@/lib/server/api-route";

export async function GET(request, context) {
  return runProjectController(request, context, getWorkspace);
}

export async function PATCH(request, context) {
  return runProjectControllerWithBody(request, context, patchWorkspace);
}
