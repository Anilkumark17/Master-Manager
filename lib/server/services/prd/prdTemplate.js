import { getSystemPrompt } from "@/lib/server/services/prd/prompts/systemPrompt";

/**
 * Prompts the model to return a nested JSON object matching PRD form field paths.
 * Composes shared senior-team bar from `prompts/systemPrompt.js` with JSON-only endpoint rules.
 */

/** JSON shape + plain-text field rules (used together with getSystemPrompt). */
const FORM_FILL_JSON_INSTRUCTIONS = `You are a senior product manager. Your entire reply must be ONE valid JSON object only—no markdown fences, no commentary before or after.

Rules:
- Leaf values must be strings only (use empty string "" if truly unknown).
- Match the nested shape implied by dot-paths in ALLOWED_FIELDS (e.g. path "executive.whatBuilding" → { "executive": { "whatBuilding": "..." } }).
- Include every allowed path with substantive content where possible.
- Prefer concrete, testable wording over buzzwords.
- If CURRENT_FORM_SNAPSHOT already has a non-empty value for a field and it is still accurate, keep or lightly refine it; otherwise fill from LINKED_PROJECT_JSON and inference.
- When NEXT_STAGE_BRIEF is provided, treat it as the primary steering signal: align executive summary, goals, scope, milestones, risks, dependencies, open questions, and team sections with that direction while staying consistent with the linked project.

PLAIN TEXT ONLY (inside each JSON string — what users see in form fields):
- No Markdown: do not use # headings, **bold**, *italic*, \`code\`, [links](url), [[wikilinks]], #tags, > callouts, - [ ] task syntax, or ==highlights==.
- No pipe tables: do not use lines like | Col1 | Col2 | or separator rows with |---|.
- For any tabular / matrix-style field (path contains "Table" or the label suggests columns): use a NORMAL TABLE = tab-separated values (TSV). First line = column headers separated by TAB characters; each following line = one row, cells separated by TAB. This pastes cleanly into Excel/Sheets.
- For lists: use simple numbered lists (1. 2.) or lines starting with a bullet character • or a hyphen and space "- " — plain text only.
- Write in normal sentences and short paragraphs. No HTML.
- Escape double quotes inside strings so the overall JSON stays valid; use \\n for newlines inside strings.`;

function buildStrategyBlockForFormFill(project, stageBrief, discoveryBundle) {
  const lines = [];
  lines.push(
    `Product: ${project.name} (${project.type}). Industry/domain: ${project.industryDomain || "n/a"}.`
  );
  if (project.shortDescription) {
    lines.push(`Short description: ${project.shortDescription}`);
  }
  if (typeof stageBrief === "string" && stageBrief.trim()) {
    lines.push(`NEXT STAGE / PRIORITIZATION BRIEF:\n${stageBrief.trim()}`);
  }
  if (discoveryBundle && typeof discoveryBundle === "object") {
    lines.push(
      "PRODUCT_DISCOVERY_PIPELINE (validated signals — treat as authoritative for scope and priorities when filling the PRD; do not re-open decisions already validated unless the form field explicitly asks for alternatives):\n" +
        JSON.stringify(discoveryBundle, null, 2).slice(0, 28000)
    );
  }
  lines.push(
    "Apply execution-first judgment inside each form field: reduce ambiguity, surface risks, dependencies, edge cases, and missing capabilities where the field allows."
  );
  return lines.join("\n\n");
}

/**
 * Full system prompt for POST .../prds/generate (JSON form snapshot).
 * @param {object} project Drizzle project row
 * @param {string} [stageBrief]
 * @param {object|null} [discoveryBundle] product journey workspace snapshot
 */
function getFormFillSystemPrompt(project, stageBrief, discoveryBundle) {
  const strategyBlock = buildStrategyBlockForFormFill(
    project,
    stageBrief,
    discoveryBundle
  );
  return `${getSystemPrompt(strategyBlock)}

---

ENDPOINT OVERRIDE (this template-fill request only — supersedes conflicting instructions above):
- Your reply must be exactly ONE JSON object matching ALLOWED_FIELDS from the user message. Do NOT output the Markdown PRD document described in REQUIRED TOP-LEVEL SECTIONS as your whole answer.
- Use the senior-team mindset (objectives, review discipline, Kano thinking where relevant) only to inform the text inside JSON string leaves.
- Plain text leaves: follow the rules below. Table paths: TSV only.

${FORM_FILL_JSON_INSTRUCTIONS}`;
}

function buildUserMessageFormFill(
  project,
  formSnapshot,
  fieldDescriptors,
  stageBrief,
  discoveryBundle
) {
  const descriptors = Array.isArray(fieldDescriptors) ? fieldDescriptors : [];

  const projectBlock = JSON.stringify(
    {
      id: project.id,
      name: project.name,
      type: project.type,
      shortDescription: project.shortDescription,
      visionStatement: project.visionStatement,
      problemStatement: project.problemStatement,
      targetUsers: project.targetUsers,
      industryDomain: project.industryDomain,
    },
    null,
    2
  );

  const formBlock = JSON.stringify(formSnapshot || {}, null, 2);
  const fieldsBlock = JSON.stringify(descriptors, null, 2);

  const discoveryBlock =
    discoveryBundle && typeof discoveryBundle === "object"
      ? `PRODUCT_DISCOVERY_AND_PRD_PLANNING_JSON (brainstorm → prioritization → validation → PRD planning — align template with this evidence):\n${JSON.stringify(discoveryBundle, null, 2).slice(0, 32000)}\n\n---\n\n`
      : "";

  return `ALLOWED_FIELDS (each item has "path" using dot notation → build nested JSON; "label" and "sectionTitle" are hints):
${fieldsBlock}

---

LINKED_PROJECT_JSON:
${projectBlock}

---

${discoveryBlock}CURRENT_FORM_SNAPSHOT_JSON (may be partial):
${formBlock}

---

NEXT_STAGE_BRIEF (what happens next in the product / program — goals, constraints, decisions, timeline hints; may be empty):
${typeof stageBrief === "string" && stageBrief.trim()
    ? stageBrief.trim()
    : "(none — infer only from LINKED_PROJECT and CURRENT_FORM_SNAPSHOT)"}

---

Return only the complete filled form as one JSON object with nested keys matching every "path" above.

Reminder: any path whose name ends with "Table" must use tab-separated (TSV) text only—header line then data lines, tabs between cells—never markdown pipe tables.`;
}

/**
 * @param {string} text
 * @returns {Record<string, unknown>}
 */
function parseModelFormJson(text) {
  let s = String(text || "").trim();
  const fence = /^```(?:json)?\s*\r?\n?([\s\S]*?)\r?\n?```$/im.exec(s);
  if (fence) {
    s = fence[1].trim();
  }
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last > first) {
    s = s.slice(first, last + 1);
  }
  const obj = JSON.parse(s);
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    throw new Error("Model response was not a JSON object");
  }
  return obj;
}

export {
  getFormFillSystemPrompt,
  buildUserMessageFormFill,
  parseModelFormJson,
};

/** @deprecated Prefer getFormFillSystemPrompt(project, stageBrief). */
export { FORM_FILL_JSON_INSTRUCTIONS as SYSTEM_PROMPT_FORM_FILL };
