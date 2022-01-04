import React from "react";
import Alert from "../lib/messages/alert";
import Push from "../lib/messages/push";

const Messages = () => (
  <>
    <Alert warning title={"this is a warning"} msg={"error"} />
    <Push
      error
      title={"Transaction failed"}
      msg={"Transaction failed"}
      callback={() => {}}
    />
    <Push sync small title={"Syncing Data"} callback={() => {}} />
  </>
);

export default Messages;
