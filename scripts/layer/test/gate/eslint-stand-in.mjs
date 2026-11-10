// Gate helper (d.11, B1): the lint preset takes no-restricted-syntax and no-restricted-imports from ESLint's
// eslint/use-at-your-own-risk and sets them as kleros-ui/ rules; without it, it falls back to the
// core ids. run.sh has no ESLint, so a gate that reads the config the preset builds imports this file first: when
// eslint/use-at-your-own-risk does not resolve, it resolves to a stand-in whose builtinRules holds those two rules as
// stubs that report nothing, and the preset builds the config it builds under ESLint. Where ESLint does resolve, the
// real module is used. The real rules were run with ESLint 9.39.5 when the preset was written. Needs Node 22.15 or later.
import { registerHooks } from "node:module";

const STAND_IN =
  "data:text/javascript," +
  encodeURIComponent(
    'const stub = { meta: { docs: { description: "gate stand-in: reports nothing" } }, create: () => ({}) };\n' +
      'export const builtinRules = new Map([["no-restricted-syntax", stub], ["no-restricted-imports", stub]]);\n',
  );
registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context);
    } catch (e) {
      if (specifier === "eslint/use-at-your-own-risk") return { url: STAND_IN, shortCircuit: true };
      throw e;
    }
  },
});
