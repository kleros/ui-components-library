import React from "react";
import styled from "styled-components";
import BulletCircle from "./bullet-circle";
import { h2, small } from "../../../styles/common-style";

const Wrapper = styled.div`
  flex-basis: 0;
  flex-grow: 1;
  width: fit-content;
  display: flex;
`;

const StyledTitle = styled.h2``;
const StyledBody = styled.small``;

const TextContainer = styled.div<{ active?: boolean }>`
  margin-left: 16px;
  margin-top: 2px;

  & ${StyledTitle} {
    ${h2}
    font-size: 14px;
    line-height: 19px;
    color: ${(props) =>
      props.active
        ? props.theme.klerosUIComponentsPrimaryText
        : props.theme.klerosUIComponentsSecondaryText};
  }

  & ${StyledBody} {
    ${small}
    font-size: 12px;
    line-height: 16px;
  }
`;

const SubitemsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

interface BulletProps {
  index: number;
  title: string;
  subitems?: string[];
  active?: boolean;
  completed?: boolean;
  line?: boolean;
}

const Bullet: React.FC<BulletProps> = ({
  title,
  subitems,
  index,
  active,
  completed,
  line,
  ...props
}) => (
  <Wrapper {...props}>
    <BulletCircle
      index={index}
      active={active}
      completed={completed}
      line={line}
    />
    <TextContainer active={active}>
      <StyledTitle>{title}</StyledTitle>
      {subitems && (
        <SubitemsContainer>
          {subitems.map((item, i) => (
            <StyledBody key={i}>{item}</StyledBody>
          ))}
        </SubitemsContainer>
      )}
    </TextContainer>
  </Wrapper>
);

export default Bullet;
