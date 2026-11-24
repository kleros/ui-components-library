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
    const before = readFileSync(saved, "utf8");
    const now = readFileSync(manifest, "utf8");
    const old = JSON.parse(before);
    const { prepare: _, ...rest } = old.scripts;
    if (
      now === before ||
      now === JSON.stringify({ ...old, scripts: rest }, null, 2) + "\n"
    ) {
      copyFileSync(saved, manifest);
    } else {
      // package.json changed after strip (a pack that did not finish, then an edit): keep the edit and put back only
      // the prepare script, in its old place.
      const pkg = JSON.parse(now);
      // An edit may have removed the whole scripts object, or set it to null.
      const current =
        pkg.scripts && typeof pkg.scripts === "object" ? pkg.scripts : {};
      const scripts = {};
      for (const key of Object.keys(old.scripts)) {
        if (key === "prepare") scripts.prepare = old.scripts.prepare;
        else if (key in current) scripts[key] = current[key];
      }
      pkg.scripts = { ...scripts, ...current };
      writeFileSync(manifest, JSON.stringify(pkg, null, 2) + "\n");
      console.warn(
        "pack-manifest: package.json changed after strip; kept those changes and put back only scripts.prepare",
      );
    }
    rmSync(saved);
  }
} else {
  throw new Error("usage: node scripts/pack-manifest.mjs strip|restore");
}
