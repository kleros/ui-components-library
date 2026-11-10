// Recipe: a case page: stat row, period steps, tabs with a timeline and a paginated votes table, dark mode.
// Copy into your app and replace the constants with your data hooks.
import { useState } from "react";
import { Steps, StandardPagination, Tabs, Timeline, type TabsItem, type TimelineItem } from "@kleros/ui-components-library";
import { AddressDisplay, DataTable, StatCard, ThemeToggle, TokenAmount } from "@kleros/ui-components-library/kit";

type Vote = { juror: string; choice: string; stakeWei: bigint };
const VOTES: Vote[] = [{ juror: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed", choice: "Yes", stakeWei: 1500n * 10n ** 18n }];
const PERIODS = ["Evidence", "Commit", "Vote", "Appeal", "Execution"].map((title) => ({ title }));
const EVENTS: [TimelineItem, ...TimelineItem[]] = [
  { title: "Case created", party: "Requester", subtitle: "12 May 2026", variant: "accepted" },
  { title: "Jurors drawn", party: "3 jurors", subtitle: "13 May 2026" },
];
const PAGE_SIZE = 10;

export default function CasePage() {
  const [page, setPage] = useState(1);
  const shown = VOTES.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const tabs: TabsItem[] = [
    { id: "overview", text: "Overview", value: "overview", content: <Timeline items={EVENTS} className="mt-4" /> },
    {
      id: "votes", text: "Votes", value: "votes",
      content: (
        <div className="mt-4 flex flex-col gap-4">
          <DataTable rows={shown} rowKey={(v) => v.juror}
            columns={[
              { key: "juror", header: "Juror", render: (v) => <AddressDisplay address={v.juror} /> },
              { key: "choice", header: "Vote" },
              { key: "stake", header: "Stake", align: "right", render: (v) => <TokenAmount value={v.stakeWei} symbol="PNK" /> },
            ]} />
          <StandardPagination currentPage={page} numPages={Math.max(1, Math.ceil(VOTES.length / PAGE_SIZE))} callback={setPage} />
        </div>
      ),
    },
  ];

  return (
    <main className="flex flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-klerosUIComponentsPrimaryText text-2xl font-semibold">Case #1234</h1>
        <ThemeToggle />
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Court" value="General Court" />
        <StatCard label="Jurors" value={3} />
        <StatCard label="Reward" value={<TokenAmount value={90000000000000000n} symbol="ETH" />} />
      </div>
      <Steps horizontal items={PERIODS} currentItemIndex={2} />
      <Tabs items={tabs} defaultSelectedKey="overview" />
    </main>
  );
}
