import { notFound } from "next/navigation";

import { DesignerWorkspace } from "@/components/designer/designer-workspace";
import { getProject } from "@/lib/get-project";

export const metadata = {
  title: "Designer — Workspace",
};

export default async function DesignerPage({ params }) {
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
          Designer workspace
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Generate separate React Flow maps from your latest saved PRD:{" "}
          <span className="font-medium text-foreground">information architecture</span>
          , <span className="font-medium text-foreground">journeys & flows</span>
          , and{" "}
          <span className="font-medium text-foreground">handoff-ready structure</span>
          . Each block has its own Generate and Save.
        </p>
      </div>

      <DesignerWorkspace projectId={id} />
    </div>
  );
}
