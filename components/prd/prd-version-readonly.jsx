import Link from "next/link";

import { PRD_SECTIONS, getAtPath } from "@/lib/prd-form-schema";
import { splitCells } from "@/lib/tsv-cells";

function ReadOnlyTable({ value }) {
  const lines = String(value || "")
    .trim()
    .split(/\r?\n/)
    .filter((l) => l.length > 0);
  if (lines.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No rows in this table.</p>
    );
  }
  const rows = lines.map(splitCells);
  const ncol = Math.max(...rows.map((r) => r.length), 1);
  const pad = (r) => {
    const x = [...(r || [])];
    while (x.length < ncol) x.push("");
    return x.slice(0, ncol);
  };
  const tableRows = rows.map(pad);
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <tbody>
          {tableRows.map((row, ri) => (
            <tr
              key={ri}
              className={
                ri === 0
                  ? "border-b border-border bg-muted/50 font-medium"
                  : "border-b border-border last:border-b-0 hover:bg-muted/15"
              }
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="border-r border-border px-3 py-2 align-top last:border-r-0"
                >
                  <span className="whitespace-pre-wrap leading-relaxed">
                    {cell}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Full read-only view of one saved PRD snapshot (server component).
 */
export function PrdVersionReadOnly({ projectId, prd }) {
  const form =
    prd.formSnapshot && typeof prd.formSnapshot === "object"
      ? prd.formSnapshot
      : {};

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <Link
            href={`/dashboard/projects/${projectId}/prd`}
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            ← Back to PRD editor
          </Link>
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            {prd.title || "Untitled PRD"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Updated {new Date(prd.updatedAt).toLocaleString()}
            {prd.modelUsed ? ` · Model: ${prd.modelUsed}` : null}
          </p>
        </div>
        <Link
          href={`/dashboard/projects/${projectId}/prd`}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium hover:bg-muted"
        >
          Edit workspace
        </Link>
      </div>

      {String(prd.content || "").trim() ? (
        <section className="space-y-3">
          <h2 className="text-base font-semibold tracking-tight">
            Plain document
          </h2>
          <pre className="max-h-[min(70vh,560px)] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-muted/15 p-4 text-sm leading-relaxed">
            {prd.content}
          </pre>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-base font-semibold tracking-tight">
          Complete structured PRD
        </h2>
        <p className="text-sm text-muted-foreground">
          All sections and fields for this saved version.
        </p>

        <div className="space-y-6">
          {PRD_SECTIONS.map((sec) => {
            const filled = sec.fields.some(
              (f) => String(getAtPath(form, f.path) || "").trim()
            );
            if (!filled) {
              return null;
            }
            return (
              <article
                key={sec.id}
                className="rounded-xl border border-border/80 bg-card/40 p-4 shadow-sm sm:p-6"
              >
                <h3 className="text-sm font-semibold text-foreground">
                  {sec.title}
                </h3>
                <div className="mt-4 space-y-6">
                  {sec.fields.map((field) => {
                    const val = getAtPath(form, field.path);
                    if (!String(val || "").trim()) {
                      return null;
                    }
                    return (
                      <div key={field.path} className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {field.label}
                        </h4>
                        {field.tableHeaders?.length ? (
                          <ReadOnlyTable value={val} />
                        ) : (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                            {val}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
