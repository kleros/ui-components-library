import React from "react";
import styled from "styled-components";
import Spine, { VariantProp, variantColor } from "./spine";
export type { VariantProp };

export interface SideProp {
  rightSided?: boolean;
}

const Wrapper = styled.div<SideProp>`
  height: 50px;
  width: 100%;
  display: flex;
  justify-content: ${({ rightSided }) =>
    rightSided ? "flex-start" : "flex-end"};
`;

const TextContainer = styled.div<SideProp & VariantProp>`
  margin-${({ rightSided }) => (rightSided ? "left" : "right")}: 24px;
  order: ${({ rightSided }) => (rightSided ? 1 : -1)};
  display: flex;
  flex-direction: column;

  h2 {
    order: ${({ rightSided }) => (rightSided ? 1 : 2)};
    font-size: 14px;
    line-height: 19px;
    color: ${({ theme }) => theme.primaryText};
  }

  p {
    order: ${({ rightSided }) => (rightSided ? 2 : 1)};
    margin-${({ rightSided }) => (rightSided ? "left" : "right")}: 8px;
    font-size: 14px;
    line-height: 19px;
    color: ${variantColor};
  }

  small {
    align-self: flex-${({ rightSided }) => (rightSided ? "start" : "end")};
    font-size: 12px;
    line-height: 16px;
  }
`;

const PartyTitleContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

interface BulletProps extends VariantProp, SideProp {
  title: string;
  party: string;
  subtitle: string;
  active?: boolean;
  line?: boolean;
}

const Bullet: React.FC<BulletProps> = (props) => {
  const { title, party, subtitle, ...restProps } = props;
  const { rightSided, variant, line, ...wrapperProps } = restProps;

  return (
    <Wrapper {...{ rightSided }} {...wrapperProps}>
      <Spine {...{ variant, line }} />
      <TextContainer {...{ variant, rightSided }}>
        <PartyTitleContainer>
          <h2>{title}</h2>
          <p>{party}</p>
        </PartyTitleContainer>
        <small>{subtitle}</small>
      </TextContainer>
    </Wrapper>
  );
};

export default Bullet;
