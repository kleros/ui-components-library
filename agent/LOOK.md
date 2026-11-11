# The Kleros look

Tailwind only, in every app: classes in `className`, and no CSS of your own besides at most one theme file (AGENTS.md,
"Styling: Tailwind only" and "Themes").

- **Colour:** `klerosUIComponents*` token classes. PrimaryText (body), SecondaryText (labels, meta), Stroke (1px
  borders), WhiteBackground (cards) on LightBackground (page), PrimaryBlue (actions, links), Success, Warning and
  Error with their `*Light` backgrounds. Statuses: `StatusBadge tone=` or `toneClasses(tone)`. The `.dark` class on
  `<html>` flips every token, so there is no second palette.
- **Theme:** an app with colours of its own changes the tokens' values in its theme file (`npx kleros-ui theme`;
  AGENTS.md, "Themes"), never the classes. Its code keeps the same token classes, and its contrast is the app's to
  check in light and dark.
- **Radius:** `rounded-base` (3px) for cards, inputs and buttons, and a plain `Card`; `rounded-full` for dots, avatars
  and pills.
- **Spacing:** steps 0 0.5 1 2 3 4 6 8 12 16 (`gap-4` is 16px; `px` only for a 1px hairline). Inline items 2, form
  fields 4, card padding 4-6, between cards 4-6, between sections 8-12. Keep the gaps of the cards next to yours.
  Space with `Stack`, `Inline` and `Grid` `gap`, not margins on components.
- **Type:** `text-xs` 12, `text-sm` 14 (UI default), `text-base` 16, `text-lg` 18, `text-xl` 20, `text-2xl` 24 (page
  title). `font-normal` or `font-semibold`.

`npm run ui:check` enforces these: its lint and CSS scan flag palette, hex and arbitrary colours (a hex value is fine
in the theme file only), `dark:` colour classes, `--klerosUIComponents*` tokens redefined outside the theme file,
padding, margin and gap off the steps, radius other than `rounded-base`, `rounded-full` or `rounded-none`, font sizes
above `text-2xl` or in brackets, weights other than `font-normal` and `font-semibold`, and `Card round`, and each
message names what to use instead.

If the scale lacks a value, use the nearest step and say so in your summary; never invent a token. Containers, data
states, charts and component traps are in AGENTS.md.
