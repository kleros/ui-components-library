import React, { useState } from "react";
import styled from "styled-components";
import Checkbox from "../lib/form/checkbox";
import Switch from "../lib/form/switch";
import RadioGroup from "../lib/form/radio-group";

const VerticalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Input: React.FC = () => {
  const [checked, setChecked] = useState(false);
  const [radioValue, setRadioValue] = useState("bitcoin");

  const changeRadioValue = (val: string) => setRadioValue(val);

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
      <RadioGroup
        groupLabel="Variants"
        small
        orientation="horizontal"
        value={radioValue}
        onChange={changeRadioValue}
        options={[
          { value: "primary", label: "Primary" },
          { value: "secondary", label: "Secondary" },
        ]}
      />

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
