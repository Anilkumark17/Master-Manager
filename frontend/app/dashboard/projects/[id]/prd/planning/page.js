import { notFound } from "next/navigation";

import { PrdPlanningWorkspace } from "@/components/prd/prd-planning-workspace";
import { getProject } from "@/lib/get-project";

export const metadata = {
  title: "PRD planning — Workspace",
};

export default async function PrdPlanningPage({ params }) {
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
        <h2 className="text-xl font-semibold tracking-tight">PRD planning</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          TAB 5 planning packet: PRD narrative, strategic rollout plan, user
          stories, user flows, technical considerations, success metrics, edge
          cases, risks, design references, and developer handoff — in that
          order, plain text only. Then use PRD generation for the structured
          template.
        </p>
      </div>

      <PrdPlanningWorkspace projectId={id} />
    </div>
  );
}
