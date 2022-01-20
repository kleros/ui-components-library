import styled from "styled-components";

const BaseItemContainer = styled.div`
  flex: 1;
  width: 238px;
  height: auto;
  background: ${({ theme }) => theme.whiteBackground};
  padding: 16px 0px;
  display: grid;
  grid-template-rows: repeat(auto-fill, minmax(0, 45px));
`;

export default BaseItemContainer;
