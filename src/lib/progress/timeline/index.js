import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Bullet from "./bullet";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledBullet = styled(Bullet)`
  position: relative;
  transform: translateX(
    ${(props) => (props.left ? "calc(-50% + 8px)" : "calc(50% - 8px)")}
  );
`;

const LastBullet = styled(StyledBullet)`
  height: unset;
  flex-basis: auto;
  flex-grow: 0;
`;

const Timeline = ({ items, ...props }) => {
  const lastItem = items.at(-1);
  return (
    <Wrapper {...props}>
      {items.slice(0, -1).map((item, i) => (
        <StyledBullet key={i} line {...item} />
      ))}
      <LastBullet {...lastItem} />
    </Wrapper>
  );
};

Timeline.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      party: PropTypes.string.isRequired,
      subtitle: PropTypes.string.isRequired,
      accepted: PropTypes.bool,
      active: PropTypes.bool,
      refused: PropTypes.bool,
      left: PropTypes.bool,
      right: PropTypes.bool,
    })
  ).isRequired,
};

export default Timeline;
