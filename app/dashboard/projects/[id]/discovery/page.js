import { notFound } from "next/navigation";

import { DiscoveryWorkspace } from "@/components/discovery/discovery-workspace";
import { getProject } from "@/lib/get-project";

export const metadata = {
  title: "Product journey — Workspace",
};

export default async function DiscoveryPage({ params }) {
  const { id } = await params;
  const project = await getProject(id);
  if (project === null) {
    notFound();
  }
  if (project === undefined) {
    return (
      <p className="text-sm text-muted-foreground">
        Could not load this project. Sign in again if your session expired.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Product journey</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Brainstorm → prioritize → validation plan → validation results. Then
          open PRD planning to lock a planning packet before template
          generation.
        </p>
      </div>

      <DiscoveryWorkspace projectId={id} />
    </div>
  );
}
