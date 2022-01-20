import React from "react";
import DropdownSelect from "../lib/dropdown/select";
import Cascader from "../lib/dropdown/cascader";

const Dropdowns = () => (
  <>
    <DropdownSelect
      items={[
        { text: "hello 1", dot: "red", value: 1 },
        { text: "hello 2", dot: "blue", value: 0 },
      ]}
      defaultValue={0}
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
              ],
            },
            {
              label: "Marketing Services",
              value: 4,
            },
          ],
        },
      ]}
    />
  </>
);

export default Dropdowns;
