import { getOne, patch } from "@/lib/server/services/prd/controller";
import {
  runProjectController,
  runProjectControllerWithBody,
} from "@/lib/server/api-route";

export async function GET(request, context) {
  return runProjectController(request, context, getOne);
}

export async function PATCH(request, context) {
  return runProjectControllerWithBody(request, context, patch);
}
