import styled from "styled-components";
import { borderBox } from "../styles/common-style";

interface DotProps {
  color: string;
}

const Dot = styled.div<DotProps>`
  ${borderBox}
  background: ${({ color }) => color};
  border-radius: 50%;
  width: 8px;
  height: 8px;
`;

export default Dot;
