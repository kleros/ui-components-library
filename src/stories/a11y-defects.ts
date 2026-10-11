import type { A11yException } from "./a11y";

/** Accessibility exceptions shared by several story files. */

const contrastInLight = (
  selector: string,
  reason: string,
  source: string,
): A11yException => ({
  rule: "color-contrast",
  selector,
  reason,
  source,
  themes: ["light"],
});

export const SECONDARY_TEXT_LIGHT = contrastInLight(
  ".text-klerosUIComponentsSecondaryText",
  "Library defect: SecondaryText #999999 is 2.7-2.8:1 on the light backgrounds.",
  "src/styles/theme.css:12",
);

export const PRIMARY_BLUE_TEXT_LIGHT = contrastInLight(
  ".text-klerosUIComponentsPrimaryBlue",
  "Library defect: PrimaryBlue #009aff text is 2.8-3.0:1 on the light backgrounds.",
  "src/styles/theme.css:7",
);

export const WHITE_ON_BLUE_LIGHT = contrastInLight(
  ".text-klerosUIComponentsWhiteBackground",
  "Library defect: white text on the PrimaryBlue/SecondaryBlue fills is 1.8-3.0:1.",
  "src/styles/theme.css:7",
);

export const SUCCESS_TEXT_LIGHT = contrastInLight(
  ".text-klerosUIComponentsSuccess",
  "Library defect: Success #00c42b text is 2.3:1 on the light backgrounds.",
  "src/styles/theme.css:23",
);

export const WARNING_TEXT_LIGHT = contrastInLight(
  ".text-klerosUIComponentsWarning",
  "Library defect: Warning #ff9900 text is 2.1:1 on the light backgrounds.",
  "src/styles/theme.css:25",
);

export const ERROR_TEXT_LIGHT = contrastInLight(
  ".text-klerosUIComponentsError",
  "Library defect: Error #f60c36 text is 4.0-4.2:1 on the light backgrounds.",
  "src/styles/theme.css:27",
);

export const SELECT_VALUE_LIGHT = contrastInLight(
  ".react-aria-SelectValue",
  "Library defect: the simple select's value inherits PrimaryBlue text, 2.9:1.",
  "src/lib/dropdown/select/simple-button.tsx:34",
);

export const SLIDER_LABEL_LIGHT = contrastInLight(
  "#slider-label",
  "Library defect: the slider label defaults to PrimaryBlue text, 2.9:1.",
  "src/lib/form/slider.tsx:100",
);

export const FOCUSED_DATE_SEGMENT_LIGHT = contrastInLight(
  '[role="spinbutton"][data-focused]',
  "Library defect: a focused date segment turns SecondaryBlue #7bcbff, 1.8:1.",
  "src/lib/form/datepicker/display-button.tsx:35",
);

export const DISABLED_TIMELINE_ITEM = {
  rule: "color-contrast",
  selector: "li.opacity-50 *",
  reason:
    "Library defect: disabled timeline items at 50% opacity are below 4.5:1.",
  source: "src/lib/progress/timeline/bullet.tsx:36",
} satisfies A11yException;

export const ICON_ONLY_PAGE_ARROWS = {
  rule: "button-name",
  selector: 'button[class*="svg"]',
  reason: "Library defect: the previous/next arrow buttons are icon-only.",
  source:
    "src/lib/pagination/standard.tsx:71, src/lib/pagination/compact.tsx:61",
} satisfies A11yException;

export const TOOLTIP_TRIGGER_NESTED = {
  rule: "nested-interactive",
  selector: 'div[role="button"]',
  reason:
    "Library defect: the Tooltip trigger is a role=button div around controls.",
  source: "src/lib/tooltip/index.tsx:47",
} satisfies A11yException;

export const TOOLTIP_TRIGGER_UNNAMED = {
  rule: "aria-command-name",
  selector: 'div[role="button"]',
  reason: "Library defect: the Tooltip trigger's role=button div has no name.",
  source: "src/lib/tooltip/index.tsx:47",
} satisfies A11yException;

export const PARTY_VARIANT_COLOUR_DARK = {
  rule: "color-contrast",
  selector: 'p[aria-label^="Timeline item party"]',
  reason:
    "Story data: the args' #4D00B4 and #ca2314 party colours are below 4.5:1.",
  themes: ["dark"],
} satisfies A11yException;
