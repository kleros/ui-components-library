import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type Manifest = Record<
  "dependencies" | "devDependencies" | "peerDependencies",
  Record<string, string>
>;

const manifest = JSON.parse(
  readFileSync(resolve("package.json"), "utf8"),
) as Manifest;

const REACT = ["react", "react-dom", "react-is"];

// A React package in `dependencies` installs the library's own React 18 under
// a React 19 app, which then renders a blank page instead of failing at install.
describe("React packages", () => {
  it.each(REACT)("%s is a ^18 peer, not a dependency", (name) => {
    expect({
      dependency: manifest.dependencies[name],
      peer: manifest.peerDependencies[name],
      dev: manifest.devDependencies[name],
    }).toEqual({ dependency: undefined, peer: "^18.0.0", dev: "^18.0.0" });
  });

  it("the README says React 19 is not supported", () => {
    expect(readFileSync(resolve("README.md"), "utf8")).toContain(
      "React 19 is not supported",
    );
  });
});
