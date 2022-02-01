import React from "react";
import Button from "../lib/button";
import Telegram from "../assets/svgs/telegram.svg";

const Buttons = () => (
  <>
    <Button text={"Primary Button"} />
    <Button
      small
      text={"Get help"}
      icon={(className) => <Telegram {...{ className }} />}
    />
    <Button disabled text={"Hello"} />
    <Button variant={"secondary"} text={"Hello"} />
    <Button variant={"tertiary"} small text={"Hello"} />
  </>
);

export default Buttons;
