import React from "react";
import Alert from "../lib/messages/alert";
import Push from "../lib/messages/push";

const Messages = () => (
  <>
    <Alert
      variant="warning"
      title={"this is a warning"}
      msg={"Hiring an outside contractor?"}
    />

    <Alert
      variant="info"
      title={"this is a warning"}
      msg={
        "Want to protect your crypto transaction? Use this option " +
        "safe cross-chain swap. One person escrows an asset based on " +
        "Ethereum and the funds are released once assets on another " +
        "blockchain have been moved."
      }
    />

    <Alert
      variant="info"
      title={"this is a warning"}
      msg={
        "Want to protect your crypto transaction? Use this option " +
        "safe cross-chain swap. One person escrows an asset based on " +
        "Ethereum and the funds are released once assets on another " +
        "blockchain have been moved." +
        "Want to protect your crypto transaction? Use this option " +
        "safe cross-chain swap. One person escrows an asset based on " +
        "Ethereum and the funds are released once assets on another " +
        "blockchain have been moved."
      }
    />

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
