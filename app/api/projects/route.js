import { list, create } from "@/lib/server/services/project/controller";
import {
  runAuthedController,
  runAuthedControllerWithBody,
} from "@/lib/server/api-route";

export async function GET(request, context) {
  return runAuthedController(request, context, list);
}

export async function POST(request, context) {
  return runAuthedControllerWithBody(request, context, create);
}
