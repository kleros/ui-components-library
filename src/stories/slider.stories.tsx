import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import SliderComponent from "../lib/form/slider";
import { a11yExceptions } from "./a11y";
import { SLIDER_LABEL_LIGHT } from "./a11y-defects";

const meta = {
  component: SliderComponent,
  title: "Form/Slider",
  parameters: a11yExceptions(SLIDER_LABEL_LIGHT),
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
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole("slider");
    const thumbLabel = canvasElement.querySelector(
      "#slider-label",
    ) as HTMLElement;
    const fill = canvasElement.querySelector("#slider-fill") as HTMLElement;
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

/** We can pass a formatter function to format the value thats displayed on the Slider thumb. */
export const FormattedValueSlider: Story = {
  args: {
    ...Slider.args,
    formatter: (val) => `${val} days`,
  },
  play: async ({ canvasElement, args }) => {
    const slider = within(canvasElement).getByRole("slider");
    const thumbLabel = canvasElement.querySelector(
      "#slider-label",
    ) as HTMLElement;
    await expect(thumbLabel).toHaveTextContent("50 days");
    slider.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(thumbLabel).toHaveTextContent("51 days");
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
    await expect(canvasElement.querySelector("#slider-label")).toHaveClass(
      "hidden",
    );
    await userEvent.tab();
    await expect(slider).not.toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect((slider as HTMLInputElement).value).toBe("50");
    await expect(args.callback).not.toHaveBeenCalled();
  },
};
