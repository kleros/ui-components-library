import React from "react";
import styled from "styled-components";
import Card from "../container/card";
import { DisplayIconProps } from "./icon";
import { borderBox, svg, h2, small } from "../../styles/common-style";

const Wrapper = styled.div`
  ${borderBox}
  width: 217px;
  display: flex;
  flex-direction: column;
`;

const StyledLabel = styled.small`
  ${small}
  color: ${(props) => props.theme.primaryText};
`;

const StyledCard = styled(Card)`
  height: 45px;
  width: 100%;
  margin-top: 16px;
  display: flex;
  align-items: center;
  padding: 0px 16px;

  .display-icon {
    ${svg}
    max-height: 16px;
    max-width: 16px;
    margin-right: 8px;
  }
`;

const StyledText = styled.h2`
  ${h2}
`;

const DisplaySmall: React.FC<DisplayIconProps> = ({
  text,
  icon,
  label,
  ...props
}) => (
  <Wrapper {...props}>
    <StyledLabel>{label}</StyledLabel>
    <StyledCard>
      {icon && icon("display-icon")}
      <StyledText>{text}</StyledText>
    </StyledCard>
  </Wrapper>
);

export default DisplaySmall;
