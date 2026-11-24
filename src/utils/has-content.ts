/**
 * Whether a rich-content prop (`children`, `labelContent`, `description`) has something to show. React renders
 * nothing for undefined, null, "", booleans (`cond && <Icon />` gives false) and an array of only those (an empty
 * `hints.map(...)`), so for those the component falls back to its plain prop (`text`, `label`, `message`). A render
 * function counts as content. 0 is content and renders as 0, as in React; use `cond ? x : undefined`.
 */
export const hasContent = (node: unknown): boolean =>
  Array.isArray(node)
    ? node.some(hasContent)
    : node !== undefined &&
      node !== null &&
      node !== "" &&
      typeof node !== "boolean";
