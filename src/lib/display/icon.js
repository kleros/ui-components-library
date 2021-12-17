import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Card from "../container/card";

const StyledCard = styled(Card)`
  height: 80px;
  width: 288px;
  padding: 16px;
  display: flex;
`;

const Text = styled.div`
  height: 100%;
  width: auto;
  margin-left: 16px;
  flex-direction: column;
  align-items: start;
  justify-content: center;

  color: ${(props) => props.theme.primaryText};
  font-size: 24px;
  font-weight: 600;
`;

const Label = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: ${(props) => props.theme.secondaryText};
`;

const IconCard = styled(Card)`
  height: 48px;
  width: 48px;
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    max-height: 32px;
    max-width: 32px;
  }
`;

const DisplayIcon = ({ text, icon, label }) => {
  return (
    <StyledCard>
      <IconCard> {icon} </IconCard>
      <Text>
        {text}
        <Label> {label} </Label>
      </Text>
    </StyledCard>
  );
};

DisplayIcon.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  label: PropTypes.string,
};

export default DisplayIcon;
