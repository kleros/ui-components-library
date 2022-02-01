import React from "react";
import styled from "styled-components";
import Accordion from "../lib/accordion";

const StyledAccordion = styled(Accordion)`
  width: 800px;
`;

const StyledContent = styled.small`
  color: ${({ theme }) => theme.primaryText} !important;
`;

const AccordionExample = () => (
  <StyledAccordion
    items={[
      {
        title: "How it works?",
        body: <StyledContent>{"hello\nhello\n\n\n\n\nhello"}</StyledContent>,
      },
      { title: "How it works?", body: <StyledContent>hello</StyledContent> },
    ]}
  />
);

export default AccordionExample;
