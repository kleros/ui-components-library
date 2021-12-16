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

  color: ${(props) => props.theme.primaryText};
  font-size: 24px;
  font-weight: 600;

  svg {
    position: absolute;
    top: 16px;
    right: 16px;
    max-height: 16px;
    max-width: 16px;
  }
`;

const Label = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: ${(props) => props.theme.secondaryText};
`;

const DisplayLarge = ({ text, icon, label }) => {
  return (
    <StyledCard>
      {icon && icon()}
      {text}
      <Label> {label} </Label>
    </StyledCard>
  );
};

DisplayLarge.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.func,
  label: PropTypes.string,
};

export default DisplayLarge;
