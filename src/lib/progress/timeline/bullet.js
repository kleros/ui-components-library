import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Spine from "./spine";

const Wrapper = styled.div`
  height: 50px;
  width: 100%;
  display: flex;
`;

const TextContainer = styled.div`
  margin-${(props) => (props.right ? "left" : "right")}: 24px;
  order: ${(props) => (props.right ? 1 : -1)};
  display: flex;
  flex-direction: column;

  h2 {
    order: ${(props) => (props.right ? 1 : 2)};
    font-size: 14px;
    line-height: 19px;
    color: ${(props) => props.theme.primaryText};
  }

  p {
    order: ${(props) => (props.right ? 2 : 1)};
    margin-${(props) => (props.right ? "left" : "right")}: 8px;
    font-size: 14px;
    line-height: 19px;
    color: ${(props) => {
      if (props.accepted) return props.theme.success;
      else if (props.refused) return props.theme.error;
      else return props.theme.primaryBlue;
    }};
  }

  small {
    align-self: flex-${(props) => (props.right ? "start" : "end")};
    font-size: 12px;
    line-height: 16px;
  }
`;

const PartyTitleContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const Bullet = (props) => {
  const { title, party, subtitle, left, right, ...restProps } = props;
  const { active, accepted, refused, line, ...wrapperProps } = restProps;
  return (
    <Wrapper {...wrapperProps}>
      <Spine {...{ active, accepted, refused, line }} />
      <TextContainer {...{ active, accepted, refused, right, left }}>
        <PartyTitleContainer>
          <h2>{title}</h2>
          <p>{party}</p>
        </PartyTitleContainer>
        <small>{subtitle}</small>
      </TextContainer>
    </Wrapper>
  );
};

Bullet.propTypes = {
  title: PropTypes.string.isRequired,
  party: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  right: PropTypes.bool,
  left: PropTypes.bool,
  active: PropTypes.bool,
  accepted: PropTypes.bool,
  refused: PropTypes.bool,
  line: PropTypes.bool,
};

export default Bullet;
