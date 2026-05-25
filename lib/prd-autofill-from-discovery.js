import { normalizePlanningFromServer } from "@/lib/discovery-prd-planning-fields";
import { getAtPath, mergeForm } from "@/lib/prd-form-schema";

function appendTagged(prev, title, body) {
  const b = String(body || "").trim();
  if (!b) {
    return String(prev || "");
  }
  const p = String(prev || "").trim();
  const tag = `--- ${title} ---`;
  if (p.includes(tag)) {
    return p;
  }
  return p ? `${p}\n\n${tag}\n${b}` : `${tag}\n${b}`;
}

function tsvFeatureRows(features) {
  if (!Array.isArray(features) || !features.length) {
    return "";
  }
  const lines = [["Feature", "Description", "Priority", "Bucket"].join("\t")];
  for (const f of features.slice(0, 50)) {
    if (!f) {
      continue;
    }
    lines.push(
      [
        String(f.featureName || "—").replace(/\t|\r?\n/g, " "),
        String(f.shortDescription || "—")
          .replace(/\t|\r?\n/g, " ")
          .slice(0, 240),
        String(f.priorityLevel || "—"),
        String(f.bucket || "—").replace(/_/g, " "),
      ].join("\t")
    );
  }
  return lines.join("\n");
}

/**
 * Merge PRD planning + product journey into the PRD form (tagged appends; idempotent tags).
 * @param {Record<string, unknown>} baseForm
 * @param {Record<string, unknown>|null|undefined} workspace
 * @param {Record<string, unknown>} project
 */
