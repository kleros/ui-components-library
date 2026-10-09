// Renders every story of a built Storybook in Chromium, in both themes, and
// fails when a render, play or afterEach throws. Plays run without Vitest or
// act(), as in Chromatic, with the story tests' trusted-event filter.
import {
  createReadStream,
  readFileSync,
  realpathSync,
  statSync,
} from "node:fs";
import { createServer } from "node:http";
import { availableParallelism } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const THEMES = ["light", "dark"];
// Each page is a renderer process; more pages than CPUs starves the plays.
const MAX_WORKERS = 8;
const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
// Per-story wait for storyFinished; the self-test shortens it.
const STORY_TIMEOUT_MS = Number(process.env.PLAYS_STORY_TIMEOUT_MS) || 30_000;

const FAILURE_EVENTS = [
  "playFunctionThrewException",
  "storyThrewException",
  "storyErrored",
  "storyMissing",
  "unhandledErrorsWhilePlaying",
];

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
  ".md": "text/markdown",
  ".txt": "text/plain",
};

const isInside = (root, candidate) =>
  candidate === root || candidate.startsWith(root + path.sep);

/**
 * Maps a request URL to a regular file under `root` (a realpath), or returns
 * null for anything that is not one, including `..` segments and symlink escapes.
 */
export const resolveRequest = (root, url) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(url, "http://localhost").pathname);
  } catch {
    return null;
  }
  const segments = pathname.split("/").filter(Boolean);
  if (
    segments.some(
      (segment) =>
        segment === ".." || segment.includes("\\") || segment.includes("\0"),
    )
  )
    return null;
  const file = path.resolve(root, ...segments);
  if (!isInside(root, file)) return null;
  let real;
  try {
    real = realpathSync(file);
  } catch {
    return null;
  }
  if (!isInside(root, real) || !statSync(real).isFile()) return null;
  return real;
};

/** Serves the files under `root` on a random loopback port. */
export const serve = (root) => {
  const realRoot = realpathSync(root);
  return new Promise((resolve) => {
    const server = createServer((request, response) => {
      const file = resolveRequest(realRoot, request.url);
      if (!file) {
        response.writeHead(404).end();
        return;
      }
      response.writeHead(200, {
        "content-type": MIME[path.extname(file)] ?? "application/octet-stream",
      });
      createReadStream(file).pipe(response);
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
};

/** Resolves the CLI argument to a built Storybook directory inside the working directory. */
export const storybookDir = (argument, cwd = process.cwd()) => {
  const base = realpathSync(cwd);
  const resolved = path.resolve(base, argument);
  if (!isInside(base, resolved))
    throw new Error(`${argument} is outside ${base}`);
  const real = realpathSync(resolved);
  if (!isInside(base, real)) throw new Error(`${argument} is outside ${base}`);
  for (const file of ["index.json", "iframe.html"])
    if (!statSync(path.join(real, file), { throwIfNoEntry: false })?.isFile())
      throw new Error(`${argument} is not a built Storybook (no ${file})`);
  return real;
};

// Runs in the page before the preview boots, which assigns the channel once.
const hookChannel = (failureEvents) => {
  window.__playCheck = { failures: [], done: false };
  const fail = (message) => window.__playCheck.failures.push(message);
  const record = (event) => (payload) =>
    fail(
      `${event}: ${payload?.message ?? payload?.description ?? JSON.stringify(payload)}`,
    );
  let channel;
  Object.defineProperty(window, "__STORYBOOK_ADDONS_CHANNEL__", {
    configurable: true,
    get: () => channel,
    set: (value) => {
      channel = value;
      for (const event of failureEvents) channel.on(event, record(event));
      channel.on("storyMissing", () => (window.__playCheck.done = true));
      // Emitted after experimental_afterEach; a11y reports are left to the Vitest audit.
      channel.on("storyFinished", ({ reporters = [] }) => {
        for (const report of reporters)
          if (report.type !== "a11y" && report.status === "failed")
            fail(`storyFinished: ${report.type} report failed`);
        window.__playCheck.done = true;
      });
      channel.on("storyRenderPhaseChanged", ({ newPhase }) => {
        if (newPhase !== "aborted") return;
        fail("storyRenderPhaseChanged: render aborted");
        window.__playCheck.done = true;
      });
    },
  });
};

const checkStory = async (context, base, id, theme) => {
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) =>
    pageErrors.push(`pageerror: ${error.message}`),
  );
  try {
    await page.goto(
      `${base}/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`,
    );
    await page.waitForFunction(() => window.__playCheck?.done, null, {
      timeout: STORY_TIMEOUT_MS,
    });
    const { failures } = await page.evaluate(() => window.__playCheck);
    return [...failures, ...pageErrors];
  } catch (error) {
    return [error.message, ...pageErrors];
  } finally {
    await page.close();
  }
};

const main = async () => {
  const started = Date.now();
  const root = storybookDir(process.argv[2] ?? "storybook-static");
  const index = JSON.parse(readFileSync(path.join(root, "index.json"), "utf8"));
  const stories = Object.values(index.entries).filter(
    (entry) => entry.type === "story",
  );
  if (stories.length === 0) {
    console.error(`No stories in ${path.join(root, "index.json")}`);
    process.exit(1);
  }
  const workers = Math.min(MAX_WORKERS, availableParallelism());

  const server = await serve(root);
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addInitScript(hookChannel, FAILURE_EVENTS);
  // Same filter as the Vitest story project, so plays see the same hover state.
  await context.addInitScript({
    path: path.join(REPO_ROOT, ".storybook/trusted-event-filter.js"),
  });

  const queue = stories.flatMap((story) =>
    THEMES.map((theme) => ({ id: story.id, theme })),
  );
  const failed = [];
  await Promise.all(
    Array.from({ length: workers }, async () => {
      for (let job = queue.shift(); job; job = queue.shift()) {
        const failures = await checkStory(context, base, job.id, job.theme);
        if (failures.length > 0) failed.push({ ...job, failures });
      }
    }),
  );
  await browser.close();
  server.close();

  failed.sort((a, b) =>
    `${a.id} ${a.theme}`.localeCompare(`${b.id} ${b.theme}`),
  );
  for (const { id, theme, failures } of failed) {
    console.info(`FAIL ${id} [${theme}]`);
    for (const failure of failures) console.info(`  ${failure.split("\n")[0]}`);
  }
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.info(
    `${stories.length} stories x ${THEMES.length} themes: ` +
      `${failed.length} failing, ${workers} workers, ${seconds}s`,
  );
  process.exitCode = failed.length > 0 ? 1 : 0;
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
