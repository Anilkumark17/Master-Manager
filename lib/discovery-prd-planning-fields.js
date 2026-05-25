/**
 * PRD planning sections — aligned with TAB 5 (validated PRD packet before template generation).
 * JSON keys are camelCase; UI labels match the spec wording.
 */
export const PRD_PLANNING_FIELD_KEYS = [
  "prd",
  "strategicRolloutPlan",
  "userStories",
  "userFlows",
  "technicalConsiderations",
  "successMetrics",
  "edgeCases",
  "risks",
  "designReferences",
  "developerHandoffDocumentation",
];

export const PRD_PLANNING_LABELS = {
  prd: "PRD",
  strategicRolloutPlan: "Strategic Rollout Plan",
  userStories: "User stories",
  userFlows: "User flows",
  technicalConsiderations: "Technical considerations",
  successMetrics: "Success metrics",
  edgeCases: "Edge cases",
  risks: "Risks",
  designReferences: "Design references",
  developerHandoffDocumentation: "Developer handoff documentation",
};

/** Rows for section hints under each heading (spec OUTPUT RULES + TAB 5). */
export const PRD_PLANNING_HINTS = {
  prd:
    "High-confidence decisions only: validated workflows, high-impact opportunities, strategically aligned functionality, clear execution priorities. Plain text — no Markdown.",
  strategicRolloutPlan:
    "Phased rollout tied to validation and business goals. Plain text or simple numbered steps.",
  userStories:
    "Concrete user-centric stories; plain lines or 1. 2. numbering — no Markdown.",
  userFlows:
    "Key flows step-by-step in plain language (who does what, in what order).",
  technicalConsiderations:
    "Constraints, integrations, data, performance, security — what engineering must respect.",
  successMetrics:
    "Measurable outcomes; avoid inventing numbers if evidence is missing — say what to measure instead.",
  edgeCases:
    "Boundary conditions, unusual paths, failure modes users might hit.",
  risks:
    "Product, market, execution, and dependency risks with mitigations where known.",
  designReferences:
    "UX principles, references, or artifacts the design team should align to.",
  developerHandoffDocumentation:
    "What builders need to start: scope boundaries, APIs, contracts, acceptance themes — plain text.",
};

const LEGACY_KEY_MAP = {
  userStoriesBlock: "userStories",
  userFlowsBlock: "userFlows",
  strategicRolloutOutline: "strategicRolloutPlan",
  developerHandoffNotes: "developerHandoffDocumentation",
};

export function emptyPlanningFields() {
  const out = {};
  for (const k of PRD_PLANNING_FIELD_KEYS) {
    out[k] = "";
  }
  return out;
}

/**
 * Normalize server `prdPlanning` into the TAB 5 field shape; maps older saves.
 * @param {Record<string, unknown>|null|undefined} plan
 * @returns {Record<string, string>}
 */
export function normalizePlanningFromServer(plan) {
  const out = emptyPlanningFields();
  if (!plan || typeof plan !== "object") {
    return { ...out };
  }
  for (const k of PRD_PLANNING_FIELD_KEYS) {
    if (typeof plan[k] === "string" && plan[k].trim()) {
      out[k] = plan[k];
    }
  }
  // Legacy v1 keys → TAB 5 shape
  if (!out.prd && typeof plan.validatedScopeSummary === "string") {
    out.prd = plan.validatedScopeSummary;
  }
  if (typeof plan.outOfScope === "string" && plan.outOfScope.trim()) {
    out.prd = out.prd
      ? `${out.prd}\n\nOut of scope:\n${plan.outOfScope}`
      : `Out of scope:\n${plan.outOfScope}`;
  }
  for (const [legacy, target] of Object.entries(LEGACY_KEY_MAP)) {
    if (typeof plan[legacy] === "string" && plan[legacy].trim() && !out[target]) {
      out[target] = plan[legacy];
    }
  }
  if (
    typeof plan.edgeCasesAndRisks === "string" &&
    plan.edgeCasesAndRisks.trim()
  ) {
    if (!out.edgeCases) {
      out.edgeCases = plan.edgeCasesAndRisks;
    } else if (!out.risks) {
      out.risks = plan.edgeCasesAndRisks;
    } else {
      out.edgeCases = `${out.edgeCases}\n\n${plan.edgeCasesAndRisks}`;
    }
  }
  if (
    typeof plan.executionPriorities === "string" &&
    plan.executionPriorities.trim()
  ) {
    out.strategicRolloutPlan = out.strategicRolloutPlan
      ? `${out.strategicRolloutPlan}\n\nExecution priorities:\n${plan.executionPriorities}`
      : `Execution priorities:\n${plan.executionPriorities}`;
  }
  if (typeof plan.openQuestions === "string" && plan.openQuestions.trim()) {
    out.prd = out.prd
      ? `${out.prd}\n\nOpen questions:\n${plan.openQuestions}`
      : `Open questions:\n${plan.openQuestions}`;
  }
  return { ...out };
}
