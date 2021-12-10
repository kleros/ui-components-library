import React, { useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import DropdownButton from "./button";
import SelectItem from "./select-item";

const DropDownContainer = styled("div")``;
const DropDownListContainer = styled("div")`
  position: absolute;
  z-index: 100;
  width: 240px;
  overflow: hidden;
  height: ${(props) => (props.isOpen ? props.length.toString() + "px" : "0px")};

  transition: height ease 0.5s;
`;
const DropDownList = styled.div`
  background-color: ${(props) => props.theme.lightBackground};
  border-radius: 3px;
  box-shadow: 0px 2px 3px ${(props) => props.theme.stroke}80;
  border: 1px solid ${(props) => props.theme.stroke};
  padding: 16px 0px;
`;

const DropdownSelect = ({ items, defaultValue, callback }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue);
  const currentItem = items.find(({ value }) => value === selected);
  return (
    <DropDownContainer tabIndex={0} onBlur={() => setIsOpen(false)}>
      <DropdownButton
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        current={
          <SelectItem
            title
            text={currentItem.text}
            dot={currentItem.dot}
            icon={currentItem.icon}
          />
        }
      />
      <DropDownListContainer isOpen={isOpen} length={items.length * 45 + 34}>
        <DropDownList>
          {items.map(({ text, icon, dot, value }, i) => (
            <SelectItem
              key={i}
              text={text}
              dot={dot}
              icon={icon}
              selected={value === currentItem.value}
              onClick={() => {
                callback(value);
                setSelected(value);
              }}
            />
          ))}
        </DropDownList>
      </DropDownListContainer>
    </DropDownContainer>
  );
};

DropdownSelect.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      dot: PropTypes.string,
      icon: PropTypes.node,
      value: PropTypes.any.isRequired,
    })
  ).isRequired,
  defaultValue: PropTypes.any.isRequired,
  callback: PropTypes.func.isRequired,
};

export default DropdownSelect;
