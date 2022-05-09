import React from "react";
import styled from "styled-components";
import Card from "../container/card";
import { DisplayIconProps } from "./icon";
import { svg, h1, small } from "../../styles/common-style";

const StyledCard = styled(Card)`
  position: relative;
  height: 80px;
  width: 288px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;

  .display-icon {
    ${svg}
    position: absolute;
    top: 16px;
    right: 16px;
    max-height: 16px;
    max-width: 16px;
  }

  .display-text {
    ${h1}
  }

  .display-label {
    ${small}
  }
`;

const DisplayLarge: React.FC<DisplayIconProps> = ({
  text,
  Icon,
  label,
  ...props
}) => (
  <StyledCard {...props}>
    {Icon && <Icon className="display-icon" />}
    <h1 className="display-text">{text}</h1>
    <small className="display-label">{label}</small>
  </StyledCard>
);

export default DisplayLarge;
