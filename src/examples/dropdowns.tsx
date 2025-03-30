import React from "react";
import DropdownSelect from "../lib/dropdown/select";
import DropdownCascader from "../lib/dropdown/cascader";

const Dropdowns = () => (
  <>
    <DropdownSelect
      simpleButton
      items={[
        { text: "hello 1", dot: "red", itemValue: 1, id: 1 },
        { text: "hello 2", dot: "blue", itemValue: 2, id: 2 },
        { text: "hello 3", dot: "blue", itemValue: 3, id: 3 },
      ]}
      defaultSelectedKey={1}
      callback={() => {
        // function called when an item is clicked with it's value as argument
      }}
    />

    <DropdownSelect
      placeholder="Select Value"
      callback={(item) => {
        // eslint-disable-next-line no-console
        console.log({ item });
      }}
      items={[
        { text: "hello 1", dot: "red", itemValue: 1, id: 1 },
        { text: "hello 2", dot: "blue", itemValue: 2, id: 2 },
        { text: "hello 3", dot: "blue", itemValue: 3, id: 3 },
        { text: "hello 4", dot: "blue", itemValue: 4, id: 4 },
        { text: "hello 5", dot: "blue", itemValue: 5, id: 5 },
        { text: "hello 6", dot: "blue", itemValue: 6, id: 6 },
        { text: "hello 7", dot: "blue", itemValue: 7, id: 7 },
        { text: "hello 8", dot: "blue", itemValue: 8, id: 8 },
        { text: "hello 9", dot: "blue", itemValue: 9, id: 9 },
        { text: "hello 10", dot: "blue", itemValue: 10, id: 10 },
        { text: "hello 11", dot: "blue", itemValue: 11, id: 11 },
        { text: "hello 12", dot: "blue", itemValue: 12, id: 12 },
        { text: "hello 13", dot: "blue", itemValue: 13, id: 13 },
        { text: "hello 14", dot: "blue", itemValue: 14, id: 14 },
        { text: "hello 15", dot: "blue", itemValue: 15, id: 15 },
        { text: "hello 16", dot: "blue", itemValue: 16, id: 16 },
      ]}
    />

    <DropdownSelect
      items={[
        { text: "hello 1", dot: "red", itemValue: 1, id: 1 },
        { text: "hello 2", dot: "blue", itemValue: 2, id: 2 },
        { text: "hello 3", dot: "blue", itemValue: 3, id: 3 },
        { text: "hello 4", dot: "blue", itemValue: 4, id: 4 },
        { text: "hello 5", dot: "blue", itemValue: 5, id: 5 },
        { text: "hello 6", dot: "blue", itemValue: 6, id: 6 },
        { text: "hello 7", dot: "blue", itemValue: 7, id: 7 },
        { text: "hello 8", dot: "blue", itemValue: 8, id: 8 },
        { text: "hello 9", dot: "blue", itemValue: 9, id: 9 },
        { text: "hello 10", dot: "blue", itemValue: 10, id: 10 },
        { text: "hello 11", dot: "blue", itemValue: 11, id: 11 },
        { text: "hello 12", dot: "blue", itemValue: 12, id: 12 },
        { text: "hello 13", dot: "blue", itemValue: 13, id: 13 },
        { text: "hello 14", dot: "blue", itemValue: 14, id: 14 },
        { text: "hello 15", dot: "blue", itemValue: 15, id: 15 },
        { text: "hello 16", dot: "blue", itemValue: 16, id: 16 },
      ]}
      defaultSelectedKey={1}
      callback={() => {
        // function called when an item is clicked with it's value as argument
      }}
    />

    <DropdownCascader
      placeholder={"Select Court"}
      callback={() => {
        // Called with the item object when select is clicked
      }}
      items={[
        {
          label: "General Court",
          id: 0,
          itemValue: 0,
          children: [
            {
              label: "Blockchain",
              id: 1,
              itemValue: 1,
              children: [
                {
                  label: "Technical",
                  id: 2,
                  itemValue: 2,
                },
                {
                  label: "Non-technical",
                  id: 3,
                  itemValue: 3,
                },
                {
                  label: "Other",
                  id: 4,
                  itemValue: 4,
                },
              ],
            },
            {
              label: "Marketing Services",
              id: 5,
              itemValue: 5,
            },
          ],
        },
      ]}
    />
  </>
);

export default Dropdowns;
