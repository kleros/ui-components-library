import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import BulletCircle from "./bullet-circle";

const Wrapper = styled.div`
  flex-basis: 0;
  flex-grow: 1;
  width: fit-content;
  display: flex;
`;

const TextContainer = styled.div`
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

const Bullet = (props) => {
  const { title, subitems, ...restProps } = props;
  const { index, active, completed, line, ...wrapperProps } = restProps;
  return (
    <Wrapper {...wrapperProps}>
      <BulletCircle {...{ index, active, completed, line }} />
      <TextContainer {...{ active }}>
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
};

Bullet.propTypes = {
  index: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  subitems: PropTypes.arrayOf(PropTypes.string),
  active: PropTypes.bool,
  completed: PropTypes.bool,
  line: PropTypes.bool,
};

export default Bullet;
