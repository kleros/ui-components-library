import React from "react";
import styled from "styled-components";
import Bullet, { SideProp, StateProp, VariantProp } from "./bullet";
import { borderBox } from "../../../styles/common-style";

interface TimelineItem extends SideProp, VariantProp, StateProp {
  title: string;
  party: string | React.ReactElement;
  subtitle: string;
  Icon?: React.FC<React.SVGAttributes<SVGElement>>;
}

const Wrapper = styled.div`
  ${borderBox}
  display: flex;
  flex-direction: column;
`;

const LastBullet = styled(Bullet)`
  height: unset;
  flex-basis: auto;
  flex-grow: 0;
`;

interface ICustomTimelineProps {
  items: [TimelineItem, ...TimelineItem[]];
}

const CustomTimeline: React.FC<ICustomTimelineProps> = ({
  items,
  ...props
}) => {
  const lastItem = items[items.length - 1];
  return (
    <Wrapper {...props}>
      {items.slice(0, -1).map((item, i) => (
        <Bullet key={i} line {...item} rightSided isLast={false} />
      ))}
      <LastBullet rightSided {...lastItem} isLast={true} />
    </Wrapper>
  );
};
export default CustomTimeline;
