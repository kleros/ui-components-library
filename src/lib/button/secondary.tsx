import styled from "styled-components";
import BaseButton from "./base";

const SecondaryButton = styled(BaseButton)`
  background: ${(props) => props.theme.klerosUIComponentsWhiteBackground};
  border: ${(props) =>
    "1px solid " + props.theme.klerosUIComponentsPrimaryBlue};

  .button-text {
    color: ${(props) => props.theme.klerosUIComponentsPrimaryBlue};
  }

  .button-svg {
    fill: ${(props) => props.theme.klerosUIComponentsPrimaryBlue};
  }

  .button-loading {
    fill: ${(props) => props.theme.klerosUIComponentsPrimaryBlue};
  }

  :hover {
    background: ${(props) => props.theme.klerosUIComponentsMediumBlue};
  }
`;

export default SecondaryButton;
