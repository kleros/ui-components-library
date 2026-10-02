import React, { Fragment, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { RadioRenderProps } from "react-aria-components";
import { expect, fn, userEvent, within } from "@storybook/test";

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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("radiogroup", { name: "Creation method" });
    const scratch = within(group).getByRole("radio", {
      name: "Create a case from scratch",
    });
    const duplicate = within(group).getByRole("radio", {
      name: "Duplicate an existing case",
    });
    await expect(scratch).toBeChecked();
    await expect(duplicate).not.toBeChecked();

    await step("clicking anywhere on a card selects it", async () => {
      await userEvent.click(canvas.getByText("Duplicate an existing case"));
      await expect(duplicate).toBeChecked();
      await expect(scratch).not.toBeChecked();
      // the selected card is highlighted through the render props
      await expect(
        canvas.getByText("Duplicate an existing case").parentElement,
      ).toHaveClass("border-klerosUIComponentsPrimaryBlue");
    });

    await step("arrow keys move the selection (roving tab index)", async () => {
      (document.activeElement as HTMLElement | null)?.blur();
      await userEvent.tab();
      await expect(duplicate).toHaveFocus();
      await userEvent.keyboard("{ArrowUp}");
      await expect(scratch).toBeChecked();
      await expect(scratch).toHaveFocus();
      // keyboard focus shows the focus ring on the card
      await expect(
        canvas.getByText("Create a case from scratch").parentElement,
      ).toHaveClass("ring-2");
      await userEvent.keyboard("{ArrowDown}");
      await expect(duplicate).toBeChecked();
    });
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("radiogroup", { name: /Eligibility/ });
    const all = within(group).getByRole("radio", {
      name: "All jurors in the court",
    });
    const gated = within(group).getByRole("radio", {
      name: "Jurors owning a specific ERC-20",
    });
    await expect(all).toBeChecked();
    await expect(
      canvas.queryByRole("textbox", { name: "Token address" }),
    ).not.toBeInTheDocument();

    // selecting the gated option reveals its sibling field
    await userEvent.click(gated);
    await expect(gated).toBeChecked();
    const field = canvas.getByRole("textbox", { name: "Token address" });
    await userEvent.type(field, "0x1234");
    await expect(field).toHaveValue("0x1234");
    // typing in the field does not change the selection
    await expect(gated).toBeChecked();

    await userEvent.click(all);
    await expect(
      canvas.queryByRole("textbox", { name: "Token address" }),
    ).not.toBeInTheDocument();
  },
};

/** Uncontrolled usage with `defaultValue`; `onChange` reports the selected value. */
export const Uncontrolled: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    "aria-label": "Creation method",
    defaultValue: "duplicate",
    items: CREATION_METHOD_ITEMS,
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const scratch = canvas.getByRole("radio", {
      name: "Create a case from scratch",
    });
    await expect(
      canvas.getByRole("radio", { name: "Duplicate an existing case" }),
    ).toBeChecked();
    await userEvent.click(scratch);
    await expect(scratch).toBeChecked();
    await expect(args.onChange).toHaveBeenCalledWith("scratch");
  },
};

/** Disabled group: no option can be selected. */
export const Disabled: Story = {
  args: {
    ...Uncontrolled.args,
    isDisabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("radiogroup");
    await expect(group).toHaveAttribute("aria-disabled", "true");
    const scratch = canvas.getByRole("radio", {
      name: "Create a case from scratch",
    });
    await expect(scratch).toBeDisabled();
    await userEvent.click(canvas.getByText("Create a case from scratch"));
    await expect(scratch).not.toBeChecked();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/** Required + invalid group shows its validation state and error message. */
export const Invalid: Story = {
  args: {
    ...Uncontrolled.args,
    defaultValue: undefined,
    isRequired: true,
    isInvalid: true,
    groupLabel: "Creation method",
    fieldErrorProps: { children: "Please select a method." },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("radiogroup", { name: /Creation method/ });
    await expect(group).toHaveAttribute("aria-invalid", "true");
    await expect(group).toHaveAttribute("aria-required", "true");
    await expect(canvas.getByText("Please select a method.")).toBeVisible();
    await userEvent.click(canvas.getByText("Duplicate an existing case"));
    await expect(args.onChange).toHaveBeenCalledWith("duplicate");
  },
};
