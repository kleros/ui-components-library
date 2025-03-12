import React from "react";
import styled, { css } from "styled-components";
import Button from "../../button";
import { mobileStyle, borderBox } from "../../../styles/common-style";

const Wrapper = styled.div`
  ${borderBox}
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
  background: ${({ theme }) => theme.klerosUIComponentsWhiteBackground};
  padding: 8px 16px;
  display: flex;
  ${mobileStyle(
    () => css`
      justify-content: center;
    `,
  )}
  justify-content: end;
  align-items: center;
`;

interface ISelector {
  currentSelection?: string;
  onSelect: () => void;
}

const Selector: React.FC<ISelector> = ({
  currentSelection,
  onSelect,
  ...props
}) => (
  <Wrapper {...props}>
    <Button
      onClick={() => onSelect()}
      text={currentSelection ? `Select\n${currentSelection}` : "No Selection"}
      isDisabled={!currentSelection}
    />
  </Wrapper>
);

export default Selector;
