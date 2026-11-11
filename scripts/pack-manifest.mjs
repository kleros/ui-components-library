// yarn pack runs this twice: as prepack ("strip") and as postpack ("restore"). The packed package.json has no
// "prepare" script: `husky install` sets up this repo's git hooks, has no use in an app, and npm lists it as an install
// script it did not run. The repo's own package.json keeps it for the library's developers.
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = join(root, "package.json");
const saved = join(
  root,
  "node_modules",
  ".cache",
  "pack-manifest",
  "package.json",
);

const mode = process.argv[2];
if (mode === "strip") {
  // A copy left by a pack that did not finish is the only one that still has the script.
  if (existsSync(saved)) {
    throw new Error(
      `pack-manifest: ${saved} is left from an earlier pack; run node scripts/pack-manifest.mjs restore`,
    );
  }
  mkdirSync(dirname(saved), { recursive: true });
  copyFileSync(manifest, saved);
  const pkg = JSON.parse(readFileSync(manifest, "utf8"));
  delete pkg.scripts.prepare;
  writeFileSync(manifest, JSON.stringify(pkg, null, 2) + "\n");
} else if (mode === "restore") {
  if (existsSync(saved)) {
    copyFileSync(saved, manifest);
    rmSync(saved);
  }
} else {
  throw new Error("usage: node scripts/pack-manifest.mjs strip|restore");
}
