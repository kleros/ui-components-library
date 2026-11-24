// Recipe: a vote form behind a wallet/chain gate: radio group, justification, an 18-decimal amount, async submit.
// Copy into your app; pass wallet state from wagmi/AppKit and replace `castVote` with your contract call.
import { useRef, useState } from "react";
import { AlertMessage, BigNumberField, Button, Card, Radio, TextArea } from "@kleros/ui-components-library";
import { ChainGuard, FormStack, HelpTooltip, parseUnits } from "@kleros/ui-components-library/kit";

const OPTIONS = [
  { label: "Yes", value: "1" },
  { label: "No", value: "2" },
  { label: "Refuse to arbitrate", value: "0" },
];

// Kleros's castVote takes no tip (it is not payable) and accepts an empty justification: the tip field is here to
// show an 18-decimal amount. Send a tip in a call of your own, or drop the field.
function castVote(_v: { choice: string; justification: string; tipWei: bigint }): Promise<void> {
  return Promise.resolve(); // your contract call
}

// The tip in wei, or null while parseUnits rejects it (more than 18 decimals); the field says why.
function toWei(amount: string): bigint | null {
  try {
    return parseUnits(amount);
  } catch {
    return null;
  }
}

// What a wallet or RPC error carries: viem's and ethers' errors have a short `shortMessage`, and viem wraps the
// wallet's own error as `cause` (a ContractFunctionExecutionError around a UserRejectedRequestError).
type CallError = { name?: unknown; code?: unknown; shortMessage?: unknown; message?: unknown; cause?: unknown };

// True when the user declined in the wallet: viem's UserRejectedRequestError, or EIP-1193 code 4001, on the error or
// on an error in its cause chain.
function isUserRejection(error: unknown): boolean {
  let e = error;
  for (let depth = 0; depth < 8 && typeof e === "object" && e !== null; depth++) {
    const { name, code, cause } = e as CallError;
    if (name === "UserRejectedRequestError" || code === 4001) return true;
    e = cause;
  }
  return false;
}

// One short line for the alert: the error's shortMessage, else the first line of its message, never a stack trace.
function failureText(error: unknown): string {
  const { shortMessage, message } = (typeof error === "object" && error !== null ? error : {}) as CallError;
  let text = typeof shortMessage === "string" ? shortMessage : "";
  if (!text.trim() && typeof message === "string") text = message.split("\n")[0];
  const line = text.replace(/\s+/g, " ").trim();
  if (!line) return "The vote was not sent. Try again.";
  return line.length > 160 ? `${line.slice(0, 159)}…` : line;
}

export interface VoteFormProps {
  isConnected: boolean;
  /** wagmi `isConnecting || isReconnecting`, so no connect prompt flashes while the wallet reconnects. */
  isConnecting?: boolean;
  chainId?: number;
  onConnect: () => void;
  onSwitchChain: () => void;
}

export default function VoteForm({ isConnected, isConnecting, chainId, onConnect, onSwitchChain }: Readonly<VoteFormProps>) {
  const [choice, setChoice] = useState<string>();
  const [justification, setJustification] = useState("");
  // The field is controlled (value={tip}), so it shows the held amount again when ChainGuard remounts it after a chain
  // switch or a reconnect. An empty field is a zero tip.
  const [tip, setTip] = useState("");
  const [state, setState] = useState<"idle" | "pending" | "done" | "rejected" | "error">("idle");
  const [error, setError] = useState("");
  const tipWei = toWei(tip || "0");
  // The core Button's isLoading only shows a spinner: the button stays pressable, so a vote in flight disables it
  // and this ref drops a second press that lands before the re-render.
  const sending = useRef(false);
  // While the vote is in flight and once it is cast, the fields lock, so they keep showing what was sent.
  const locked = state === "pending" || state === "done";

  async function onVote() {
    if (sending.current || state === "done" || !choice || tipWei === null) return;
    sending.current = true;
    setState("pending");
    try {
      await castVote({ choice, justification, tipWei });
      setState("done");
    } catch (e) {
      // A rejection in the wallet is the user's choice; a revert, the RPC, the funds or the chain is a failure.
      if (isUserRejection(e)) {
        setState("rejected");
      } else {
        setError(failureText(e));
        setState("error");
      }
    } finally {
      sending.current = false;
    }
  }

  return (
    <ChainGuard isConnected={isConnected} isConnecting={isConnecting} chainId={chainId} requiredChainId={42161}
      chainName="Arbitrum One" onConnect={onConnect} onSwitchChain={onSwitchChain}>
      <Card fluid className="max-w-xl p-6">
        <FormStack
          actions={
            <Button text="Cast vote" isDisabled={locked || !choice || tipWei === null}
              isLoading={state === "pending"} onPress={onVote} />
          }
        >
          <Radio groupLabel="Your vote" options={OPTIONS} value={choice ?? null} onChange={setChoice}
            isDisabled={locked} />
          <TextArea label="Justification" placeholder="Why this ruling?" value={justification}
            onChange={setJustification} isDisabled={locked} className="w-full"
            inputProps={{ className: "w-full" }} />
          <HelpTooltip text="Optional tip to the case creator, in ETH.">Tip (ETH)</HelpTooltip>
          {/* BigNumberField names its input through inputProps, not a top-level aria-label. The wheel is off and the
              step small, so a scroll or an arrow key over the focused field does not add whole ETH. */}
          <BigNumberField inputProps={{ "aria-label": "Tip (ETH)" }} placeholder="0.0" minValue="0" showFieldError
            isWheelDisabled step="0.01" validate={(v) => (v?.decimalPlaces() ?? 0) <= 18 || "At most 18 decimals"}
            value={tip} onChange={(v) => setTip(v.toFixed())} isDisabled={locked} />
          {state === "done" && <AlertMessage variant="success" title="Vote cast" msg="Your vote is recorded." />}
          {state === "rejected" && (
            <AlertMessage variant="warning" title="Vote not sent" msg="You rejected the transaction in your wallet." />
          )}
          {state === "error" && <AlertMessage variant="error" title="Vote failed" msg={error} />}
        </FormStack>
      </Card>
    </ChainGuard>
  );
}
