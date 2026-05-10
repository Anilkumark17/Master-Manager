import { notFound } from "next/navigation";
import { Braces, GitBranch, Terminal } from "lucide-react";

import { AiCallout } from "@/components/projects/ai-callout";
import { WorkspacePanel } from "@/components/projects/workspace-panel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Dev workspace</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            APIs, contracts, env notes, and architecture context for{" "}
            <span className="font-medium text-foreground">{project.name}</span>{" "}
            — always tied back to shipped scope.
          </p>
        </div>
        <Button size="sm" className="shrink-0" type="button" disabled>
          Explain architecture
        </Button>
      </div>

      <AiCallout title="Engineering copilot">
        Generate high-level diagrams, trace dependencies across services, and keep
        decisions discoverable next to the tasks that depend on them.
      </AiCallout>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Braces,
            title: "APIs & schemas",
            desc: "Endpoints, payloads, and versioning notes.",
          },
          {
            icon: GitBranch,
            title: "Delivery",
            desc: "Branches, releases, and review queues.",
          },
          {
            icon: Terminal,
            title: "Runbooks",
            desc: "Local setup, deploy paths, and observability.",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <Card
            key={title}
            className="border-border/60 bg-card/40 shadow-none ring-1 ring-foreground/[0.04]"
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-foreground/80" aria-hidden />
                <CardTitle className="text-base">{title}</CardTitle>
              </div>
              <CardDescription>{desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-28 rounded-lg border border-dashed border-border/80 bg-muted/20 font-mono text-[10px] leading-relaxed text-muted-foreground/80">
                <div className="p-3">
                  // Knowledge-linked snippets
                  <br />
                  // PRD requirement IDs → code paths
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <WorkspacePanel>
        <h3 className="text-sm font-semibold text-foreground">
          Same thread as design & PM
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          When designers publish flows or PMs adjust acceptance criteria, this
          space updates with links — one execution brain, not three tools.
        </p>
      </WorkspacePanel>
    </div>
  );
}
