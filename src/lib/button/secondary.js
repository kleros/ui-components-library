import styled from "styled-components";
import BaseButton from "./base";

const SecondaryButton = styled(BaseButton)`
  background: ${(props) => props.theme.whiteBackground};
  color: ${(props) => props.theme.primaryBlue};
  border: ${(props) => "1px solid " + props.theme.primaryBlue};

  :hover {
    background: ${(props) => props.theme.mediumBlue};
  }
`;

export default SecondaryButton;