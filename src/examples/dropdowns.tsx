import React from "react";
import DropdownSelect from "../lib/dropdown/select";

const Dropdowns = () => (
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
);

export default Dropdowns;
