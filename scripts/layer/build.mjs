// Runs after `vite build` and `tsc -p kit/tsconfig.json` (yarn build:layer). It finishes, in place, the kit that tsc
// emitted into dist/kit and the library's type entry files.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "dist");
const KIT = join(DIST, "kit");
const LIB_IMPORT = 'from "@kleros/ui-components-library"';

// Every type file an agent may open first points at the guide (D31), and names no command: every app that updates
// to this version gets these files, and an agent in an app that never chose the agent layer should not run init on
// its own (PR #127 review, F17). The guide's Start says how to set an app up, and to ask the app's team first when
// its AGENTS.md has no kleros-ui block.
const NOTE =
  "// @kleros/ui-components-library: before writing UI with this package, read agent/AGENTS.md in it (setup and " +
  "rules) and agent/CATALOG.md (the components).";
// The note goes on top in place of any version of it already there, so a build over an older dist (`yarn build:layer`
// alone does not empty it) leaves one note, the current one. Every version so far starts with NOTE_START.
const NOTE_START = "// @kleros/ui-components-library: ";
const withNote = (text) => {
  const lines = text.split("\n");
  while (lines[0]?.startsWith(NOTE_START)) lines.shift();
  return [NOTE, ...lines].join("\n");
};

// One replacement per line at most, like sed without the g flag.
const eachLine = (text, edit) => text.split("\n").map(edit).join("\n");

for (const name of readdirSync(KIT).sort()) {
  const file = join(KIT, name);
  const text = readFileSync(file, "utf8");
  if (name.endsWith(".d.ts")) {
    // The kit's types read the library from the package root. `import React from "react"` is a default import that
    // @types/react (export =) has only under esModuleInterop, so in an app with "moduleResolution": "node" and no
    // interop StackProps and the rest lost children and className; `import * as React` reads the same under both.
    const types = eachLine(text, (line) =>
      line
        .replace(LIB_IMPORT, 'from "../ui-components-library"')
        .replace(
          /^import React from "react";$/,
          'import * as React from "react";',
        ),
    );
    if (/^import React\b/m.test(types)) {
      throw new Error(`build-layer: ${file} still has a default React import`);
    }
    writeFileSync(file, withNote(types));
  } else if (name.endsWith(".js")) {
    // The kit's code imports the library's own entry, so an app bundles one copy of it.
    writeFileSync(
      file,
      eachLine(text, (line) => line.replace(LIB_IMPORT, 'from "../index.js"')),
    );
  }
}

for (const entry of ["ui-components-library.d.ts", "lib/index.d.ts"]) {
  const file = join(DIST, entry);
  const text = readFileSync(file, "utf8");
  const next = withNote(text);
  if (next !== text) writeFileSync(file, next);
}
