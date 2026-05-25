"use client";

import * as React from "react";
import { Layers, Loader2, Map, Route, Save, Sparkles } from "lucide-react";

import { DesignerFlowPreview } from "@/components/designer/designer-flow-preview";
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

const KINDS = [
  {
    kind: "ia",
    icon: Map,
    title: "Information architecture",
    description:
      "Site maps, navigation hierarchy, content structure, parent–child relationships, feature grouping, and screen hierarchy—row-based React Flow from your PRD.",
  },
  {
    kind: "journeys",
    icon: Route,
    title: "Journeys & flows",
    description:
      "End-to-end journeys, decision points, alternates, success/error paths, entry and exit—mapped for discussion.",
  },
  {
    kind: "handoff",
    icon: Layers,
    title: "Handoff-ready structure",
    description:
      "Screen relationships, interaction notes, state changes, flow dependencies, navigation logic, component grouping.",
  },
];

function DeliverablePanel({ projectId, config }) {
  const { kind, icon: Icon, title, description } = config;
  const [reactFlow, setReactFlow] = React.useState(null);
  const [modelUsed, setModelUsed] = React.useState("");
  const [savedId, setSavedId] = React.useState(null);
  const [generating, setGenerating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [savedHint, setSavedHint] = React.useState("");

  const loadLatest = React.useCallback(async () => {
    try {
      const res = await fetch(
        `/api/projects/${projectId}/designer/deliverables?kind=${encodeURIComponent(kind)}`
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return;
      }
      const list = data.deliverables || [];
      if (list.length > 0) {
        const latest = list[0];
        setReactFlow(latest.reactFlow);
        setSavedId(latest.id);
        setModelUsed(latest.modelUsed || "");
      }
    } catch {
      /* ignore */
    }
  }, [projectId, kind]);

  React.useEffect(() => {
    loadLatest();
  }, [loadLatest]);

  async function generate() {
    setError("");
    setSavedHint("");
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/designer/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Generation failed");
        return;
      }
      if (data.reactFlow) {
        setReactFlow(data.reactFlow);
        setModelUsed(data.modelUsed || "");
        setSavedId(null);
      }
    } catch (e) {
      setError(e?.message || "Request failed");
    } finally {
      setGenerating(false);
    }
  }

  async function save() {
    if (!reactFlow || !reactFlow.nodes?.length) {
      setError("Generate a map before saving.");
      return;
    }
    setError("");
    setSaving(true);
    setSavedHint("");
    try {
      const res = await fetch(
        `/api/projects/${projectId}/designer/deliverables`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind,
            title: `${title} — ${new Date().toLocaleString()}`,
            reactFlow,
            modelUsed: modelUsed || undefined,
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      const id = data.deliverable?.id;
      if (id) {
        setSavedId(id);
      }
      setSavedHint("Saved new version to this project.");
      await loadLatest();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-border/60 bg-card/40 shadow-none ring-1 ring-foreground/[0.04]">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-2">
            <Icon className="mt-0.5 size-4 shrink-0 text-foreground/80" aria-hidden />
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              disabled={generating}
              onClick={generate}
            >
              {generating ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="size-4" aria-hidden />
              )}
              Generate
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="gap-1.5"
              disabled={saving || !reactFlow}
              onClick={save}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Save className="size-4" aria-hidden />
              )}
              Save
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {error ? (
          <p className="text-xs text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        {savedHint ? (
          <p className="text-xs text-muted-foreground" role="status">
            {savedHint}
          </p>
        ) : null}
        {modelUsed ? (
          <p className="text-[11px] text-muted-foreground">Model: {modelUsed}</p>
        ) : null}
        <DesignerFlowPreview reactFlow={reactFlow} />
      </CardContent>
    </Card>
  );
}

export function DesignerWorkspace({ projectId }) {
  return (
    <div className="space-y-8">
      <AiCallout title="PRD → designer maps">
        The latest saved PRD snapshot is the source of truth. Each section has
        its own Generate (React Flow JSON, row-based layout) and Save. Open the
        PRD tab and save a version before generating here.
      </AiCallout>

      <div className="flex flex-col gap-6">
        {KINDS.map((config) => (
          <DeliverablePanel
            key={config.kind}
            projectId={projectId}
            config={config}
          />
        ))}
      </div>

      <WorkspacePanel>
        <h3 className="text-sm font-semibold text-foreground">
          Collaboration & handoff
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Export graphs to your whiteboard tool by copying the saved JSON from
          the API, or iterate here with your team using the live preview.
        </p>
      </WorkspacePanel>
    </div>
  );
}
