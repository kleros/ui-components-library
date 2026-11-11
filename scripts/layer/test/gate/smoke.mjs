// Renders every kit component to HTML through the packed package (no DOM), to catch runtime errors tsc cannot see.
// d.9 adds a few client checks in happy-dom (no interval with a fixed `now`, applyInitialTheme, ThemeToggle's start).
// The 3.11 review adds checks for its kit fixes, and mounts the recipes and the Dark story of each new-component
// template, which run.sh's step 5 writes to out/ as JavaScript.
import { readFileSync, writeFileSync } from "node:fs";
import { register, registerHooks } from "node:module";
register("./css-stub-loader.mjs", import.meta.url);
// tsc keeps out/'s relative imports as written ("./GateUi", no .js), which Node's ESM resolution needs: add it, for
// modules in out/ only, so an extensionless import in the packed dist/kit still fails here as it would in an app.
const OUT = new URL("./out/", import.meta.url).href;
registerHooks({
  resolve(spec, context, next) {
    try { return next(spec, context); }
    catch (e) {
      const fromOut = context.parentURL?.startsWith(OUT);
      if (fromOut && /^\.\.?\//.test(spec) && !/\.[cm]?js$/.test(spec)) return next(`${spec}.js`, context);
      throw e;
    }
  },
});
const React = (await import("react")).default;
const { renderToString } = await import("react-dom/server");
// The core root entry touches document/window at import time (react-markdown's browser build, react-aria),
// so the smoke test needs a DOM even for server rendering. happy-dom provides one.
const { GlobalRegistrator } = await import("@happy-dom/global-registrator");
GlobalRegistrator.register({ url: "http://localhost/" });
const kit = await import("@kleros/ui-components-library/kit");
const h = React.createElement;
const steps = [
  { title: "Terms", content: h("input", { "aria-label": "Title" }), validate: () => true },
  { title: "Payment", content: "pay" },
  { title: "Review", content: "review" },
];
// d.9 (D20): a fixed clock. 2 days 4 hours 12 minutes 5 seconds before the deadline, in each accepted form.
const NOW = "2026-10-29T12:00:00Z";
const DEADLINE = "2026-10-31T16:12:05Z";
function CountdownParts() {
  return h("output", null, JSON.stringify(kit.useCountdown(new Date(DEADLINE), Date.parse(NOW))));
}
const cases = {
  Skeleton: h(kit.Skeleton, { count: 2 }),
  Spinner: h(kit.Spinner),
  EmptyState: h(kit.EmptyState, { title: "None", action: { text: "Reset", onPress() {} } }),
  InfoCard: h(kit.InfoCard, { variant: "error" }, "x"),
  StatCard: h(kit.StatCard, { label: "Cases", value: 3 }),
  AddressDisplay: h(kit.AddressDisplay, { address: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed", explorerUrl: "https://etherscan.io" }),
  TokenAmount: h(kit.TokenAmount, { value: 1234567890000000000000n, symbol: "PNK" }),
  DataTable: h(kit.DataTable, { rows: [{ id: 1, name: "a" }], rowKey: (r) => r.id, columns: [{ key: "name", header: "Name" }] }),
  ExternalLink: h(kit.ExternalLink, { href: "https://kleros.io" }, "Kleros"),
  HelpTooltip: h(kit.HelpTooltip, { text: "help" }, "Label"),
  Stack: h(kit.Stack, { gap: 2 }, "a"),
  Inline: h(kit.Inline, { gap: 2, justify: "between" }, "a"),
  Grid: h(kit.Grid, { minItemWidth: 200 }, "a"),
  Section: h(kit.Section, { title: "T", description: "d", actions: "x" }, "a"),
  Page: h(kit.Page, { title: "T" }, "a"),
  FormStack: h(kit.FormStack, { actions: "x" }, "a"),
  ErrorState: h(kit.ErrorState, { message: "m", onRetry() {} }),
  QueryStateEmpty: h(kit.QueryState, { isLoading: false, data: [], empty: { title: "None" } }, () => "rows"),
  QueryStateLoading: h(kit.QueryState, { isLoading: true, data: undefined }, () => "rows"),
  StatusBadge: h(kit.StatusBadge, { tone: "accent", dot: true }, "Vote"),
  FormField: h(kit.FormField, { label: "L", help: "h", error: "e" }, h("input")),
  Countdown: h(kit.Countdown, { deadline: Date.now() + 3_600_000 }),
  KeyValueList: h(kit.KeyValueList, { items: [{ label: "Court", value: "General" }, { label: "Amount", value: "1.5 ETH", hint: "In escrow", id: "a" }] }),
  Sparkline: h(kit.Sparkline, { values: [3, 5, 4, 8], label: "Escrow", startLabel: "1 Oct", endLabel: "Today" }),
  SparklineEmpty: h(kit.Sparkline, { values: [] }),
  SparklineOne: h(kit.Sparkline, { values: [7] }),
  SparklineZeros: h(kit.Sparkline, { values: [0, 0, 0] }),
  SparklineFlat: h(kit.Sparkline, { values: [5, 5, Number.NaN, 5], zeroBased: false }),
  WizardFirst: h(kit.WizardShell, { steps, onSubmit() {} }),
  WizardLast: h(kit.WizardShell, { steps, step: 2, onStepChange() {}, onSubmit() {}, submitText: "Create" }),
  ChainGuard: h(kit.ChainGuard, { isConnected: true, chainId: 1, requiredChainId: 42161, chainName: "Arbitrum One", onConnect() {}, onSwitchChain() {} }, "secret"),
  // d.9 kit changes
  CountdownNow: h(kit.Countdown, { deadline: DEADLINE, now: NOW }),
  CountdownNowLong: h(kit.Countdown, { deadline: new Date(DEADLINE), now: Date.parse(NOW), format: "long" }),
  CountdownNowOver: h(kit.Countdown, { deadline: NOW, now: DEADLINE, overText: "Closed" }),
  CountdownParts: h(CountdownParts),
  GridOne: h(kit.Grid, { minItemWidth: 200 }, h("div", null, "one")),
  FormStackTwo: h(kit.FormStack, { actions: [h("button", { key: "c" }, "Cancel"), h("button", { key: "s" }, "Review and confirm")] }, "fields"),
  // d.9 review: actions in one kit Inline; an unparseable deadline.
  FormStackInline: h(kit.FormStack, { actions: h(kit.Inline, { gap: 2 }, h("button", { key: "c" }, "Cancel"), h("button", { key: "s" }, "Save")) }, "fields"),
  CountdownBad: h(kit.Countdown, { deadline: "2026-31-10" }),
  // 3.11 review (kit-shots observations, CodeRabbit).
  EmptyStateNode: h(kit.EmptyState, { title: "t", action: h("a", { id: "x", href: "#all" }, "Go") }),
  QueryStateEmptyNode: h(kit.QueryState, { isLoading: false, data: [], empty: { title: "No cases", description: "Try another court.",
    action: h("a", { id: "act", href: "#all" }, "View all") } }, () => null),
  QueryStateEmptyButton: h(kit.QueryState, { isLoading: false, data: [], empty: { title: "No cases", action: { text: "Reload", onPress() {} } } }, () => null),
  QueryStateErrorTitle: h(kit.QueryState, { isLoading: false, isError: true, error: new Error("503"), data: undefined, errorTitle: "Could not load cases" }, () => null),
  QueryStateError: h(kit.QueryState, { isLoading: false, isError: true, error: new Error("503"), data: undefined }, () => null),
  InfoCardWarning: h(kit.InfoCard, { variant: "warning" }, "Voting closes in 2 hours."),
  StatusBadgeNeutral: h(kit.StatusBadge, { tone: "neutral", dot: true }, "Commit"),
  DataTablePress: h(kit.DataTable, { rows: [{ id: 1, name: "a" }], rowKey: (r) => r.id, onRowPress() {}, columns: [{ key: "name", header: "Name" }] }),
  DataTableWidths: h(kit.DataTable, { rows: [], isLoading: true, rowKey: (r) => r.id,
    columns: [{ key: "name", header: "Name", width: 120 }, { key: "id", header: "Id", width: "20%" }, { key: "x", header: "X" }] }),
  TokenDust: h(kit.TokenAmount, { value: 50000000000000n, symbol: "ETH" }),
  TokenDustNeg: h(kit.TokenAmount, { value: -50000000000000n }),
  TokenDust2: h(kit.TokenAmount, { value: 1000000000000000n, maxFractionDigits: 2 }),
  TokenDust0: h(kit.TokenAmount, { value: 500000000000000000n, maxFractionDigits: 0 }),
  TokenZero: h(kit.TokenAmount, { value: 0n }),
  TokenStep: h(kit.TokenAmount, { value: 100000000000000n }),
  CountdownZeroUnit: h(kit.Countdown, { deadline: Date.parse(NOW) + 86_600_000, now: NOW }),
  CountdownZeroUnitLong: h(kit.Countdown, { deadline: Date.parse(NOW) + 86_600_000, now: NOW, format: "long" }),
  CountdownFiveMin: h(kit.Countdown, { deadline: Date.parse(NOW) + 300_000, now: NOW }),
  HelpTooltipRich: h(kit.HelpTooltip, { text: "help" }, h("b", null, "Rich")),
  ChainGuardConnecting: h(kit.ChainGuard, { isConnected: false, isConnecting: true, requiredChainId: 42161, chainName: "Arbitrum One", onConnect() {}, onSwitchChain() {} }, "secret"),
  ChainGuardConnectingOnChain: h(kit.ChainGuard, { isConnected: true, isConnecting: true, chainId: 42161, requiredChainId: 42161, chainName: "Arbitrum One", onConnect() {}, onSwitchChain() {} }, "secret"),
  SectionActions: h(kit.Section, { actions: h("button", null, "Go") }, "a"),
};
let bad = 0;
for (const [name, el] of Object.entries(cases)) {
  try { const html = renderToString(el); console.log(`ok   ${name.padEnd(15)} ${html.length} chars`); }
  catch (e) { bad++; console.log(`FAIL ${name}: ${e.message.split("\n")[0]}`); }
}
console.log(kit.formatUnits(1234567890000000000000n), kit.parseUnits("1.5").toString(), kit.shortenAddress("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"));
const ok = renderToString(cases.ChainGuard).includes("Switch to Arbitrum One") && !renderToString(cases.ChainGuard).includes("secret");
// d.8 kit additions. run.sh prints only the last line, so every check is folded into it.
const html = (name) => { try { return renderToString(cases[name]); } catch { return ""; } };
// React escapes & and > in attributes; the class checks read the unescaped markup.
const raw = (name) => html(name).replaceAll("&amp;", "&").replaceAll("&gt;", ">");
// The text a server render shows: no tags (React's <!-- --> between text nodes included), entities read.
const text = (name) => html(name).replace(/<[^>]*>/g, "").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");

// d.9 client checks (happy-dom). Each returns true or a short reason.
const { createRoot } = await import("react-dom/client");
async function mount(el) {
  const div = document.createElement("div");
  document.body.appendChild(div);
  const root = createRoot(div);
  await React.act(async () => root.render(el));
  return { div, unmount: async () => { await React.act(async () => root.unmount()); div.remove(); } };
}
async function intervalsWhileMounted(el) {
  const real = globalThis.setInterval;
  let n = 0;
  globalThis.setInterval = (...a) => { n++; return real(...a); };
  try { const m = await mount(el); const text = m.div.textContent; await m.unmount(); return { n, text }; }
  finally { globalThis.setInterval = real; }
}
const realMatchMedia = window.matchMedia;
const system = (dark) => { window.matchMedia = (q) => ({ matches: dark && q === "(prefers-color-scheme: dark)", media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false }); };
const at = (search, darkSystem, classBefore) => {
  window.happyDOM.setURL("http://localhost/" + search);
  system(darkSystem);
  document.documentElement.classList.toggle("dark", classBefore);
  const got = kit.applyInitialTheme();
  return `${got}/${document.documentElement.classList.contains("dark") ? "dark" : "light"}`;
};
async function themeChecks() {
  const r = {
    lightOnDark: at("?theme=light", true, true),
    darkOnLight: at("?theme=dark", false, false),
    systemDark: at("", true, false),
    systemLight: at("?theme=blue", false, true),
  };
  // No matchMedia (an old or embedded browser): light, unless the URL asks for dark.
  window.happyDOM.setURL("http://localhost/");
  window.matchMedia = undefined;
  document.documentElement.classList.add("dark");
  r.noMatchMedia = `${kit.applyInitialTheme()}/${document.documentElement.classList.contains("dark") ? "dark" : "light"}`;
  // No window (a server render): returns "light" and touches nothing.
  const desc = Object.getOwnPropertyDescriptor(globalThis, "window");
  document.documentElement.classList.add("dark");
  try { delete globalThis.window; r.noWindow = `${typeof window}:${kit.applyInitialTheme()}`; }
  catch (e) { r.noWindow = "threw " + e.message; }
  finally { Object.defineProperty(globalThis, "window", desc); }
  r.noWindowUntouched = document.documentElement.classList.contains("dark");
  // ThemeToggle starts from what applyInitialTheme applied (it follows the class).
  const toggle = async (search, darkSystem) => {
    at(search, darkSystem, !darkSystem);
    const m = await mount(h(kit.ThemeToggle));
    const on = m.div.querySelector('input[role="switch"]')?.checked;
    await m.unmount();
    return on;
  };
  r.toggleLightOnDark = await toggle("?theme=light", true);
  r.toggleDarkOnLight = await toggle("?theme=dark", false);
  window.matchMedia = realMatchMedia;
  window.happyDOM.setURL("http://localhost/");
  document.documentElement.classList.remove("dark");
  return r;
}
// A pressable DataTable row: a tab stop; Enter, Space and a cell click press it; a click on a link in it does not.
async function rowPressChecks() {
  const pressed = [];
  const link = () => h("a", { href: "#case", onClick: (e) => e.preventDefault() }, "Case 1");
  const m = await mount(h(kit.DataTable, { rows: [{ id: 1 }], rowKey: (r) => r.id, onRowPress: (r) => pressed.push(r.id),
    columns: [{ key: "id", header: "Id" }, { key: "link", header: "Case", render: link }] }));
  const tr = m.div.querySelector("tbody tr");
  const key = (k) => React.act(async () => tr.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true })));
  await key("Enter");
  await key(" ");
  await React.act(async () => tr.querySelector("a").click());
  await React.act(async () => tr.querySelector("td").click());
  const r = { tabIndex: tr.tabIndex, pressed: pressed.join(",") };
  await m.unmount();
  return r;
}
// 3.11 review client checks.
const tick = () => React.act(async () => { await new Promise((r) => setTimeout(r, 0)); });
const byText = (root, sel, want) => [...root.querySelectorAll(sel)].find((e) => e.textContent.trim() === want);
// With an explorer link, the link sits beside the core Tooltip's trigger (still a role="button" around the short
// address), so no link is inside a button, and react-aria logs no role warning on mount.
async function addressChecks() {
  const warn = console.warn;
  const warned = [];
  console.warn = (...a) => { warned.push(a.join(" ")); };
  try {
    const m = await mount(h(kit.AddressDisplay, { address: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed", explorerUrl: "https://etherscan.io" }));
    const a = m.div.querySelector("a");
    const r = {
      inButton: !!a?.closest('[role="button"]'),
      // The address's own trigger, not Copiable's copy-button tooltip (which wraps a <button>).
      trigger: [...m.div.querySelectorAll('[role="button"]')].some((e) => !e.querySelector("button") && e.textContent.includes("0x5aAe…eAed")),
      label: a?.getAttribute("aria-label") ?? null,
      roleWarning: warned.some((w) => w.includes("interactive ARIA role")),
    };
    await m.unmount();
    return r;
  } finally { console.warn = warn; }
}
// useDarkMode follows the <html> class: a second caller sees the switch, and both see a change made by other code.
// The word Dark is the switch's label, so a click on it toggles the theme.
function DarkProbe() { return h("output", null, String(kit.useDarkMode()[0])); }
async function darkSyncChecks() {
  const html = document.documentElement;
  html.classList.remove("dark");
  const m = await mount(h(React.Fragment, null, h(kit.ThemeToggle), h(DarkProbe)));
  const input = m.div.querySelector('input[role="switch"]');
  const probe = () => m.div.querySelector("output")?.textContent;
  await React.act(async () => input.click());
  await tick();
  const r = { afterSwitch: probe() };
  await React.act(async () => { html.classList.remove("dark"); await new Promise((res) => setTimeout(res, 0)); });
  r.afterOutside = `${probe()}/${input.checked}`;
  const word = byText(m.div, "label", "Dark");
  r.labelFor = !!word && !!input.id && word.htmlFor === input.id;
  await React.act(async () => word?.click());
  await tick();
  r.afterWord = html.classList.contains("dark");
  await m.unmount();
  html.classList.remove("dark");
  return r;
}
// A live countdown that has ended and gets a later deadline (a refetch that extends a period) does not end again.
async function countdownEndChecks() {
  let ends = 0;
  const onEnd = () => { ends++; };
  const div = document.createElement("div");
  document.body.appendChild(div);
  const root = createRoot(div);
  await React.act(async () => root.render(h(kit.Countdown, { deadline: Date.now() - 60_000, onEnd })));
  await React.act(async () => root.render(h(kit.Countdown, { deadline: Date.now() + 3_600_000, onEnd })));
  const r = { ends, text: div.textContent };
  await React.act(async () => root.unmount());
  div.remove();
  return r;
}
// The Dark story of each template kind (run.sh step 5 names them GateUi, GateData, GateForm): the dark class on
// <html> while it is shown, under StrictMode, and the class as it was once it goes.
async function darkStoryChecks() {
  const r = {};
  const html = document.documentElement;
  for (const kind of ["ui", "data", "form"]) {
    const name = `Gate${kind[0].toUpperCase()}${kind.slice(1)}`;
    try {
      const mod = await import(`./out/t-${kind}/${name}.stories.js`);
      const { Dark } = mod;
      const story = () => (Dark.render ? Dark.render(Dark.args ?? {}, {}) : h(mod.default.component, Dark.args));
      const run = async (before) => {
        html.className = before;
        const m = await mount(h(React.StrictMode, null, story()));
        const during = html.classList.contains("dark");
        await m.unmount();
        return `${during}/${html.className}`;
      };
      r[kind] = `${await run("scheme-x")} ${await run("dark scheme-x")}`;
    } catch (e) { r[kind] = `threw ${e.message.split("\n")[0]}`; }
  }
  html.className = "";
  return r;
}
// The recipes, as run.sh step 5 compiled them. evidence-list is loaded once more with a fetch that fails once.
let unhandled = 0;
process.on("unhandledRejection", () => { unhandled++; });
async function recipeChecks() {
  const r = {};
  try {
    const src = readFileSync(new URL("./out/evidence-list.js", import.meta.url), "utf8");
    writeFileSync(new URL("./out/evidence-list-failing.js", import.meta.url), src.replace("function fetchEvidence() {",
      'function fetchEvidence() { if (globalThis.failEvidence) { globalThis.failEvidence = false; return Promise.reject(new Error("indexer down")); }'));
    globalThis.failEvidence = true;
    const { default: EvidenceList } = await import("./out/evidence-list-failing.js");
    const m = await mount(h(EvidenceList));
    await tick();
    const retry = byText(m.div, "button", "Retry");
    r.evidenceError = `${m.div.textContent.includes("Something went wrong")}/${!!retry}/${m.div.querySelectorAll(".animate-pulse").length}`;
    await React.act(async () => retry?.click());
    await tick();
    r.evidenceRetry = m.div.textContent.includes("Delivery receipt");
    await React.act(async () => byText(m.div, "button", "Submit evidence")?.click());
    await tick();
    const dialog = document.querySelector('[role="dialog"]');
    r.evidenceModal = `${!!dialog?.classList.contains("h-auto")}/${!!(dialog && byText(dialog, "button", "Submit")?.closest(".justify-end"))}/${!!dialog?.querySelector("textarea.w-full")}`;
    await m.unmount();
  } catch (e) { r.evidence = `threw ${e.message.split("\n")[0]}`; }
  r.unhandled = unhandled;
  try {
    const { default: CasePage } = await import("./out/case-page.js");
    const t = renderToString(h(CasePage)).replaceAll("&amp;", "&").replaceAll("&gt;", ">");
    const steps = /<ol class="([^"]*)"[^>]*aria-label="Horizontal progress steps"/.exec(t)?.[1] ?? "";
    r.casePage = `${/<main class="[^"]*\bmax-w-6xl\b/.test(t)}/${/<div class="grid[^"]*" style="[^"]*grid-template-columns:repeat\(/.test(t)}/${/\bw-full\b/.test(steps)}`;
  } catch (e) { r.casePage = `threw ${e.message.split("\n")[0]}`; }
  try {
    const { default: VoteForm } = await import("./out/vote-form.js");
    const t = renderToString(h(VoteForm, { isConnected: true, chainId: 42161, onConnect() {}, onSwitchChain() {} }));
    r.voteForm = /class="[^"]*\bjustify-end\b[^"]*"><button[^>]*>(?:<[^>]*>)*Cast vote/.test(t);
    r.voteTipName = /<input[^>]*aria-label="Tip \(ETH\)"/.test(t);
  } catch (e) { r.voteForm = `threw ${e.message.split("\n")[0]}`; }
  return r;
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let fixedRun, liveRun, badRun, theme, rowPress, address, dark, countdownEnd, darkStory, recipes;
try {
  fixedRun = await intervalsWhileMounted(h(kit.Countdown, { deadline: DEADLINE, now: NOW }));
  liveRun = await intervalsWhileMounted(h(kit.Countdown, { deadline: Date.now() + 3_600_000 }));
  badRun = await intervalsWhileMounted(h(kit.Countdown, { deadline: "2026-31-10" }));
  theme = await themeChecks();
  rowPress = await rowPressChecks();
  address = await addressChecks();
  dark = await darkSyncChecks();
  countdownEnd = await countdownEndChecks();
  darkStory = await darkStoryChecks();
  recipes = await recipeChecks();
} catch (e) { console.log(`FAIL client checks: ${e.message.split("\n")[0]}`); }
for (const [k, v] of Object.entries({ fixedRun, liveRun, badRun, theme, rowPress, address, dark, countdownEnd, darkStory, recipes })) {
  console.log(`     ${k} ${JSON.stringify(v)}`);
}

const parts = (() => { try { return JSON.parse(html("CountdownParts").replace(/^<output>|<\/output>$/g, "").replaceAll("&quot;", '"')); } catch { return {}; } })();
const checks = {
  "KeyValueList dl/dt/dd + hint": /<dl[^>]*>.*<dt[^>]*>Court<\/dt><dd[^>]*>General<\/dd>.*In escrow/.test(html("KeyValueList")),
  "Sparkline no NaN (0, 1, zeros, flat)": ["Sparkline", "SparklineEmpty", "SparklineOne", "SparklineZeros", "SparklineFlat"]
    .every((n) => html(n).includes('role="img"') && !/NaN|Infinity/.test(html(n))),
  "Sparkline token classes + summary": html("Sparkline").includes("stroke-klerosUIComponentsPrimaryBlue")
    && html("Sparkline").includes('aria-label="Escrow: 3 (1 Oct) to 8 (Today), low 3, high 8"') && html("SparklineEmpty").includes("Trend: no data"),
  "WizardShell first step: Next, no Back": html("WizardFirst").includes(">Next<") && !html("WizardFirst").includes(">Back<")
    && html("WizardFirst").includes('aria-current="step"') && html("WizardFirst").includes("<form"),
  "WizardShell last step: Back + Submit, no Next": html("WizardLast").includes(">Back<") && html("WizardLast").includes(">Create<")
    && !html("WizardLast").includes(">Next<") && html("WizardLast").includes("review"),
  // d.9
  "Countdown now: fixed text (ISO, Date + ms, over)": html("CountdownNow").includes(">2d 4h 12m</time>")
    && html("CountdownNowLong").includes(">2 days 4 hours</time>") && html("CountdownNowOver").includes(">Closed</time>")
    && html("CountdownNow").includes('dateTime="2026-10-31T16:12:05.000Z"'),
  "useCountdown now: fixed parts": parts.days === 2 && parts.hours === 4 && parts.minutes === 12 && parts.seconds === 5 && parts.isOver === false,
  "Countdown now: no interval (live: 1)": fixedRun?.n === 0 && fixedRun?.text === "2d 4h 12m" && liveRun?.n === 1,
  "Countdown, unparseable deadline: 0s and no interval": badRun?.n === 0 && badRun?.text === "0s" && html("CountdownBad").includes(">0s</time>"),
  "FormField label: core label classes": /<label[^>]*class="text-klerosUIComponentsSecondaryText text-sm">L<\/label>/.test(html("FormField")),
  "Grid: auto-fit, lone item on auto-fill, min-width floor": raw("GridOne").includes("min-width:min(100%, 200px)")
    && raw("GridOne").includes("grid-template-columns:repeat(var(--kit-grid-repeat, auto-fit), minmax(min(100%, max(200px, var(--kit-grid-lone, 0px))), 1fr))")
    && raw("GridOne").includes("[&:has(>:only-child)]:[--kit-grid-repeat:auto-fill]") && raw("GridOne").includes("[--kit-grid-repeat:auto-fit]"),
  "FormStack actions: wrap-reverse, full width below sm, a lone wrapper's buttons too": /class="flex flex-wrap-reverse items-center justify-end gap-2 max-sm:\*:grow max-sm:\[&>div:only-child\]:flex-wrap-reverse max-sm:\[&>div:only-child>\*\]:grow"><button>Cancel<\/button><button>Review and confirm<\/button><\/div>/.test(raw("FormStackTwo"))
    && raw("FormStackInline").includes("max-sm:[&>div:only-child>*]:grow\"><div class=\"flex flex-wrap gap-2 items-center justify-start\"><button>Cancel</button><button>Save</button></div></div>"),
  "applyInitialTheme: ?theme= wins, else system; no window": theme?.lightOnDark === "light/light" && theme?.darkOnLight === "dark/dark"
    && theme?.systemDark === "dark/dark" && theme?.systemLight === "light/light" && theme?.noMatchMedia === "light/light"
    && theme?.noWindow === "undefined:light" && theme?.noWindowUntouched === true,
  "ThemeToggle starts from applyInitialTheme": theme?.toggleLightOnDark === false && theme?.toggleDarkOnLight === true,
  "DataTable onRowPress: a tab stop, Enter and Space press, a link click does not; no tab stop without it":
    rowPress?.tabIndex === 0 && rowPress?.pressed === "1,1,1" && !html("DataTable").includes("tabindex"),
  // 3.11 review: each check fails on the 3.11 tip (8b5ccb1), before the review's fixes.
  "Spinner keeps its size in a flex row (shrink-0)": html("Spinner").includes("shrink-0"),
  "EmptyState action: a node as given, {text, onPress} as a Button": html("EmptyStateNode").includes('<a id="x" href="#all">Go</a>')
    && /<button[^>]*>.*Reset.*<\/button>/.test(html("EmptyState")),
  "QueryState empty.action: inside EmptyState, under the description; {text, onPress} too":
    /^<div class="[^"]*\bgap-2\b[^"]*">.*Try another court\.<\/p><a id="act" href="#all">View all<\/a><\/div>$/.test(html("QueryStateEmptyNode"))
    && /<button[^>]*>.*Reload.*<\/button>/.test(html("QueryStateEmptyButton")),
  "QueryState errorTitle, else Something went wrong": html("QueryStateErrorTitle").includes("Could not load cases")
    && !html("QueryStateErrorTitle").includes("Something went wrong") && html("QueryStateError").includes("Something went wrong"),
  "InfoCard: an icon and a screen-reader word per variant": /<svg aria-hidden="true"[^>]*class="[^"]*text-klerosUIComponentsWarning/.test(html("InfoCardWarning"))
    && html("InfoCardWarning").includes('<span class="sr-only">Warning: </span>Voting closes in 2 hours.')
    && new Set(["info", "warning", "success", "error"].map((v) => /<path d="([^"]+)"/.exec(renderToString(h(kit.InfoCard, { variant: v }, "x")))?.[1])).size === 4,
  "StatusBadge neutral: PrimaryText on Stroke; accent dot SecondaryPurple": html("StatusBadgeNeutral").includes("text-klerosUIComponentsPrimaryText bg-klerosUIComponentsStroke")
    && html("StatusBadgeNeutral").includes("bg-klerosUIComponentsPrimaryText") && !html("StatusBadgeNeutral").includes("LightGrey")
    && kit.toneClasses("neutral") === "text-klerosUIComponentsPrimaryText bg-klerosUIComponentsStroke"
    && html("StatusBadge").includes("bg-klerosUIComponentsSecondaryPurple") && !html("StatusBadge").includes("PrimaryPurple"),
  "AddressDisplay: the explorer link is named and beside the tooltip's button, with no role warning":
    address?.inButton === false && address?.trigger === true && address?.label?.includes("0x5aAeb605") && address?.roleWarning === false,
  "DataTable pressable row: MediumBlue highlight, same focus ring": raw("DataTablePress").includes("hover:bg-klerosUIComponentsMediumBlue")
    && raw("DataTablePress").includes("focus-visible:bg-klerosUIComponentsMediumBlue")
    && raw("DataTablePress").includes("focus-visible:outline-klerosUIComponentsPrimaryBlue") && !raw("DataTablePress").includes("LightGrey"),
  "DataTable column width on its header cell": html("DataTableWidths").includes('style="width:120px"') && html("DataTableWidths").includes('style="width:20%"')
    && /<th class="[^"]*">X<\/th>/.test(html("DataTableWidths")),
  "TokenAmount: a non-zero amount too small for maxFractionDigits reads <0.0001, not 0": text("TokenDust") === "<0.0001 ETH"
    && text("TokenDustNeg") === "-<0.0001" && text("TokenDust2") === "<0.01" && text("TokenDust0") === "<1" && text("TokenZero") === "0"
    && text("TokenStep") === "0.0001" && kit.formatUnits(50000000000000n) === "0",
  "useDarkMode: every caller follows the html class; the word Dark labels the switch": dark?.afterSwitch === "true"
    && dark?.afterOutside === "false/false" && dark?.labelFor === true && dark?.afterWord === true,
  "Countdown: a later deadline after the end does not fire onEnd again": countdownEnd?.ends === 1 && /^(59m 5\ds|1h 0m 0s)$/.test(countdownEnd?.text),
  "Countdown keeps zero units in a row (1d 0h 3m, 1 day 0 hours, 5m 0s)": html("CountdownZeroUnit").includes(">1d 0h 3m</time>")
    && html("CountdownZeroUnitLong").includes(">1 day 0 hours</time>") && html("CountdownFiveMin").includes(">5m 0s</time>"),
  "HelpTooltip: the ? is inline-flex, named About <label>, the help its description": (() => {
    const trigger = (name) => /<div[^>]*role="button"[^>]*>/.exec(html(name))?.[0] ?? "";
    return trigger("HelpTooltip").includes('class="inline-flex"') && trigger("HelpTooltip").includes('aria-label="About Label"')
      && trigger("HelpTooltip").includes('aria-description="help"') && trigger("HelpTooltipRich").includes('aria-label="More information"');
  })(),
  "ChainGuard isConnecting: a spinner, no prompt, until connected on the chain": /role="status"[^>]*aria-label="Connecting wallet"/.test(html("ChainGuardConnecting"))
    && !html("ChainGuardConnecting").includes("Connect wallet") && !html("ChainGuardConnecting").includes("secret") && html("ChainGuardConnectingOnChain") === "secret",
  "Section: heading and actions on one centred row, the description under it":
    /<div class="flex flex-wrap items-center justify-between gap-2"><h2[^>]*>T<\/h2><div class="flex flex-wrap items-center gap-2">x<\/div><\/div><p[^>]*>d<\/p>/.test(raw("Section"))
    && /<div class="[^"]*\bml-auto\b[^"]*"><button>Go<\/button>/.test(raw("SectionActions")),
  "new's Dark story: dark on <html> while shown, the class put back after (ui, data, form)": ["ui", "data", "form"]
    .every((k) => darkStory?.[k] === "true/scheme-x true/dark scheme-x"),
  "evidence-list recipe: a failed load shows the error with Retry, which loads again; a fluid modal with a FormStack and a full-width text area":
    recipes?.evidenceError === "true/true/0" && recipes?.evidenceRetry === true && recipes?.evidenceModal === "true/true/true" && recipes?.unhandled === 0,
  "case-page recipe: kit Page and Grid, full-width Steps": recipes?.casePage === "true/true/true",
  "vote-form recipe: Cast vote in FormStack's actions row; the tip input is named": recipes?.voteForm === true && recipes?.voteTipName === true,
};
const failed = Object.entries(checks).filter(([, pass]) => !pass).map(([name]) => name);
for (const [name, pass] of Object.entries(checks)) console.log(`${pass ? "ok  " : "FAIL"} ${name}`);
console.log(ok && !failed.length && !bad
  ? "ok   ChainGuard gates on chain; KeyValueList, Sparkline (0, 1, flat points, no NaN) and WizardShell (first and last step buttons) render; d.9: Countdown and useCountdown with now give fixed text and start no interval, FormField labels match core labels, Grid fills its row (a lone item takes half), FormStack actions stack full width on a phone, applyInitialTheme follows ?theme= then the system and ThemeToggle starts from it; d.9 review: Grid keeps a min-width floor, actions in one wrapper fill a phone too, an unparseable deadline reads 0s and starts no interval; a pressable DataTable row takes Enter and Space and leaves a link click to the link; 3.11 review: Spinner, EmptyState and QueryState actions and errorTitle, InfoCard icon and word, StatusBadge neutral and accent, AddressDisplay link, DataTable highlight and widths, TokenAmount dust, useDarkMode and ThemeToggle in sync, Countdown onEnd and zero units, HelpTooltip, ChainGuard isConnecting, Section row, the templates' Dark story and the three recipes"
  : `FAIL ${[!ok && "ChainGuard gate", bad && `${bad} render error(s)`, ...failed].filter(Boolean).join("; ")}`);
process.exit(bad || !ok || failed.length ? 1 : 0);
