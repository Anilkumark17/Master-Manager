"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";

import { WorkspacePanel } from "@/components/projects/workspace-panel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function planFeatureIds(validationPlan) {
  const src = validationPlan?.sourceFeatureIds;
  if (Array.isArray(src) && src.length) {
    return src.map(String).filter(Boolean);
  }
  const plans = validationPlan?.plansByFeatureId;
  if (plans && typeof plans === "object") {
    return Object.keys(plans).filter(Boolean);
  }
  return [];
}

function featureTitle(id, validationPlan, prioFeatures) {
  const plan = validationPlan?.plansByFeatureId?.[id];
  const name =
    (plan && typeof plan.featureName === "string" && plan.featureName.trim()) ||
    prioFeatures.find((f) => String(f.id) === id)?.featureName;
  return name?.trim() || `Feature ${id}`;
}

export function ValidationResultsTab({
  projectId,
  workspace,
  setWorkspace,
  prioFeatures,
  pendingAction,
  setPendingAction,
  setError,
}) {
  const plan = workspace?.validationPlan;
  const ids = React.useMemo(() => planFeatureIds(plan), [plan]);
  const [notesByFeature, setNotesByFeature] = React.useState({});
  const [extraNotes, setExtraNotes] = React.useState("");

  React.useEffect(() => {
    const fromServer = workspace?.validationResults?.executionNotesByFeatureId;
    const serverMap =
      fromServer && typeof fromServer === "object" ? fromServer : {};
    setNotesByFeature((prev) => {
      const o = {};
      for (const id of ids) {
        o[id] =
          typeof serverMap[id] === "string"
            ? serverMap[id]
            : (prev[id] ?? "");
      }
      return o;
    });
  }, [ids.join("|"), workspace?.validationResults?.executionNotesByFeatureId]);

  React.useEffect(() => {
    const fi = workspace?.validationResults?.founderInput;
    setExtraNotes(typeof fi === "string" ? fi : "");
  }, [workspace?.validationResults?.founderInput]);

  function setNote(id, value) {
    setNotesByFeature((prev) => ({ ...prev, [id]: value }));
  }

  async function saveNotesAndPlanReference() {
    if (!ids.length) {
      setError("Create a validation plan on TAB 3 first.");
      return;
    }
    setPendingAction("save-results-notes");
    setError("");
    try {
      const executionNotesByFeatureId = {};
      for (const id of ids) {
        executionNotesByFeatureId[id] = String(notesByFeature[id] || "").trim();
      }
      const res = await fetch(`/api/projects/${projectId}/discovery/workspace`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          validationResults: {
            executionNotesByFeatureId,
            planSnapshot: plan,
            notesSavedAt: new Date().toISOString(),
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      setWorkspace(data.workspace);
    } catch (e) {
      setError(e?.message || "Save failed");
    } finally {
      setPendingAction("");
    }
  }

  async function verifyExecution() {
    if (!ids.length) {
      setError("Create a validation plan on TAB 3 first.");
      return;
    }
    const missing = ids.filter((id) => !String(notesByFeature[id] || "").trim());
    if (missing.length) {
      setError(
        `Write how you ran validation for each feature. Still empty: ${missing.join(", ")}`
      );
      return;
    }
    setPendingAction("validation-analyze");
    setError("");
    try {
      const res = await fetch(
        `/api/projects/${projectId}/discovery/validation-analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            perFeatureNotes: notesByFeature,
            founderNotes: extraNotes.trim(),
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Verification failed");
        return;
      }
      setWorkspace(data.workspace);
    } catch (e) {
      setError(e?.message || "Request failed");
    } finally {
      setPendingAction("");
    }
  }

  const vr = workspace?.validationResults;
  const review = vr?.executionReview;
  const overall = review?.overallVerdict;
  const needsRedo = overall === "needs_redo";
  const per = review?.perFeature && typeof review.perFeature === "object"
    ? review.perFeature
    : {};

  return (
    <div className="space-y-6">
      <WorkspacePanel className="space-y-2 border-primary/15 bg-primary/[0.02]">
        <h3 className="text-sm font-semibold tracking-tight">
          TAB 4 — Validation results & verification
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          For each feature from your saved validation plan, describe{" "}
          <span className="font-medium text-foreground">how you actually ran</span>{" "}
          validation (who you talked to, method, sample size, outcomes). Save
          keeps your notes and a{" "}
          <span className="font-medium text-foreground">snapshot of the plan</span>{" "}
          as reference. Verify uses AI to check whether you followed the plan
          well enough; if not, you will be asked to run validation again.
        </p>
        {vr?.planSnapshotAt ? (
          <p className="text-xs text-muted-foreground">
            Last plan snapshot (for verification):{" "}
            {new Date(vr.planSnapshotAt).toLocaleString()}
          </p>
        ) : vr?.notesSavedAt ? (
          <p className="text-xs text-muted-foreground">
            Notes last saved: {new Date(vr.notesSavedAt).toLocaleString()}
          </p>
        ) : null}
      </WorkspacePanel>

      {!ids.length ? (
        <Alert>
          <AlertCircle className="size-4" />
          <AlertTitle>No validation plan yet</AlertTitle>
          <AlertDescription>
            Go to Validation plan, generate a plan for your selected features,
            then return here.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          {ids.map((id) => (
            <WorkspacePanel key={id} className="space-y-2">
              <Label
                htmlFor={`val-exec-${id}`}
                className="text-base font-semibold"
              >
                {featureTitle(id, plan, prioFeatures)}
              </Label>
              <p className="text-xs text-muted-foreground">Feature id: {id}</p>
              <Textarea
                id={`val-exec-${id}`}
                rows={6}
                className="text-sm"
                placeholder="e.g. Ran 5 semi-structured interviews with [role] recruited from [channel]; used script aligned to core assumption X; 3/5 showed willingness to…"
                value={notesByFeature[id] ?? ""}
                onChange={(e) => setNote(id, e.target.value)}
              />
              {per[id] ? (
                <div
                  className={cn(
                    "rounded-lg border p-3 text-sm",
                    per[id].verdict === "redo" || per[id].mustRedo
                      ? "border-amber-500/60 bg-amber-500/10"
                      : "border-emerald-600/40 bg-emerald-600/10"
                  )}
                >
                  <p className="flex items-center gap-2 font-medium">
                    {per[id].verdict === "redo" || per[id].mustRedo ? (
                      <>
                        <RotateCcw className="size-4 text-amber-700 dark:text-amber-400" />
                        Redo validation for this feature
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-4 text-emerald-700 dark:text-emerald-400" />
                        Execution looks sufficient
                      </>
                    )}
                  </p>
                  {per[id].whatWentWell ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">What went well: </span>
                      {per[id].whatWentWell}
                    </p>
                  ) : null}
                  {Array.isArray(per[id].gaps) && per[id].gaps.length ? (
                    <ul className="mt-2 list-inside list-disc text-xs text-muted-foreground">
                      {per[id].gaps.map((g) => (
                        <li key={g}>{g}</li>
                      ))}
                    </ul>
                  ) : null}
                  {per[id].redoInstructions ? (
                    <p className="mt-2 text-xs font-medium text-amber-900 dark:text-amber-100">
                      Do again: {per[id].redoInstructions}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </WorkspacePanel>
          ))}

          <WorkspacePanel className="space-y-2">
            <Label htmlFor="extra-val-notes">
              Optional — extra metrics, conversions, or cross-feature learnings
            </Label>
            <Textarea
              id="extra-val-notes"
              rows={4}
              className="text-sm"
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
              placeholder="e.g. Landing page 2.1% signup; waitlist 120; key quotes…"
            />
          </WorkspacePanel>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={saveNotesAndPlanReference}
              disabled={pendingAction === "save-results-notes"}
              className="gap-2"
            >
              {pendingAction === "save-results-notes" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Save className="size-4" aria-hidden />
              )}
              Save notes &amp; plan reference
            </Button>
            <Button
              type="button"
              onClick={verifyExecution}
              disabled={pendingAction === "validation-analyze"}
              className="gap-2"
            >
              {pendingAction === "validation-analyze" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="size-4" aria-hidden />
              )}
              Verify execution (AI)
            </Button>
          </div>

          {needsRedo && review?.overallMessage ? (
            <Alert className="border-amber-600 bg-amber-500/15 text-foreground">
              <AlertCircle className="size-4 text-amber-800 dark:text-amber-300" />
              <AlertTitle>Run validation again</AlertTitle>
              <AlertDescription className="whitespace-pre-wrap text-foreground">
                {review.overallMessage}
              </AlertDescription>
            </Alert>
          ) : overall === "sufficient" ? (
            <Alert className="border-emerald-600/50 bg-emerald-600/10">
              <CheckCircle2 className="size-4 text-emerald-700 dark:text-emerald-400" />
              <AlertTitle>Verification passed</AlertTitle>
              <AlertDescription>
                AI did not flag a mandatory redo. You can still tighten learnings
                using the gaps above, if any.
              </AlertDescription>
            </Alert>
          ) : null}

          {vr?.analyzed?.summary ? (
            <WorkspacePanel>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Product summary (from your results)
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {vr.analyzed.summary}
              </p>
            </WorkspacePanel>
          ) : null}
        </div>
      )}
    </div>
  );
}
