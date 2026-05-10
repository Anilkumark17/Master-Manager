"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Save, Sparkles } from "lucide-react";

import { AiCallout } from "@/components/projects/ai-callout";
import { WorkspacePanel } from "@/components/projects/workspace-panel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PRD_PLANNING_FIELD_KEYS,
  PRD_PLANNING_HINTS,
  PRD_PLANNING_LABELS,
  emptyPlanningFields,
  normalizePlanningFromServer,
} from "@/lib/discovery-prd-planning-fields";

const TALL_SECTION_KEYS = new Set([
  "prd",
  "strategicRolloutPlan",
  "userStories",
  "userFlows",
  "developerHandoffDocumentation",
]);

function mergePlanningPayload(fields, meta) {
  return {
    ...fields,
    lastModelUsed: meta.lastModelUsed,
    lastGeneratedAt: meta.lastGeneratedAt,
  };
}

export function PrdPlanningWorkspace({ projectId }) {
  const [planningBrief, setPlanningBrief] = React.useState("");
  const [fields, setFields] = React.useState(emptyPlanningFields);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [error, setError] = React.useState("");
  const [meta, setMeta] = React.useState({
    lastModelUsed: null,
    lastGeneratedAt: null,
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${projectId}/discovery/workspace`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to load workspace");
        return;
      }
      const p = data.workspace?.prdPlanning;
      setFields(normalizePlanningFromServer(p));
      setMeta({
        lastModelUsed: p?.lastModelUsed ?? null,
        lastGeneratedAt: p?.lastGeneratedAt ?? null,
      });
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    load();
  }, [load]);

  function setField(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${projectId}/discovery/workspace`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prdPlanning: mergePlanningPayload(fields, meta),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      const p = data.workspace?.prdPlanning;
      setMeta({
        lastModelUsed: p?.lastModelUsed ?? null,
        lastGeneratedAt: p?.lastGeneratedAt ?? null,
      });
    } finally {
      setSaving(false);
    }
  }

  async function generate() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch(
        `/api/projects/${projectId}/discovery/prd-planning`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planningBrief: planningBrief.trim() }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Generation failed");
        return;
      }
      const p = data.workspace?.prdPlanning;
      setFields(normalizePlanningFromServer(p));
      setMeta({
        lastModelUsed: p?.lastModelUsed ?? data.modelUsed ?? null,
        lastGeneratedAt: p?.lastGeneratedAt ?? new Date().toISOString(),
      });
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading planning workspace…
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <WorkspacePanel className="space-y-4 border-primary/20 bg-primary/[0.03]">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">
            TAB 5 — PRD planning (validated packet)
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Use only validated features, confirmed workflows, proven assumptions,
            prioritized execution plans, and strategically aligned opportunities.
            The PRD section below is the narrative planning depth; template
            generation happens on the next tab.
          </p>
        </div>
        <ul className="list-inside list-disc space-y-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          <li>PRD</li>
          <li>Strategic Rollout Plan</li>
          <li>User stories</li>
          <li>User flows</li>
          <li>Technical considerations</li>
          <li>Success metrics</li>
          <li>Edge cases</li>
          <li>Risks</li>
          <li>Design references</li>
          <li>Developer handoff documentation</li>
        </ul>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Output rules: world-class PM and strategist mindset; validation before
          development; reduce decision fatigue and scope creep; plain text only
          (no Markdown in fields).
        </p>
      </WorkspacePanel>

      <AiCallout title="AI planning">
        Same FastRouter setup as other steps. Generate fills the ten sections
        above; you can edit any section before saving.
      </AiCallout>

      <WorkspacePanel className="space-y-3">
        <Label htmlFor="planning-brief">Optional steering brief</Label>
        <Textarea
          id="planning-brief"
          rows={4}
          value={planningBrief}
          onChange={(e) => setPlanningBrief(e.target.value)}
          placeholder="e.g. Ship analytics + onboarding first; defer marketplace…"
          className="text-sm"
        />
      </WorkspacePanel>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={generate}
          disabled={generating}
          className="gap-2"
        >
          {generating ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="size-4" aria-hidden />
          )}
          Generate planning (AI)
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={save}
          disabled={saving}
          className="gap-2"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Save className="size-4" aria-hidden />
          )}
          Save planning
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={`/dashboard/projects/${projectId}/prd/generate`}>
            Continue to PRD generation
          </Link>
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {meta.lastGeneratedAt ? (
        <p className="text-xs text-muted-foreground">
          Last AI run: {new Date(meta.lastGeneratedAt).toLocaleString()}
          {meta.lastModelUsed ? ` · ${meta.lastModelUsed}` : null}
        </p>
      ) : null}

      <div className="space-y-8">
        {PRD_PLANNING_FIELD_KEYS.map((key) => (
          <section
            key={key}
            className="scroll-mt-4 border-b border-border/60 pb-8 last:border-0 last:pb-0"
          >
            <h3 className="text-base font-semibold tracking-tight">
              {PRD_PLANNING_LABELS[key] || key}
            </h3>
            {PRD_PLANNING_HINTS[key] ? (
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {PRD_PLANNING_HINTS[key]}
              </p>
            ) : null}
            <Textarea
              className="mt-3 text-sm"
              rows={TALL_SECTION_KEYS.has(key) ? 12 : 7}
              value={fields[key] || ""}
              onChange={(e) => setField(key, e.target.value)}
              aria-label={PRD_PLANNING_LABELS[key] || key}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
