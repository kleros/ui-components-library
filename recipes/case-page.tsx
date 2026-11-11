// Recipe: a case page: stat row, period steps, tabs with a timeline and a paginated votes table, dark mode.
// Copy into your app and replace the constants with your data hooks. Each data view renders through QueryState: pass
// the hook's isLoading, isError, data and refetch (as onRetry); mock data, as here, passes isLoading={false}.
import { useState } from "react";
import { Steps, StandardPagination, Tabs, Timeline, type TabsItem, type TimelineItem } from "@kleros/ui-components-library";
import {
  AddressDisplay, DataTable, Grid, Page, QueryState, Stack, StatCard, ThemeToggle, TokenAmount,
} from "@kleros/ui-components-library/kit";

type Vote = { juror: string; choice: string; stakeWei: bigint };
const CASE = { court: "General Court", jurors: 3, rewardWei: 90000000000000000n, period: 2 };
const VOTES: Vote[] = [{ juror: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed", choice: "Yes", stakeWei: 1500n * 10n ** 18n }];
const PERIODS = ["Evidence", "Commit", "Vote", "Appeal", "Execution"].map((title) => ({ title }));
const EVENTS: [TimelineItem, ...TimelineItem[]] = [
  { title: "Case created", party: "Requester", subtitle: "12 May 2026", variant: "accepted" },
  { title: "Jurors drawn", party: "3 jurors", subtitle: "13 May 2026" },
];
const PAGE_SIZE = 10;

export default function CasePage() {
  const [page, setPage] = useState(1);

  const tabs: TabsItem[] = [
    {
      id: "overview", text: "Overview", value: "overview",
      content: (
        <Stack className="mt-4">
          <QueryState isLoading={false} data={EVENTS} empty={{ title: "No events yet" }}>
            {(events) => <Timeline items={events} />}
          </QueryState>
        </Stack>
      ),
    },
    {
      id: "votes", text: "Votes", value: "votes",
      content: (
        <Stack gap={4} className="mt-4">
          <QueryState isLoading={false} data={VOTES} empty={{ title: "No votes yet" }}>
            {(votes) => (
              <>
                <DataTable rows={votes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)} rowKey={(v) => v.juror}
                  columns={[
                    { key: "juror", header: "Juror", render: (v) => <AddressDisplay address={v.juror} /> },
                    { key: "choice", header: "Vote" },
                    {
                      key: "stake", header: "Stake", align: "right",
                      render: (v) => <TokenAmount value={v.stakeWei} symbol="PNK" />,
                    },
                  ]} />
                <StandardPagination currentPage={page} numPages={Math.max(1, Math.ceil(votes.length / PAGE_SIZE))}
                  callback={setPage} />
              </>
            )}
          </QueryState>
        </Stack>
      ),
    },
  ];

  return (
    <Page title="Case #1234" actions={<ThemeToggle />}>
      <QueryState isLoading={false} data={CASE} empty={{ title: "Case not found" }}>
        {(c) => (
          <>
            <Grid gap={4}>
              <StatCard label="Court" value={c.court} />
              <StatCard label="Jurors" value={c.jurors} />
              <StatCard label="Reward" value={<TokenAmount value={c.rewardWei} symbol="ETH" />} />
            </Grid>
            <Steps horizontal items={PERIODS} currentItemIndex={c.period} className="w-full" />
          </>
        )}
      </QueryState>
      <Tabs items={tabs} defaultSelectedKey="overview" />
    </Page>
  );
}
