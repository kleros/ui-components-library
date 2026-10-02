export type IPreviewArgs = {
  args: {
    themeUI: "light" | "dark";
    backgroundUI: "white" | "light";
  };
};

/**
 * Story `parameters` that disable specific axe rules for a story (or a whole
 * file when used in `meta`). Only use this for genuine, pre-existing component
 * a11y issues that cannot be fixed from the story itself, and always leave a
 * comment explaining why.
 */
export const disableA11yRules = (...ids: string[]) => ({
  a11y: {
    config: {
      rules: ids.map((id) => ({ id, enabled: false })),
    },
  },
});

/**
 * Hovers `element` as a mouse user would. react-aria only opens hover
 * tooltips when the current interaction modality is "pointer", so a neutral
 * pointer press on the document body is made first.
 */
export const mouseHover = async (
  user: {
    click: (el: Element) => Promise<void>;
    hover: (el: Element) => Promise<void>;
  },
  element: Element,
) => {
  await user.click(document.body);
  await user.hover(element);
};
