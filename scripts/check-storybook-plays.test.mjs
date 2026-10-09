// Self-test of check-storybook-plays.mjs: its static server and CLI argument
// handling, and what it reports for the known-bad stories in storybook-plays-fixtures.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { request } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, test } from "node:test";
import { fileURLToPath } from "node:url";

import { serve, storybookDir } from "./check-storybook-plays.mjs";

const repo = path.resolve(fileURLToPath(import.meta.url), "../..");
const checker = path.join(repo, "scripts/check-storybook-plays.mjs");
const FIXTURES_OUT = "storybook-plays-fixtures-static";

before(() => {
  execFileSync(
    "yarn",
    [
      "storybook",
      "build",
      "--config-dir",
      "scripts/storybook-plays-fixtures",
      "--output-dir",
      FIXTURES_OUT,
      "--quiet",
    ],
    { cwd: repo, stdio: "ignore" },
  );
});

// Sends `rawPath` unnormalized, as a hostile client would.
const get = (port, rawPath) =>
  new Promise((resolve, reject) => {
    request({ host: "127.0.0.1", port, path: rawPath }, (response) => {
      response.resume();
      response.on("end", () => resolve(response.statusCode));
    })
      .on("error", reject)
      .end();
  });

describe("static server", () => {
  let parent;
  let server;
  let port;
  before(async () => {
    parent = mkdtempSync(path.join(tmpdir(), "plays-checker-"));
    const root = path.join(parent, "root");
    mkdirSync(path.join(root, "nested"), { recursive: true });
    writeFileSync(path.join(root, "nested/inside.txt"), "inside");
    writeFileSync(path.join(parent, "outside.txt"), "outside");
    symlinkSync(path.join(parent, "outside.txt"), path.join(root, "escape"));
    symlinkSync(parent, path.join(root, "escape-dir"));
    server = await serve(root);
    port = server.address().port;
  });
  after(() => {
    server.close();
    rmSync(parent, { recursive: true });
  });

  test("serves files under the root", async () => {
    assert.equal(await get(port, "/nested/inside.txt"), 200);
    assert.equal(await get(port, "/nested/../nested/inside.txt"), 200);
  });

  for (const hostile of [
    "/../outside.txt",
    "/..%2Foutside.txt",
    "/%2e%2e/outside.txt",
    "/nested/..%2F..%2Foutside.txt",
    "/..%5Coutside.txt",
    "//../outside.txt",
    "/nested%00/inside.txt",
    "/escape",
    "/escape-dir/outside.txt",
    "/%E0%A4%A",
    "/nested",
    "/",
  ])
    test(`refuses ${hostile}`, async () => {
      assert.equal(await get(port, hostile), 404);
    });
});

describe("storybook directory argument", () => {
  test("accepts a built Storybook inside the working directory", () => {
    assert.equal(
      storybookDir(FIXTURES_OUT, repo),
      path.join(repo, FIXTURES_OUT),
    );
  });
  for (const argument of ["..", "/etc", "scripts", "missing-dir"])
    test(`rejects ${argument}`, () => {
      assert.throws(() => storybookDir(argument, repo));
    });

  test("rejects a built Storybook outside the working directory", () => {
    const parent = mkdtempSync(path.join(tmpdir(), "plays-checker-cli-"));
    try {
      const cwd = path.join(parent, "cwd");
      const outside = path.join(parent, "outside");
      for (const dir of [path.join(cwd, "inside"), outside]) {
        mkdirSync(dir, { recursive: true });
        writeFileSync(path.join(dir, "index.json"), "{}");
        writeFileSync(path.join(dir, "iframe.html"), "");
      }
      symlinkSync(outside, path.join(cwd, "linked"));
      assert.ok(storybookDir("inside", cwd).endsWith("inside"));
      for (const argument of ["../outside", outside, "linked"])
        assert.throws(() => storybookDir(argument, cwd), /is outside/);
    } finally {
      rmSync(parent, { recursive: true });
    }
  });
});

// `${id} [${theme}]` -> the failure events the checker must report, exactly.
const EXPECTED = {
  "checker-fixtures--play-throws [light]": [
    "playFunctionThrewException",
    "storyThrewException",
  ],
  "checker-fixtures--play-throws [dark]": [
    "playFunctionThrewException",
    "storyThrewException",
  ],
  "checker-fixtures--after-each-throws-after-timer [light]": [
    "storyThrewException",
  ],
  "checker-fixtures--after-each-throws-after-timer [dark]": [
    "storyThrewException",
  ],
  "checker-fixtures--dark-only-at-play-start [dark]": [
    "playFunctionThrewException",
    "storyThrewException",
  ],
  "checker-fixtures--unhandled-rejection-while-playing [light]": [
    "pageerror",
    "unhandledErrorsWhilePlaying",
  ],
  "checker-fixtures--unhandled-rejection-while-playing [dark]": [
    "pageerror",
    "unhandledErrorsWhilePlaying",
  ],
  "checker-fixtures--render-throws [light]": ["storyThrewException"],
  "checker-fixtures--render-throws [dark]": ["storyThrewException"],
  "checker-fixtures--dark-only-at-first-render [dark]": ["storyThrewException"],
  "checker-fixtures-import--module-throws [light]": ["storyMissing"],
  "checker-fixtures-import--module-throws [dark]": ["storyMissing"],
};

describe("checker on known-bad stories", () => {
  let result;
  let reported;
  before(() => {
    result = spawnSync("node", [checker, FIXTURES_OUT], {
      cwd: repo,
      encoding: "utf8",
    });
    reported = {};
    let current;
    for (const line of result.stdout.split("\n")) {
      if (line.startsWith("FAIL ")) {
        current = line.slice("FAIL ".length);
        reported[current] = [];
      } else if (line.startsWith("  ") && current) {
        reported[current].push(line.trim().split(":")[0]);
      } else current = undefined;
    }
    for (const key of Object.keys(reported)) reported[key].sort();
  });

  test("exits 1", () => assert.equal(result.status, 1, result.stderr));

  for (const [job, events] of Object.entries(EXPECTED))
    test(`reports ${job} with ${events.join(", ")}`, () => {
      assert.deepEqual(reported[job], events);
    });

  test("reports no other story or theme", () => {
    assert.deepEqual(
      Object.keys(reported).sort(),
      Object.keys(EXPECTED).sort(),
    );
  });
});
