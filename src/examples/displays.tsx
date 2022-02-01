import React from "react";
import DisplaySmall from "../lib/display/small";
import Dai from "../assets/svgs/dai.svg";
import DisplayLarge from "../lib/display/large";
import DisplayIcon from "../lib/display/icon";
import Balance from "../assets/svgs/balance.svg";
import Tag from "../lib/tag";

const Displays = () => (
  <>
    <DisplaySmall
      text="250 DAI"
      label="Amount"
      icon={(className: string) => <Dai {...{ className }} />}
    />
    <DisplayLarge
      text="$244.08"
      label="ETH Price"
      icon={(className: string) => <Dai {...{ className }} />}
    />
    <DisplayIcon
      text="247"
      label="Disputes"
      icon={(className: string) => <Balance {...{ className }} />}
    />
    <Tag text={"First tag"} />
    <Tag active text={"Active tag"} />
    <Tag text={"Tag with lots and lots of text, ok maybe not that much"} />
  </>
);

export default Displays;
