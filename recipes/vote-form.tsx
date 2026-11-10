// Recipe: a vote form behind a wallet/chain gate: radio group, justification, an 18-decimal amount, async submit.
// Copy into your app; pass wallet state from wagmi/AppKit and replace `castVote` with your contract call.
import { useState } from "react";
import { AlertMessage, BigNumberField, Button, Card, Radio, TextArea } from "@kleros/ui-components-library";
import { ChainGuard, HelpTooltip, parseUnits } from "@kleros/ui-components-library/kit";

const OPTIONS = [
  { label: "Yes", value: "1" },
  { label: "No", value: "2" },
  { label: "Refuse to arbitrate", value: "0" },
];

async function castVote(_v: { choice: string; justification: string; tipWei: bigint }): Promise<void> {}

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
  chainId?: number;
  onConnect: () => void;
  onSwitchChain: () => void;
}

export default function VoteForm({ isConnected, chainId, onConnect, onSwitchChain }: VoteFormProps) {
  const [choice, setChoice] = useState<string>();
  const [justification, setJustification] = useState("");
  const [tip, setTip] = useState("0");
  const [state, setState] = useState<"idle" | "pending" | "done" | "error">("idle");
  const tipWei = toWei(tip);

  async function onVote() {
    if (!choice || tipWei === null) return;
    setState("pending");
    try {
      await castVote({ choice, justification, tipWei });
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <ChainGuard isConnected={isConnected} chainId={chainId} requiredChainId={42161} chainName="Arbitrum One"
      onConnect={onConnect} onSwitchChain={onSwitchChain}>
      <Card className="flex h-auto w-full max-w-xl flex-col gap-4 p-6">
        <Radio groupLabel="Your vote" options={OPTIONS} value={choice} onChange={setChoice} />
        <TextArea label="Justification" placeholder="Why this ruling?" value={justification} onChange={setJustification} />
        <HelpTooltip text="Optional tip to the case creator, in ETH.">Tip</HelpTooltip>
        <BigNumberField aria-label="Tip (ETH)" placeholder="0.0" minValue="0" showFieldError
          validate={(v) => (v?.decimalPlaces() ?? 0) <= 18 || "At most 18 decimals"}
          onChange={(v) => setTip(v.toFixed())} />
        <Button text="Cast vote" isDisabled={!choice || !justification || tipWei === null}
          isLoading={state === "pending"} onPress={onVote} />
        {state === "done" && <AlertMessage variant="success" title="Vote cast" msg="Your vote is recorded." />}
        {state === "error" && <AlertMessage variant="error" title="Vote failed" msg="The transaction was rejected." />}
      </Card>
    </ChainGuard>
  );
}
