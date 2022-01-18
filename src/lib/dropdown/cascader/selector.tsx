import React from "react";
import styled from "styled-components";
import BaseItem from "../base-item";
import Button from "../../button";

const Wrapper = styled.div`
  grid-column: 1 / -1;
  grid-row: 2 / 2;
  height: 64px;
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
  background: ${({ theme }) => theme.whiteBackground};
  padding: 0px 16px;
  display: flex;
  justify-content: space-between;
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
    {currentSelection && <BaseItem current text={currentSelection} />}
    <Button
      onClick={() => onSelect()}
      text={"Select"}
      disabled={!currentSelection}
    />
  </Wrapper>
);

export default Selector;
