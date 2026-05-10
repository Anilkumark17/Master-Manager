"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckSquare,
  ClipboardList,
  Lightbulb,
  Loader2,
  Save,
  Sparkles,
  TestTube2,
} from "lucide-react";

import { AiCallout } from "@/components/projects/ai-callout";
import { WorkspacePanel } from "@/components/projects/workspace-panel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ValidationPlanTab } from "@/components/discovery/validation-plan-tab";
import { ValidationResultsTab } from "@/components/discovery/validation-results-tab";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "brainstorm", label: "Brainstorm", icon: Lightbulb },
  { id: "prioritize", label: "Prioritize", icon: CheckSquare },
  { id: "validation", label: "Validation plan", icon: TestTube2 },
  { id: "results", label: "Validation results", icon: ClipboardList },
];

export function DiscoveryWorkspace({ projectId }) {
  const [tab, setTab] = React.useState("brainstorm");
  const [workspace, setWorkspace] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [rawBrainstorm, setRawBrainstorm] = React.useState("");
  const [prioritizeNotes, setPrioritizeNotes] = React.useState("");
  const [pendingAction, setPendingAction] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${projectId}/discovery/workspace`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to load");
        return;
      }
      setWorkspace(data.workspace);
      if (data.workspace?.brainstorm?.rawInput) {
        setRawBrainstorm(data.workspace.brainstorm.rawInput);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const features = workspace?.brainstorm?.structuredFeatures;
  const prio = workspace?.prioritization;
  const prioFeatures = Array.isArray(prio?.features) ? prio.features : [];

  const [selectedIds, setSelectedIds] = React.useState([]);

  React.useEffect(() => {
    const fromWs = prio?.selectedForValidationIds;
    if (Array.isArray(fromWs) && fromWs.length) {
      setSelectedIds(fromWs.map(String));
    }
  }, [prio?.selectedForValidationIds]);

  function toggleSelected(id) {
    const s = String(id);
    setSelectedIds((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  async function patchSection(section, data) {
    const res = await fetch(`/api/projects/${projectId}/discovery/workspace`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [section]: data }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(j.error || "Save failed");
    }
    setWorkspace(j.workspace);
  }

  async function runBrainstorm() {
    setPendingAction("brainstorm");
    setError("");
    try {
      const res = await fetch(
        `/api/projects/${projectId}/discovery/brainstorm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawInput: rawBrainstorm }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Brainstorm failed");
        return;
      }
      setWorkspace(data.workspace);
    } catch (e) {
      setError(e?.message || "Request failed");
    } finally {
      setPendingAction("");
    }
  }

  async function runPrioritize() {
    setPendingAction("prioritize");
    setError("");
    try {
      const res = await fetch(
        `/api/projects/${projectId}/discovery/prioritize`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            founderNotes: prioritizeNotes,
            selectedForValidationIds: selectedIds,
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Prioritize failed");
        return;
      }
      setWorkspace(data.workspace);
    } catch (e) {
      setError(e?.message || "Request failed");
    } finally {
      setPendingAction("");
    }
  }

  async function saveSelection() {
    setPendingAction("save-selection");
    setError("");
    try {
      await patchSection("prioritization", {
        ...prio,
        selectedForValidationIds: selectedIds,
      });
    } catch (e) {
      setError(e?.message || "Save failed");
    } finally {
      setPendingAction("");
    }
  }

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Loading product journey…
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <AiCallout title="Product journey">
        Sequential steps: organize inputs, prioritize with PM frameworks, plan
        validation, interpret results. PRD planning and template generation live
        under the PRD tab.
      </AiCallout>

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              tab === id
                ? "bg-foreground text-background"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        ))}
        <Button variant="outline" size="sm" asChild className="ml-auto">
          <Link href={`/dashboard/projects/${projectId}/prd/planning`}>
            PRD planning →
          </Link>
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {tab === "brainstorm" ? (
        <WorkspacePanel className="space-y-3">
          <Label htmlFor="raw-in">Raw ideas, feedback, notes</Label>
          <Textarea
            id="raw-in"
            rows={12}
            value={rawBrainstorm}
            onChange={(e) => setRawBrainstorm(e.target.value)}
            className="text-sm"
            placeholder="Paste anything: customer quotes, feature ideas, meeting notes…"
          />
          <Button
            type="button"
            onClick={runBrainstorm}
            disabled={!rawBrainstorm.trim() || pendingAction === "brainstorm"}
            className="gap-2"
          >
            {pendingAction === "brainstorm" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="size-4" aria-hidden />
            )}
            Organize with AI
          </Button>
          {Array.isArray(features) && features.length > 0 ? (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium">
                Structured features ({features.length})
              </p>
              <ul className="max-h-[min(50vh,480px)] space-y-2 overflow-y-auto rounded-lg border border-border/70 p-3 text-sm">
                {features.map((f) => (
                  <li
                    key={f.id || f.featureName}
                    className="rounded-md border border-border/50 bg-card/40 p-2"
                  >
                    <p className="font-medium">{f.featureName || "Untitled"}</p>
                    <p className="text-xs text-muted-foreground">
                      {f.shortDescription}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </WorkspacePanel>
      ) : null}

      {tab === "prioritize" ? (
        <WorkspacePanel className="space-y-4">
          <div>
            <Label>Founder notes (goals, stage, constraints)</Label>
            <Textarea
              rows={4}
              value={prioritizeNotes}
              onChange={(e) => setPrioritizeNotes(e.target.value)}
              className="mt-1 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={runPrioritize}
              disabled={
                !Array.isArray(features) ||
                features.length === 0 ||
                pendingAction === "prioritize"
              }
              className="gap-2"
            >
              {pendingAction === "prioritize" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="size-4" aria-hidden />
              )}
              Prioritize with AI
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={saveSelection}
              disabled={
                pendingAction === "save-selection" || !prioFeatures.length
              }
              className="gap-2"
            >
              {pendingAction === "save-selection" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Save className="size-4" aria-hidden />
              )}
              Save validation selection
            </Button>
          </div>
          {prioFeatures.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Run brainstorm first, then prioritize.
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {prioFeatures.map((f) => {
                const id = String(f.id || "");
                const checked = id && selectedIds.includes(id);
                return (
                  <li
                    key={id || f.featureName}
                    className="flex gap-2 rounded-lg border border-border/70 bg-card/30 p-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={!!checked}
                      disabled={!id}
                      onChange={() => id && toggleSelected(id)}
                      aria-label={`Select ${f.featureName} for validation planning`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{f.featureName}</p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {f.bucket?.replace(/_/g, " ") || "—"} ·{" "}
                        {f.priorityLevel || "—"}
                      </p>
                      {f.whyItMatters ? (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {f.whyItMatters}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </WorkspacePanel>
      ) : null}

      {tab === "validation" ? (
        <ValidationPlanTab
          projectId={projectId}
          workspace={workspace}
          setWorkspace={setWorkspace}
          selectedIds={selectedIds}
          prioFeatures={prioFeatures}
          pendingAction={pendingAction}
          setPendingAction={setPendingAction}
          setError={setError}
        />
      ) : null}

      {tab === "results" ? (
        <ValidationResultsTab
          projectId={projectId}
          workspace={workspace}
          setWorkspace={setWorkspace}
          prioFeatures={prioFeatures}
          pendingAction={pendingAction}
          setPendingAction={setPendingAction}
          setError={setError}
        />
      ) : null}
    </div>
  );
}
