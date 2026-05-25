import { generate } from "@/lib/server/services/designer/controller";
import { runProjectControllerWithBody } from "@/lib/server/api-route";

export const maxDuration = 900;

export async function POST(request, context) {
  return runProjectControllerWithBody(request, context, generate);
}
