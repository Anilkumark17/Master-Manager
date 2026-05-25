import { notFound } from "next/navigation";
import { KanbanSquare, ListTodo, Timer } from "lucide-react";

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
  title: "Work Track — Workspace",
};

export default async function WorkTrackPage({ params }) {
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Work track</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Sprint plans, bottlenecks, and alignment summaries for{" "}
            <span className="font-medium text-foreground">{project.name}</span>{" "}
            — execution visible without status-deck theater.
          </p>
        </div>
        <Button size="sm" className="shrink-0" type="button" disabled>
          Summarize sprint
        </Button>
      </div>

      <AiCallout title="Execution intelligence">
        Surface dependency maps, blocked lanes, and drift from the PRD baseline
        in one view founders and leads can scan in minutes.
      </AiCallout>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: KanbanSquare,
            title: "Board",
            desc: "Trello-style flow with PRD links on every card.",
          },
          {
            icon: ListTodo,
            title: "Plans",
            desc: "Sprint slices with capacity and ownership.",
          },
          {
            icon: Timer,
            title: "Signals",
            desc: "Bottlenecks and scope alerts before dates move.",
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
              <div className="h-28 rounded-lg border border-dashed border-border/80 bg-muted/20" />
            </CardContent>
          </Card>
        ))}
      </div>

      <WorkspacePanel>
        <h3 className="text-sm font-semibold text-foreground">
          Connected to PRD & knowledge
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Tasks inherit context from the company knowledge base and the active
          PRD — no manual doc hunting for ICs.
        </p>
      </WorkspacePanel>
    </div>
  );
}
