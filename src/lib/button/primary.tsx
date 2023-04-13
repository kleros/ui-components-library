import styled from "styled-components";
import BaseButton from "./base";

const PrimaryButton = styled(BaseButton)`
  background: ${(props) =>
    props.disabled
      ? props.theme.klerosUIComponentsLightGrey
      : props.theme.klerosUIComponentsPrimaryBlue};

  .button-text {
    color: ${(props) =>
      props.disabled
        ? props.theme.klerosUIComponentsStroke
        : props.theme.klerosUIComponentsWhiteBackground};
  }

  .button-svg {
    fill: ${(props) =>
      props.disabled
        ? props.theme.klerosUIComponentsStroke
        : props.theme.klerosUIComponentsWhiteBackground};
  }

  .button-loading {
    fill: ${(props) =>
      props.disabled
        ? props.theme.klerosUIComponentsStroke
        : props.theme.klerosUIComponentsWhiteBackground};
  }

  :hover {
    background: ${(props) =>
      props.disabled
        ? props.theme.klerosUIComponentsLightGrey
        : props.theme.klerosUIComponentsSecondaryBlue};
  }
`;

export default PrimaryButton;