export function applyDiscoveryToForm(baseForm, workspace, project) {
  if (!workspace || typeof workspace !== "object") {
    return baseForm;
  }

  const plan = normalizePlanningFromServer(workspace.prdPlanning);
  const prioFeats = workspace.prioritization?.features;
  const tsv = tsvFeatureRows(Array.isArray(prioFeats) ? prioFeats : []);

  const patch = {};
  const goals = {};
  const solution = {};
  const strategicRollout = {};
  const technical = {};
  const vision = {};

  if (plan.prd) {
    patch.executive = {
      whatBuilding: appendTagged(
        getAtPath(baseForm, "executive.whatBuilding"),
        "PRD planning — validated narrative",
        plan.prd
      ),
    };
  }

  if (plan.strategicRolloutPlan) {
    goals.goals = appendTagged(
      getAtPath(baseForm, "goals.goals"),
      "PRD planning — strategic rollout",
      plan.strategicRolloutPlan
    );
    strategicRollout.optionalNotes = appendTagged(
      getAtPath(baseForm, "strategicRollout.optionalNotes"),
      "Rollout context from planning",
      plan.strategicRolloutPlan
    );
  }

  if (plan.userStories) {
    patch.userStories = appendTagged(
      getAtPath(baseForm, "userStories"),
      "PRD planning — user stories",
      plan.userStories
    );
  }

  if (plan.userFlows) {
    solution.coreWorkflow = appendTagged(
      getAtPath(baseForm, "solution.coreWorkflow"),
      "PRD planning — user flows",
      plan.userFlows
    );
    patch.userFlow = {
      journey: appendTagged(
        getAtPath(baseForm, "userFlow.journey"),
        "PRD planning — user flows (journey)",
        plan.userFlows
      ),
    };
  }

  if (plan.technicalConsiderations) {
    technical.infra = appendTagged(
      getAtPath(baseForm, "technical.infra"),
      "PRD planning — technical considerations",
      plan.technicalConsiderations
    );
  }

  if (plan.successMetrics) {
    const prevGoals = goals.goals ?? getAtPath(baseForm, "goals.goals");
    goals.goals = appendTagged(
      prevGoals,
      "PRD planning — success metrics",
      plan.successMetrics
    );
  }

  if (plan.edgeCases) {
    patch.edge = {
      empty: appendTagged(
        getAtPath(baseForm, "edge.empty"),
        "PRD planning — edge cases",
        plan.edgeCases
      ),
    };
  }

  if (plan.risks) {
    patch.risks = {
      risks: appendTagged(
        getAtPath(baseForm, "risks.risks"),
        "PRD planning — risks",
        plan.risks
      ),
    };
  }

  if (plan.designReferences) {
    vision.strategicImportance = appendTagged(
      getAtPath(baseForm, "vision.strategicImportance"),
      "PRD planning — design references",
      plan.designReferences
    );
  }

  if (plan.developerHandoffDocumentation) {
    solution.assumptions = appendTagged(
      getAtPath(baseForm, "solution.assumptions"),
      "PRD planning — developer handoff",
      plan.developerHandoffDocumentation
    );
  }

  if (tsv) {
    patch.featureTable = appendTagged(
      getAtPath(baseForm, "featureTable"),
      "Product journey — prioritized features (from discovery)",
      tsv
    );
  }

  const brainstormNotes = workspace.brainstorm?.notes;
  if (typeof brainstormNotes === "string" && brainstormNotes.trim()) {
    vision.businessGoal = appendTagged(
      getAtPath(baseForm, "vision.businessGoal"),
      "Product journey — brainstorm notes",
      brainstormNotes
    );
  }

  const valSummary = workspace.validationResults?.analyzed?.summary;
  if (typeof valSummary === "string" && valSummary.trim()) {
    patch.problem = {
      painPoints: appendTagged(
        getAtPath(baseForm, "problem.painPoints"),
        "Product journey — validation summary",
        valSummary
      ),
    };
  }

  const execReview =
    workspace.validationResults?.executionReview?.overallMessage;
  if (typeof execReview === "string" && execReview.trim()) {
    const srPrev =
      strategicRollout.optionalNotes ??
      getAtPath(baseForm, "strategicRollout.optionalNotes");
    strategicRollout.optionalNotes = appendTagged(
      srPrev,
      "Validation execution review",
      execReview
    );
  }

  if (Object.keys(goals).length) {
    patch.goals = goals;
  }
  if (Object.keys(solution).length) {
    patch.solution = solution;
  }
  if (Object.keys(strategicRollout).length) {
    patch.strategicRollout = strategicRollout;
  }
  if (Object.keys(technical).length) {
    patch.technical = technical;
  }
  if (Object.keys(vision).length) {
    patch.vision = vision;
  }

  let out = mergeForm(baseForm, patch);
  if (project?.name && workspace.brainstorm?.structuredFeatures?.length) {
    out = mergeForm(out, {
      goals: {
        nonGoals: appendTagged(
          getAtPath(out, "goals.nonGoals"),
          "Product journey",
          `Structured ${workspace.brainstorm.structuredFeatures.length} candidate feature(s) in discovery; see feature table for prioritized view.`
        ),
      },
    });
  }

  return out;
}

/**
 * Stage brief for AI when empty: project + journey headlines.
 */
export function buildJourneyStageBrief(workspace, project) {
  if (!project) {
    return "";
  }
  if (!workspace || typeof workspace !== "object") {
    return `Project: ${project.name} (${project.type}). Use the project record and current PRD form fields.`;
  }
  const lines = [];
  lines.push(
    `Use the full product journey and PRD planning already merged into the form fields, plus this project: ${project.name} (${project.type}).`
  );
  if (project.shortDescription) {
    lines.push(`Short description: ${project.shortDescription}`);
  }
  const prio = workspace.prioritization;
  if (typeof prio?.summary === "string" && prio.summary.trim()) {
    lines.push(`Prioritization summary:\n${prio.summary.trim()}`);
  }
  const n = workspace.brainstorm?.structuredFeatures?.length;
  if (n) {
    lines.push(
      `Discovery: ${n} structured feature(s) from brainstorm; prioritized list is in the feature table.`
    );
  }
  const vs = workspace.validationResults?.analyzed?.summary;
  if (typeof vs === "string" && vs.trim()) {
    lines.push(`Latest validation summary:\n${vs.trim().slice(0, 2500)}`);
  }
  return lines.join("\n\n");
}
