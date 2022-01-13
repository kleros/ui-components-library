import React from "react";
import styled from "styled-components";
import Card from "../container/card";
import { DisplayIconProps } from "./icon";

const Wrapper = styled.div`
  width: 217px;
  display: flex;
  flex-direction: column;

  small {
    color: ${(props) => props.theme.primaryText};
  }
`;

const StyledCard = styled(Card)`
  height: 45px;
  width: 100%;
  margin-top: 16px;
  display: flex;
  align-items: center;
  padding: 0px 16px;

  svg {
    max-height: 16px;
    max-width: 16px;
    margin-right: 8px;
  }
`;

const DisplaySmall: React.FC<DisplayIconProps> = ({
  text,
  icon,
  label,
  ...props
}) => (
  <Wrapper {...props}>
    <small>{label}</small>
    <StyledCard>
      {icon}
      <h2>{text}</h2>
    </StyledCard>
  </Wrapper>
);

export default DisplaySmall;
