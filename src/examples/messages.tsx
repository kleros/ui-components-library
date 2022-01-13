import React from "react";
import Alert from "../lib/messages/alert";
import Push from "../lib/messages/push";

const Messages = () => (
  <>
    <Alert variant="warning" title={"this is a warning"} msg={"error"} />
    <Push
      variant="error"
      title={"Transaction failed"}
      msg={"Transaction failed"}
      callback={() => {
        // function to be called when the close button is clicked
      }}
    />
    <Push
      variant="sync"
      small
      title={"Syncing Data"}
      callback={() => {
        // function to be called when the close button is clicked
      }}
    />
  </>
);

export default Messages;
