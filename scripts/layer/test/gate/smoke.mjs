// Renders every kit component to HTML through the packed package (no DOM), to catch runtime errors tsc cannot see.
// d.9 adds a few client checks in happy-dom (no interval with a fixed `now`, applyInitialTheme, ThemeToggle's start).
import { register } from "node:module";
register("./css-stub-loader.mjs", import.meta.url);
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
  SparklineFlat: h(kit.Sparkline, { values: [5, 5, NaN, 5], zeroBased: false }),
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
};
let bad = 0;
for (const [name, el] of Object.entries(cases)) {
  try { const html = renderToString(el); console.log(`ok   ${name.padEnd(15)} ${html.length} chars`); }
  catch (e) { bad++; console.log(`FAIL ${name}: ${e.message.split("\n")[0]}`); }
}
console.log(kit.formatUnits(1234567890000000000000n), kit.parseUnits("1.5").toString(), kit.shortenAddress("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"));
const ok = renderToString(cases.ChainGuard).includes("Switch to Arbitrum One") && !renderToString(cases.ChainGuard).includes("secret");
// d.8 kit additions. build.sh prints only the last line, so every check is folded into it.
const html = (name) => { try { return renderToString(cases[name]); } catch { return ""; } };
// React escapes & and > in attributes; the class checks read the unescaped markup.
const raw = (name) => html(name).replaceAll("&amp;", "&").replaceAll("&gt;", ">");

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
  // ThemeToggle starts from what applyInitialTheme applied (it reads the class at mount).
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
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let fixedRun, liveRun, badRun, theme;
try {
  fixedRun = await intervalsWhileMounted(h(kit.Countdown, { deadline: DEADLINE, now: NOW }));
  liveRun = await intervalsWhileMounted(h(kit.Countdown, { deadline: Date.now() + 3_600_000 }));
  badRun = await intervalsWhileMounted(h(kit.Countdown, { deadline: "2026-31-10" }));
  theme = await themeChecks();
} catch (e) { console.log(`FAIL client checks: ${e.message.split("\n")[0]}`); }
for (const [k, v] of Object.entries({ fixedRun, liveRun, badRun, theme })) console.log(`     ${k} ${JSON.stringify(v)}`);

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
};
const failed = Object.entries(checks).filter(([, pass]) => !pass).map(([name]) => name);
for (const [name, pass] of Object.entries(checks)) console.log(`${pass ? "ok  " : "FAIL"} ${name}`);
console.log(ok && !failed.length && !bad
  ? "ok   ChainGuard gates on chain; KeyValueList, Sparkline (0, 1, flat points, no NaN) and WizardShell (first and last step buttons) render; d.9: Countdown and useCountdown with now give fixed text and start no interval, FormField labels match core labels, Grid fills its row (a lone item takes half), FormStack actions stack full width on a phone, applyInitialTheme follows ?theme= then the system and ThemeToggle starts from it; d.9 review: Grid keeps a min-width floor, actions in one wrapper fill a phone too, an unparseable deadline reads 0s and starts no interval"
  : `FAIL ${[!ok && "ChainGuard gate", bad && `${bad} render error(s)`, ...failed].filter(Boolean).join("; ")}`);
process.exit(bad || !ok || failed.length ? 1 : 0);
