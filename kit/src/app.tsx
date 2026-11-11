import React, { useId, useSyncExternalStore } from "react";
import { Button, Card, Switch, Tooltip } from "@kleros/ui-components-library";
import { cn } from "./cn.js";
import { Spinner } from "./feedback.js";

export interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

/**
 * Link that opens in a new tab with `rel="noopener noreferrer"` and a trailing arrow.
 * @example <ExternalLink href="https://docs.kleros.io">Docs</ExternalLink>
 */
export function ExternalLink({ href, children, className, ...props }: Readonly<ExternalLinkProps>) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn("text-klerosUIComponentsPrimaryBlue hover:underline", className)} {...props}>
      {children} ↗
    </a>
  );
}

export interface HelpTooltipProps {
  /** The help text. */
  text: string;
  /**
   * The label the "?" sits next to. Plain text (strings and numbers) also names the "?" for screen readers,
   * "About <label>"; any other content gives it the name "More information".
   */
  children: React.ReactNode;
  place?: "top" | "bottom" | "left" | "right";
}

// The "?" trigger's accessible name: "About <label>" when the label is plain text, else a generic name.
function helpName(label: React.ReactNode): string {
  const parts = React.Children.toArray(label);
  const plain = parts.every((p) => typeof p === "string" || typeof p === "number") ? parts.join("").trim() : "";
  return plain ? `About ${plain}` : "More information";
}

/**
 * A label followed by a "?" that shows help on hover or focus (core `Tooltip`).
 * The "?" is named after the label ("About Coherence", or "More information" when the label is not plain text) and
 * carries the help text as its description.
 * @example <HelpTooltip text="Share of your votes that matched the final ruling.">Coherence</HelpTooltip>
 */
export function HelpTooltip({ text, children, place = "top" }: Readonly<HelpTooltipProps>) {
  return (
    <span className="inline-flex items-center gap-1">
      {children}
      {/* inline-flex: the core wrapper is a block div, whose line box would set the "?" on the baseline, below the
          label's centre. The name says what the "?" explains; the help text stays its description. */}
      <Tooltip
        text={text}
        place={place}
        wrapperProps={{ className: "inline-flex", "aria-label": helpName(children), "aria-description": text }}
      >
        <span className="border-klerosUIComponentsSecondaryText text-klerosUIComponentsSecondaryText inline-flex size-4 items-center justify-center rounded-full border text-[10px]">
          ?
        </span>
      </Tooltip>
    </span>
  );
}

// The `dark` class on <html> is the single source of truth: every useDarkMode call subscribes to it, so they all see a
// change made by any of them, by applyInitialTheme or by other code. Nothing is persisted.
function subscribeDark(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const readDark = () => document.documentElement.classList.contains("dark");
const serverDark = () => false;
const setDarkClass = (dark: boolean) => {
  document.documentElement.classList.toggle("dark", dark);
};

/**
 * Reads and sets the `.dark` class on `<html>`, which is how the core library switches theme.
 * The value follows the class: every component that calls it (and `ThemeToggle`) re-renders when the class changes,
 * whoever changes it. The setter only changes the class; nothing is persisted. A server render, and hydration,
 * read false.
 */
export function useDarkMode(): [boolean, (dark: boolean) => void] {
  const dark = useSyncExternalStore(subscribeDark, readDark, serverDark);
  return [dark, setDarkClass];
}

/**
 * Sets the starting theme before the first render: `?theme=light` or `?theme=dark` in the URL wins, else the system setting. Call it once in `main.tsx`.
 * It reads the query from `window.location.search`; without `theme=light|dark` there it follows
 * `prefers-color-scheme: dark`. It adds or removes the `dark` class on `document.documentElement` and returns the theme
 * it applied. Without a window (a server render) it changes nothing and returns "light". Call it before
 * `createRoot(...).render(...)`, so the first paint is already in that theme: `ThemeToggle` and `useDarkMode` follow
 * the class, so they show the same theme.
 * @intent initial theme, dark mode, light mode, system theme, prefers-color-scheme, theme query parameter, theme on load
 * @example
 * import { applyInitialTheme } from "@kleros/ui-components-library/kit";
 * applyInitialTheme();
 * createRoot(document.getElementById("root")!).render(<App />);
 */
export function applyInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined" || typeof document === "undefined") return "light";
  const asked = new URLSearchParams(window.location.search).get("theme");
  const dark =
    asked === "dark" ||
    (asked !== "light" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  return dark ? "dark" : "light";
}

/**
 * Light/dark switch (core `Switch`) wired to the `.dark` class on `<html>`. No provider or theme object is needed.
 * It follows the class (through `useDarkMode`), so it stays in step with other code that changes it. Call
 * `applyInitialTheme()` in `main.tsx` first, so the page starts from `?theme=` or the system setting.
 * The word "Dark" is a label of the switch: clicking it toggles the theme too.
 * @example <ThemeToggle />
 */
export function ThemeToggle({ className }: Readonly<{ className?: string }>) {
  const [dark, setDark] = useDarkMode();
  // The core Switch fixes its own children (the track), so the word labels its input through the id it passes on.
  const id = useId();
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm", className)}>
      <label htmlFor={id} className="text-klerosUIComponentsSecondaryText cursor-pointer">
        Dark
      </label>
      <Switch id={id} aria-label="Dark mode" isSelected={dark} onChange={setDark} />
    </span>
  );
}

