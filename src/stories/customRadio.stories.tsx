import React, { Fragment, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { RadioRenderProps } from "react-aria-components";

import { IPreviewArgs } from "./utils";

import CustomRadio, {
  CustomRadioItem,
  RadioIndicator,
  type CustomRadioOption,
} from "../lib/form/custom-radio";
import Card from "../lib/container/card";
import TextField from "../lib/form/text-field";
import { cn } from "../utils";

const meta = {
  component: CustomRadio,
  title: "Input/CustomRadio",
  tags: ["autodocs"],
} satisfies Meta<typeof CustomRadio>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

/** A full-card option with the indicator on the right; the whole card is the click target
 *  (it is the radio's `<label>`). Because the card is the target, the focus ring and selected
 *  emphasis go on the card (driven by the render props), not on the small circle — so
 *  `RadioIndicator` gets `focusRing={false}` to avoid a double ring. Defined at module scope
 *  (not inside the story's `render`) so it keeps a stable identity across renders. */
const CreationMethodCard = ({
  title,
  ...rp
}: RadioRenderProps & { title: string }) => (
  <Card
    hover
    className={cn(
      "flex h-fit w-[420px] items-center gap-4 p-4",
      rp.isSelected && "border-klerosUIComponentsPrimaryBlue",
      rp.isFocusVisible &&
        "ring-klerosUIComponentsPrimaryBlue ring-2 ring-offset-2",
    )}
  >
    <span className="text-klerosUIComponentsPrimaryText grow text-base">
      {title}
    </span>
    <RadioIndicator {...rp} focusRing={false} />
  </Card>
);

const CREATION_METHOD_ITEMS: CustomRadioOption[] = [
  { value: "scratch", title: "Create a case from scratch" },
  { value: "duplicate", title: "Duplicate an existing case" },
].map(({ value, title }) => ({
  value,
  content: (rp) => <CreationMethodCard title={title} {...rp} />,
}));

/** `items` API — the simplest case. This mirrors react-aria's own card-radio example. */
export const Cards: Story = {
  args: { themeUI: "dark", backgroundUI: "light" },
  render: function Render() {
    const [value, setValue] = useState("scratch");
    return (
      <CustomRadio
        aria-label="Creation method"
        value={value}
        onChange={setValue}
        items={CREATION_METHOD_ITEMS}
      />
    );
  },
};

/** Composition API (`children` + `<CustomRadioItem>`). Use this when options need
 *  per-row adornments or interleaved content that the flat `items` array can't express.
 *  Here a conditional `<TextField>` is rendered as a sibling of the selected option —
 *  it must NOT go inside the radio's `<label>` (interactive controls there are invalid
 *  and would toggle the radio). The `RadioIndicator` is driven by the item's render props. */
export const Composition: Story = {
  args: { themeUI: "dark", backgroundUI: "light" },
  render: function Render() {
    const [value, setValue] = useState("all");
    const options = [
      { value: "all", label: "All jurors in the court" },
      { value: "gated", label: "Jurors owning a specific ERC-20" },
    ];
    return (
      <CustomRadio
        aria-label="Eligibility"
        groupLabel="Eligibility"
        value={value}
        onChange={setValue}
      >
        {options.map(({ value: v, label }) => (
          <Fragment key={v}>
            <CustomRadioItem value={v}>
              {(rp) => (
                <span className="flex items-center gap-2">
                  <RadioIndicator {...rp} small />
                  {label}
                </span>
              )}
            </CustomRadioItem>
            {v === "gated" && value === "gated" ? (
              <TextField aria-label="Token address" placeholder="0x..." />
            ) : null}
          </Fragment>
        ))}
      </CustomRadio>
    );
  },
};
