import styled from "styled-components";
import { borderBox } from "../../styles/common-style";

const Box = styled.div`
  ${borderBox}
  background: ${({ theme }) => theme.mediumBlue};
  border-radius: 18px;
  width: 328px;
  height: 200px;
`;

export default Box;
