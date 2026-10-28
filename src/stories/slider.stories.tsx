import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import SliderComponent from "../lib/form/slider";
import { a11yExceptions } from "./a11y";
import { SLIDER_LABEL_LIGHT } from "./a11y-defects";

const meta = {
  component: SliderComponent,
  title: "Form/Slider",
  tags: ["autodocs"],
  args: {
    callback: fn(),
  },
  argTypes: {
    isDisabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof SliderComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Slider: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    isDisabled: false,
    minValue: 0,
    maxValue: 100,
    defaultValue: 50,
    leftLabel: "0",
    rightLabel: "100",
    "aria-label": "Volume",
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole("slider", { name: "Volume" });
    const thumbLabel = canvasElement.querySelector(
      '[data-slot="slider-label"]',
    ) as HTMLElement;
    const fill = canvasElement.querySelector(
      '[data-slot="slider-fill"]',
    ) as HTMLElement;
    await expect((slider as HTMLInputElement).value).toBe("50");
    await expect(slider).toHaveAttribute("min", "0");
    await expect(slider).toHaveAttribute("max", "100");
    await expect(thumbLabel).toHaveTextContent("50");
    await expect(fill.style.width).toBe("50%");
    await expect(canvas.getByText("0")).toBeVisible();
    await expect(canvas.getByText("100")).toBeVisible();

    await step("arrow keys change the value by one step", async () => {
      await userEvent.tab();
      await expect(slider).toHaveFocus();
      await userEvent.keyboard("{ArrowRight}");
      await expect((slider as HTMLInputElement).value).toBe("51");
      await expect(args.callback).toHaveBeenLastCalledWith(51);
      await expect(thumbLabel).toHaveTextContent("51");
      await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
      await expect(args.callback).toHaveBeenLastCalledWith(49);
    });

    await step("Home / End jump to the limits", async () => {
      await userEvent.keyboard("{End}");
      await expect(args.callback).toHaveBeenLastCalledWith(100);
      await expect(fill.style.width).toBe("100%");
      await userEvent.keyboard("{Home}");
      await expect(args.callback).toHaveBeenLastCalledWith(0);
      await expect(fill.style.width).toBe("0%");
      // cannot go below the minimum
      await userEvent.keyboard("{ArrowLeft}");
      await expect((slider as HTMLInputElement).value).toBe("0");
    });
  },
};

/**
 * We can pass a formatter function to format the value thats displayed on the Slider thumb.
 * Screen readers announce the same text as the value.
 */
export const FormattedValueSlider: Story = {
  parameters: a11yExceptions(SLIDER_LABEL_LIGHT),
  args: {
    ...Slider.args,
    formatter: (val) => `${val} days`,
  },
  play: async ({ canvasElement, args }) => {
    const slider = within(canvasElement).getByRole("slider", {
      name: "Volume",
    });
    const thumbLabel = canvasElement.querySelector(
      '[data-slot="slider-label"]',
    ) as HTMLElement;
    await expect(thumbLabel).toHaveTextContent("50 days");
    await expect(slider).toHaveAttribute("aria-valuetext", "50 days");
    slider.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(thumbLabel).toHaveTextContent("51 days");
    await expect(slider).toHaveAttribute("aria-valuetext", "51 days");
    await expect(args.callback).toHaveBeenLastCalledWith(51);
  },
};

export const DisabledSlider: Story = {
  args: {
    ...Slider.args,
    isDisabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const slider = within(canvasElement).getByRole("slider");
    await expect(slider).toBeDisabled();
    // the value bubble is hidden while disabled
    await expect(
      canvasElement.querySelector('[data-slot="slider-label"]'),
    ).toHaveClass("hidden");
    await userEvent.tab();
    await expect(slider).not.toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect((slider as HTMLInputElement).value).toBe("50");
    await expect(args.callback).not.toHaveBeenCalled();
  },
};

/** A caller's `onChange` runs alongside the component's own `callback`. */
export const OnChange: Story = {
  parameters: a11yExceptions(SLIDER_LABEL_LIGHT),
  args: {
    ...Slider.args,
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const slider = within(canvasElement).getByRole("slider");
    const thumbLabel = canvasElement.querySelector(
      '[data-slot="slider-label"]',
    ) as HTMLElement;
    slider.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(args.onChange).toHaveBeenLastCalledWith(51);
    await expect((slider as HTMLInputElement).value).toBe("51");
    await expect(thumbLabel).toHaveTextContent("51");
    await expect(args.callback).toHaveBeenLastCalledWith(51);
  },
};

/** Several sliders on a page: each input is named after its own `aria-label`, and announces its own value. */
export const SeveralSliders: Story = {
  parameters: a11yExceptions(SLIDER_LABEL_LIGHT),
  args: {
    ...Slider.args,
    formatter: (val) => `${val} $M`,
  },
  render: (args) => (
    <div className="flex flex-col gap-8">
      <SliderComponent {...args} aria-label="Budget" defaultValue={40} />
      <SliderComponent {...args} aria-label="Reserve" defaultValue={20} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const budget = canvas.getByRole("slider", { name: "Budget" });
    const reserve = canvas.getByRole("slider", { name: "Reserve" });
    await expect(budget).toHaveAttribute("aria-valuetext", "40 $M");
    await expect(reserve).toHaveAttribute("aria-valuetext", "20 $M");

    reserve.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(args.callback).toHaveBeenLastCalledWith(21);
    await expect(reserve).toHaveAttribute("aria-valuetext", "21 $M");
    await expect(budget).toHaveAttribute("aria-valuetext", "40 $M");
    // the names stay the labels as the values change
    await expect(canvas.getByRole("slider", { name: "Reserve" })).toBe(reserve);
    await expect(canvas.getByRole("slider", { name: "Budget" })).toBe(budget);
  },
};

/** `aria-labelledby` names the slider after text elsewhere on the page, such as a heading. */
export const LabelledBy: Story = {
  parameters: a11yExceptions(SLIDER_LABEL_LIGHT),
  args: {
    ...Slider.args,
    "aria-label": undefined,
    "aria-labelledby": "slider-heading",
  },
  render: (args) => (
    <div>
      <h3 id="slider-heading" className="text-klerosUIComponentsPrimaryText">
        Item deposit
      </h3>
      <SliderComponent {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("slider", { name: "Item deposit" }),
    ).toHaveAttribute("aria-valuetext", "50");
    await expect(canvas.getByRole("group", { name: "Item deposit" })).toBe(
      canvasElement.querySelector('[role="group"]'),
    );
  },
};
