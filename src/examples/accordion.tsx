import React from "react";
import styled from "styled-components";
import Accordion from "../lib/accordion";

const StyledAccordion = styled(Accordion)`
  width: 800px;
`;

const AccordionExample = () => (
  <StyledAccordion
    items={[
      {
        title: "How it works?",
        body: <p>{"hello\nhello\n\n\n\n\nhello"}</p>,
      },
      { title: "How it works?", body: "hello" },
    ]}
  />
);

export default AccordionExample;
