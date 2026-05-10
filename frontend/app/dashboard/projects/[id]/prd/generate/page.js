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
          Complete PRD planning in the previous tab first when you can. Here,
          describe the next stage and run AI to fill the structured template
          using your project, optional product-journey context, and saved PRD
          planning. Section 9 still uses the dedicated strategic rollout call.
        </p>
      </div>

      <PrdWorkspace projectId={id} project={project} />
    </div>
  );
}
