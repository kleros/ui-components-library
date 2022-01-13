import React from "react";
import styled from "styled-components";
import BulletCircle from "./bullet-circle";

const Wrapper = styled.div`
  flex-basis: 0;
  flex-grow: 1;
  width: fit-content;
  display: flex;
`;

const TextContainer = styled.div<{ active?: boolean }>`
  margin-left: 16px;
  margin-top: 2px;

  h2 {
    font-size: 14px;
    line-height: 19px;
    color: ${(props) =>
      props.active ? props.theme.primaryText : props.theme.secondaryText};
  }

  small {
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
      <h2>{title}</h2>
      {subitems && (
        <SubitemsContainer>
          {subitems.map((item, i) => (
            <small key={i}>{item}</small>
          ))}
        </SubitemsContainer>
      )}
    </TextContainer>
  </Wrapper>
);

export default Bullet;
