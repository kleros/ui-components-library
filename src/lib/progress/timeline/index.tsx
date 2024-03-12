import React from "react";
import styled from "styled-components";
import Bullet, { SideProp, VariantProp } from "./bullet";
import { borderBox } from "../../../styles/common-style";

const Wrapper = styled.div`
  ${borderBox}
  display: flex;
  flex-direction: column;
`;

interface TimelineItem extends SideProp, VariantProp {
  title: string;
  party: string;
  subtitle: string;
}

const StyledBullet = styled(Bullet)`
  position: relative;
  transform: translateX(
    ${({ rightSided }) => (rightSided ? "calc(50% - 8px)" : "calc(-50% + 8px)")}
  );
`;

const LastBullet = styled(StyledBullet)`
  height: unset;
  flex-basis: auto;
  flex-grow: 0;
`;

interface TimelineProps {
  items: [TimelineItem, ...TimelineItem[]];
}

const Timeline: React.FC<TimelineProps> = ({ items, ...props }) => {
  const lastItem = items[items.length - 1];
  return (
    <Wrapper {...props}>
      {items.slice(0, -1).map((item, i) => (
        <StyledBullet key={i} line {...item} isLast={false} />
      ))}
      <LastBullet {...lastItem} isLast={true} />
    </Wrapper>
  );
};

export default Timeline;
