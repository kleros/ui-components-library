import styled from "styled-components";

const Dot = styled.div`
  background: ${(props) => props.color};
  border-radius: 50%;
  width: 8px;
  height: 8px;
`;

export default Dot;
