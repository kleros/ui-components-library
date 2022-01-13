import React from "react";
import DisplaySmall from "../lib/display/small";
import Dai from "../assets/svgs/dai.svg";
import DisplayLarge from "../lib/display/large";
import DisplayIcon from "../lib/display/icon";
import Balance from "../assets/svgs/balance.svg";

const Displays = () => (
  <>
    <DisplaySmall text="250 DAI" label="Amount" icon={<Dai />} />
    <DisplayLarge text="$244.08" label="ETH Price" icon={<Dai />} />
    <DisplayIcon text="247" label="Disputes" icon={<Balance />} />
  </>
);

export default Displays;
