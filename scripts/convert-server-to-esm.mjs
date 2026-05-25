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

function toImportPath(fromFile, reqPath) {
  if (!reqPath.startsWith(".")) return reqPath;
  let abs = path.resolve(path.dirname(fromFile), reqPath);
  if (!abs.endsWith(".js")) abs += ".js";
  const rel = path.relative(path.join(__dirname, ".."), abs).replace(/\\/g, "/");
  return `@/${rel.replace(/\.js$/, "")}`;
}

function convertFile(file) {
  let src = fs.readFileSync(file, "utf8");
  if (!src.includes("require(") && !src.includes("module.exports")) return false;

  const imports = [];

  src = src.replace(
    /require\(["']dotenv["']\)\.config\([^)]*\)\s*;?\s*\n/g,
    ""
  );

  src = src.replace(
    /const\s+(\{[^}]+\}|\w+)\s*=\s*require\(\s*["']([^"']+)["']\s*\)\s*;?\s*\n/g,
    (_, binding, req) => {
      const p = toImportPath(file, req);
      if (binding.startsWith("{")) {
        imports.push(`import ${binding} from "${p}";`);
      } else {
        imports.push(`import ${binding} from "${p}";`);
      }
      return "";
    }
  );

  let exportLine = "";
  const objExport = src.match(/module\.exports\s*=\s*(\{[\s\S]*?\})\s*;?\s*$/);
  if (objExport) {
    src = src.replace(/module\.exports\s*=\s*\{[\s\S]*?\}\s*;?\s*$/, "");
    exportLine = `export ${objExport[1]};`;
  } else {
    const single = src.match(/module\.exports\s*=\s*(\w+)\s*;?\s*$/);
    if (single) {
      src = src.replace(/module\.exports\s*=\s*\w+\s*;?\s*$/, "");
      exportLine = `export default ${single[1]};`;
    }
  }

  const body = src.trim();
  const out = [imports.join("\n"), body, exportLine].filter(Boolean).join("\n\n") + "\n";
  fs.writeFileSync(file, out);
  return true;
}

let n = 0;
for (const file of walk(root)) {
  if (convertFile(file)) n++;
}
console.log("Converted", n, "files");
