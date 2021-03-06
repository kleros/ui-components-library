import React from "react";
import styled from "styled-components";
import { borderBox, small, button } from "../styles/common-style";

const Wrapper = styled.div`
  ${borderBox}
  display: flex;
`;

const Element = styled.button`
  ${button}
  background: none;
  padding: 0;

  :hover {
    small {
      color: ${({ theme }) => theme.primaryText};
    }
  }
`;

const Content = styled.small`
  ${small}
  transition: color ease ${({ theme }) => theme.transitionSpeed};
`;

const Separator = styled(Content)`
  margin: 0px 8px;
`;

const ActiveElement = styled(Content)`
  color: ${({ theme }) => theme.primaryText};
`;

interface BreadcrumbProps {
  // eslint-disable-next-line @typescript-eslint/ban-types
  callback: Function;
  items: { text: string; value: any }[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ callback, items }) => (
  <Wrapper>
    {items.map(({ text, value }, i) =>
      i === items.length - 1 ? (
        <ActiveElement key={i}>{text}</ActiveElement>
      ) : (
        <React.Fragment key={i}>
          <Element onClick={() => callback(value)}>
            <Content>{text}</Content>
          </Element>
          <Separator>{"/"}</Separator>
        </React.Fragment>
      )
    )}
  </Wrapper>
);

export default Breadcrumb;
