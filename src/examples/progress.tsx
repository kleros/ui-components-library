import React from "react";
import Linear from "../lib/progress/linear";
import Circular from "../lib/progress/circular";

const Progress = () => (
  <>
    <Circular progress={0} />
    <Circular progress={5} />
    <Circular progress={100} />
    <Circular progress={16} small />
    <Circular progress={98} small />
    <Linear
      text='Deposit required = xETH of 0.01ETH'
      width={500}
      progress={60}
    />
    <Linear text='100/100' width={200} progress={100} />
    <Linear off width={800} progress={20} />
  </>
);

export default Progress;
