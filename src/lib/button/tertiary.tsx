import styled from "styled-components";
import BaseButton from "./base";

const TertiaryButton = styled(BaseButton)`
  background: ${(props) => props.theme.secondaryPurple};

  .button-text {
    color: ${(props) => props.theme.whiteBackground};
  }

  .button-svg {
    fill: ${(props) => props.theme.whiteBackground};
  }

  :hover {
    background: ${(props) => props.theme.primaryPurple};
  }
`;

export default TertiaryButton;
