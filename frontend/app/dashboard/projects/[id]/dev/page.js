import { notFound } from "next/navigation";

import { DevArchitectureWorkspace } from "@/components/dev/dev-architecture-workspace";
import { getProject } from "@/lib/get-project";

export const metadata = {
  title: "Dev — Workspace",
};

export default async function DevPage({ params }) {
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
        <h2 className="text-xl font-semibold tracking-tight">Dev workspace</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Turn PRDs and prioritization into a maintainable technical requirements
          document: architecture, patterns, trade-offs, and ownership — scoped to{" "}
          <span className="font-medium text-foreground">{project.name}</span>.
        </p>
      </div>

      <DevArchitectureWorkspace projectId={id} project={project} />
    </div>
  );
}
