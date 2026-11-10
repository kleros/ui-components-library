import React from "react";
import { cn } from "./cn.js";

/** Spacing steps the kit allows (Tailwind scale). Anything else is a design smell. */
export type Space = 0 | 0.5 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16;

// Full static class strings so Tailwind can detect them.
const GAP: Record<Space, string> = {
  0: "gap-0",
  0.5: "gap-0.5",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
  12: "gap-12",
  16: "gap-16",
};

const ALIGN = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
} as const;

const JUSTIFY = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
} as const;

type Align = keyof typeof ALIGN;
type Justify = keyof typeof JUSTIFY;

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Space between children, in Tailwind steps. @default 4 */
  gap?: Space;
  /** Cross-axis (horizontal) alignment. @default "stretch" */
  align?: Align;
}

/**
 * Vertical flex column with a fixed gap. Use it instead of hand-written `flex flex-col gap-*` or margins on children.
 * @intent stack, vertical, column, spacing, gap, layout, list of blocks
 * @example <Stack gap={6}><Header /><Body /></Stack>
 */
export function Stack({ gap = 4, align = "stretch", className, ...props }: Readonly<StackProps>) {
  return <div className={cn("flex flex-col", GAP[gap], ALIGN[align], className)} {...props} />;
}

export interface InlineProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Space between children, in Tailwind steps. @default 2 */
  gap?: Space;
  /** Cross-axis (vertical) alignment. @default "center" */
  align?: Align;
  /** Main-axis (horizontal) distribution. @default "start" */
  justify?: Justify;
}

/**
 * Horizontal row that wraps, with a fixed gap. For button rows, tag lists and label + value pairs.
 * @intent inline, row, horizontal, buttons row, toolbar, tags, wrap, spacing, gap
 * @example <Inline justify="between"><h2>Title</h2><Button text="Add" /></Inline>
 */
export function Inline({ gap = 2, align = "center", justify = "start", className, ...props }: Readonly<InlineProps>) {
  return <div className={cn("flex flex-wrap", GAP[gap], ALIGN[align], JUSTIFY[justify], className)} {...props} />;
}

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Minimum column width in px: as many columns of at least this width as the row holds, and the items fill the row. @default 240 */
  minItemWidth?: number;
  /** Space between cells, in Tailwind steps. @default 4 */
  gap?: Space;
}

/**
 * Responsive grid: as many columns of at least `minItemWidth` as the row holds, with the items filling the row, so no empty column is left at its end. No breakpoints needed.
 * - Fewer items than fit share the row: 4 items of `minItemWidth={200}` in a 1120 px row are 268 px each.
 * - More items wrap at the same column width; the last row can be part full.
 * - One item alone takes half the row (the width it has beside a second item), or the whole row when two do not fit (a phone), so a lone card is never stretched across a desktop page.
 * - A column is never wider than the grid, so a `minItemWidth` larger than a narrow card does not push the page sideways.
 * - In a parent that sizes it to its content (a `Stack align="start"`), the grid is still at least `minItemWidth` wide (or its parent's width, when that is narrower), so a column never shrinks to its text.
 * @intent grid, cards grid, columns, responsive, auto-fit, auto-fill, dashboard layout, stat row, two-up, side by side
 * @example <Grid minItemWidth={200}>{stats.map((s) => <StatCard key={s.label} {...s} />)}</Grid>
 */
export function Grid({ minItemWidth = 240, gap = 4, className, style, ...props }: Readonly<GridProps>) {
  // auto-fit: tracks with no item collapse, so the items share the whole row (auto-fill kept them as empty columns).
  // A lone item would then span the row, so a grid whose only element child is one item switches, through the two
  // custom properties below, to auto-fill with tracks of at least 40% of the row: two tracks fit, the item takes one.
  // `:has()` counts rendered elements, so a fragment or a component that renders several items is not taken for one.
  // The defaults are set on every Grid, so a nested grid never inherits a lone outer grid's values. Without the
  // classes (an app whose Tailwind does not scan the kit), the fallbacks give plain auto-fit.
  // While a parent sizes the grid to its content, min(100%, ...) has no width to resolve against, so the column
  // would take its text's width (78 px for minItemWidth 200). The grid's own min-width, against its parent's width,
  // keeps minItemWidth as a floor there; in a parent of definite width the grid is wider than that and it does nothing.
  return (
    <div
      className={cn(
        "grid [--kit-grid-lone:0px] [--kit-grid-repeat:auto-fit]",
        "[&:has(>:only-child)]:[--kit-grid-lone:40%] [&:has(>:only-child)]:[--kit-grid-repeat:auto-fill]",
        GAP[gap],
        className,
      )}
      style={{
        minWidth: `min(100%, ${minItemWidth}px)`,
        ...style,
        gridTemplateColumns: `repeat(var(--kit-grid-repeat, auto-fit), minmax(min(100%, max(${minItemWidth}px, var(--kit-grid-lone, 0px))), 1fr))`,
      }}
      {...props}
    />
  );
}

