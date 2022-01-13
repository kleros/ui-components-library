import React from "react";
import Button from "../lib/button";
import Telegram from "../assets/svgs/telegram.svg";

const Buttons = () => (
  <>
    <Button text={"Primary Button"} />
    <Button small text={"Get help"} icon={<Telegram />} />
    <Button disabled text={"Hello"} />
    <Button variation={"secondary"} text={"Hello"} />
    <Button variation={"tertiary"} small text={"Hello"} />
  </>
);

export default Buttons;
