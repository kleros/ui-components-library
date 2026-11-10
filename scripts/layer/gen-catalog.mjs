// Build step (yarn build:layer): agent/catalog.json and agent/CATALOG.md from the seed (the core components and the
// first kit components) and the @intent tags in the kit's sources (the later kit components).
// usage: node scripts/layer/gen-catalog.mjs [kit/src dir] [out agent dir] [version]
// The defaults are kit/src, agent and the version in the repo's package.json.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const [
  srcDir = join(root, "kit", "src"),
  outDir = join(root, "agent"),
  version = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))
    .version,
] = process.argv.slice(2);
const seed = JSON.parse(readFileSync(join(here, "seed.json"), "utf8"));
const split = (s) =>
  s
    .split(",")
    .map((w) => w.trim())
    .filter(Boolean);

const components = [
  ...seed.core.map(([name, intent, props]) => ({
    name,
    importPath: "@kleros/ui-components-library",
    intent: split(intent),
    props,
  })),
  ...seed.kit.map(([name, intent, props]) => ({
    name,
    importPath: "@kleros/ui-components-library/kit",
    intent: split(intent),
    props,
  })),
];
// Kit additions: JSDoc blocks with @intent directly above an exported function or const. The body may not contain
// "*/", so a match starts at the component's own JSDoc, not at an earlier prop comment in its props interface.
for (const f of readdirSync(srcDir).filter((f) => /\.tsx?$/.test(f))) {
  const src = readFileSync(join(srcDir, f), "utf8");
  for (const m of src.matchAll(
    /\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*export (?:function|const) (\w+)/g,
  )) {
    const doc = m[1];
    const intent = doc.match(/@intent ([^\n]+)/);
    if (!intent || components.some((c) => c.name === m[2])) continue;
    const description =
      doc
        .split("\n")
        .map((l) => l.replace(/^\s*\*\s?/, ""))
        .filter((l) => l && !l.startsWith("@"))[0] || "";
    components.push({
      name: m[2],
      importPath: "@kleros/ui-components-library/kit",
      intent: split(intent[1]),
      description,
    });
  }
}
const knownGaps = seed.knownGaps.map((g) => ({
  ...g,
  intent: split(g.intent),
}));
writeFileSync(
  join(outDir, "catalog.json"),
  JSON.stringify({ version, components, knownGaps }, null, 2) + "\n",
);

const md = [
  `# Catalogue: @kleros/ui-components-library ${version}`,
  "",
  "Generated at build. Search this file, and your app's `kleros-ui.json` for components the app already has.",
  "",
  "| Component | Import from | Use it for | Key props |",
  "|---|---|---|---|",
  ...components.map(
    (c) =>
      `| ${c.name} | \`${c.importPath}\` | ${c.intent.join(", ")} | ${c.props || c.description || ""} |`,
  ),
  "",
  "## Known gaps (not in the library; apps build these by hand)",
  "| Need | Compose from | Or scaffold |",
  "|---|---|---|",
  // The command passes the gap's intent words, as the guide's step 2 does; without them new wrote an empty intent
  // list and ui:check noted it.
  ...knownGaps.map((g) => {
    const need = `${g.name} (${g.intent.slice(0, 4).join(", ")})`;
    const command = `npx kleros-ui new ${g.suggest} --kind ${g.kind} --intent "${g.intent.join(", ")}"`;
    return `| ${need} | ${g.compose || "–"} | \`${command}\` |`;
  }),
  "",
].join("\n");
writeFileSync(join(outDir, "CATALOG.md"), md);
console.info(
  `catalog: ${components.length} components, ${knownGaps.length} known gaps`,
);
