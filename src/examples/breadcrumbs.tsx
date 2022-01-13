import React from "react";
import Breadcrumb from "../lib/breadcrumb";

const Breadcrumbs = () => (
  <Breadcrumb
    items={[
      { text: "General Court", value: 0 },
      { text: "Blockchain", value: 1 },
      { text: "Non-Technical", value: 2 },
    ]}
    callback={() => {
      // executed when an item is clicked passing it's value as argument
    }}
  />
);

export default Breadcrumbs;
