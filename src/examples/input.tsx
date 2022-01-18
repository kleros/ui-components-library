import React, { useState } from "react";
import Radio from "../lib/form/radio";
import Checkbox from "../lib/form/checkbox";
import Switch from "../lib/form/switch";
import styled from "styled-components";

const VerticalWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Input: React.FC = () => {
  const [checked, setChecked] = useState(false);
  const [radioValue, setRadioValue] = useState("bitcoin");

  const changeRadioValue: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => setRadioValue(event.target.value);

  return (
    <>
      <VerticalWrapper>
        <Checkbox
          label="Checkbox"
          checked={checked}
          onChange={() => setChecked((old) => !old)}
        />
        <Checkbox
          label="Inverted"
          checked={!checked}
          onChange={() => setChecked((old) => !old)}
        />
        <Checkbox
          label="One"
          small
          checked={checked}
          onChange={() => setChecked((old) => !old)}
        />
      </VerticalWrapper>
      <VerticalWrapper>
        <Radio
          label="Bitcoin"
          value="bitcoin"
          checked={radioValue === "bitcoin"}
          onChange={changeRadioValue}
        />
        <Radio
          label="Ethereum"
          value="ethereum"
          checked={radioValue === "ethereum"}
          onChange={changeRadioValue}
        />
        <Radio
          label="Pinakion"
          value="pinakion"
          checked={radioValue === "pinakion"}
          onChange={changeRadioValue}
        />
      </VerticalWrapper>
      <VerticalWrapper>
        <Radio
          label="Bitcoin"
          small
          value="bitcoin"
          checked={radioValue === "bitcoin"}
          onChange={changeRadioValue}
        />
        <Radio
          small
          label="Ethereum"
          value="ethereum"
          checked={radioValue === "ethereum"}
          onChange={changeRadioValue}
        />
      </VerticalWrapper>
      <Switch checked={checked} onChange={() => setChecked((old) => !old)} />
      <Switch
        small
        checked={checked}
        onChange={() => setChecked((old) => !old)}
      />
    </>
  );
};

export default Input;
