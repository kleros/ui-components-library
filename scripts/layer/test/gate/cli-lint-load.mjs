// CLI-5 gate (build.sh): load an app's flat config the way ESLint 9 does, without ESLint. ESLint takes the first of
// eslint.config.{js,mjs,cjs} in the folder (then the TypeScript names, which need jiti and are not tried here) and
// import()s it, so Node's module type rules decide whether it loads: a .js file is an ES module only under
// "type": "module". Prints the file it loaded; exits 1 when it does not load or does not carry the Kleros UI preset.
// usage: node cli-lint-load.mjs <app folder> [file]
// d.11 (B1): with a file (a path from the app folder, such as src/App.tsx), a second line holds, as JSON, the rules
// ESLint would apply to it ("rules": each block whose files match, in order, a later block's options replacing an
// earlier one's for the same id, a bare severity keeping them) and, per plugin, whether each rule is ESLint's own from
// eslint/use-at-your-own-risk ("pluginRules"). That is how a gate without ESLint sees that an app's own
// no-restricted-imports options survive the preset.
// d.11 (B1): the preset sets kleros-ui/no-restricted-syntax and -imports only when ESLint's rules load; see the helper.
import "./eslint-stand-in.mjs";
import { existsSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const dir = resolve(process.argv[2] || ".");
const name = ["eslint.config.js", "eslint.config.mjs", "eslint.config.cjs", "eslint.config.ts", "eslint.config.mts", "eslint.config.cts"].find((f) =>
  existsSync(join(dir, f)),
);
if (!name || /\.[cm]?ts$/.test(name)) {
  console.error(`cli-lint-load: ${name ? `${name} needs jiti` : "no eslint.config.* file"} in ${dir}`);
  process.exit(1);
}
let config;
try {
  config = (await import(pathToFileURL(join(dir, name)).href)).default;
} catch (e) {
  console.error(`cli-lint-load: ${name} does not load: ${String(e?.message ?? e).split("\n")[0]}`);
  process.exit(1);
}
// The preset's own block: its kleros-ui/no-restricted-syntax rule (colour literals, raw elements; d.11, B1).
const preset = Array.isArray(config) && config.some((c) => c?.rules?.["kleros-ui/no-restricted-syntax"]);
if (!preset) {
  console.error(`cli-lint-load: ${name} loads, but its default export has no Kleros UI preset block`);
  process.exit(1);
}
console.log(name);
const file = process.argv[3];
if (file) {
  // A flat config's files patterns, enough for the gates' configs: **, *, ? and {a,b}, matched from the app folder.
  const glob = (g) => {
    let re = "";
    for (let i = 0; i < g.length; i++) {
      const c = g[i];
      if (c === "*" && g[i + 1] === "*") {
        re += g[i + 2] === "/" ? "(?:.*/)?" : ".*";
        i += g[i + 2] === "/" ? 2 : 1;
      } else if (c === "*") re += "[^/]*";
      else if (c === "?") re += "[^/]";
      else if (c === "{") re += "(?:";
      else if (c === "}") re += ")";
      else if (c === ",") re += "|";
      else re += c.replace(/[.+^$()|[\]\\]/g, "\\$&");
    }
    return new RegExp(`^${re}$`);
  };
  const path = relative(dir, resolve(dir, file)).split(sep).join("/");
  const applies = (c) => !c.files || c.files.flat().some((g) => typeof g === "string" && glob(g).test(path));
  const rules = {};
  const pluginRules = {};
  let builtin = null;
  try {
    builtin = (await import("eslint/use-at-your-own-risk")).builtinRules;
  } catch {
    // no ESLint and no stand-in: every plugin rule reads as not ESLint's own
  }
  for (const c of config.filter((x) => x && typeof x === "object" && applies(x))) {
    for (const [id, v] of Object.entries(c.rules ?? {})) {
      const options = Array.isArray(v) ? v.slice(1) : [];
      const severity = Array.isArray(v) ? v[0] : v;
      rules[id] = options.length || !Array.isArray(rules[id]) ? [severity, ...options] : [severity, ...rules[id].slice(1)];
    }
    for (const [name, p] of Object.entries(c.plugins ?? {}))
      for (const [id, r] of Object.entries(p?.rules ?? {})) (pluginRules[name] ??= {})[id] = builtin?.get?.(id) === r ? "builtin" : "own";
  }
  console.log(JSON.stringify({ file: path, rules, pluginRules }));
}
