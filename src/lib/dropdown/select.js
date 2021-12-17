import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import useFocusOutside from "../../hooks/use-focus-outside";
import styled from "styled-components";
import DropdownButton from "./button";
import SelectItem from "./select-item";

const DropDownContainer = styled.div``;

const DropDownListContainer = styled.div`
  position: absolute;
  z-index: 100;
  width: 240px;
  overflow: hidden;
  height: ${(props) => (props.isOpen ? props.totalHeight.toString() : "0")}px;
  box-shadow: 0px 2px 3px ${(props) => props.theme.defaultShadow};

  transition: height ease ${(props) => props.theme.transitionSpeed};
`;

const DropDownList = styled.div`
  background-color: ${(props) => props.theme.whiteBackground};
  border-radius: 3px;
  border: 1px solid ${(props) => props.theme.stroke};
  padding: 16px 0px;
`;

const DropdownSelect = ({ items, defaultValue, defaultNode, callback }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue);
  const containerRef = useRef(null);
  useFocusOutside(containerRef, () => setIsOpen(false));
  const heightRef = useRef(0);
  const currentItem = items.find(({ value }) => value === selected);
  return (
    <DropDownContainer ref={containerRef}>
      <DropdownButton
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        node={
          currentItem ? (
            <SelectItem
              current
              text={currentItem.text}
              dot={currentItem.dot}
              icon={currentItem.icon}
            />
          ) : (
            defaultNode
          )
        }
      />
      <DropDownListContainer
        isOpen={isOpen}
        totalHeight={heightRef.current + 2}
      >
        <DropDownList
          ref={(ref) => (heightRef.current = ref?.clientHeight || 0)}
        >
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
  defaultValue: PropTypes.any,
  defaultNode: PropTypes.node,
  callback: PropTypes.func.isRequired,
};

export default DropdownSelect;
