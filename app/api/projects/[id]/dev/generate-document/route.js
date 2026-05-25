import { generateDocument } from "@/lib/server/services/dev/controller";
import { runProjectControllerWithBody } from "@/lib/server/api-route";

export const maxDuration = 900;

export async function POST(request, context) {
  return runProjectControllerWithBody(request, context, generateDocument);
}
