import React from "react";
import styled, { css } from "styled-components";
import BulletCircle from "./bullet-circle";
import { h2, small, mobileStyle } from "../../../styles/common-style";

interface IContainer {
  last?: boolean;
  completed?: boolean;
}

const Container = styled.div<IContainer>`
  position: relative;
  height: fit-content;
  display: flex;
  justify-content: center;
  align-items: start;

  ${({ theme, last, completed }) =>
    last
      ? css`
          flex-grow: 0;
        `
      : css`
          flex-grow: 1;
          :after {
            content: "";
            height: 0px;
            width: auto;
            flex-grow: 1;
            border-top: 1px solid
              ${completed
                ? theme.klerosUIComponentsPrimaryBlue
                : theme.klerosUIComponentsStroke};
            margin: 12px 16px;
          }
        `}
`;

interface ITextWrapper {
  active?: boolean;
}

const TextWrapper = styled.div<ITextWrapper>`
  margin-left: 8px;
  display: flex;
  flex-direction: column;
  align-items: start;

  > h2 {
    ${h2}
    font-size: 14px;
    line-height: 24px;
    color: ${(props) =>
      props.active
        ? props.theme.klerosUIComponentsPrimaryText
        : props.theme.klerosUIComponentsSecondaryText};
  }

  > small {
    ${small}
    font-size: 12px;
    line-height: 16px;
  }

  ${mobileStyle(
    () => css`
      position: absolute;
      top: 24px;
      left: 0;
      margin-left: 0px;
      transform: translateX(calc(-50% + 12px));
      align-items: center;
      text-align: center;

      > h2 {
        line-height: 19px;
      }
    `
  )}
`;

interface HorizontalBulletProps extends IContainer, ITextWrapper {
  index: number;
  title: string;
  subitems?: string[];
}

const HorizontalBullet: React.FC<HorizontalBulletProps> = ({
  index,
  title,
  subitems,
  active,
  last,
  completed,
  ...props
}) => (
  <Container {...{ active, completed, last }} {...props}>
    <BulletCircle {...{ active, completed, index }} />
    <TextWrapper {...{ active }}>
      <h2>{title}</h2>
      {subitems && subitems.map((item, i) => <small key={i}>{item}</small>)}
    </TextWrapper>
  </Container>
);

export default HorizontalBullet;
