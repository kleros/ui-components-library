// Runs after `vite build` and `tsc -p kit/tsconfig.json` (yarn build:layer). It finishes, in place, the kit that tsc
// emitted into dist/kit.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "dist");
const KIT = join(DIST, "kit");
const LIB_IMPORT = 'from "@kleros/ui-components-library"';

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
    writeFileSync(file, types);
  } else if (name.endsWith(".js")) {
    // The kit's code imports the library's own entry, so an app bundles one copy of it.
    writeFileSync(
      file,
      eachLine(text, (line) => line.replace(LIB_IMPORT, 'from "../index.js"')),
    );
  }
}
