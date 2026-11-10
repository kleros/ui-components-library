/** Every colour token in the theme, without the `klerosUIComponents` prefix. Matches `--klerosUIComponents<Name>` in theme.css. */
export type KlerosToken =
  | "BlackLowOpacity"
  | "DarkPurple"
  | "DefaultShadow"
  | "Error"
  | "ErrorLight"
  | "HoveredShadow"
  | "LavenderPurple"
  | "LightBackground"
  | "LightBlue"
  | "LightGrey"
  | "LightPurple"
  | "LimeGreen"
  | "MediumBlue"
  | "MediumPurple"
  | "PaleCyan"
  | "PrimaryBlue"
  | "PrimaryPurple"
  | "PrimaryText"
  | "SecondaryBlue"
  | "SecondaryPurple"
  | "SecondaryText"
  | "SkeletonBackground"
  | "SkeletonHighlight"
  | "Stroke"
  | "Success"
  | "SuccessLight"
  | "Tint"
  | "TintMedium"
  | "TintPurple"
  | "VioletPurple"
  | "Warning"
  | "WarningLight"
  | "WhiteBackground"
  | "WhiteLowOpacityStrong"
  | "WhiteLowOpacitySubtle"
  ;

/**
 * Current value of a colour token as a CSS colour string, for charts and canvas that cannot use Tailwind classes.
 * The value follows the `.dark` class, so re-read it when the theme changes (e.g. depend on `useDarkMode()`).
 * Returns an empty string when there is no `document` (server render).
 * @intent token, color, colour, theme value, chart color, canvas, css variable, getComputedStyle
 * @example const stroke = readToken("PrimaryBlue");
 */
export function readToken(name: KlerosToken): string {
  if (typeof document === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue("--klerosUIComponents" + name).trim();
}
