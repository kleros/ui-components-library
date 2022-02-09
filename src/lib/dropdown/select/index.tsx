import React, { useState, useRef } from "react";
import styled, { css } from "styled-components";
import useFocusOutside from "../../../hooks/use-focus-outside";
import DropdownButton from "./button";
import DropdownContainer from "../dropdown-container";
import ItemContainer, { IItem } from "./item-container";

const Container = styled(DropdownContainer)`
  ${({ theme, isOpen }) => css`
    background: ${theme.whiteBackground};
    border: ${isOpen ? "1px" : "0"} solid ${theme.stroke};
    border-radius: 3px;
  `}
`;

interface ISelect {
  items: IItem[];
  callback: (value: IItem["value"]) => void;
  defaultValue?: IItem["value"];
  placeholder?: Omit<IItem, "value">;
  simpleButton?: boolean;
  smallButton?: boolean;
}

const Select: React.FC<ISelect> = ({
  items,
  callback,
  simpleButton,
  smallButton,
  defaultValue,
  placeholder,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef(null);
  useFocusOutside(containerRef, () => setIsOpen(false));
  const [selected, setSelected] = useState(defaultValue);
  const currentItem = items.find(({ value }) => value === selected);
  return (
    <div ref={containerRef} {...props}>
      <DropdownButton
        {...{
          item: currentItem
            ? currentItem
            : placeholder
            ? placeholder
            : { text: "" },
          isOpen,
          setIsOpen,
          simple: simpleButton,
          small: smallButton,
        }}
      />
      <Container {...{ isOpen }}>
        <ItemContainer
          {...{ items, selected }}
          onChange={(value: IItem["value"]) => {
            new Promise((resolve) => resolve(callback(value)))
              .then(() => setSelected(value))
              .catch((error) => console.error(error));
          }}
        />
      </Container>
    </div>
  );
};

export default Select;
