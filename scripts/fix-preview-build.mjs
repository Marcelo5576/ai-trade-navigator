import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const source = resolve("dist/server/index.js");
const target = resolve("dist/server/server.js");

if (!existsSync(source)) {
  console.warn("[fix-preview-build] dist/server/index.js not found; skipping preview alias.");
  process.exit(0);
}

copyFileSync(source, target);
console.log("[fix-preview-build] created dist/server/server.js");
