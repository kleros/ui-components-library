import React from "react";
import styled, { css } from "styled-components";
import Spine from "./spine";

const Wrapper = styled.div`
  height: 50px;
  width: 100%;
  display: flex;
`;

export type VariantProp = { variant?: "accepted" | "refused" };

const variantColor = css<VariantProp>`
  ${({ variant, theme }) => {
    if (variant === "accepted") return theme.success;
    if (variant === "refused") return theme.error;
    return theme.primaryBlue;
  }}
`;

interface TextContainerProps extends VariantProp {
  rightSided?: boolean;
}

const TextContainer = styled.div<TextContainerProps>`
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

interface BulletProps {
  title: string;
  party: string;
  subtitle: string;
  rightSided?: boolean;
  variant?: "accepted" | "refused";
  active?: boolean;
  line?: boolean;
}

const Bullet: React.FC<BulletProps> = ({ rightSided, variant, ...props }) => {
  const { title, party, subtitle, ...restProps } = props;
  const { active, line, ...wrapperProps } = restProps;

  return (
    <Wrapper {...wrapperProps}>
      <Spine
        variant={variant}
        {...{ line }}
        //! active={active}?
      />
      <TextContainer
        variant={variant}
        rightSided={rightSided}
        //! active={active}?
      >
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