export interface ChainGuardProps {
  /** From your wallet hook, e.g. wagmi `useAccount().isConnected`. */
  isConnected: boolean;
  /** Current chain id, e.g. wagmi `useAccount().chainId`. */
  chainId?: number;
  /**
   * True while the wallet is still connecting or reconnecting, e.g. wagmi
   * `useAccount().isConnecting || useAccount().isReconnecting`. Until the wallet is connected on the required chain, a
   * loading state then replaces the connect or switch prompt, so neither flashes while the connection settles.
   * @default false
   */
  isConnecting?: boolean;
  requiredChainId: number;
  /** e.g. "Arbitrum One". */
  chainName: string;
  /** Opens your wallet modal (e.g. Reown AppKit `open()`). */
  onConnect: () => void;
  /** e.g. `() => switchChain({ chainId: requiredChainId })`. */
  onSwitchChain: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Renders `children` only when a wallet is connected on the right chain; otherwise a connect or switch prompt, or,
 * while `isConnecting`, a loading spinner in the same card.
 * Wallet-agnostic: pass state and actions from wagmi/AppKit, so the library does not depend on them.
 * @example
 * <ChainGuard isConnected={isConnected} isConnecting={isConnecting || isReconnecting} chainId={chainId}
 *   requiredChainId={42161} chainName="Arbitrum One"
 *   onConnect={() => open()} onSwitchChain={() => switchChain({ chainId: 42161 })}>
 *   <StakeForm />
 * </ChainGuard>
 */
export function ChainGuard({ isConnected, isConnecting = false, chainId, requiredChainId, chainName, onConnect, onSwitchChain, children, className }: Readonly<ChainGuardProps>) {
  if (isConnected && chainId === requiredChainId) return <>{children}</>;
  if (isConnecting) {
    return (
      <Card className={cn("flex h-auto w-full flex-col items-center gap-3 p-6 text-center", className)}>
        <Spinner label="Connecting wallet" />
      </Card>
    );
  }
  return (
    <Card className={cn("flex h-auto w-full flex-col items-center gap-3 p-6 text-center", className)}>
      <p className="text-klerosUIComponentsPrimaryText">
        {isConnected ? `Switch your wallet to ${chainName} to continue.` : "Connect a wallet to continue."}
      </p>
      {isConnected ? (
        <Button text={`Switch to ${chainName}`} onPress={onSwitchChain} />
      ) : (
        <Button text="Connect wallet" onPress={onConnect} />
      )}
    </Card>
  );
}
