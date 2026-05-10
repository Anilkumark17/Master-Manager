"use client";

import * as React from "react";
import Link from "next/link";
import {
  ClipboardCopy,
  Crosshair,
  Download,
  Loader2,
  Save,
  Sparkles,
  Wand2,
} from "lucide-react";

import { TsvTableField } from "@/components/prd/tsv-table-field";
import { AiCallout } from "@/components/projects/ai-callout";
import { WorkspacePanel } from "@/components/projects/workspace-panel";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  buildPlainDocumentFromPrdForm,
  safeFilename,
} from "@/lib/prd-plain-export";
import {
  PRD_SECTIONS,
  autofillFromProject,
  emptyPrdForm,
  getAtPath,
  getPrdFieldDescriptorsForAi,
  mergeForm,
  setAtPath,
} from "@/lib/prd-form-schema";
import { cn } from "@/lib/utils";

export function PrdWorkspace({ projectId, project }) {
  const [form, setForm] = React.useState(() =>
    mergeForm(emptyPrdForm(), autofillFromProject(project))
  );
  const [nextStageBrief, setNextStageBrief] = React.useState("");
  const [docTitle, setDocTitle] = React.useState("");
  const [prds, setPrds] = React.useState([]);
  const [selectedId, setSelectedId] = React.useState(null);
  const [loadingList, setLoadingList] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [exportHint, setExportHint] = React.useState("");
  const [strategicLoading, setStrategicLoading] = React.useState(false);

  const refreshList = React.useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/prds`);
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPrds(data.prds || []);
      }
    } finally {
      setLoadingList(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    refreshList();
  }, [refreshList]);

  function applyAutofill() {
    setForm(mergeForm(emptyPrdForm(), autofillFromProject(project)));
  }

  function updateField(path, value) {
    setForm((prev) => setAtPath(prev, path, value));
  }

  function buildPlainBody() {
    return buildPlainDocumentFromPrdForm({
      form,
      project,
      docTitle,
      stageBrief: nextStageBrief,
    });
  }

  async function copyPlainDocument() {
    setExportHint("");
    try {
      await navigator.clipboard.writeText(buildPlainBody());
      setExportHint("Plain document copied to clipboard.");
      window.setTimeout(() => setExportHint(""), 3500);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  function downloadPlainDocument() {
    const text = buildPlainBody();
    const name = safeFilename(
      docTitle?.trim() || `PRD-${project?.name || "project"}`
    );
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setExportHint("Download started (.txt).");
    window.setTimeout(() => setExportHint(""), 3500);
  }

  async function generateFormWithAi() {
    setError("");
    const brief = nextStageBrief.trim();
    if (!brief) {
      setError(
        "Add a short brief about the next stage above, then run AI prefill."
      );
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/prds/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formSnapshot: form,
          fieldDescriptors: getPrdFieldDescriptorsForAi({
            skipPaths: ["strategicRollout.analysis"],
          }),
          stageBrief: brief,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Generation failed");
        return;
      }
      if (data.formSnapshot && typeof data.formSnapshot === "object") {
        setForm((prev) => mergeForm(prev, data.formSnapshot));
      }
    } catch (e) {
      setError(e?.message || "Request failed");
    } finally {
      setGenerating(false);
    }
  }

  async function runStrategicRolloutAnalysis() {
    const feature = String(
      getAtPath(form, "strategicRollout.feature") || ""
    ).trim();
    if (!feature) {
      setError(
        'In section 9, fill "Feature to analyze" with exactly one feature first.'
      );
      return;
    }
    setError("");
    setStrategicLoading(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/prds/strategic-rollout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feature,
            optionalNotes: String(
              getAtPath(form, "strategicRollout.optionalNotes") || ""
            ).trim(),
            stageBrief: nextStageBrief.trim() || undefined,
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Strategic analysis failed");
        return;
      }
      const text = data.analysis;
      if (typeof text === "string" && text.trim()) {
        setForm((prev) =>
          setAtPath(prev, "strategicRollout.analysis", text.trim())
        );
      }
    } catch (e) {
      setError(e?.message || "Request failed");
    } finally {
      setStrategicLoading(false);
    }
  }

  async function savePrd() {
    setError("");
    setSaving(true);
    try {
      const body = {
        title: docTitle || `PRD — ${project?.name || "Project"}`,
        content: buildPlainDocumentFromPrdForm({
          form,
          project,
          docTitle,
          stageBrief: nextStageBrief,
        }),
        formSnapshot: form,
      };
      const url = selectedId
        ? `/api/projects/${projectId}/prds/${selectedId}`
        : `/api/projects/${projectId}/prds`;
      const res = await fetch(url, {
        method: selectedId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      const p = data.prd;
      if (p?.id) {
        setSelectedId(p.id);
      }
      await refreshList();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <AiCallout title="FastRouter">
        Uses <code className="rounded bg-muted px-1">FASTROUTER_API_KEY</code>{" "}
        (or <code className="rounded bg-muted px-1">API_key</code>) and{" "}
        <code className="rounded bg-muted px-1">FASTROUTER_MODEL</code> on the
        server. Describe the next stage, then AI prefills fields as plain text
        (no markdown in inputs; tables as tab-separated rows for Excel-style
        paste). Save stores the form and a plain-text document in{" "}
        <code className="rounded bg-muted px-1">content</code>.
      </AiCallout>

      <WorkspacePanel className="space-y-3">
        <div>
          <Label htmlFor="next-stage-brief" className="text-sm font-medium">
            Brief for the next stage
          </Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Summarize what you are moving toward next (goals, scope, timeline,
            risks, or decisions). AI uses this together with the project record
            and any fields you already filled to prefill the template.
          </p>
        </div>
        <Textarea
          id="next-stage-brief"
          value={nextStageBrief}
          onChange={(e) => setNextStageBrief(e.target.value)}
          placeholder="e.g. We are entering private beta in 6 weeks: focus MVP scope, onboarding, analytics events, and launch risks…"
          rows={5}
          className="resize-y text-sm"
        />
      </WorkspacePanel>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={applyAutofill}
          className="gap-2"
        >
          <Wand2 className="size-4" aria-hidden />
          Autofill from project
        </Button>
        <Button
          type="button"
          onClick={generateFormWithAi}
          disabled={generating || !nextStageBrief.trim()}
          className="gap-2"
        >
          {generating ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="size-4" aria-hidden />
          )}
          Fill template (AI)
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={savePrd}
          disabled={saving}
          className="gap-2"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {selectedId ? "Update saved PRD" : "Save PRD"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={copyPlainDocument}
          className="gap-2"
        >
          <ClipboardCopy className="size-4" aria-hidden />
          Copy plain document
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={downloadPlainDocument}
          className="gap-2"
        >
          <Download className="size-4" aria-hidden />
          Download .txt
        </Button>
      </div>

      {exportHint ? (
        <p className="text-sm text-muted-foreground" role="status">
          {exportHint}
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Template fields</h3>
          <ScrollArea className="h-[min(70vh,720px)] pr-3">
            <div className="space-y-2 pb-6">
              {PRD_SECTIONS.map((sec) => (
                <Collapsible
                  key={sec.id}
                  defaultOpen={sec.id === "exec"}
                  className="rounded-xl border border-border/70 bg-card/30"
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-semibold hover:bg-muted/30">
                    {sec.title}
                    <span className="text-muted-foreground">▾</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-4 border-t border-border/60 px-3 py-3">
                      {sec.fields.map((field) => (
                        <div key={field.path} className="grid gap-1.5">
                          <Label className="text-xs text-muted-foreground">
                            {field.label}
                          </Label>
                          {field.tableHeaders?.length ? (
                            <TsvTableField
                              value={getAtPath(form, field.path)}
                              onChange={(v) => updateField(field.path, v)}
                              defaultHeaders={field.tableHeaders}
                            />
                          ) : field.multiline ? (
                            <Textarea
                              rows={field.rows || 3}
                              value={getAtPath(form, field.path)}
                              onChange={(e) =>
                                updateField(field.path, e.target.value)
                              }
                              className="text-sm"
                            />
                          ) : (
                            <Input
                              value={getAtPath(form, field.path)}
                              onChange={(e) =>
                                updateField(field.path, e.target.value)
                              }
                              className="h-9 text-sm"
                            />
                          )}
                          {field.hint ? (
                            <p className="text-[11px] text-muted-foreground">
                              {field.hint}
                            </p>
                          ) : null}
                        </div>
                      ))}
                      {sec.id === "strategicRollout" ? (
                        <div className="space-y-2 border-t border-border/60 pt-4">
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={
                              strategicLoading ||
                              !String(
                                getAtPath(form, "strategicRollout.feature") || ""
                              ).trim()
                            }
                            onClick={runStrategicRolloutAnalysis}
                            className="gap-2"
                          >
                            {strategicLoading ? (
                              <Loader2
                                className="size-4 animate-spin"
                                aria-hidden
                              />
                            ) : (
                              <Crosshair className="size-4" aria-hidden />
                            )}
                            Analyze this one feature (strategic)
                          </Button>
                          <p className="text-[11px] text-muted-foreground">
                            Uses the same FastRouter key as other AI actions.
                            Fills only the “Strategic analysis” field for the
                            single feature above—not the whole template.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        </div>

        <WorkspacePanel className="flex min-h-[320px] flex-col lg:min-h-[480px]">
          <Label className="text-xs text-muted-foreground">Snapshot title</Label>
          <Input
            className="mt-1 h-9"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            placeholder="e.g. PRD draft — Feb sprint"
          />
          <Separator className="my-4" />
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Saved versions
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Click a version to open the full PRD on its own page.
            </p>
            <ScrollArea className="mt-2 h-48 lg:h-[min(40vh,360px)]">
              <ul className="space-y-1 pr-2">
                {loadingList ? (
                  <li className="text-xs text-muted-foreground">Loading…</li>
                ) : prds.length === 0 ? (
                  <li className="text-xs text-muted-foreground">None yet</li>
                ) : (
                  prds.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/dashboard/projects/${projectId}/prd/${p.id}`}
                        className={cn(
                          "block w-full rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted/60",
                          selectedId === p.id &&
                            "ring-1 ring-foreground/20 ring-offset-1 ring-offset-background"
                        )}
                      >
                        <span className="line-clamp-2 font-medium">
                          {p.title || "Untitled"}
                        </span>
                        <span className="block text-muted-foreground">
                          {new Date(p.updatedAt).toLocaleString()}
                        </span>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </ScrollArea>
          </div>
        </WorkspacePanel>
      </div>
    </div>
  );
}
