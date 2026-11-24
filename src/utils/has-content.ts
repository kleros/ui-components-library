import { Fragment, isValidElement } from "react";

/**
 * Whether a rich-content prop (`children`, `labelContent`, `description`) has something to show. React renders
 * nothing for undefined, null, "", booleans (`cond && <Icon />` gives false), an array of only those (an empty
 * `hints.map(...)`) and a fragment holding only those (`<>{cond && <Icon />}</>`), so for those the component falls
 * back to its plain prop (`text`, `label`, `message`). A render function counts as content, and so does any other
 * element (a component that returns null cannot be seen without rendering it). 0 is content and renders as 0, as in
 * React; use `cond ? x : undefined`.
 */
export const hasContent = (node: unknown): boolean => {
  if (Array.isArray(node)) return node.some(hasContent);
  if (isValidElement(node) && node.type === Fragment)
    return hasContent((node.props as { children?: unknown }).children);
  return (
    node !== undefined &&
    node !== null &&
    node !== "" &&
    typeof node !== "boolean"
  );
};
