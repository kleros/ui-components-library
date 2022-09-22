import React from "react";
import styled from "styled-components";
import { StepsProps } from ".";
import Bullet from "./bullet";

const Wrapper = styled.div`
  height: 100px;
  display: flex;
  flex-direction: column;
`;

const BulletsContainer = styled.div`
  height: auto;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const LastBullet = styled(Bullet)`
  flex-basis: auto;
  flex-grow: 0;
`;

const Steps: React.FC<StepsProps> = ({ items, currentItemIndex, ...props }) => {
  const lastItem = items[items.length - 1];
  return (
    <Wrapper {...props}>
      <BulletsContainer>
        {items.slice(0, -1).map(({ title, subitems }, i) => (
          <Bullet
            {...{ title, subitems }}
            completed={i < currentItemIndex}
            active={i === currentItemIndex}
            line={!(i + 1 === items.length)}
            index={i + 1}
            key={i}
          />
        ))}
      </BulletsContainer>
      <LastBullet
        title={lastItem.title}
        subitems={lastItem.subitems}
        completed={items.length - 1 < currentItemIndex}
        active={items.length - 1 === currentItemIndex}
        index={items.length}
      />
    </Wrapper>
  );
};

export default Steps;
