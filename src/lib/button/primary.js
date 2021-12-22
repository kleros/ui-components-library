import styled from "styled-components";
import BaseButton from "./base";

const PrimaryButton = styled(BaseButton)`
  background: ${(props) =>
    props.disabled ? props.theme.lightGrey : props.theme.primaryBlue};

  p {
    color: ${(props) => (props.disabled ? props.theme.stroke : "white")};
  }

  :hover {
    background: ${(props) =>
      props.disabled ? props.theme.lightGrey : props.theme.secondaryBlue};
  }
`;

export default PrimaryButton;
