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
  const [tip, setTip] = useState("0");
  const [state, setState] = useState<"idle" | "pending" | "done" | "error">("idle");
  const tipWei = toWei(tip);
  // The core Button's isLoading only shows a spinner: the button stays pressable, so a vote in flight disables it
  // and this ref drops a second press that lands before the re-render.
  const sending = useRef(false);

  async function onVote() {
    if (sending.current || !choice || tipWei === null) return;
    sending.current = true;
    setState("pending");
    try {
      await castVote({ choice, justification, tipWei });
      setState("done");
    } catch {
      setState("error");
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
            <Button text="Cast vote" isDisabled={state === "pending" || !choice || !justification || tipWei === null}
              isLoading={state === "pending"} onPress={onVote} />
          }
        >
          <Radio groupLabel="Your vote" options={OPTIONS} value={choice} onChange={setChoice} />
          <TextArea label="Justification" placeholder="Why this ruling?" value={justification}
            onChange={setJustification} className="w-full" inputProps={{ className: "w-full" }} />
          <HelpTooltip text="Optional tip to the case creator, in ETH.">Tip</HelpTooltip>
          {/* BigNumberField names its input through inputProps, not a top-level aria-label. */}
          <BigNumberField inputProps={{ "aria-label": "Tip (ETH)" }} placeholder="0.0" minValue="0" showFieldError
            validate={(v) => (v?.decimalPlaces() ?? 0) <= 18 || "At most 18 decimals"}
            onChange={(v) => setTip(v.toFixed())} />
          {state === "done" && <AlertMessage variant="success" title="Vote cast" msg="Your vote is recorded." />}
          {state === "error" && <AlertMessage variant="error" title="Vote failed" msg="The transaction was rejected." />}
        </FormStack>
      </Card>
    </ChainGuard>
  );
}
