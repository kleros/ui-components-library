import React from "react";
import styled from "styled-components";
import Card from "../container/card";
import { borderBox, svg, h1, small } from "../../styles/common-style";

const StyledCard = styled(Card)`
  height: 80px;
  width: 288px;
  padding: 16px;
  display: flex;
`;

const Text = styled.div`
  ${borderBox}
  height: 100%;
  width: auto;
  margin-left: 16px;
  flex-direction: column;
  align-items: start;
  justify-content: center;

  .display-text {
    ${h1}
  }

  .display-label {
    ${small}
  }
`;

const IconCard = styled(Card)`
  height: 48px;
  width: 48px;
  display: flex;
  justify-content: center;
  align-items: center;

  .display-icon {
    ${svg}
    max-height: 32px;
    max-width: 32px;
  }
`;

export interface DisplayIconProps {
  text: string;
  Icon: React.FC<React.SVGAttributes<SVGElement>>;
  label?: string;
}

const DisplayIcon: React.FC<DisplayIconProps> = ({
  text,
  Icon,
  label,
  ...props
}) => {
  return (
    <StyledCard {...props}>
      <IconCard>
        <Icon className="display-icon" />
      </IconCard>
      <Text>
        <h1 className="display-text">{text}</h1>
        <small className="display-label">{label}</small>
      </Text>
    </StyledCard>
  );
};

export default DisplayIcon;
