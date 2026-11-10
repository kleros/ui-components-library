import React from "react";
import { Card, Copiable, Tooltip } from "@kleros/ui-components-library";
import { Skeleton } from "./feedback.js";
import { cn } from "./cn.js";

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  /** Small line under the value, e.g. "+12 this week". */
  hint?: string;
  icon?: React.ReactNode;
  /** Shows a skeleton instead of the value. */
  isLoading?: boolean;
  className?: string;
}

/**
 * One figure with a label, for dashboard stat rows. Wraps the core `Card` and resets its fixed 328x200 size.
 * @example
 * <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
 *   <StatCard label="Active cases" value={42} isLoading={isLoading} />
 * </div>
 */
export function StatCard({ label, value, hint, icon, isLoading, className }: Readonly<StatCardProps>) {
  return (
    <Card className={cn("flex h-auto w-full items-center gap-4 p-4", className)}>
      {icon}
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-klerosUIComponentsSecondaryText text-sm">{label}</span>
        {isLoading ? (
          <Skeleton className="h-6 w-20" />
        ) : (
          <span className="text-klerosUIComponentsPrimaryText text-xl font-semibold">{value}</span>
        )}
        {hint && <span className="text-klerosUIComponentsSecondaryText text-xs">{hint}</span>}
      </div>
    </Card>
  );
}

/** Shortens `0x1234567890abcdef…` to `0x1234…cdef`. */
export function shortenAddress(address: string, chars = 4): string {
  return address.length <= 2 + chars * 2 ? address : `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`;
}

export interface AddressDisplayProps {
  address: string;
  /** Characters kept on each side. @default 4 */
  chars?: number;
  /** When set, the address links to `${explorerUrl}/address/${address}`. */
  explorerUrl?: string;
  /** Tooltip on the copy icon. @default "Copy address" */
  copyInfo?: string;
  className?: string;
}

/**
 * Shortened address with a copy button (core `Copiable`), a tooltip with the full address and an optional explorer link.
 * @example <AddressDisplay address={juror} explorerUrl="https://etherscan.io" />
 */
export function AddressDisplay({ address, chars = 4, explorerUrl, copyInfo = "Copy address", className }: Readonly<AddressDisplayProps>) {
  const short = shortenAddress(address, chars);
  return (
    <Copiable copiableContent={address} info={copyInfo} className={cn("font-mono text-sm", className)}>
      <Tooltip text={address}>
        {explorerUrl ? (
          <a href={`${explorerUrl}/address/${address}`} target="_blank" rel="noopener noreferrer" className="text-klerosUIComponentsPrimaryBlue">
            {short}
          </a>
        ) : (
          <span className="text-klerosUIComponentsPrimaryText">{short}</span>
        )}
      </Tooltip>
    </Copiable>
  );
}

/**
 * Formats an integer amount in base units (wei) for display: `formatUnits(1500000000000000000n)` is `"1.5"`.
 * @param value bigint or decimal string in base units
 * @param decimals token decimals. @default 18
 * @param maxFractionDigits digits kept after the point (truncated). @default 4
 */
export function formatUnits(value: bigint | string, decimals = 18, maxFractionDigits = 4): string {
  const v = BigInt(value);
  const neg = v < 0n;
  const abs = neg ? -v : v;
  const base = 10n ** BigInt(decimals);
  const whole = (abs / base).toLocaleString("en-US");
  const frac = (abs % base).toString().padStart(decimals, "0").slice(0, maxFractionDigits).replace(/0+$/, "");
  return `${neg ? "-" : ""}${whole}${frac ? `.${frac}` : ""}`;
}

/**
 * Converts a decimal string in display units to base units: `parseUnits("1.5")` is `1500000000000000000n`.
 * Pair it with the core `BigNumberField`: `onChange={(v) => setWei(parseUnits(v.toFixed()))}`.
 * @throws on more fraction digits than `decimals` or on a non-numeric string
 */
export function parseUnits(value: string, decimals = 18): bigint {
  const m = /^(-)?(\d*)(?:\.(\d*))?$/.exec(value.trim());
  if (!m || (!m[2] && !m[3])) throw new Error(`parseUnits: not a number: "${value}"`);
  const frac = m[3] ?? "";
  if (frac.length > decimals) throw new Error(`parseUnits: more than ${decimals} decimals`);
  const v = BigInt((m[2] || "0") + frac.padEnd(decimals, "0"));
  return m[1] ? -v : v;
}

export interface TokenAmountProps {
  /** Amount in base units (wei), as bigint or decimal string. */
  value: bigint | string;
  /** e.g. "ETH", "PNK". */
  symbol?: string;
  /** @default 18 */
  decimals?: number;
  /** @default 4 */
  maxFractionDigits?: number;
  className?: string;
}

/**
 * Displays a token amount held in base units.
 * @example <TokenAmount value={stakeWei} symbol="PNK" />
 */
