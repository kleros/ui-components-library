import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Dot from "../dot";

const ListItem = styled.div`
  background: ${(props) =>
    props.selected ? props.theme.mediumBlue : props.theme.whiteBackground};
  border-left: 3px solid
    ${(props) =>
      props.selected ? props.theme.primaryBlue : props.theme.whiteBackground};
  padding: ${(props) =>
    props.current ? "10.5px 16px 10.5px 13px" : "11.5px 16px 11.5px 13px"};
  display: flex;
  align-items: center;

  ${(props) => {
    if (!props.current)
      return `
        :hover {
          background: ${props.theme.mediumBlue};
          border-left: 3px solid
            ${
              props.selected ? props.theme.primaryBlue : props.theme.mediumBlue
            };}`;
  }}

  p {
    font-size: 16px;
    user-select: none;
  }

  svg {
    max-height: 16px;
    max-width: 16px;
    min-height: 12px;
    min-width: 12px;
  }
`;

const StyledDot = styled(Dot)`
  margin-right: 8px;
`;

const SelectItem = ({ text, icon, dot, selected, current, onClick }) => (
  <ListItem selected={selected} current={current} onClick={onClick}>
    {icon}
    {dot && <StyledDot color={dot} />}
    <p>{text}</p>
  </ListItem>
);

SelectItem.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.node,
  dot: PropTypes.string,
  selected: PropTypes.bool,
  current: PropTypes.bool,
  onClick: PropTypes.func,
};

export default SelectItem;
