import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "lib", "server");

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".js")) out.push(p);
  }
  return out;
}

function moveExportsToEnd(src) {
  const lines = src.split("\n");
  const exportLines = [];
  const rest = [];

  for (const line of lines) {
    if (
      line.startsWith("export {") ||
      line.startsWith("export default") ||
      (exportLines.length > 0 &&
        !exportLines[exportLines.length - 1].includes("};") &&
        !exportLines[exportLines.length - 1].includes("};"))
    ) {
      exportLines.push(line);
      continue;
    }
    if (exportLines.length && line.trim() === "") {
      exportLines.push(line);
      continue;
    }
    if (
      exportLines.length &&
      exportLines.some((l) => l.startsWith("export {")) &&
      line === "};"
    ) {
      exportLines.push(line);
      continue;
    }
    rest.push(line);
  }

  if (!exportLines.length) return src;
  while (rest.length && rest[rest.length - 1].trim() === "") rest.pop();
  return `${rest.join("\n")}\n\n${exportLines.join("\n").trim()}\n`;
}

for (const file of walk(root)) {
  const src = fs.readFileSync(file, "utf8");
  const next = moveExportsToEnd(src);
  if (next !== src) fs.writeFileSync(file, next);
}

console.log("Moved exports to end");
