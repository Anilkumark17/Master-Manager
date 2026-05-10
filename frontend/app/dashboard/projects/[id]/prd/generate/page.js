import { notFound } from "next/navigation";

import { PrdWorkspace } from "@/components/prd/prd-workspace";
import { getProject } from "@/lib/get-project";

export const metadata = {
  title: "PRD generation — Workspace",
};

export default async function PrdGeneratePage({ params }) {
  const { id } = await params;
  const project = await getProject(id);
  if (project === null) {
    notFound();
  }
  if (project === undefined) {
    return (
      <p className="text-sm text-muted-foreground">
        Could not load this project from the API. Check that the backend is
        running and BACKEND_URL is correct.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          PRD generation (template)
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Product journey and PRD planning are merged into the template when
          you open this tab (and when you use Autofill). The stage brief is
          pre-filled when empty. Run AI to refine the full template; the server
          always receives your discovery workspace. Section 9 still uses the
          dedicated strategic rollout call.
        </p>
      </div>

      <PrdWorkspace projectId={id} project={project} />
    </div>
  );
}
