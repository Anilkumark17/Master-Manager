import { notFound } from "next/navigation";

import { WorkspacePanel } from "@/components/projects/workspace-panel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getProject } from "@/lib/get-project";

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h3>
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {children}
      </div>
    </div>
  );
}

export default async function ProjectDetailsPage({ params }) {
  const { id } = await params;
  const p = await getProject(id);
  if (p === null) {
    notFound();
  }
  if (p === undefined) {
    return (
      <p className="text-sm text-muted-foreground">
        Could not load this project from the API. Check that the backend is
        running and BACKEND_URL is correct.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <WorkspacePanel>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Overview
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              Project details
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Source of truth for positioning, audience, and problem framing —
              every other tab reads from here.
            </p>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="space-y-8">
          <Field label="Short description">{p.shortDescription}</Field>
          <Field label="Vision statement">{p.visionStatement}</Field>
          <Field label="Problem statement">{p.problemStatement}</Field>
          <Field label="Target users">{p.targetUsers}</Field>
          <Field label="Industry / domain">{p.industryDomain}</Field>
        </div>
      </WorkspacePanel>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "PRD health", body: "Structured requirements vs. drift" },
          { title: "Execution", body: "Milestones tied to this narrative" },
          { title: "Handoffs", body: "Design & dev aligned to same story" },
        ].map((item) => (
          <Card
            key={item.title}
            className="border-border/60 bg-muted/10 shadow-none ring-1 ring-foreground/[0.04]"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {item.body}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
