import React from "react";
import styled from "styled-components";
import Spine, { VariantProp, variantColor } from "./spine";
export type { VariantProp };
import { h2, p, small } from "../../../styles/common-style";

export interface SideProp {
  rightSided?: boolean;
}

const Wrapper = styled.div<SideProp>`
  display: flex;
  justify-content: ${({ rightSided }) =>
    rightSided ? "flex-start" : "flex-end"};
`;

const StyledTitle = styled.h2``;
const StyledParty = styled.p``;
const StyledSubtitle = styled.small``;

const TextContainer = styled.div<SideProp & VariantProp>`
  margin-${({ rightSided }) => (rightSided ? "left" : "right")}: 20px;
  order: ${({ rightSided }) => (rightSided ? 1 : -1)};
  display: flex;
  flex-direction: column;  
  margin-bottom: 18px;
  gap: 2px;
  text-align: ${({ rightSided }) => (rightSided ? "left" : "right")};

  @media (max-width: 900px) {
    margin-${({ rightSided }) => (rightSided ? "left" : "right")}: 16px;
    margin-bottom: 16px;
    gap: 4px;

  }
  
  & ${StyledTitle} {
    ${h2}
    order: ${({ rightSided }) => (rightSided ? 1 : 2)};
    font-size: 14px;
    line-height: 19px;
    color: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
  }

  & ${StyledParty} {
    ${p}
    order: ${({ rightSided }) => (rightSided ? 2 : 1)};
    
    font-size: 14px;
    line-height: 19px;
    color: ${variantColor};
  }

  & ${StyledSubtitle} {
    ${small}
    align-self: flex-${({ rightSided }) => (rightSided ? "start" : "end")};
    font-size: 12px;
    line-height: 16px;
  }
`;

const PartyTitleContainer = styled.div<SideProp>`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 4px 8px;
  justify-content: ${({ rightSided }) =>
    rightSided ? "flex-start" : "flex-end"};
`;

interface BulletProps extends VariantProp, SideProp {
  title: string;
  party: string;
  subtitle: string;
  active?: boolean;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
  line?: boolean;
}

const Bullet: React.FC<BulletProps> = (props) => {
  const { title, party, subtitle, ...restProps } = props;
  const { rightSided, variant, line, Icon, ...wrapperProps } = restProps;

  return (
    <Wrapper {...{ rightSided }} {...wrapperProps}>
      <Spine {...{ variant, line, Icon }} />
      <TextContainer {...{ variant, rightSided }}>
        <PartyTitleContainer {...{ rightSided }}>
          <StyledTitle>{title}</StyledTitle>
          <StyledParty>{party}</StyledParty>
        </PartyTitleContainer>
        <StyledSubtitle>{subtitle}</StyledSubtitle>
      </TextContainer>
    </Wrapper>
  );
};

export default Bullet;
