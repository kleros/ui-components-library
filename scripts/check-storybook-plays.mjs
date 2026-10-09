// Renders every story of a built Storybook in Chromium, in both themes, and
// fails when a render or play throws. Plays run as in Chromatic: no Vitest, no act().
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(process.argv[2] ?? "storybook-static");
const THEMES = ["light", "dark"];
const WORKERS = 8;
const STORY_TIMEOUT_MS = 30_000;

// Story id prefix -> why the story is not checked here.
const EXCLUDED = {
  "internal-a11y-self-test--":
    "self-tests of the Vitest-only a11y audit; outside the story runner their play is a no-op",
};

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

const serve = () =>
  new Promise((resolve) => {
    const server = createServer((request, response) => {
      const { pathname } = new URL(request.url, "http://localhost");
      const file = path.join(ROOT, decodeURIComponent(pathname));
      if (
        !file.startsWith(ROOT) ||
        !existsSync(file) ||
        statSync(file).isDirectory()
      ) {
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

// Runs in the page before the preview boots, which assigns the channel once.
const hookChannel = (failureEvents) => {
  window.__playCheck = { failures: [], done: false };
  const record = (event) => (payload) =>
    window.__playCheck.failures.push(
      `${event}: ${payload?.message ?? payload?.description ?? JSON.stringify(payload)}`,
    );
  let channel;
  Object.defineProperty(window, "__STORYBOOK_ADDONS_CHANNEL__", {
    configurable: true,
    get: () => channel,
    set: (value) => {
      channel = value;
      for (const event of failureEvents) channel.on(event, record(event));
      channel.on("storyRenderPhaseChanged", ({ newPhase }) => {
        if (["completed", "errored", "aborted"].includes(newPhase))
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
  const index = JSON.parse(readFileSync(path.join(ROOT, "index.json"), "utf8"));
  const stories = Object.values(index.entries).filter(
    (entry) => entry.type === "story",
  );
  const exclusion = (story) =>
    Object.keys(EXCLUDED).find((prefix) => story.id.startsWith(prefix));
  const checked = stories.filter((story) => !exclusion(story));

  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addInitScript(hookChannel, FAILURE_EVENTS);

  const queue = checked.flatMap((story) =>
    THEMES.map((theme) => ({ id: story.id, theme })),
  );
  const failed = [];
  await Promise.all(
    Array.from({ length: WORKERS }, async () => {
      for (let job = queue.shift(); job; job = queue.shift()) {
        const failures = await checkStory(context, base, job.id, job.theme);
        if (failures.length > 0) failed.push({ ...job, failures });
      }
    }),
  );
  await browser.close();
  server.close();

  for (const [prefix, reason] of Object.entries(EXCLUDED)) {
    const count = stories.filter((story) => exclusion(story) === prefix).length;
    console.info(`excluded ${prefix}* (${count} stories): ${reason}`);
  }
  failed.sort((a, b) =>
    `${a.id} ${a.theme}`.localeCompare(`${b.id} ${b.theme}`),
  );
  for (const { id, theme, failures } of failed) {
    console.info(`FAIL ${id} [${theme}]`);
    for (const failure of failures) console.info(`  ${failure.split("\n")[0]}`);
  }
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  const excludedCount = stories.length - checked.length;
  console.info(
    `${checked.length} stories x ${THEMES.length} themes: ` +
      `${failed.length} failing, ${excludedCount} excluded, ${seconds}s`,
  );
  process.exitCode = failed.length > 0 ? 1 : 0;
};

await main();
