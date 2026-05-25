"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { splitCells } from "@/lib/tsv-cells";

function rowsToTsv(rows) {
  return rows.map((r) => r.join("\t")).join("\n");
}

function parseModel(value, baseHeaders) {
  const t = String(value ?? "").trim();
  const lines = t
    ? t.split(/\r?\n/).filter((line) => line.length > 0)
    : [];
  const rows = lines.length ? lines.map(splitCells) : [];
  const ncol = Math.max(
    baseHeaders.length,
    rows.length ? Math.max(...rows.map((r) => r.length)) : 0,
    1
  );
  const pad = (r) => {
    const x = [...(r || [])];
    while (x.length < ncol) x.push("");
    return x.slice(0, ncol);
  };
  const header = pad(rows[0] ?? baseHeaders);
  const data = rows.slice(1).map(pad);
  const body = data.length > 0 ? data : [Array(ncol).fill("")];
  return { header, body, numCols: ncol };
}

/**
 * Bordered table UI; parent `value` / `onChange` stay TSV for AI and export.
 */
export function TsvTableField({ value, onChange, defaultHeaders }) {
  const baseHeaders = React.useMemo(
    () =>
      defaultHeaders?.length
        ? defaultHeaders.map(String)
        : ["Column 1", "Column 2", "Column 3"],
    [defaultHeaders]
  );

  const { header, body, numCols } = React.useMemo(
    () => parseModel(value, baseHeaders),
    [value, baseHeaders]
  );

  const commit = React.useCallback(
    (nextHeader, nextBody) => {
      onChange(rowsToTsv([nextHeader, ...nextBody]));
    },
    [onChange]
  );

  const setHeaderCell = (ci, val) => {
    const nextH = header.map((c, j) => (j === ci ? val : c));
    commit(nextH, body);
  };

  const setBodyCell = (ri, ci, val) => {
    const nextBody = body.map((row, i) =>
      i === ri ? row.map((c, j) => (j === ci ? val : c)) : row
    );
    commit(header, nextBody);
  };

  const addRow = () => {
    commit(header, [...body, Array(numCols).fill("")]);
  };

  const removeRow = (ri) => {
    if (body.length <= 1) {
      commit(header, [Array(numCols).fill("")]);
      return;
    }
    commit(
      header,
      body.filter((_, i) => i !== ri)
    );
  };

  const onPaste = (e) => {
    const text = e.clipboardData.getData("text/plain");
    if (!text || !text.includes("\t")) {
      return;
    }
    e.preventDefault();
    const lines = text.trim().split(/\r?\n/).filter((l) => l.length > 0);
    if (lines.length === 0) {
      return;
    }
    const pasted = lines.map(splitCells);
    const ncolPaste = Math.max(
      numCols,
      ...pasted.map((r) => r.length),
      1
    );
    const padP = (r) => {
      const x = [...(r || [])];
      while (x.length < ncolPaste) x.push("");
      return x.slice(0, ncolPaste);
    };
    onChange(rowsToTsv(pasted.map(padP)));
  };

  return (
    <div className="space-y-2" onPaste={onPaste}>
      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr>
              {header.map((cell, ci) => (
                <th
                  key={ci}
                  className="border-b border-r border-border bg-muted/50 px-0 py-0 text-left font-medium"
                >
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) => setHeaderCell(ci, e.target.value)}
                    className="w-full min-w-[7rem] border-0 bg-transparent px-3 py-2.5 text-sm outline-none ring-0 focus:bg-muted/30"
                    spellCheck={false}
                  />
                </th>
              ))}
              <th
                className="w-12 border-b border-l border-border bg-muted/50"
                aria-hidden
              />
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri} className="hover:bg-muted/20">
                {row.map((cell, ci) => (
                  <td key={ci} className="border-b border-r border-border p-0">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => setBodyCell(ri, ci, e.target.value)}
                      className="w-full min-w-[7rem] border-0 bg-transparent px-3 py-2 text-sm outline-none ring-0 focus:bg-muted/40"
                      spellCheck={false}
                    />
                  </td>
                ))}
                <td className="border-b border-l border-border bg-muted/10 p-0 align-middle">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeRow(ri)}
                    aria-label="Remove row"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={addRow}
      >
        <Plus className="size-4" aria-hidden />
        Add row
      </Button>
      <p className="text-[11px] text-muted-foreground">
        Borders are for editing only; stored value stays tab-separated (Excel
        paste supported).
      </p>
    </div>
  );
}
