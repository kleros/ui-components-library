import React from "react";
import Card from "../lib/container/card";
import Box from "../lib/container/box";
import Alert from "../lib/container/alert";

const Containers = () => (
  <>
    <Card hover round />
    <Box />
    <Alert warning title={"this is a warning"} msg={"error"} />
  </>
);

export default Containers;
