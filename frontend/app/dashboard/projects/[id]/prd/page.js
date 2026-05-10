import { notFound } from "next/navigation";

import { PrdWorkspace } from "@/components/prd/prd-workspace";
import { getProject } from "@/lib/get-project";

export const metadata = {
  title: "PRD — Workspace",
};

export default async function PrdPage({ params }) {
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
          Product Requirements Document
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Describe the next stage, use AI to prefill the template, then save.
          Section 9 analyzes one feature at a time with a dedicated strategic
          AI. Click a saved version to view the full PRD on its own page.
        </p>
      </div>

      <PrdWorkspace projectId={id} project={project} />
    </div>
  );
}
