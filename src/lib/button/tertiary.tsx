import styled from "styled-components";
import BaseButton from "./base";

const TertiaryButton = styled(BaseButton)`
  background: ${(props) => props.theme.klerosUIComponentsSecondaryPurple};

  .button-text {
    color: ${(props) => props.theme.klerosUIComponentsWhiteBackground};
  }

  .button-svg {
    fill: ${(props) => props.theme.klerosUIComponentsWhiteBackground};
  }

  .button-loading {
    fill: ${(props) => props.theme.klerosUIComponentsWhiteBackground};
  }

  :hover {
    background: ${(props) => props.theme.klerosUIComponentsPrimaryPurple};
  }
`;

export default TertiaryButton;
