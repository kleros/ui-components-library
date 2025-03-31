import React from "react";
import Linear from "../lib/progress/linear";
import Circular from "../lib/progress/circular";

const Progress = () => (
  <>
    <Circular progress={0} />
    <Circular progress={5} />
    <Circular progress={100} />
    <Circular progress={16} small />
    <Circular progress={98} small animated={false} />
    <Linear
      valueLabel="Deposit required = xETH of 0.01ETH"
      width={500}
      value={50}
      timerText={"00d 03h 00m "}
    />
    <Linear valueLabel="100/100 (no anime)" width={200} value={100} />
    <Linear width={800} value={0} timerText={"hello world"} />
  </>
);

export default Progress;
