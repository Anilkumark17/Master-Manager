/**
 * Designer deliverables: React Flow JSON from PRD (horizontal row layout).
 */

const KIND_LABELS = {
  ia: "Information Architecture",
  journeys: "Journeys & Flows",
  handoff: "Handoff-Ready Visual Structure",
};

const SHARED_RULES = `
PRIMARY SOURCE: The user message includes the latest PRD (plain document + structured JSON). Treat it as the only source of truth.

LAYOUT (mandatory):
- Use a HORIZONTAL, row-based layout: each logical row is one "level" or one connected workflow step.
- Increase y by ~100–140 per row; increase x left-to-right within a row (~180–220px spacing).
- Node type: use "default" for all nodes unless you use "input"/"output" for clear entry/exit.
- Edges: directed arrows showing hierarchy, navigation, or flow order. Minimize crossing lines.
- Keep 4–20 nodes unless the PRD clearly needs more. Labels short and scannable.

OUTPUT (mandatory):
- Reply with ONE JSON object ONLY (no markdown fences, no prose outside JSON) with exactly this shape:
  { "nodes": [ { "id": string, "position": { "x": number, "y": number }, "data": { "label": string }, "type": "default" } ], "edges": [ { "id": string, "source": string, "target": string, "label"?: string } ] }
- Every edge source/target must match an existing node id.

DESIGN PRINCIPLES: Gestalt grouping, Hick's law (few clear choices per screen), cognitive load reduction, progressive disclosure, recognition over recall, consistent spacing, accessibility-minded labels, minimal interaction cost.
`;

const KIND_FOCUS = {
  ia: `
DELIVERABLE FOCUS — Information Architecture:
- Site map / screen inventory as nodes; parent-child via edges.
- Navigation hierarchy and content structure (group related screens in same row where possible).
- Feature grouping and screen hierarchy; show progressive disclosure (high-level row → detail row).
`,

  journeys: `
DELIVERABLE FOCUS — Journeys & Flows:
- End-to-end user journey as left-to-right or top-row entry → branches.
- Decision points as nodes with labeled edges (yes/no, alternate paths).
- Success paths, failure/error paths, entry and exit points clearly marked (labels: "Entry", "Success", "Error", etc.).
`,

  handoff: `
DELIVERABLE FOCUS — Handoff-ready structure:
- Screen relationships and component grouping (nodes = screens or component clusters).
- Interaction notes on edges or in node labels (short: "opens modal", "validates form").
- State changes and flow dependencies; navigation logic between screens.
- Suitable for dev/design handoff discussion (still graph, not prose).
`,
};

function getDesignerSystemPrompt(kind) {
  const label = KIND_LABELS[kind] || "Designer map";
  const focus = KIND_FOCUS[kind] || KIND_FOCUS.ia;
  return `You are a senior product designer + UX systems lead producing ${label} as a React Flow graph for cross-functional collaboration.

${SHARED_RULES}
${focus}
`;
}

function buildDesignerUserMessage(project, prdBlock, kind) {
  const label = KIND_LABELS[kind] || kind;
  return `PROJECT (summary):
${JSON.stringify(
  {
    id: project.id,
    name: project.name,
    type: project.type,
    shortDescription: project.shortDescription,
    visionStatement: project.visionStatement,
    problemStatement: project.problemStatement,
    targetUsers: project.targetUsers,
  },
  null,
  2
)}

---

LATEST_PRD_SNAPSHOT (primary truth — content + structured form JSON):
${prdBlock}

---

Generate ${label} as the required JSON object { nodes, edges } only.`;
}

export {
  getDesignerSystemPrompt,
  buildDesignerUserMessage,
  KIND_LABELS,
};
