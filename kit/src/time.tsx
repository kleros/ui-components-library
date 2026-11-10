import React, { useEffect, useRef, useState } from "react";
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
// timer (d.9 review: the live interval started, since NaN <= now is false, and was never cleared).
const toMs = (t: Date | number | string) => (typeof t === "number" ? t : typeof t === "string" ? Date.parse(t) : t.getTime());

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
  // Live state only. With a fixed now it is never read, and Date.now() is never called.
  const [parts, setParts] = useState(() => split(deadlineMs, fixed ? fixedMs : Date.now()));
  useEffect(() => {
    if (fixed) return;
    setParts(split(deadlineMs, Date.now()));
    if (!Number.isFinite(deadlineMs) || deadlineMs <= Date.now()) return;
    const id = setInterval(() => {
      const next = split(deadlineMs, Date.now());
      setParts(next);
      if (next.isOver) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [deadlineMs, fixed]);
  return fixed ? split(deadlineMs, fixedMs) : parts;
}

export interface CountdownProps {
  /** A `Date`, milliseconds since the epoch, or an ISO 8601 string. */
  deadline: Date | number | string;
  /** A fixed "now" (a `Date`, milliseconds or an ISO 8601 string) for mocks, stories, tests and screenshots: the text is computed from it, and no interval or timer starts. Leave it out for the live clock. */
  now?: Date | number | string;
  /** "short" is `2d 4h 12m`, "long" is `2 days 4 hours`. @default "short" */
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
  // Show the two most significant non-zero units; under a minute that is just seconds.
  const shown = units.filter(([n]) => n > 0).slice(0, format === "long" ? 2 : 3);
  const first = units.findIndex(([n]) => n > 0);
  const list: Array<[number, string, string]> = first === -1 ? [[0, "s", "second"]] : shown;
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
