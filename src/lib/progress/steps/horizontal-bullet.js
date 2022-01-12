import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import BulletCircle from "./bullet-circle";

const Wrapper = styled.div`
  flex-grow: 1;
  height: fit-content;
  display: flex;
  justify-content: center;
  align-items: center;

  h2 {
    font-size: 14px;
    line-height: 19px;
    margin-left: 8px;
    color: ${(props) =>
      props.active ? props.theme.primaryText : props.theme.secondaryText};
  }
`;

const Line = styled.div`
  height: 0px;
  width: auto;
  flex-grow: 1;
  border-top: 1px solid
    ${(props) =>
      props.completed ? props.theme.primaryBlue : props.theme.stroke};
  margin: 0px 16px;
`;

const HorizontalBullet = ({
  index,
  title,
  active,
  completed,
  line,
  ...props
}) => (
  <Wrapper {...{ active }} {...props}>
    <BulletCircle {...{ active, completed, index }} />
    <h2>{title}</h2>
    {line && <Line {...{ completed }} />}
  </Wrapper>
);

HorizontalBullet.propTypes = {
  index: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  active: PropTypes.bool,
  completed: PropTypes.bool,
  line: PropTypes.bool,
};

export default HorizontalBullet;
