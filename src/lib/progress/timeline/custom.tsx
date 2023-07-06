import React from "react";
import styled from "styled-components";
import Bullet, { SideProp, VariantProp } from "./bullet";
import { borderBox } from "../../../styles/common-style";

interface TimelineItem extends SideProp, VariantProp {
  title: string;
  party: string;
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
        <Bullet key={i} line {...item} rightSided />
      ))}
      <LastBullet rightSided {...lastItem} />
    </Wrapper>
  );
};
export default CustomTimeline;
