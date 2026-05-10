"use client";

import * as React from "react";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";

import { WorkspacePanel } from "@/components/projects/workspace-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  VALIDATION_METHOD_CATALOG,
  WATERING_HOLE_LABELS,
  normalizeFeaturePlan,
} from "@/lib/validation-plan-display";
import { cn } from "@/lib/utils";

const GUIDANCE_LABELS = {
  whoToTalkTo: "Who validation should come from",
  whoValidationShouldComeFrom: "Who validation should come from",
  idealEarlyAdopters: "Ideal early adopters",
  strongestPainHolders: "Strongest pain holders",
  budgetOwners: "Budget owners",
  powerUsers: "Power users",
  decisionMakers: "Decision makers",
  passiveUsers: "Passive users",
  badValidationSources: "Bad validation sources",
};

function FieldBlock({ title, children, muted, className }) {
  if (children == null || children === "") {
    return null;
  }
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div
        className={
          muted
            ? "whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground"
            : "whitespace-pre-wrap text-sm leading-relaxed"
        }
      >
        {children}
      </div>
    </div>
  );
}

function FeaturePlanCard({ featureId, plan, defaultOpen }) {
  const p = normalizeFeaturePlan(plan);
  const title = p.featureName || `Feature ${featureId}`;

  return (
    <Collapsible defaultOpen={defaultOpen} className="rounded-xl border border-border/80 bg-card/40">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold hover:bg-muted/40">
        <span className="line-clamp-2">{title}</span>
        <span className="shrink-0 text-muted-foreground">▾</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <CardContent className="space-y-6 border-t border-border/60 px-4 pb-5 pt-4">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">
              For this feature — plan blocks
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldBlock title="Validation experiments" muted={false}>
                {p.validationExperiments}
              </FieldBlock>
              <FieldBlock title="Assumptions needing proof">
                {p.assumptionsNeedingProof}
              </FieldBlock>
              <FieldBlock title="Testing methods">
                {p.testingMethods?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {p.testingMethods.map((m) => (
                      <Badge key={m} variant="secondary" className="font-normal">
                        {m}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </FieldBlock>
              <FieldBlock title="Success metrics" muted>
                {p.validationSuccessMetrics}
              </FieldBlock>
              <FieldBlock title="Failure signals">{p.failureSignals}</FieldBlock>
              <FieldBlock
                title="Validation workflows"
                className="sm:col-span-2"
              >
                {p.validationWorkflows}
              </FieldBlock>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">
              For every feature — core fields
            </p>
            <div className="grid gap-4">
              <FieldBlock title="1. Validation goal">{p.validationGoal}</FieldBlock>
              <FieldBlock title="2. Core assumption">{p.coreAssumption}</FieldBlock>
              <FieldBlock title="3. Fastest experiment">{p.fastestExperiment}</FieldBlock>
              <FieldBlock title="4. Recommended validation method">
                {p.recommendedValidationMethod}
              </FieldBlock>
              <FieldBlock title="5. Success criteria">{p.successCriteria}</FieldBlock>
              <FieldBlock title="6. Failure signals (pass / pivot)" muted>
                {p.failureSignals}
              </FieldBlock>
              <FieldBlock title="7. Suggested validation channels">
                {p.suggestedValidationChannels?.length ? (
                  <ul className="list-inside list-disc text-sm text-muted-foreground">
                    {p.suggestedValidationChannels.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                ) : null}
              </FieldBlock>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">
              Audience watering hole discovery
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(WATERING_HOLE_LABELS).map(([key, label]) => {
                const v = p.wateringHoleDiscovery[key];
                if (!v) return null;
                return <FieldBlock key={key} title={label} muted>{v}</FieldBlock>;
              })}
            </div>
          </div>

          {p.validationGuidance &&
          typeof p.validationGuidance === "object" &&
          Object.keys(p.validationGuidance).length > 0 ? (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">
                Validation guidance (who / where / what)
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(p.validationGuidance).map(([key, val]) => {
                  if (val == null || val === "") return null;
                  const label = GUIDANCE_LABELS[key] || key;
                  if (Array.isArray(val)) {
                    return (
                      <FieldBlock key={key} title={label}>
                        <ul className="list-inside list-disc text-sm text-muted-foreground">
                          {val.map((x) => (
                            <li key={String(x)}>{String(x)}</li>
                          ))}
                        </ul>
                      </FieldBlock>
                    );
                  }
                  return (
                    <FieldBlock key={key} title={label} muted>
                      {String(val)}
                    </FieldBlock>
                  );
                })}
              </div>
            </div>
          ) : null}
        </CardContent>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ValidationPlanTab({
  projectId,
  workspace,
  setWorkspace,
  selectedIds,
  prioFeatures,
  pendingAction,
  setPendingAction,
  setError,
}) {
  const vp = workspace?.validationPlan;
  const plans = vp?.plansByFeatureId || {};
  const planIds = Object.keys(plans);
  const selectedPreview = React.useMemo(() => {
    const set = new Set(selectedIds.map(String));
    return prioFeatures.filter((f) => f?.id && set.has(String(f.id)));
  }, [prioFeatures, selectedIds]);

  async function runValidationPlan() {
    if (!selectedIds.length) {
      setError(
        "On the Prioritize tab, check at least one feature for validation, then return here and generate."
      );
      return;
    }
    setPendingAction("validation-plan");
    setError("");
    try {
      const res = await fetch(
        `/api/projects/${projectId}/discovery/validation-plan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ featureIds: selectedIds }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Validation plan failed");
        return;
      }
      setWorkspace(data.workspace);
    } catch (e) {
      setError(e?.message || "Request failed");
    } finally {
      setPendingAction("");
    }
  }

  return (
    <div className="space-y-6">
      <WorkspacePanel className="space-y-3 border-primary/15 bg-primary/[0.02]">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">
            TAB 3 — Validation planning
          </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Uses the features you checked on Prioritize. For each one we generate:
          validation experiments, assumptions needing proof, testing methods,
          success metrics, failure signals, validation workflows — plus the
          seven core fields, watering holes, and who to talk to (not “talk to
          anyone”). The plan is stored when you generate; TAB 4 can save a
          snapshot with your execution notes before verification.
        </p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Suggested methods (model picks from this set)
          </p>
          <div className="mt-2 flex max-h-28 flex-wrap gap-1 overflow-y-auto">
            {VALIDATION_METHOD_CATALOG.map((m) => (
              <Badge key={m} variant="outline" className="font-normal text-xs">
                {m}
              </Badge>
            ))}
          </div>
        </div>
      </WorkspacePanel>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Selected features</CardTitle>
          <CardDescription>
            {selectedIds.length === 0
              ? "No features checked yet — go to Prioritize and check the features you want plans for."
              : `${selectedIds.length} feature(s) will be sent to the model (same checkboxes as Prioritize).`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedPreview.length === 0 ? (
            <p className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              Your checked feature ids do not match the current prioritized list.
              Run Prioritize again or re-check features on the Prioritize tab.
            </p>
          ) : (
            <ScrollArea className="h-40 pr-3">
              <ul className="space-y-2 text-sm">
                {selectedPreview.map((f) => (
                  <li
                    key={f.id}
                    className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
                  >
                    <span className="font-medium">{f.featureName}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({f.bucket?.replace(/_/g, " ")})
                    </span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={runValidationPlan}
          disabled={
            !prioFeatures.length ||
            !selectedIds.length ||
            pendingAction === "validation-plan"
          }
          className="gap-2"
        >
          {pendingAction === "validation-plan" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="size-4" aria-hidden />
          )}
          Generate validation plan (AI)
        </Button>
      </div>

      {vp?.overallNotes ? (
        <WorkspacePanel>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Overall notes
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
            {vp.overallNotes}
          </p>
        </WorkspacePanel>
      ) : null}

      {planIds.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Plans by feature</h3>
          <div className="space-y-2">
            {planIds.map((fid, i) => (
              <FeaturePlanCard
                key={fid}
                featureId={fid}
                plan={plans[fid]}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
