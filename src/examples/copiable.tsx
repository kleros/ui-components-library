import React from "react";
import Copiable from "../lib/copiable";
import { Tooltip } from "../lib";

const CopiableExample: React.FC = () => (
  <>
    <Copiable copiableContent="Copied text" iconPlacement="left">
      Copiable text
    </Copiable>
    <Copiable
      copiableContent="0xbe8d95497E53aB41d5A45CC8def90d0e59b49f99"
      info="Copy Address"
    >
      <Tooltip text="User's Address">0xbe8...49f99</Tooltip>
    </Copiable>
    <Copiable
      copiableContent="0xbe8d95497E53aB41d5A45CC8def90d0e59b49f99"
      tooltipProps={{ place: "bottom" }}
    >
      Control tooltip display
    </Copiable>
  </>
);

export default CopiableExample;
