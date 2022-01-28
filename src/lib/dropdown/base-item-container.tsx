import React from "react";
import styled from "styled-components";
import ScrollbarContainer from "../scrollbar";
import { borderBox } from "../../styles/common-style";

const ItemContainer = styled.div`
  ${borderBox}
  flex: 1;
  width: 238px;
  height: auto;
  background: ${({ theme }) => theme.whiteBackground};
  padding: 16px 0px;
  display: grid;
  grid-template-rows: repeat(auto-fill, minmax(0, 45px));
`;

const StyledScrollbarContainer = styled(ScrollbarContainer)`
  width: 238px;
  max-height: 350px;
`;

const ItemContainerWithScrollbar: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <StyledScrollbarContainer>
    <ItemContainer>{children}</ItemContainer>
  </StyledScrollbarContainer>
);

export default ItemContainerWithScrollbar;
