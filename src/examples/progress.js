import React from "react";
import styled from "styled-components";
import Steps from "../lib/progress/steps";

const StyledSteps = styled(Steps)`
  height: ${(props) => (props.horizontal ? "auto" : "300px")};
  width: ${(props) => (props.horizontal ? "500px" : "auto")};
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
    <StyledSteps
      horizontal
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
