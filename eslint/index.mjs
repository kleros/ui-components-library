// @kleros/ui-components-library/eslint: the Kleros look (agent/LOOK.md) as lint rules.
// Usage (flat config): import klerosUI from "@kleros/ui-components-library/eslint";
//   export default [...yourConfig, ...klerosUI({ cssEntry: "src/index.css" })];
// Needs eslint >= 9. The Tailwind class rules need eslint-plugin-better-tailwindcss (optional peer dependency) and are
// skipped without it.
// Every app styles with Tailwind only (agent/AGENTS.md, "Styling: Tailwind only"), so there is one set of rules for
// all apps. A `styled` option (once for apps on styled-components without Tailwind) is still accepted, so
// an existing config such as `klerosUI({ styled: true })` loads, but it is ignored and changes nothing. Its px radius
// and spacing rules for styled-components CSS are gone: every styled-components use is now reported by itself.
// - kleros-ui/no-styled-components reports each use of a name imported from styled-components (styled.x`...`,
//   styled(X)`...`, styled.x.attrs(...)`...`, css`...`, keyframes`...`, createGlobalStyle`...`) once, so ui:baseline
//   counts uses per file and a new styled component in an old file fails. A use through a re-export from another
//   module is not seen.
// - kleros-ui/no-restricted-imports reports imports of CSS-in-JS libraries (styled-components, @emotion/*, goober,
//   @stitches/*, @vanilla-extract/*, styled-jsx).
// - Inline style={{ ... }} that sets colour, spacing or type is reported; a computed size (width, height, transform)
//   is allowed. A style object passed by name (style={box}) is not seen.
// Also:
// - files defaults to src/**/*.{js,jsx,ts,tsx}: a styled component in a .js or .jsx file was not linted at all. The
//   preset turns on JSX parsing for its .js and .jsx files, so an app whose own config parses only TypeScript still
//   parses them.
// - Spacing and radius are allow-lists, so every off-scale value fails: padding, margin, gap and space take the steps
//   0 0.5 1 2 3 4 6 8 12 16 (plus px, auto and reverse), radius is rounded-base, rounded-full or rounded-none. dark:
//   colour classes are caught after other variants too (md:dark:, dark:hover:).
// - Card round is flagged on the library's Card only (<Card round>, <UI.Card round>), not on an app's own *Card with
//   a round prop (an appeal round). An arbitrary colour class is one whose value is not a number or a length, so
//   stroke-[1.5] and border-[1.5px] pass.
// The preset's restrictions are kleros-ui/no-restricted-syntax and kleros-ui/no-restricted-imports:
// ESLint's own rules, registered again in the preset's plugin from eslint/use-at-your-own-risk. A flat config keeps one
// set of options per rule id and the preset comes last, so under the core ids its options replaced an app's own
// no-restricted-syntax and no-restricted-imports options, and the app's patterns stopped reporting. Now both report.
// use-at-your-own-risk exports builtinRules in ESLint 8 to 10 (read in 9.15.0, 9.39.5 and 10.11.0). Where it does not
// load, as when the app's ESLint is not reachable from this folder, the preset falls back to the core ids and says so.
const betterTailwind = await import("eslint-plugin-better-tailwindcss").then((m) => m.default, () => null);
const RESTRICTED = ["no-restricted-syntax", "no-restricted-imports"];
const builtin = await import("eslint/use-at-your-own-risk").then((m) => m.builtinRules ?? m.default?.builtinRules, (e) => e);
const coreRules = Object.fromEntries(RESTRICTED.map((id) => [id, builtin?.get?.(id)]));
const own = Object.values(coreRules).every((r) => typeof r?.create === "function");
if (!own)
  console.warn(
    `@kleros/ui-components-library/eslint: ESLint's built-in rules did not load from eslint/use-at-your-own-risk (${builtin instanceof Error ? (builtin.code ?? builtin.message.split("\n")[0]) : "it has no builtinRules with no-restricted-syntax and no-restricted-imports"}). The preset falls back to the core ids no-restricted-syntax and no-restricted-imports, and its options for them replace your config's own. Install ESLint 9 in the app (npm install -D eslint@^9) to get kleros-ui/no-restricted-syntax and kleros-ui/no-restricted-imports.`,
  );
// The rule id the preset sets: its own plugin's when ESLint's rules loaded, the core one otherwise.
const restricted = (id) => (own ? `kleros-ui/${id}` : id);

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white";
const COLOR_UTILS = "bg|text|border|border-[trblxy]|ring|fill|stroke|from|via|to|divide|outline|decoration|accent|caret|placeholder|shadow";
const SPACE_UTILS = "p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y";
const V = "(?:[a-z0-9-]+:)*"; // variants such as hover: md: dark:
const STEPS = "0|0\\.5|1|2|3|4|6|8|12|16|px|auto|reverse"; // spacing values allowed (LOOK.md); px is a 1px hairline
const LENGTH = "(?:[\\d.]+(?:px|rem|em|%)?|(?:length|number|percentage):.+)"; // an arbitrary value that is not a colour

