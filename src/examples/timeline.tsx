import React from "react";
import Steps from "../lib/progress/steps";
import Timeline from "../lib/progress/timeline";
import CustomTimeline from "../lib/progress/timeline/custom";
import Circle from "../assets/svgs/check-circle-outline.svg";

const TimelineProgress = () => (
  <>
    <Steps
      className="h-[300px]"
      items={[
        { title: "Escrow Details", subitems: ["Type of Escrow", "Title"] },
        { title: "Terms", subitems: ["Deliverable", "Payment", "Deadline"] },
        { title: "Preview" },
      ]}
      currentItemIndex={1}
    />
    <Steps
      className="w-[500px]"
      horizontal
      items={[
        { title: "Escrow Details", subitems: ["Type of Escrow", "Title"] },
        { title: "Terms", subitems: ["Deliverable"] },
        { title: "Preview" },
      ]}
      currentItemIndex={1}
    />
    <Timeline
      className="mx-25"
      items={[
        {
          title: "Pay 200 DAI",
          party: "alice.eth",
          subtitle: "08 Jan 2019 03:00 UTC",
          rightSided: true,
          variant: "accepted",
        },
        {
          title: "Pay 250 DAI",
          party: "bob.eth",
          subtitle: "08 Jan 2019 02:00 UTC",
          variant: "refused",
        },
      ]}
    />
    <CustomTimeline
      items={[
        {
          title: "Pay 250 DAI",
          party: (
            <div className="flex items-center gap-2">
              <label className="text-klerosUIComponentsPrimaryText leading-4">
                alice.eth -
              </label>
              <a
                className="text-klerosUIComponentsPrimaryBlue text-sm"
                href="https://docs.kleros.io/"
                target="_blank"
                rel="noreferrer"
              >
                Justification
              </a>
            </div>
          ),
          subtitle: "06 Jul 2023 12:00 UTC",
          variant: "#4D00B4",
          Icon: Circle,
        },
        {
          title: "Jury Decision - Round 1",
          party: "No",
          subtitle: "06 Jul 2023 12:00 UTC",
          variant: "#ca2314",
          state: "loading",
        },
      ]}
    />
  </>
);

export default TimelineProgress;
