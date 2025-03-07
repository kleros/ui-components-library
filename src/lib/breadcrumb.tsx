import React from "react";
import styled from "styled-components";
import { borderBox, small, button } from "../styles/common-style";

const Wrapper = styled.div`
  ${borderBox}
  display: flex;
  flex-wrap: wrap;
  gap: 2px 0;
`;

const Element = styled.button<{ clickable?: boolean }>`
  ${button}
  background: none;
  padding: 0;

  :hover {
    ${({ clickable, theme }) =>
      clickable
        ? `small { color: ${theme.klerosUIComponentsPrimaryText}; }`
        : `cursor: text !important`}
  }
`;

const Content = styled.small`
  ${small}
  transition: color ease
    ${({ theme }) => theme.klerosUIComponentsTransitionSpeed};
`;

const Separator = styled(Content)`
  margin: 0px 8px;
`;

const ActiveElement = styled(Content)`
  color: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
`;

interface BreadcrumbProps {
  items: { text: string; value: any }[];
  // eslint-disable-next-line @typescript-eslint/ban-types
  callback?: Function;
  clickable?: boolean;
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  callback,
  clickable,
  className,
}) => (
  <Wrapper {...{ className }}>
    {items.map(({ text, value }, i) =>
      i === items.length - 1 ? (
        <ActiveElement key={i}>{text}</ActiveElement>
      ) : (
        <React.Fragment key={i}>
          <Element
            onClick={() => (callback ? callback(value) : null)}
            {...{ clickable }}
          >
            <Content>{text}</Content>
          </Element>
          <Separator>{"/"}</Separator>
        </React.Fragment>
      ),
    )}
  </Wrapper>
);

export default Breadcrumb;
