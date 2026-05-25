/** Drives PRD structured inputs (keys match form state object). */

export const PRD_SECTIONS = [
  {
    id: "exec",
    title: "1. Executive Summary (TL;DR)",
    fields: [
      { path: "executive.whatBuilding", label: "What are we building?", multiline: true, rows: 2 },
      { path: "executive.whyBuilding", label: "Why are we building this?", multiline: true, rows: 2 },
      { path: "executive.expectedOutcome", label: "Expected outcome / success", multiline: true, rows: 2 },
    ],
  },
  {
    id: "vision",
    title: "2. Product Vision",
    fields: [
      { path: "vision.visionStatement", label: "Vision statement", multiline: true, rows: 3 },
      { path: "vision.businessGoal", label: "Business goal", multiline: true, rows: 2 },
      { path: "vision.strategicImportance", label: "Strategic importance", multiline: true, rows: 2 },
    ],
  },
  {
    id: "problem",
    title: "3. Problem Statement",
    fields: [
      { path: "problem.currentProblem", label: "Current problem", multiline: true, rows: 3 },
      { path: "problem.whoFaces", label: "Who faces this problem?", multiline: true, rows: 2 },
      { path: "problem.painPoints", label: "Pain points (bullets, one per line)", multiline: true, rows: 4 },
      { path: "problem.workflow", label: "Current workflow / pain", multiline: true, rows: 3 },
    ],
  },
  {
    id: "personas",
    title: "4. User Personas (table)",
    fields: [
      {
        path: "personasTable",
        label: "Personas",
        tableHeaders: ["Persona", "Description", "Goals", "Pain"],
        multiline: true,
        rows: 6,
        hint: "Use the table below; values save as tab-separated text.",
      },
    ],
  },
  {
    id: "goals",
    title: "5. Goals & Non-Goals",
    fields: [
      { path: "goals.goals", label: "Goals (one per line)", multiline: true, rows: 4 },
      { path: "goals.nonGoals", label: "Non-goals", multiline: true, rows: 3 },
      { path: "goals.outOfScope", label: "Out of scope", multiline: true, rows: 3 },
    ],
  },
  {
    id: "kpi",
    title: "6. Success Metrics (KPIs) — table",
    fields: [
      {
        path: "kpiTable",
        label: "KPIs",
        tableHeaders: ["Metric", "Current", "Target"],
        multiline: true,
        rows: 5,
        hint: "Use the table below.",
      },
    ],
  },
  {
    id: "stories",
    title: "7. User Stories",
    fields: [
      {
        path: "userStories",
        label: 'Stories (one per line, "As a … I want … so that …")',
        multiline: true,
        rows: 8,
      },
    ],
  },
  {
    id: "solution",
    title: "8. Solution Overview",
    fields: [
      { path: "solution.proposed", label: "Proposed solution", multiline: true, rows: 4 },
      { path: "solution.coreWorkflow", label: "Core workflow", multiline: true, rows: 4 },
      { path: "solution.assumptions", label: "Key assumptions (one per line)", multiline: true, rows: 3 },
    ],
  },
  {
    id: "strategicRollout",
    title: "9. Strategic Rollout Plan (one feature at a time)",
    fields: [
      {
        path: "strategicRollout.feature",
        label: "Feature to analyze (exactly one)",
        multiline: true,
        rows: 5,
        hint: "Name and describe a single feature. Strategic AI analyzes only this item—not your whole product.",
      },
      {
        path: "strategicRollout.optionalNotes",
        label: "Optional context (stage, audience, constraints)",
        multiline: true,
        rows: 3,
        hint: "Helps pick frameworks and validation channels.",
      },
      {
        path: "strategicRollout.analysis",
        label: "Strategic analysis (plain text)",
        multiline: true,
        rows: 20,
        hint: "Use “Analyze this one feature” below, or paste your own write-up. Not filled by the main “Fill template” AI.",
      },
    ],
  },
  {
    id: "features",
    title: "10. Feature List — table",
    fields: [
      {
        path: "featureTable",
        label: "Features",
        tableHeaders: ["Feature", "Description", "Priority", "Owner"],
        multiline: true,
        rows: 6,
        hint: "Use the table below.",
      },
    ],
  },
  {
    id: "kano",
    title: "11. Kano Model — table",
    fields: [
      {
        path: "kanoTable",
        label: "Kano",
        tableHeaders: ["Feature", "Kano category", "Reason"],
        multiline: true,
        rows: 6,
        hint: "Use the table below.",
      },
    ],
  },
  {
    id: "functional",
    title: "12. Functional Requirements — table",
    fields: [
      {
        path: "functionalTable",
        label: "Requirements",
        tableHeaders: ["Req ID", "Description", "Priority"],
        multiline: true,
        rows: 6,
        hint: "Use the table below.",
      },
    ],
  },
  {
    id: "nfr",
    title: "13. Non-Functional Requirements",
    fields: [
      { path: "nfr.performance", label: "Performance", multiline: true, rows: 2 },
      { path: "nfr.scalability", label: "Scalability", multiline: true, rows: 2 },
      { path: "nfr.security", label: "Security", multiline: true, rows: 2 },
      { path: "nfr.accessibility", label: "Accessibility", multiline: true, rows: 2 },
      { path: "nfr.reliability", label: "Reliability", multiline: true, rows: 2 },
    ],
  },
  {
    id: "flow",
    title: "14. User Flow",
    fields: [
      { path: "userFlow.entry", label: "Entry point", multiline: true, rows: 2 },
      { path: "userFlow.journey", label: "Main journey (steps)", multiline: true, rows: 5 },
      { path: "userFlow.exit", label: "Exit point / outcome", multiline: true, rows: 2 },
    ],
  },
  {
    id: "edge",
    title: "15. Edge Cases & Failure States",
    fields: [
      { path: "edge.empty", label: "Empty states", multiline: true, rows: 2 },
      { path: "edge.error", label: "Error states", multiline: true, rows: 2 },
      { path: "edge.auth", label: "Authentication failures", multiline: true, rows: 2 },
      { path: "edge.api", label: "API failures", multiline: true, rows: 2 },
      { path: "edge.offline", label: "Offline scenarios", multiline: true, rows: 2 },
      { path: "edge.invalidInput", label: "Invalid input handling", multiline: true, rows: 2 },
    ],
  },
  {
    id: "tech",
    title: "16. Technical Considerations",
    fields: [
      { path: "technical.techStack", label: "Tech stack", multiline: true, rows: 3 },
      { path: "technical.apis", label: "APIs", multiline: true, rows: 2 },
      { path: "technical.database", label: "Database", multiline: true, rows: 2 },
      { path: "technical.infra", label: "Infrastructure notes", multiline: true, rows: 2 },
      { path: "technical.securityRisks", label: "Security risks", multiline: true, rows: 2 },
    ],
  },
  {
    id: "deps",
    title: "17. Dependencies — table",
    fields: [
      {
        path: "depsTable",
        label: "Dependencies",
        tableHeaders: ["Dependency", "Team", "Risk level"],
        multiline: true,
        rows: 4,
        hint: "Use the table below.",
      },
    ],
  },
  {
    id: "risks",
    title: "18. Risks & Trade-offs",
    fields: [
      { path: "risks.risks", label: "Risks (one per line)", multiline: true, rows: 4 },
      { path: "risks.tradeoffs", label: "Trade-offs narrative", multiline: true, rows: 3 },
    ],
  },
  {
    id: "alt",
    title: "19. Alternative Solutions — table",
    fields: [
      {
        path: "alternativesTable",
        label: "Alternatives",
        tableHeaders: ["Solution", "Why rejected"],
        multiline: true,
        rows: 4,
        hint: "Use the table below.",
      },
    ],
  },
  {
    id: "analytics",
    title: "20. Analytics & Tracking",
    fields: [
      { path: "analytics.events", label: "Events to track", multiline: true, rows: 3 },
      { path: "analytics.productMetrics", label: "Product metrics", multiline: true, rows: 3 },
    ],
  },
  {
    id: "timeline",
    title: "21. Timeline & Milestones — table",
    fields: [
      {
        path: "timelineTable",
        label: "Milestones",
        tableHeaders: ["Milestone", "Owner", "Deadline"],
        multiline: true,
        rows: 4,
        hint: "Use the bordered table below.",
      },
    ],
  },
  {
    id: "team",
    title: "22. Team Responsibilities — table",
    fields: [
      {
        path: "teamTable",
        label: "Team",
        tableHeaders: ["Team", "Responsibility"],
        multiline: true,
        rows: 6,
        hint: "Use the table below.",
      },
    ],
  },
  {
    id: "openq",
    title: "23. Open Questions",
    fields: [{ path: "openQuestions", label: "Questions (one per line)", multiline: true, rows: 4 }],
  },
  {
    id: "approval",
    title: "24. Approval & Sign-off — table",
    fields: [
      {
        path: "approvalTable",
        label: "Sign-off",
        tableHeaders: ["Name", "Role", "Status"],
        multiline: true,
        rows: 4,
        hint: "Use the table below.",
      },
    ],
  },
  {
    id: "attach",
    title: "25. Attachments",
    fields: [
      {
        path: "attachments",
        label: "List links or references (one per line)",
        multiline: true,
        rows: 4,
      },
    ],
  },
];

