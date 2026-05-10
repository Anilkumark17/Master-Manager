import { PRD_SECTIONS, getAtPath } from "@/lib/prd-form-schema";

function slugify(name) {
  return String(name || "project")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function safeFilename(title) {
  const s = slugify(title);
  return s || "prd-document";
}

/**
 * Plain-text document: no markdown headings, pipes, wikilinks, or code fences.
 * Tables in fields should already be tab-separated (TSV) for a normal spreadsheet-style layout.
 */
export function buildPlainDocumentFromPrdForm({
  form,
  project,
  docTitle,
  stageBrief = "",
}) {
  const title =
    (docTitle && String(docTitle).trim()) ||
    `PRD — ${project?.name || "Project"}`;
  const lines = [];

  lines.push(title);
  lines.push("");
  lines.push(`Created: ${new Date().toISOString().slice(0, 19)}`);
  if (project?.name) {
    lines.push(`Project: ${project.name}`);
  }
  if (project?.type) {
    lines.push(`Type: ${project.type}`);
  }
  if (project?.id) {
    lines.push(`Project ID: ${project.id}`);
  }
  lines.push("");
  lines.push("—".repeat(48));
  lines.push("");

  if (String(stageBrief || "").trim()) {
    lines.push("NEXT STAGE BRIEF");
    lines.push("");
    lines.push(String(stageBrief).trim());
    lines.push("");
    lines.push("—".repeat(48));
    lines.push("");
  }

  for (const sec of PRD_SECTIONS) {
    lines.push(sec.title);
    lines.push("");
    for (const field of sec.fields) {
      const raw = getAtPath(form, field.path);
      const val = String(raw ?? "").trim();
      if (!val) {
        continue;
      }
      lines.push(field.label);
      lines.push("");
      lines.push(val);
      lines.push("");
    }
    lines.push("—".repeat(48));
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}
