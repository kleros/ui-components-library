import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Bullet from "./bullet";

const Wrapper = styled.div`
  height: 100px;
  display: flex;
  flex-direction: column;
`;

const Steps = ({ items, currentItemIndex, ...props }) => (
  <Wrapper {...props}>
    {items.map(({ title, subitems }, i) => (
      <Bullet
        {...{ title, subitems }}
        completed={i < currentItemIndex}
        active={i === currentItemIndex}
        line={!(i + 1 === items.length)}
        index={i + 1}
        key={i}
      />
    ))}
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
