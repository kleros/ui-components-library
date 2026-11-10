import React from "react";
import { cn } from "./cn.js";

export interface SparklineProps {
  /** The series, oldest first. Values that are not finite numbers (a missing day) are skipped: the line joins the points on either side, the points are spread evenly, and the summary names `startLabel` or `endLabel` only when the first or last value is there. */
  values: number[];
  /** Text under the first point, e.g. "1 Oct". */
  startLabel?: string;
  /** Text under the last point, e.g. "Today". */
  endLabel?: string;
  /** What the series measures, e.g. "Value in escrow". Not shown: it starts the accessible summary. @default "Trend" */
  label?: string;
  /** Formats values in the accessible summary. @default en-US number format, e.g. "1,250.5"; below 1, three significant digits, e.g. "0.00005" */
  formatValue?: (value: number) => string;
  /** Replaces the generated summary as the chart's accessible name. */
  "aria-label"?: string;
  /** Height of the chart in px, labels excluded. @default 64 */
  height?: number;
  /** true: the scale starts at zero (counts, amounts). false: it spans the series' own range (a price far from zero). @default true */
  zeroBased?: boolean;
  className?: string;
}

// Gap in px above the highest point and below the lowest, so the 8px dot is never clipped.
const PAD = 5;
const WIDTH = 100;
const fixed = (n: number) => n.toFixed(2);
// en-US keeps at most three fraction digits, which reads 0.00005 ETH as "0": below 1, keep three significant digits.
const defaultFormat = (v: number) =>
  v !== 0 && Math.abs(v) < 1
    ? Number(v.toPrecision(3)).toLocaleString("en-US", { maximumFractionDigits: 20 })
    : v.toLocaleString("en-US");

/**
 * Small line chart of one series: a filled area, a line and a dot on the latest value, with optional start and end labels.
 * It fills the width of its container. Colours are theme token classes, so it follows dark mode with no JavaScript.
 * An empty series, one point and a flat series all draw without errors.
 * For axes, tooltips or several series, use a chart library with `readToken()` colours.
 * @intent sparkline, mini chart, trend, chart, graph, line chart, area chart, history, time series, small chart, trend line
 * @example <Sparkline values={escrowByDay} label="Value in escrow" startLabel="30 Sep" endLabel="Today" formatValue={(v) => `$${v.toLocaleString("en-US")}`} />
 */
export function Sparkline({
  values,
  startLabel,
  endLabel,
  label = "Trend",
  formatValue = defaultFormat,
  "aria-label": ariaLabel,
  height = 64,
  zeroBased = true,
  className,
}: Readonly<SparklineProps>) {
  const points = values.filter((v) => Number.isFinite(v));
  const n = points.length;
  const h = Math.max(height, 2 * PAD + 2);
  const min = n ? points.reduce((a, v) => (v < a ? v : a)) : 0;
  const max = n ? points.reduce((a, v) => (v > a ? v : a)) : 0;
  let lo = zeroBased ? Math.min(min, 0) : min;
  let hi = zeroBased ? Math.max(max, 0) : max;
  if (hi === lo) {
    // Flat: all zeros sit on the zero line at the bottom; any other flat series runs through the middle.
    if (zeroBased) hi = lo + 1;
    else {
      lo -= 1;
      hi += 1;
    }
  }
  const x = (i: number) => (n === 1 ? WIDTH : (i / (n - 1)) * WIDTH);
  const y = (v: number) => PAD + ((hi - v) / (hi - lo)) * (h - 2 * PAD);
  const line = points.map((v, i) => `${i === 0 ? "M" : "L"}${fixed(x(i))},${fixed(y(v))}`).join(" ");
  const base = fixed(y(zeroBased ? 0 : lo));
  const area = `${line} L${WIDTH},${base} L0,${base} Z`;
  const first = points[0];
  const last = points[n - 1];

  const at = (v: number, where?: string) => formatValue(v) + (where ? ` (${where})` : "");
  // The labels belong to the first and last entries of `values`; a skipped one has no point to name.
  const startAt = Number.isFinite(values[0]) ? startLabel : undefined;
  const endAt = Number.isFinite(values[values.length - 1]) ? endLabel : undefined;
  const summary =
    n === 0
      ? `${label}: no data`
      : n === 1
        ? `${label}: ${at(last, endAt)}`
        : `${label}: ${at(first, startAt)} to ${at(last, endAt)}, low ${formatValue(min)}, high ${formatValue(max)}`;

  return (
    // pr-1 holds the right half of the dot, which sits on the last point at the right edge of the chart.
    <div className={cn("flex w-full flex-col gap-1 pr-1", className)}>
      <div className="relative w-full" style={{ height: h }}>
        <svg
          viewBox={`0 0 ${WIDTH} ${h}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={ariaLabel ?? summary}
          className="block size-full"
        >
          {n > 1 && <path d={area} className="fill-klerosUIComponentsPrimaryBlue/15" />}
          {n > 1 && (
            <path
              d={line}
              className="stroke-klerosUIComponentsPrimaryBlue fill-none"
              strokeWidth={2}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
        {n > 0 && (
          // An HTML dot, not an svg circle: preserveAspectRatio="none" would stretch a circle into an ellipse.
          <span
            aria-hidden
            className="bg-klerosUIComponentsPrimaryBlue absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ left: "100%", top: `${fixed((y(last) / h) * 100)}%` }}
          />
        )}
      </div>
      {(startLabel !== undefined || endLabel !== undefined) && (
        <div
          aria-hidden={ariaLabel === undefined ? true : undefined}
          className="text-klerosUIComponentsSecondaryText flex justify-between gap-2 text-xs"
        >
          <span>{startLabel}</span>
          <span>{endLabel}</span>
        </div>
      )}
    </div>
  );
}
