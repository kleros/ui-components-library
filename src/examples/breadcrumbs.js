import React from "react";
import Breadcrumb from "../lib/breadcrumb";

const Breadcrumbs = () => (
  <Breadcrumb
    items={[
      { text: "General Court", value: 0 },
      { text: "Blockchain", value: 1 },
      { text: "Non-Technical", value: 2 },
    ]}
    callback={() => {}}
  />
);

export default Breadcrumbs;
