// CI fixture: every kit export used once through the public subpath, so a broken kit type fails the gate.
import { useState } from "react";
import { Button, LinearProgress, TextField } from "@kleros/ui-components-library";
import {
  AddressDisplay, ChainGuard, DataTable, EmptyState, ExternalLink, HelpTooltip, InfoCard, Skeleton, Spinner,
  StatCard, ThemeToggle, TokenAmount, formatUnits, parseUnits, shortenAddress, useDarkMode, applyInitialTheme,
  Stack, Inline, Grid, Section, Page, FormStack, ErrorState, QueryState, StatusBadge, toneClasses, FormField,
  Countdown, useCountdown, readToken, KeyValueList, Sparkline, WizardShell,
  type DataTableColumn, type Tone, type KlerosToken, type KeyValueItem, type KeyValueListProps, type SparklineProps,
  type WizardStep, type WizardShellProps,
} from "@kleros/ui-components-library/kit";
import type { Meta, StoryObj } from "@kleros/ui-components-library/story-types";

type Row = { id: number; name: string };
const columns: DataTableColumn<Row>[] = [{ key: "name", header: "Name" }];
const wei: bigint = parseUnits("1.5");
const text: string = formatUnits(wei) + shortenAddress("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed");
const tone: Tone = "accent";
const token: KlerosToken = "PrimaryBlue";
const facts: KeyValueItem[] = [
  { label: "Court", value: "General Court" },
  { label: <HelpTooltip text="Locked until the ruling">Amount</HelpTooltip>, value: <TokenAmount value={wei} symbol="ETH" />, hint: "In escrow", id: "amount" },
];
const factsProps: KeyValueListProps = { items: facts, className: "max-w-md" };
const trend: SparklineProps = { values: [3, 5, 4, 8], label: "Escrow", startLabel: "1 Oct", endLabel: "Today", formatValue: (v) => `${v} ETH`, height: 48, zeroBased: false };
const steps: WizardStep[] = [
  { title: "Terms", content: <TextField label="Title" />, validate: () => true },
  { title: "Payment", content: <TextField label="Amount" />, validate: () => Promise.resolve(wei > 0n) },
  { title: "Review", content: <KeyValueList {...factsProps} /> },
];
const wizard: WizardShellProps = { steps, onSubmit: async () => {}, onCancel: () => {}, submitText: "Create" };
const meta: Meta<typeof Stack> = { component: Stack };
// d.9: the starter's main.tsx calls this before the first render; it returns the theme it applied.
const startTheme: "light" | "dark" = applyInitialTheme();
const NOW = "2026-10-29T12:00:00Z";
const story: StoryObj<typeof meta> = { args: { gap: 2 } };
void story;

export default function Fixture() {
  const [dark, setDark] = useDarkMode();
  const left = useCountdown(Date.now() + 60_000);
  // d.9: a fixed now, as an ISO string, a Date or milliseconds; the deadline takes the same forms.
  const fixed = useCountdown("2026-10-31T16:12:05Z", NOW);
  const fixedToo = useCountdown(new Date("2026-10-31T16:12:05Z"), Date.parse(NOW));
  const live = useCountdown(Date.now() + 60_000, undefined);
  const [step, setStep] = useState(0);
  return (
    <Page title="Fixture" actions={<ThemeToggle />}>
      <Section title="Kit" description={`${left.seconds}s ${readToken(token)}`}>
        <Grid minItemWidth={200} gap={4}>
          <Skeleton className="h-4" count={2} />
          <Spinner size={16} />
          <EmptyState title="Empty" action={{ text: "Reset", onPress: () => setDark(!dark) }} />
          <InfoCard variant="warning">{text}</InfoCard>
          <StatCard label="Cases" value={3} isLoading={false} />
        </Grid>
        <Inline gap={2} justify="between">
          <StatusBadge tone={tone} dot>Vote</StatusBadge>
          <span className={toneClasses("success")}>Executed</span>
          <Countdown deadline={new Date(Date.now() + 3_600_000)} format="long" />
        </Inline>
        <Stack gap={3}>
          <AddressDisplay address="0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed" explorerUrl="https://etherscan.io" />
          <TokenAmount value={wei} symbol="ETH" />
          <LinearProgress value={60} width={200} />
          <QueryState isLoading={false} data={[{ id: 1, name: "a" }]} empty={{ title: "None" }} onRetry={() => {}}>
            {(rows) => <DataTable rows={rows} rowKey={(r) => r.id} columns={columns} empty={<EmptyState title="None" />} />}
          </QueryState>
          <ErrorState message="Failed" onRetry={() => {}} />
        </Stack>
        <FormStack actions={<Button text="Go" />}>
          <TextField label="Name" />
          <FormField label="Custom" help="help" error="bad"><input aria-label="x" /></FormField>
        </FormStack>
      </Section>
      <Section title="Kit d.9" description={`${startTheme} ${fixed.days}d ${fixedToo.hours}h ${live.isOver}`}>
        <Countdown deadline="2026-10-31T16:12:05Z" now={NOW} />
        <Countdown deadline={new Date("2026-10-31T16:12:05Z")} now={new Date(NOW)} format="long" overText="Closed" onEnd={() => setDark(false)} />
        <Countdown deadline={Date.parse("2026-10-31T16:12:05Z")} now={Date.parse(NOW)} className="text-sm" />
        <Grid minItemWidth={240}>
          <StatCard label="Alone" value={1} />
        </Grid>
        <FormStack actions={<><Button variant="secondary" text="Cancel" /><Button text="Review and confirm" type="submit" /></>}>
          <FormField label="Chain" htmlFor="chain" help="The chain the token lives on"><input id="chain" /></FormField>
        </FormStack>
      </Section>
      <Section title="Kit d.8">
        <KeyValueList items={facts} />
        <Sparkline {...trend} />
        <Sparkline values={[]} aria-label="No escrow history yet" />
        <WizardShell {...wizard} />
        <WizardShell steps={steps} step={step} onStepChange={setStep} onSubmit={() => setDark(true)}
          backText="Previous" nextText="Continue" cancelText="Close" defaultStep={1} className="max-w-2xl" />
      </Section>
      <ExternalLink href="https://kleros.io">Kleros</ExternalLink>
      <HelpTooltip text="Help">Label</HelpTooltip>
      <ChainGuard isConnected chainId={1} requiredChainId={1} chainName="Ethereum" onConnect={() => {}} onSwitchChain={() => {}}>
        <Button text="Go" />
      </ChainGuard>
    </Page>
  );
}
