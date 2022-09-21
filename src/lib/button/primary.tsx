import styled from "styled-components";
import BaseButton from "./base";

const PrimaryButton = styled(BaseButton)`
  background: ${(props) =>
    props.disabled ? props.theme.lightGrey : props.theme.primaryBlue};

  .button-text {
    color: ${(props) =>
      props.disabled ? props.theme.stroke : props.theme.whiteBackground};
  }

  .button-svg {
    fill: ${(props) =>
      props.disabled ? props.theme.stroke : props.theme.whiteBackground};
  }

  .button-loading {
    fill: ${(props) =>
      props.disabled ? props.theme.stroke : props.theme.whiteBackground};
  }

  :hover {
    background: ${(props) =>
      props.disabled ? props.theme.lightGrey : props.theme.secondaryBlue};
  }
`;

export default PrimaryButton;
