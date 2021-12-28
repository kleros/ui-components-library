import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const Wrapper = styled.div`
  height: fit-content;
  width: 500px;
  display: flex;
`;

const StyledTab = styled.button`
  flex-grow: 1;
  height: 45px;
  background: ${(props) => props.theme.lightBackground};
  border-bottom: 3px solid
    ${(props) =>
      props.selected ? props.theme.primaryBlue : props.theme.stroke};
  display: flex;
  align-items: center;
  justify-content: center;

  color: ${(props) =>
    props.disabled ? props.theme.stroke : props.theme.primaryText};

  ${(props) =>
    !props.disabled && !props.selected
      ? `:hover {
            border-bottom: 3px solid ${props.theme.secondaryBlue};
          }`
      : ""}
`;

const Tabs = (props) => {
  return (
    <Wrapper {...props}>
      {props.items.map(({ icon, text, value, disabled }) => (
        <StyledTab
          disabled={disabled}
          selected={value === props.currentValue}
          key={value}
          onClick={() => props.callback(value)}
        >
          {icon}
          {text}
        </StyledTab>
      ))}
    </Wrapper>
  );
};

Tabs.propTypes = {
  currentValue: PropTypes.any.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node,
      text: PropTypes.string.isRequired,
      value: PropTypes.any.isRequired,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  callback: PropTypes.func.isRequired,
};

export default Tabs;
