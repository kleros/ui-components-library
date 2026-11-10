import React, { useEffect, useState } from "react";
import { Button, Card, Switch, Tooltip } from "@kleros/ui-components-library";
import { cn } from "./cn.js";

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
  /** The label the "?" sits next to. */
  children: React.ReactNode;
  place?: "top" | "bottom" | "left" | "right";
}

/**
 * A label followed by a "?" that shows help on hover or focus (core `Tooltip`).
 * @example <HelpTooltip text="Share of your votes that matched the final ruling.">Coherence</HelpTooltip>
 */
export function HelpTooltip({ text, children, place = "top" }: Readonly<HelpTooltipProps>) {
  return (
    <span className="inline-flex items-center gap-1">
      {children}
      <Tooltip text={text} place={place}>
        <span className="border-klerosUIComponentsSecondaryText text-klerosUIComponentsSecondaryText inline-flex size-4 items-center justify-center rounded-full border text-[10px]">
          ?
        </span>
      </Tooltip>
    </span>
  );
}

/** Reads and sets the `.dark` class on `<html>`, which is how the core library switches theme. */
export function useDarkMode(): [boolean, (dark: boolean) => void] {
  const [dark, setDark] = useState(() => typeof document !== "undefined" && document.documentElement.classList.contains("dark"));
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return [dark, setDark];
}

/**
 * Sets the starting theme before the first render: `?theme=light` or `?theme=dark` in the URL wins, else the system setting. Call it once in `main.tsx`.
 * It reads the query from `window.location.search`; without `theme=light|dark` there it follows
 * `prefers-color-scheme: dark`. It adds or removes the `dark` class on `document.documentElement` and returns the theme
 * it applied. Without a window (a server render) it changes nothing and returns "light". Call it before
 * `createRoot(...).render(...)`: `ThemeToggle` and `useDarkMode` read the class when they mount, so they then start in
 * the same theme.
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
 * It reads the class when it mounts: call `applyInitialTheme()` in `main.tsx` first, so it starts from `?theme=` or the system setting.
 * @example <ThemeToggle />
 */
export function ThemeToggle({ className }: Readonly<{ className?: string }>) {
  const [dark, setDark] = useDarkMode();
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm", className)}>
      <span className="text-klerosUIComponentsSecondaryText">Dark</span>
      <Switch aria-label="Dark mode" isSelected={dark} onChange={setDark} />
    </span>
  );
}

export interface ChainGuardProps {
  /** From your wallet hook, e.g. wagmi `useAccount().isConnected`. */
  isConnected: boolean;
  /** Current chain id, e.g. wagmi `useAccount().chainId`. */
  chainId?: number;
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
 * Renders `children` only when a wallet is connected on the right chain; otherwise a connect or switch prompt.
 * Wallet-agnostic: pass state and actions from wagmi/AppKit, so the library does not depend on them.
 * @example
 * <ChainGuard isConnected={isConnected} chainId={chainId} requiredChainId={42161} chainName="Arbitrum One"
 *   onConnect={() => open()} onSwitchChain={() => switchChain({ chainId: 42161 })}>
 *   <StakeForm />
 * </ChainGuard>
 */
export function ChainGuard({ isConnected, chainId, requiredChainId, chainName, onConnect, onSwitchChain, children, className }: Readonly<ChainGuardProps>) {
  if (isConnected && chainId === requiredChainId) return <>{children}</>;
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
