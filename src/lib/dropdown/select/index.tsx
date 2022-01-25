import React, { useState, useRef } from "react";
import styled, { css } from "styled-components";
import useFocusOutside from "../../../hooks/use-focus-outside";
import DropdownContainer from "../dropdown-container";
import ItemContainer, { IItem, StyledItem } from "./item-container";
import DropdownButton from "../button";

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
}

const Select: React.FC<ISelect> = ({
  items,
  callback,
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
        {...{ isOpen, setIsOpen }}
        node={
          currentItem ? (
            <StyledItem current {...currentItem} />
          ) : placeholder ? (
            <StyledItem current {...placeholder} />
          ) : (
            ""
          )
        }
      />
      <Container {...{ isOpen }}>
        <ItemContainer
          {...{ items, selected }}
          onChange={(value: IItem["value"]) => {
            setSelected(value);
            callback(value);
          }}
        />
      </Container>
    </div>
  );
};

export default Select;
