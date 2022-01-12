import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
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

const Steps = ({ items, currentItemIndex, ...props }) => (
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
      title={items.at(-1).title}
      subitems={items.at(-1).subitems}
      completed={items.length - 1 < currentItemIndex}
      active={items.length - 1 === currentItemIndex}
      index={items.length}
    />
  </Wrapper>
);

Steps.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      subitems: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
  currentItemIndex: PropTypes.number.isRequired,
};

export default Steps;
