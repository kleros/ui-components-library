import React, { useState, useRef } from "react";
import styled, { css } from "styled-components";
import useFocusOutside from "../../../hooks/use-focus-outside";
import DropdownButton from "./button";
import _DropdownContainer from "../dropdown-container";
import ItemContainer, { IItem } from "./item-container";

const Container = styled.div`
  position: relative;
`;

const DropdownContainer = styled(_DropdownContainer)`
  ${({ theme }) => css`
    background: ${theme.klerosUIComponentsWhiteBackground};
    border: 1px solid ${theme.klerosUIComponentsStroke};
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
  alignRight?: boolean;
}

const Select: React.FC<ISelect> = ({
  items,
  callback,
  simpleButton,
  smallButton,
  defaultValue,
  placeholder,
  alignRight,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef(null);
  useFocusOutside(containerRef, () => setIsOpen(false));
  const [selected, setSelected] = useState(defaultValue);
  const currentItem = items.find(({ value }) => value === selected);
  return (
    <Container ref={containerRef} {...props}>
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
      <DropdownContainer {...{ isOpen, alignRight }}>
        <ItemContainer
          {...{ items, selected }}
          onChange={(value: IItem["value"]) => {
            new Promise((resolve) => resolve(callback(value)))
              .then(() => {
                setSelected(value);
                setIsOpen(false);
              })
              .catch((error) => console.error(error));
          }}
        />
      </DropdownContainer>
    </Container>
  );
};

export default Select;
