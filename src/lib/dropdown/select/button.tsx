import React from "react";
import DropdownButton from "../button";
import SimpleButton from "../simple-button";
import { IItem, StyledItem } from "./item-container";

export interface ISelectButton {
  item: Omit<IItem, "value" | "icon" | "dot" | "onClick">;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  simple?: boolean;
  small?: boolean;
}

const SelectButton: React.FC<ISelectButton> = ({
  item,
  simple,
  small,
  isOpen,
  setIsOpen,
}) =>
  simple ? (
    <SimpleButton {...{ text: item.text, isOpen, setIsOpen, small }} />
  ) : (
    <DropdownButton
      {...{ isOpen, setIsOpen }}
      node={<StyledItem current {...item} />}
    />
  );

export default SelectButton;
