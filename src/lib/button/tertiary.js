import styled from "styled-components";
import BaseButton from "./base";

const TertiaryButton = styled(BaseButton)`
  background: ${(props) => props.theme.secondaryPurple};

  p {
    color: white;
  }

  :hover {
    background: ${(props) => props.theme.primaryPurple};
  }
`;

export default TertiaryButton;