export function TokenAmount({ value, symbol, decimals = 18, maxFractionDigits = 4, className }: Readonly<TokenAmountProps>) {
  return (
    <span className={cn("tabular-nums", className)}>
      {formatUnits(value, decimals, maxFractionDigits)}
      {symbol && ` ${symbol}`}
    </span>
  );
}

export interface DataTableColumn<T> {
  /** Unique column id. */
  key: string;
  header: React.ReactNode;
  /** Cell content; defaults to `String(row[key])`. */
  render?: (row: T) => React.ReactNode;
  align?: "left" | "right";
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  /** Stable key per row. */
  rowKey: (row: T) => string | number;
  /** Shows skeleton rows. */
  isLoading?: boolean;
  /** Shown when `rows` is empty and not loading, e.g. an `EmptyState`. */
  empty?: React.ReactNode;
  onRowPress?: (row: T) => void;
  className?: string;
}

/**
 * Plain typed table (the core has none). Pair it with the core `StandardPagination` below it.
 * @example
 * <DataTable rows={cases} rowKey={(c) => c.id} isLoading={isLoading} empty={<EmptyState title="No cases" />}
 *   columns={[{ key: "id", header: "Case" }, { key: "court", header: "Court" },
 *     { key: "reward", header: "Reward", align: "right", render: (c) => <TokenAmount value={c.rewardWei} symbol="ETH" /> }]} />
 */
export function DataTable<T>({ columns, rows, rowKey, isLoading, empty, onRowPress, className }: Readonly<DataTableProps<T>>) {
  const cell = (c: DataTableColumn<T>) => cn("px-4 py-3", c.align === "right" ? "text-right" : "text-left");
  return (
    <div className={cn("border-klerosUIComponentsStroke rounded-base overflow-x-auto border", className)}>
      <table className="text-klerosUIComponentsPrimaryText w-full text-sm">
        <thead className="bg-klerosUIComponentsLightBackground text-klerosUIComponentsSecondaryText">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={cn(cell(c), "font-medium")}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 3 }, (_, i) => (
                <tr key={i} className="border-klerosUIComponentsStroke border-t">
                  <td colSpan={columns.length} className="px-4 py-3">
                    <Skeleton className="h-5" />
                  </td>
                </tr>
              ))
            : rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowPress ? () => onRowPress(row) : undefined}
                  className={cn("border-klerosUIComponentsStroke border-t", onRowPress && "hover:bg-klerosUIComponentsLightGrey cursor-pointer")}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cell(c)}>
                      {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
      {!isLoading && rows.length === 0 && empty}
    </div>
  );
}

export interface KeyValueItem {
  /** The fact's name, e.g. "Deadline". A `HelpTooltip` works here for a label that needs explaining. */
  label: React.ReactNode;
  /** The fact: text, a `TokenAmount`, an `AddressDisplay`, a `StatusBadge`, a `Countdown`. */
  value: React.ReactNode;
  /** Muted line under the value, e.g. "Locked in escrow". */
  hint?: React.ReactNode;
  /** Stable React key for lists that reorder. @default the row's index */
  id?: string | number;
}

export interface KeyValueListProps {
  /** Rows in display order. */
  items: KeyValueItem[];
  className?: string;
}

/**
 * Facts as label and value rows (a `dl`) with a divider between rows, inside a `Card` or alone.
 * Label left and value right when the list is at least 384px wide; label above value when it is narrower. The width is
 * the list's own (a container query), not the screen's, so a narrow card on a desktop stacks too. Long values wrap.
 * It fills the width of its container. Put a paragraph of free text under the list, not in a row.
 * @intent key value, facts, details list, properties, definition list, label value, details, summary, review step, info rows
 * @example
 * <Card fluid className="p-6">
 *   <KeyValueList items={[
 *     { label: "Court", value: "General Court" },
 *     { label: "Amount", value: <TokenAmount value={amountWei} symbol="ETH" />, hint: "Locked in escrow" },
 *     { label: "Seller", value: <AddressDisplay address={seller} /> },
 *   ]} />
 * </Card>
 */
export function KeyValueList({ items, className }: Readonly<KeyValueListProps>) {
  return (
    <dl className={cn("divide-klerosUIComponentsStroke @container flex w-full flex-col divide-y text-sm", className)}>
      {items.map((item, i) => (
        <div
          key={item.id ?? i}
          className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 @sm:flex-row @sm:items-baseline @sm:justify-between @sm:gap-4"
        >
          <dt className="text-klerosUIComponentsSecondaryText @sm:max-w-1/2 @sm:shrink-0">{item.label}</dt>
          <dd className="text-klerosUIComponentsPrimaryText min-w-0 break-words @sm:text-right">
            {item.value}
            {item.hint !== undefined && <span className="text-klerosUIComponentsSecondaryText block text-xs">{item.hint}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
