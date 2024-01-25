import styled from "styled-components";
import BaseButton from "./base";

const SecondaryButton = styled(BaseButton)`
  background: ${(props) =>
    props.disabled
      ? props.theme.klerosUIComponentsLightGrey
      : props.theme.klerosUIComponentsWhiteBackground};
  border: ${(props) =>
    props.disabled
      ? `1px solid ${props.theme.klerosUIComponentsStroke}`
      : `1px solid ${props.theme.klerosUIComponentsPrimaryBlue}`};

  .button-text {
    color: ${(props) =>
      props.disabled
        ? props.theme.klerosUIComponentsStroke
        : props.theme.klerosUIComponentsPrimaryBlue};
  }

  .button-svg {
    fill: ${(props) =>
      props.disabled
        ? props.theme.klerosUIComponentsStroke
        : props.theme.klerosUIComponentsPrimaryBlue};
  }

  .button-loading {
    fill: ${(props) =>
      props.disabled
        ? props.theme.klerosUIComponentsStroke
        : props.theme.klerosUIComponentsPrimaryBlue};
  }

  :hover {
    background: ${(props) =>
      props.disabled
        ? props.theme.klerosUIComponentsLightGrey
        : props.theme.klerosUIComponentsMediumBlue};
  }
`;

export default SecondaryButton;