// Library exports an app should import instead of re-declaring (core + kit).
const LIB_NAMES = [
  "Button", "Card", "Box", "Modal", "Tag", "Tabs", "Tooltip", "Switch", "Checkbox", "Radio", "Steps", "Timeline", "Accordion",
  "Breadcrumb", "Copiable", "Searchbar", "TextField", "TextArea", "NumberField", "Datepicker", "DropdownSelect", "FileUploader",
  "AlertMessage", "LinearProgress", "CircularProgress", "StandardPagination", "CompactPagination",
];
// Every kit component in the catalogue must be listed here (the repo's yarn test:layer checks it).
const KIT_NAMES = [
  "Skeleton", "Spinner", "EmptyState", "ErrorState", "QueryState", "StatusBadge", "StatCard", "TokenAmount", "AddressDisplay",
  "DataTable", "HelpTooltip", "ThemeToggle", "Countdown", "Stack", "Inline", "Grid", "Section", "Page", "FormStack", "FormField",
  "InfoCard", "ExternalLink", "ChainGuard", "KeyValueList", "Sparkline", "WizardShell",
];
// Names agents guess for parts the library has under another name.
const GUESSED = {
  Pagination: "StandardPagination", Alert: "AlertMessage", Badge: "StatusBadge (kit)", Loader: "Spinner (kit)",
  LoadingSkeleton: "Skeleton (kit)", ProgressBar: "LinearProgress", Timer: "Countdown (kit)", Container: "Stack / Page (kit)",
  Wizard: "WizardShell (kit)", Stepper: "WizardShell (kit)", MiniChart: "Sparkline (kit)", TrendChart: "Sparkline (kit)",
  DetailsList: "KeyValueList (kit)", FactsList: "KeyValueList (kit)", DefinitionList: "KeyValueList (kit)",
};
const RAW = {
  button: "Button", select: "DropdownSelect", dialog: "Modal", progress: "LinearProgress", table: "DataTable (kit)",
  textarea: "TextArea", input: "TextField / Searchbar / Checkbox / Radio",
};

const TAILWIND_WAY = "style with Tailwind classes in className (klerosUIComponents* tokens, the spacing steps, kit Stack/Inline/Grid for layout); see agent/AGENTS.md, \"Styling: Tailwind only\"";
const CSS_IN_JS = "CSS-in-JS: " + TAILWIND_WAY + ".";
// Inline style keys that set colour, spacing or type. Sizes (width, height, min-/max-, inset, transform) stay allowed.
const INLINE_VISUAL = "^(color|background.*|border.*|margin.*|padding.*|gap|rowGap|columnGap|font.*|lineHeight|letterSpacing|boxShadow|fill|stroke)$";

// One report per styled-components use, by import binding, so the per-file baseline counts uses.
const STYLED_HELPERS = new Set(["css", "keyframes", "createGlobalStyle", "injectGlobal"]);
const noStyledComponents = {
  meta: {
    type: "problem",
    docs: { description: "Report each styled-components use: Kleros apps style new UI with Tailwind only." },
    schema: [],
    messages: {
      styled: "styled-components component: " + TAILWIND_WAY + ". Existing uses stay in ui:baseline; a new one fails.",
      helper: "styled-components {{name}}`...`: " + TAILWIND_WAY + ". Existing uses stay in ui:baseline; a new one fails.",
    },
  },
  create(context) {
    const styled = new Set(); // local names of styled (default or named import)
    const helpers = new Map(); // local name -> css | keyframes | createGlobalStyle | injectGlobal
    const spaces = new Set(); // import * as sc from "styled-components"
    const fromStyled = (s) => s === "styled-components" || s.startsWith("styled-components/");
    return {
      Program(program) {
        for (const node of program.body) {
          if (node.type !== "ImportDeclaration" || node.importKind === "type" || !fromStyled(node.source.value)) continue;
          for (const s of node.specifiers) {
            if (s.type === "ImportDefaultSpecifier") styled.add(s.local.name);
            else if (s.type === "ImportNamespaceSpecifier") spaces.add(s.local.name);
            else if (s.importKind !== "type") {
              const imported = s.imported.name ?? s.imported.value;
              if (imported === "default" || imported === "styled") styled.add(s.local.name);
              else if (STYLED_HELPERS.has(imported)) helpers.set(s.local.name, imported);
            }
          }
        }
      },
      TaggedTemplateExpression(node) {
        if (!styled.size && !helpers.size && !spaces.size) return;
        // Walk styled.div / styled(X) / styled.div.attrs(...) / sc.default.div down to the name it starts from.
        let n = node.tag;
        let first = null; // the property right after the root name (sc.css, sc.default)
        while (n.type === "MemberExpression" || n.type === "CallExpression" || n.type === "TSNonNullExpression") {
          if (n.type === "MemberExpression") {
            if (n.object.type === "Identifier") first = n.property.name ?? n.property.value;
            n = n.object;
          } else n = n.type === "CallExpression" ? n.callee : n.expression;
        }
        if (n.type !== "Identifier") return;
        if (styled.has(n.name)) return context.report({ node, messageId: "styled" });
        if (n === node.tag && helpers.has(n.name)) return context.report({ node, messageId: "helper", data: { name: helpers.get(n.name) } });
        if (spaces.has(n.name)) {
          if (first === "default" || first === "styled") return context.report({ node, messageId: "styled" });
          if (STYLED_HELPERS.has(first) && node.tag.type === "MemberExpression" && node.tag.object === n)
            return context.report({ node, messageId: "helper", data: { name: first } });
        }
      },
    };
  },
};

