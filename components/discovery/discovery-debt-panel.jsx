"use client";

import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const DOMAIN_SET = new Set([
  "Problem Debt",
  "Customer Debt",
  "Market Debt",
  "Solution Debt",
  "Channel Debt",
  "Economics Debt",
]);

function severityClass(s) {
  const v = String(s || "").toLowerCase();
  if (v === "critical") {
    return "border-destructive/60 bg-destructive/10 text-destructive";
  }
  if (v === "high") {
    return "border-orange-500/50 bg-orange-500/10 text-orange-900 dark:text-orange-200";
  }
  if (v === "medium") {
    return "border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100";
  }
  return "border-border bg-muted/40 text-muted-foreground";
}

function formatRecommendation(v) {
  const s = String(v || "").replace(/_/g, " ");
  return s ? s.replace(/\b\w/g, (c) => c.toUpperCase()) : "—";
}

function Field({ label, children }) {
  if (children == null || children === "") {
    return null;
  }
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-xs leading-relaxed text-foreground/90">{children}</p>
    </div>
  );
}

export function DiscoveryDebtPanel({ debt }) {
  if (!debt || typeof debt !== "object") {
    return (
      <p className="rounded-md border border-dashed border-border/80 bg-muted/20 px-2 py-2 text-xs text-muted-foreground">
        No Discovery Debt block yet — run <strong>Prioritize with AI</strong> to
        generate domain mapping and validation guidance per feature.
      </p>
    );
  }

  const domains = Array.isArray(debt.relatedDomains)
    ? debt.relatedDomains.filter((d) => DOMAIN_SET.has(String(d).trim()))
    : [];

  return (
    <div className="mt-2 space-y-2 border-t border-border/60 pt-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Discovery debt
        </span>
        {domains.length ? (
          domains.map((d) => (
            <Badge
              key={d}
              variant="secondary"
              className="max-w-full truncate text-[10px] font-normal"
            >
              {d}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant="outline"
          className={cn("text-[10px]", severityClass(debt.debtSeverity))}
        >
          Severity: {debt.debtSeverity || "—"}
        </Badge>
        <Badge variant="outline" className="text-[10px] font-normal">
          Zone: {debt.debtZone || "—"}
          {debt.debtZoneLabel ? ` → ${debt.debtZoneLabel}` : ""}
        </Badge>
        <Badge variant="outline" className="text-[10px] font-normal">
          {formatRecommendation(debt.strategicRecommendation)}
        </Badge>
      </div>

      <Collapsible>
        <CollapsibleTrigger className="text-xs font-medium text-primary underline-offset-2 hover:underline">
          Assumptions, gaps, validation & watering holes
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-2 rounded-md border border-border/50 bg-muted/15 p-2">
          <Field label="Key assumption" children={debt.keyAssumptionTheFeatureDependsOn} />
          <Field label="Business uncertainty" children={debt.businessUncertainty} />
          <Field label="Validation gap" children={debt.validationGap} />
          <Field label="Risk if built without proof" children={debt.riskIfBuiltWithoutProof} />
          <Field label="Why this debt exists" children={debt.whyThisDebtExists} />
          <Field label="Risk if ignored" children={debt.riskIfIgnored} />
          <Field label="Evidence available" children={debt.evidenceAvailable} />
          <Field label="Missing validation" children={debt.missingValidation} />
          <Field label="Suggested validation method" children={debt.suggestedValidationMethod} />
          <Field label="Suggested experiment" children={debt.suggestedExperiment} />
          {Array.isArray(debt.suggestedChannels) && debt.suggestedChannels.length > 0 ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Suggested channels
              </p>
              <ul className="mt-0.5 list-inside list-disc text-xs text-foreground/90">
                {debt.suggestedChannels.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {Array.isArray(debt.suggestedWateringHoles) &&
          debt.suggestedWateringHoles.length > 0 ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Watering holes
              </p>
              <ul className="mt-0.5 list-inside list-disc text-xs text-foreground/90">
                {debt.suggestedWateringHoles.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
