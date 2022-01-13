import React from "react";
import styled from "styled-components";
import Steps from "../lib/progress/steps";
import Timeline from "../lib/progress/timeline";

const StyledSteps = styled(Steps)`
  height: ${(props) => (props.horizontal ? "auto" : "300px")};
  width: ${(props) => (props.horizontal ? "500px" : "auto")};
`;

const StyledTimeline = styled(Timeline)`
  margin: 0px 100px;
`;

const Progress = () => (
  <>
    <StyledSteps
      items={[
        { title: "Escrow Details", subitems: ["Type of Escrow", "Title"] },
        { title: "Terms", subitems: ["Deliverable", "Payment", "Deadline"] },
        { title: "Preview" },
      ]}
      currentItemIndex={1}
    />
    <StyledSteps
      horizontal
      items={[
        { title: "Escrow Details", subitems: ["Type of Escrow", "Title"] },
        { title: "Terms", subitems: ["Deliverable", "Payment", "Deadline"] },
        { title: "Preview" },
      ]}
      currentItemIndex={1}
    />
    <StyledTimeline
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
  </>
);

export default Progress;
