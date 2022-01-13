import styled from "styled-components";

interface DotProps {
  color: string;
}

const Dot = styled.div<DotProps>`
  background: ${({ color }) => color};
  border-radius: 50%;
  width: 8px;
  height: 8px;
`;

export default Dot;
