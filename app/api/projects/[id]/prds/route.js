import { list, create } from "@/lib/server/services/prd/controller";
import {
  runProjectController,
  runProjectControllerWithBody,
} from "@/lib/server/api-route";

export async function GET(request, context) {
  return runProjectController(request, context, list);
}

export async function POST(request, context) {
  return runProjectControllerWithBody(request, context, create);
}
