import React, { useContext } from "react";
import { type Key, SelectStateContext } from "react-aria-components";
import clsx from "clsx";
import { isUndefined } from "../../../utils";
import Button from "../../button";
import { IItem } from "./item";
import { IDropdownCascader } from ".";

interface ISelectButton {
  selectedKey: Key | null;
  callback: IDropdownCascader["callback"];
}

const SelectButton: React.FC<ISelectButton> = ({ selectedKey, callback }) => {
  const state = useContext(SelectStateContext);

  const selectedItem = !isUndefined(selectedKey)
    ? state?.collection.getItem(selectedKey)
    : undefined;

  return (
    <div
      className={clsx(
        "box-border px-4 py-2",
        "border-t-klerosUIComponentsStroke border-t",
        "flex items-center justify-center lg:justify-end",
      )}
    >
      <Button
        onPress={() => {
          if (!isUndefined(selectedKey)) state?.setSelectedKey(selectedKey);
          if (selectedItem) {
            callback(selectedItem.value as IItem);
          }
          state?.close();
        }}
        text={
          isUndefined(selectedItem)
            ? "No Selection"
            : `Select\n${selectedItem.textValue}`
        }
        isDisabled={isUndefined(selectedKey)}
      />
    </div>
  );
};

export default SelectButton;
