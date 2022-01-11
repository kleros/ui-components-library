import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Card from "../container/card";

const StyledCard = styled(Card)`
  position: relative;
  height: 80px;
  width: 288px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;

  svg {
    position: absolute;
    top: 16px;
    right: 16px;
    max-height: 16px;
    max-width: 16px;
  }
`;

const DisplayLarge = ({ text, icon, label, ...props }) => (
  <StyledCard {...props}>
    {icon}
    <h1>{text}</h1>
    <small>{label}</small>
  </StyledCard>
);

DisplayLarge.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.node,
  label: PropTypes.string,
};

export default DisplayLarge;
