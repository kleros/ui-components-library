import React from "react";
import Button from "../lib/button";
import Telegram from "../assets/svgs/telegram.svg";

const Buttons = () => (
  <>
    <Button text="Primary Button" />
    <Button small text="Get help" Icon={Telegram} />
    <Button disabled isLoading text="Hello" />
    <Button variant="secondary" text="Hello" />
    <Button variant="secondary" isLoading disabled text="Hello" />
    <Button variant="tertiary" small text="Hello" />
  </>
);

export default Buttons;
