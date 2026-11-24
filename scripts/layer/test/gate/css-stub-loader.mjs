// Node ESM loader for the smoke test: CSS and SVG imports become empty modules.
export async function load(url, context, next) {
  if (/\.(css|svg)(\?.*)?$/.test(url)) return { format: "module", source: "export default {};", shortCircuit: true };
  return next(url, context);
}