// One plugin object for every call, so a config that calls klerosUI() twice does not redefine the plugin.
// It also carries ESLint's no-restricted-syntax and no-restricted-imports when they loaded (see the top).
const plugin = {
  meta: { name: "@kleros/ui-components-library/eslint" },
  rules: { "no-styled-components": noStyledComponents, ...(own ? coreRules : {}) },
};

// Options: cssEntry (the app's Tailwind entry) and files. An old `styled` option is ignored (see the header).
export default function klerosUI({ cssEntry = "src/index.css", files = ["src/**/*.{js,jsx,ts,tsx}"] } = {}) {
  const colour = "Colour literal: use a klerosUIComponents* token (stroke-/fill- classes on an SVG chart, or the kit's Sparkline), a StatusBadge tone, or readToken() for canvas and chart libraries.";
  const tailwind = betterTailwind
    ? [{
      files,
      plugins: { "better-tailwindcss": betterTailwind },
      settings: { "better-tailwindcss": { entryPoint: cssEntry } },
      rules: {
        "better-tailwindcss/no-unknown-classes": ["error", { ignore: ["^group$", "^peer$", "^dark$"] }],
        "better-tailwindcss/no-restricted-classes": [
          "error",
          {
            restrict: [
              { pattern: `^${V}(?:${COLOR_UTILS})-(?:${PALETTE})(?:-\\d+)?(?:/\\d+)?$`, message: "Palette colour: use a klerosUIComponents* token (e.g. text-klerosUIComponentsSecondaryText) or a StatusBadge tone." },
              { pattern: `^${V}dark:${V}(?:${COLOR_UTILS})-`, message: "dark: colour override: the .dark class already flips the klerosUIComponents* tokens; remove it." },
              { pattern: `^${V}-?(?:${SPACE_UTILS})-(?!(?:${STEPS})$)[^\\s\\[\\]()-]+$`, message: "Off-scale spacing: use one of the steps 0.5 1 2 3 4 6 8 12 16 (or a Stack/Inline gap)." },
              { pattern: `^${V}-?(?:${SPACE_UTILS})-(?:\\[.+\\]|\\(.+\\))$`, message: "Arbitrary spacing: use one of the steps 0.5 1 2 3 4 6 8 12 16. If none fits, say so in your summary." },
              { pattern: `^${V}text-\\[[\\d.]+(?:px|rem|em)\\]$`, message: "Arbitrary font size: use text-xs, text-sm, text-base, text-lg, text-xl or text-2xl." },
              { pattern: `^${V}(?:${COLOR_UTILS})-\\[(?!${LENGTH}\\]$).+\\]$`, message: "Arbitrary colour: use a klerosUIComponents* token or a StatusBadge tone." },
              { pattern: `^${V}text-(?:3xl|4xl|5xl|6xl|7xl|8xl|9xl)$`, message: "Off-scale font size: the largest is text-2xl (page title)." },
              { pattern: `^${V}font-(?:thin|extralight|light|medium|bold|extrabold|black)$`, message: "Off-scale weight: use font-normal or font-semibold." },
              { pattern: `^${V}rounded(?:-[trblse]{1,2})?(?:-(?!(?:base|full|none)$)(?:\\[.+\\]|\\(.+\\)|[^\\s\\[\\]()-]+))?$`, message: "Off-scale radius: use rounded-base (3px), or rounded-full for pills and dots." },
              { pattern: `^${V}animate-pulse$`, message: "Hand-rolled skeleton: use Skeleton or QueryState from @kleros/ui-components-library/kit." },
            ],
          },
        ],
      },
    }]
    : [];
  // The preset's .js and .jsx files parse JSX (with espree, or the app's own parser), so they are linted, not parse
  // errors. typescript-eslint ignores the flag for .ts and .tsx, which it parses by their extension.
  const jsx = { files, languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } };
  return [
    jsx,
    ...tailwind,
    {
      files,
      plugins: { "kleros-ui": plugin },
      rules: {
        "kleros-ui/no-styled-components": "error",
        [restricted("no-restricted-syntax")]: [
          "error",
          { selector: "Literal[value=/(^|[\\s:,(\\[])#(?=[0-9]*[a-fA-F])[0-9a-fA-F]{3,8}\\b|(^|[:,(\\[])#[0-9]{6}([0-9]{2})?\\b|[:,(\\[]\\s*#[0-9]{3,4}\\b|\\b(rgba?|hsla?)\\(/]", message: colour },
          { selector: "TemplateElement[value.raw=/(^|[\\s:,(\\[])#(?=[0-9]*[a-fA-F])[0-9a-fA-F]{3,8}\\b|(^|[:,(\\[])#[0-9]{6}([0-9]{2})?\\b|[:,(\\[]\\s*#[0-9]{3,4}\\b|\\b(rgba?|hsla?)\\(/]", message: colour },
          ...Object.entries(RAW).map(([el, lib]) => ({
            selector: `JSXOpeningElement[name.name="${el}"]`,
            message: `Raw <${el}>: use ${lib} from @kleros/ui-components-library (see agent/CATALOG.md).`,
          })),
          // The theme file is the one stylesheet besides the entry.
          { selector: "JSXOpeningElement[name.name=\"style\"]", message: "A <style> block: " + TAILWIND_WAY + ". The app's CSS is src/index.css as create writes it, plus the theme file npx kleros-ui theme sets up for new token values." },
          // A `Card round` at 18px drifts from the 3px cards around it. The library's Card only: an app's
          // RoundCard round={2} is an appeal round, not a radius.
          { selector: "JSXOpeningElement:matches([name.name='Card'], [name.property.name='Card']) > JSXAttribute[name.name='round']:not([value.expression.raw='false'])", message: "Card round draws an 18px radius; Kleros cards are a plain Card (3px, rounded-base). Remove round." },
          {
            selector: `JSXAttribute[name.name='style'] > JSXExpressionContainer > ObjectExpression > Property:matches([key.name=/${INLINE_VISUAL}/], [key.value=/${INLINE_VISUAL}/])`,
            message: "Inline style sets colour, spacing or type: use Tailwind classes (klerosUIComponents* tokens, the spacing steps, text-sm …). Inline style is only for a size computed at runtime (width, height).",
          },
          { selector: "CallExpression[callee.name='setInterval']", message: "Hand-rolled timer: use Countdown or useCountdown from @kleros/ui-components-library/kit." },
          { selector: "BinaryExpression[operator='/'][right.raw=/^(1e18|10 \\*\\* 18|10n \\*\\* 18n)$/]", message: "Hand-rolled wei conversion: use TokenAmount or formatUnits from @kleros/ui-components-library/kit." },
          { selector: "CallExpression[callee.property.name='slice'][arguments.0.value=0][arguments.1.value=/^(4|6|8|10)$/]", message: "Hand-rolled address shortening? Use AddressDisplay or shortenAddress from @kleros/ui-components-library/kit." },
          { selector: `:matches(FunctionDeclaration, VariableDeclarator)[id.name=/^(${[...new Set([...LIB_NAMES, ...KIT_NAMES])].join("|")})$/]`, message: "Local component with a library name: import it from @kleros/ui-components-library (or /kit) instead of re-declaring it." },
          ...Object.entries(GUESSED).map(([name, lib]) => ({
            selector: `:matches(FunctionDeclaration, VariableDeclarator)[id.name="${name}"]`,
            message: `Local ${name}: the library has ${lib}; import that instead of writing a near-copy.`,
          })),
        ],
        [restricted("no-restricted-imports")]: [
          "error",
          {
            paths: ["styled-components", "goober", "styled-jsx"].map((name) => ({ name, message: CSS_IN_JS })),
            patterns: [
              { group: ["@kleros/ui-components-library/dist/*"], message: "Import from the package root or /kit, not dist/ internals." },
              { group: ["styled-components/*", "@emotion/*", "@stitches/*", "@vanilla-extract/*", "goober/*", "styled-jsx/*"], message: CSS_IN_JS },
            ],
          },
        ],
      },
    },
  ];
}
