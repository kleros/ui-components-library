import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Card from "../container/card";

const Wrapper = styled.div`
  width: 217px;
  display: flex;
  flex-direction: column;

  small {
    color: ${(props) => props.theme.primaryText};
  }
`;

const StyledCard = styled(Card)`
  height: 45px;
  width: 100%;
  margin-top: 16px;
  display: flex;
  align-items: center;
  padding: 0px 16px;

  svg {
    max-height: 16px;
    max-width: 16px;
    margin-right: 8px;
  }
`;

const DisplaySmall = ({ text, icon, label, ...props }) => {
  return (
    <Wrapper {...props}>
      <small>{label}</small>
      <StyledCard>
        {icon}
        <h2>{text}</h2>
      </StyledCard>
    </Wrapper>
  );
};

DisplaySmall.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.node,
  label: PropTypes.string,
};

export default DisplaySmall;
