import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Card from "../container/card";

const Wrapper = styled.div`
  width: 217px;
  display: flex;
  flex-direction: column;

  font-size: 14px;
  color: ${(props) => props.theme.primaryText};
`;

const StyledCard = styled(Card)`
  height: 45px;
  width: 100%;
  margin-top: 16px;
  display: flex;
  align-items: center;
  padding: 0px 16px;

  color: ${(props) => props.theme.primaryText};
  font-size: 16px;
  font-weight: 600;

  svg {
    max-height: 16px;
    max-width: 16px;
    margin-right: 8px;
  }
`;

const DisplaySmall = ({ text, icon, label }) => {
  return (
    <Wrapper>
      {label}
      <StyledCard>
        {icon}
        {text}
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
