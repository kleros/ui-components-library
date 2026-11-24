// Gate (d.8 review): every kit component in the generated catalogue is named in agent/AGENTS.md (in backticks) and is
// in the lint preset's KIT_NAMES, so an app that re-declares it is flagged. Components are the catalogue's /kit rows
// with a PascalCase name; hooks and helpers (useCountdown, readToken) are not components.
// usage: node kit-names.mjs <agent/catalog.json> <agent/AGENTS.md> <eslint/index.mjs>
// Exit 0 when all are covered; otherwise it lists what is missing on stderr and exits 1.
// d.11 (B1): the preset sets kleros-ui/no-restricted-syntax and -imports only when ESLint's rules load; see the helper.
import "./eslint-stand-in.mjs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [catalogFile, agentsFile, presetFile] = process.argv.slice(2);
const catalog = JSON.parse(readFileSync(catalogFile, "utf8"));
const kit = catalog.components.filter((c) => c.importPath.endsWith("/kit") && /^[A-Z]/.test(c.name)).map((c) => c.name);
const agents = readFileSync(agentsFile, "utf8");

// KIT_NAMES is not exported: read it from the rule the preset builds, the "Local component with a library name" selector.
const { default: klerosUI } = await import(pathToFileURL(resolve(presetFile)).href);
const rules = klerosUI({}).flatMap((c) => c.rules?.["kleros-ui/no-restricted-syntax"]?.slice(1) ?? []);
const rule = rules.find((r) => r.message?.startsWith("Local component with a library name"));
const names = new Set(rule?.selector.match(/\[id\.name=\/\^\(([^)]*)\)\$\/\]/)?.[1].split("|") ?? []);

const notInAgents = kit.filter((n) => !agents.includes(`\`${n}\``));
const notInLint = kit.filter((n) => !names.has(n));
if (!kit.length || !names.size) {
  console.error(`kit-names: read ${kit.length} kit components and ${names.size} lint names; expected both`);
  process.exit(1);
}
if (notInAgents.length) console.error(`kit-names: not named in ${agentsFile}: ${notInAgents.join(", ")}`);
if (notInLint.length) console.error(`kit-names: not in KIT_NAMES of ${presetFile}: ${notInLint.join(", ")}`);
if (notInAgents.length || notInLint.length) process.exit(1);
console.log(`kit-names: ${kit.length} kit components, all named in AGENTS.md and in KIT_NAMES`);
