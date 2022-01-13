import React, { useState, useRef, ReactNode } from "react";
import useFocusOutside from "../../hooks/use-focus-outside";
import styled from "styled-components";
import DropdownButton from "./button";
import SelectItem from "./select-item";

const DropDownContainer = styled.div``;

interface DropDownListContainerProps {
  isOpen: boolean;
  totalHeight: number;
}

const DropDownListContainer = styled.div<DropDownListContainerProps>`
  position: absolute;
  z-index: 100;
  width: 240px;
  overflow: hidden;
  height: ${(props) => (props.isOpen ? props.totalHeight.toString() : "0")}px;
  box-shadow: 0px 2px 3px ${({ theme }) => theme.defaultShadow};
  transition: height ease ${({ theme }) => theme.transitionSpeed};
`;

const DropDownList = styled.div`
  background-color: ${({ theme }) => theme.whiteBackground};
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.stroke};
  padding: 16px 0px;
`;

interface DropdownSelectItem {
  text: string;
  dot?: string;
  icon?: ReactNode;
  value: any;
}

interface DropdownSelectProps {
  items: DropdownSelectItem[];
  defaultValue?: any;
  defaultNode?: ReactNode;
  // eslint-disable-next-line @typescript-eslint/ban-types
  callback: Function;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  items,
  defaultValue,
  defaultNode,
  callback,
}) => {
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
              selected={value === currentItem?.value}
              onClick={() => {
                callback(value);
                setSelected(value);
                setIsOpen(false);
              }}
            />
          ))}
        </DropDownList>
      </DropDownListContainer>
    </DropDownContainer>
  );
};

export default DropdownSelect;
