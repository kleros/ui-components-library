import React from "react";
import styled from "styled-components";
import Bullet from "./bullet";

interface TimelineItem {
  title: string;
  party: string;
  subtitle: string;
  accepted?: boolean;
  active?: boolean;
  refused?: boolean;
  leftSided?: boolean;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledBullet = styled(Bullet)<TimelineItem>`
  position: relative;
  transform: translateX(
    ${({ leftSided }) => (leftSided ? "calc(-50% + 8px)" : "calc(50% - 8px)")}
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
        <StyledBullet key={i} line {...item} />
      ))}
      <LastBullet {...lastItem} />
    </Wrapper>
  );
};

export default Timeline;
