import React from "react";
import Tag from "../lib/tag";

const Tags = () => (
  <>
    <Tag text={"First tag"} />
    <Tag active text={"Active tag"} />
    <Tag text={"Tag with lots and lots of text, ok maybe not that much"} />
  </>
);

export default Tags;
