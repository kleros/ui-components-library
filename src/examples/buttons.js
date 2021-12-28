import React from "react";
import Button from "../lib/button";
import Telegram from "../assets/svgs/telegram.svg";

const Buttons = () => (
  <>
    <Button primary text={"Primary Button"} />
    <Button primary small text={"Get help"} icon={<Telegram />} />
    <Button primary disabled text={"Hello"} />
    <Button secondary text={"Hello"} />
    <Button tertiary small text={"Hello"} />
  </>
);

export default Buttons;
