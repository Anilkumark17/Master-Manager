/** Split one TSV (or space-aligned) row into cells — shared by editor and read-only views. */
export function splitCells(line) {
  if (line.includes("\t")) {
    return line.split("\t");
  }
  if (/\s{2,}/.test(line)) {
    return line.split(/\s{2,}/).map((s) => s.trim());
  }
  return [line];
}