export interface SectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Heading text. */
  title?: React.ReactNode;
  /** Muted line under the heading. */
  description?: React.ReactNode;
  /** Buttons or links shown top-right, level with the heading. */
  actions?: React.ReactNode;
}

/**
 * Titled block of a page: heading, optional description and actions, then content.
 * @intent section, heading, block, panel header, title with actions, group of content
 * @example <Section title="Active cases" actions={<Button text="New" />}><DataTable ... /></Section>
 */
export function Section({ title, description, actions, children, className, ...props }: Readonly<SectionProps>) {
  const hasHeader = title !== undefined || description !== undefined || actions !== undefined;
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      {hasHeader && (
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-1">
            {title !== undefined && <h2 className="text-klerosUIComponentsPrimaryText text-lg font-semibold">{title}</h2>}
            {description !== undefined && <p className="text-klerosUIComponentsSecondaryText text-sm">{description}</p>}
          </div>
          {actions !== undefined && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export interface PageProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Page heading. */
  title?: React.ReactNode;
  /** Buttons shown top-right of the header. */
  actions?: React.ReactNode;
  /** Space between the header and the children. @default 8 */
  gap?: Space;
}

/**
 * Page container: centred, max width, responsive gutters, vertical padding. Renders a `main` element.
 * @intent page, container, wrapper, max width, centred layout, gutters, page title, screen
 * @example <Page title="Dashboard" actions={<Button text="Stake" />}><Section title="Overview">...</Section></Page>
 */
export function Page({ title, actions, gap = 8, children, className, ...props }: Readonly<PageProps>) {
  return (
    <main className={cn("mx-auto flex w-full max-w-6xl flex-col px-4 py-8 lg:px-8", GAP[gap], className)} {...props}>
      {(title !== undefined || actions !== undefined) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {title !== undefined && <h1 className="text-klerosUIComponentsPrimaryText text-2xl font-semibold">{title}</h1>}
          {actions !== undefined && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </main>
  );
}

export interface FormStackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Buttons for the end of the form, secondary first and primary last (e.g. Cancel, Save), as a fragment or in one wrapper such as kit `Inline`: right-aligned in one row; full width on a phone. */
  actions?: React.ReactNode;
}

/**
 * Vertical stack of form fields with an optional actions row. Use inside the core `Form` or a plain `form`; in a `WizardShell` step, pass the fields alone (the shell is the form and its FormStack).
 * Actions: pass them secondary first, primary last, as a fragment or in one wrapper (`<Inline gap={2}>`). They sit right-aligned in one row. On a phone (below Tailwind's `sm`, 640 px) they are full width: one row when they fit, otherwise one per line with the primary on top, never two rows of different widths.
 * @intent form layout, fields, form actions, submit row, vertical form, field spacing, form buttons, cancel submit
 * @example <FormStack actions={<><Button variant="secondary" text="Cancel" /><Button text="Save" type="submit" /></>}><TextField label="Name" /></FormStack>
 */
export function FormStack({ actions, children, className, ...props }: Readonly<FormStackProps>) {
  // flex-wrap-reverse: a line that wraps goes above the first, so the primary (last) is on top. max-sm:*:grow makes
  // each action fill its line on a phone. Neither fights a class the library emits (a core Button is size-fit), so the
  // layout holds whatever order the app loads the library's CSS in. Actions in one wrapper element (kit Inline, a
  // div) would grow as one block while their buttons stayed at its start, left-aligned on a phone, so the wrapper's
  // own children grow and wrap the same way. A lone Button renders a <button>, not a div, so it is not touched.
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      {children}
      {actions !== undefined && (
        <div className="flex flex-wrap-reverse items-center justify-end gap-2 max-sm:*:grow max-sm:[&>div:only-child]:flex-wrap-reverse max-sm:[&>div:only-child>*]:grow">
          {actions}
        </div>
      )}
    </div>
  );
}
