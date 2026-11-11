import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "./cn.js";

export interface CountdownParts {
  /** Milliseconds until the deadline, never below 0. */
  msLeft: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once the deadline has passed. */
  isOver: boolean;
}

// A moment as a Date, milliseconds since the epoch, or an ISO 8601 string. An unparseable string gives NaN, as
// Date.parse does, and the countdown then reads "0s", the same as an invalid Date: every part 0, isOver false, and no
// timer (a live interval would start, since NaN <= now is false, and never be cleared).
type Moment = Date | number | string;
function toMs(t: Moment): number {
  if (typeof t === "number") return t;
  if (typeof t === "string") return Date.parse(t);
  return t.getTime();
}

// A layout effect in the browser, so a new deadline gets the current clock before the first paint; a plain effect
// on the server, where layout effects warn and never run.
const useClockEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function split(deadlineMs: number, nowMs: number): CountdownParts {
  if (!Number.isFinite(deadlineMs - nowMs)) return { msLeft: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isOver: false };
  const msLeft = Math.max(0, deadlineMs - nowMs);
  const total = Math.floor(msLeft / 1000);
  return {
    msLeft,
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    isOver: msLeft === 0,
  };
}

/**
 * Time left until a deadline: live (re-rendered every second), or computed from a fixed `now` with no timer, for mocks and stories.
 * Live by default: the interval is cleared on unmount and once the deadline passes.
 * With `now`, the time left is computed from that fixed moment instead of the clock, and no interval or timer starts:
 * use it for mocks, stories, tests and screenshots with a fixed clock, and for a server render that must hydrate to the
 * same values. The result follows `now` when it changes. Leave `now` out (or `undefined`) for the live clock.
 * The hook stores the clock, not the result, so a new `deadline` shows in the same render: a live countdown that has
 * ended and gets a later deadline (a refetch that extends a period) does not read as over for a frame.
 * @param deadline a `Date`, milliseconds since the epoch, or an ISO 8601 string
 * @param now a fixed "now" in the same forms, for a fixed clock; leave it out for the live clock
 * @intent countdown, deadline, time left, timer, remaining time, hook, fixed clock, fixed now, mock time
 * @example const { days, hours, isOver } = useCountdown(periodEnd);
 * @example const left = useCountdown("2026-10-31T16:00:00Z", "2026-10-29T12:00:00Z"); // fixed clock: 2 days 4 hours, no timer
 */
export function useCountdown(deadline: Date | number | string, now?: Date | number | string): CountdownParts {
  const deadlineMs = toMs(deadline);
  // null is treated as "no now" too, so a plain-JS caller passing null gets the live clock rather than a crash.
  const fixedMs = now == null ? undefined : toMs(now);
  const fixed = fixedMs !== undefined;
  // The live clock, not the parts: they are derived below from the current deadline, so they never lag a new one.
  // The stored clock stops when the countdown ends, so it can be far behind when a later deadline arrives; the layout
  // effect below sets it again before that render is painted. It is never ahead of the real one, so it never shows
  // isOver for a deadline still to come. With a fixed now it is never read, and Date.now() is never called (NaN until a
  // live clock starts, which split reads as "0s", not over).
  const [clock, setClock] = useState(() => (fixed ? Number.NaN : Date.now()));
  useClockEffect(() => {
    if (fixed) return;
    const start = Date.now();
    setClock(start);
    if (!Number.isFinite(deadlineMs) || deadlineMs <= start) return;
    const id = setInterval(() => {
      const t = Date.now();
      setClock(t);
      if (t >= deadlineMs) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [deadlineMs, fixed]);
  return split(deadlineMs, fixed ? fixedMs : clock);
}

export interface CountdownProps {
  /** A `Date`, milliseconds since the epoch, or an ISO 8601 string. */
  deadline: Date | number | string;
  /** A fixed "now" (a `Date`, milliseconds or an ISO 8601 string) for mocks, stories, tests and screenshots: the text is computed from it, and no interval or timer starts. Leave it out for the live clock. */
  now?: Date | number | string;
  /**
   * "short" shows three units in a row from the largest non-zero one (`2d 4h 12m`, `1d 0h 3m`, `5m 0s`), "long" shows
   * two (`2 days 4 hours`, `1 day 0 hours`). A zero unit between them is kept, so no unit is skipped; under a minute
   * it is just seconds. @default "short"
   */
  format?: "short" | "long";
  /** Text shown after the deadline. @default "Ended" */
  overText?: string;
  /** Called once when the deadline passes while mounted, and on mount when it has already passed (with a fixed `now` too). */
  onEnd?: () => void;
  className?: string;
}

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;

function formatParts(p: CountdownParts, format: "short" | "long"): string {
  const units: Array<[number, string, string]> = [
    [p.days, "d", "day"],
    [p.hours, "h", "hour"],
    [p.minutes, "m", "minute"],
    [p.seconds, "s", "second"],
  ];
  // From the largest non-zero unit, show the next three units in a row (short) or two (long), zeros included, so
  // 1 d 0 h 3 min reads "1d 0h 3m", not "1d 3m". Under a minute that is just seconds; at 0, "0s".
  const first = units.findIndex(([n]) => n > 0);
  const count = format === "long" ? 2 : 3;
  const list: Array<[number, string, string]> = first === -1 ? [[0, "s", "second"]] : units.slice(first, first + count);
  return list.map(([n, short, long]) => (format === "long" ? plural(n, long) : `${n}${short}`)).join(" ");
}

/**
 * Time left until a deadline, in a `time` element with the UTC time as its tooltip: live, or static text from a fixed `now` (mocks, stories, screenshots).
 * Use instead of hand-written setInterval timers. Live by default. With `now` (a fixed clock for mocks, stories, tests and screenshots), it renders static text computed from that moment and starts no timer.
 * @intent countdown, deadline, time left, timer, remaining time, ends in, clock, fixed clock, fixed now, mock time
 * @example <Countdown deadline={dispute.periodEnd} format="long" onEnd={refetch} />
 * @example <Countdown deadline="2026-10-31T16:12:00Z" now="2026-10-29T12:00:00Z" /> // "2d 4h 12m", no timer
 */
export function Countdown({ deadline, now, format = "short", overText = "Ended", onEnd, className }: Readonly<CountdownProps>) {
  const deadlineMs = toMs(deadline);
  const parts = useCountdown(deadlineMs, now);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;
  useEffect(() => {
    if (parts.isOver) onEndRef.current?.();
  }, [parts.isOver, deadlineMs]);
  const date = new Date(deadlineMs);
  const valid = !Number.isNaN(date.getTime());
  return (
    <time
      dateTime={valid ? date.toISOString() : undefined}
      title={valid ? `${date.toISOString().slice(0, 16).replace("T", " ")} UTC` : undefined}
      className={cn("tabular-nums", className)}
    >
      {parts.isOver ? overText : formatParts(parts, format)}
    </time>
  );
}
