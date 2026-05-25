import { requireAuthUser } from "@/lib/server/auth-context";
import { requireProjectForUser } from "@/lib/server/project-access";
import { jsonError } from "@/lib/server/api-route";
import { streamDevDocument } from "@/lib/server/dev/stream-document";

export const maxDuration = 900;

export async function POST(request, { params }) {
  const { id } = await params;

  const auth = await requireAuthUser(request);
  if (auth.error) {
    return jsonError(auth.error.status, auth.error.body);
  }

  const access = await requireProjectForUser(auth.user.id, id);
  if (access.error) {
    return jsonError(access.error.status, access.error.body);
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const stream = await streamDevDocument({
    project: access.project,
    user: auth.user,
    body,
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
