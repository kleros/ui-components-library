import React from "react";
import DropdownSelect from "../lib/dropdown/select";
import Cascader from "../lib/dropdown/cascader";

const Dropdowns = () => (
  <>
    <DropdownSelect
      simpleButton
      items={[
        { text: "hello", dot: "red", value: 1 },
        { text: "world", dot: "blue", value: 2 },
      ]}
      defaultValue={1}
      callback={() => {
        // function called when an item is clicked with it's value as argument
      }}
    />
    <DropdownSelect
      items={[
        { text: "hello 1", dot: "red", value: 1 },
        { text: "hello 2", dot: "blue", value: 2 },
        { text: "hello 3", dot: "blue", value: 3 },
        { text: "hello 4", dot: "blue", value: 4 },
        { text: "hello 5", dot: "blue", value: 5 },
        { text: "hello 6", dot: "blue", value: 6 },
        { text: "hello 7", dot: "blue", value: 7 },
        { text: "hello 8", dot: "blue", value: 8 },
        { text: "hello 9", dot: "blue", value: 9 },
        { text: "hello 10", dot: "blue", value: 10 },
        { text: "hello 11", dot: "blue", value: 11 },
        { text: "hello 12", dot: "blue", value: 12 },
        { text: "hello 13", dot: "blue", value: 13 },
        { text: "hello 14", dot: "blue", value: 14 },
        { text: "hello 15", dot: "blue", value: 15 },
        { text: "hello 16", dot: "blue", value: 16 },
      ]}
      defaultValue={1}
      callback={() => {
        // function called when an item is clicked with it's value as argument
      }}
    />
    <Cascader
      placeholder={"Select Court"}
      onSelect={() => {
        // Called with the item value when select is clicked
      }}
      items={[
        {
          label: "General Court",
          value: 0,
          children: [
            {
              label: "Blockchain",
              value: 1,
              children: [
                {
                  label: "Technical",
                  value: 2,
                },
                {
                  label: "Non-technical",
                  value: 3,
                },
                {
                  label: "Other",
                  value: 4,
                },
              ],
            },
            {
              label: "Marketing Services",
              value: 5,
            },
          ],
        },
      ]}
    />
  </>
);

export default Dropdowns;