/** Paths + labels sent to the API so the model fills the same template fields. */
export function getPrdFieldDescriptorsForAi(options = {}) {
  const skip = new Set(options.skipPaths || []);
  return PRD_SECTIONS.flatMap((sec) =>
    sec.fields
      .filter((f) => !skip.has(f.path))
      .map((f) => ({
        path: f.path,
        label: f.label,
        sectionTitle: sec.title,
      }))
  );
}

export function emptyPrdForm() {
  const f = {};
  for (const sec of PRD_SECTIONS) {
    for (const field of sec.fields) {
      const parts = field.path.split(".");
      let cur = f;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (!cur[p]) {
          cur[p] = {};
        }
        cur = cur[p];
      }
      cur[parts[parts.length - 1]] = "";
    }
  }
  return f;
}

export function getAtPath(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? "" : o[k]), obj) ?? "";
}

export function setAtPath(obj, path, value) {
  const parts = path.split(".");
  const next = structuredClone(obj);
  let cur = next;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!cur[p] || typeof cur[p] !== "object") {
      cur[p] = {};
    }
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
  return next;
}

export function mergeForm(base, patch) {
  const out = structuredClone(base);
  for (const [k, v] of Object.entries(patch || {})) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = mergeForm(out[k] || {}, v);
    } else if (v !== undefined && v !== null) {
      out[k] = v;
    }
  }
  return out;
}

export function autofillFromProject(project) {
  if (!project) {
    return {};
  }
  const o = emptyPrdForm();
  o.executive.whatBuilding = project.shortDescription || "";
  o.executive.whyBuilding = project.problemStatement || "";
  o.vision.visionStatement = project.visionStatement || "";
  o.problem.currentProblem = project.problemStatement || "";
  o.problem.whoFaces = project.targetUsers || "";
  o.technical.techStack = project.industryDomain
    ? `Domain / industry: ${project.industryDomain}`
    : "";
  o.goals.goals = `Ship ${project.name} (${project.type}) with measurable outcomes.`;
  o.personasTable = `Persona\tDescription\tGoals\tPain\nPrimary user\t${project.targetUsers || "TBD"}\tClarity\tNeeds better workflow`;
  o.teamTable =
    "Team\tResponsibility\nProduct\tPRD, roadmap, prioritization\nDesign\tUX, flows, visuals\nEngineering\tBuild, integrate, scale\nQA\tQuality, regression\nMarketing\tPositioning, launch";
  return o;
}
