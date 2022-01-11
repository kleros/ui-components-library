import React from "react";
import styled from "styled-components";
import Steps from "../lib/progress/steps";

const StyledSteps = styled(Steps)`
  height: 300px;
`;

const Progress = () => (
  <>
    <StyledSteps
      items={[
        {
          title: "Escrow Details",
          subitems: ["Type of Escrow", "Title"],
        },
        {
          title: "Terms",
          subitems: ["Deliverable", "Payment", "Deadline"],
        },
        {
          title: "Preview",
        },
      ]}
      currentItemIndex={1}
    />
  </>
);

export default Progress;
