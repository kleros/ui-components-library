import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import DatepickerComponent from "../lib/form/datepicker";
import {
  getLocalTimeZone,
  now,
  parseZonedDateTime,
  type ZonedDateTime,
} from "@internationalized/date";

const meta = {
  component: DatepickerComponent,
  title: "Form/Datepicker",
  tags: ["autodocs"],
  args: {
    onChange: fn(),
  },
  argTypes: {
    time: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof DatepickerComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

const body = within(document.body);

/** Opens the calendar popover with the trigger button and returns the dialog. */
const openCalendar = async (canvasElement: HTMLElement) => {
  const trigger = within(canvasElement).getByRole("button");
  await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  await userEvent.click(trigger);
  const dialog = await body.findByRole("dialog");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  return dialog;
};

/** Text of the date segment of the given type in `container`. */
const segment = (container: HTMLElement, type: string) =>
  container.querySelector(`[data-type="${type}"]`)?.textContent;

/** The last value emitted through `onChange`, as a ISO-like string. */
const lastValue = (onChange: unknown) => {
  const calls = (onChange as ReturnType<typeof fn>).mock.calls;
  return (
    calls[calls.length - 1]?.[0] as ZonedDateTime | undefined
  )?.toString();
};

/** The visible month navigation button (react-aria also renders hidden ones). */
const navButton = (dialog: HTMLElement, slot: "previous" | "next") =>
  dialog.querySelector(`button[slot="${slot}"]`) as HTMLButtonElement;

const FIXED_DATE = parseZonedDateTime("2024-03-15T10:30[UTC]");

export const Datepicker: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-full",
  },
  play: async ({ canvasElement }) => {
    const today = now(getLocalTimeZone());
    // defaults to today, with day granularity
    await expect(segment(canvasElement, "day")).toBe(String(today.day));
    await expect(segment(canvasElement, "year")).toBe(String(today.year));
    await expect(segment(canvasElement, "hour")).toBeUndefined();

    const dialog = await openCalendar(canvasElement);
    const grid = within(dialog).getByRole("grid");
    const selected = grid.querySelector('[aria-selected="true"]');
    await expect(selected).toHaveTextContent(String(today.day));
    // no time controls without `time`
    await expect(
      within(dialog).queryByRole("button", { name: "hour-increment" }),
    ).not.toBeInTheDocument();

    // Escape dismisses the popover
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(body.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  },
};

export const DatepickerWithTime: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-full",
    time: true,
  },
  play: async ({ canvasElement }) => {
    await expect(segment(canvasElement, "hour")).toBeDefined();
    await expect(segment(canvasElement, "minute")).toBeDefined();
    const dialog = await openCalendar(canvasElement);
    await expect(within(dialog).getByText("Time")).toBeVisible();
    await expect(
      within(dialog).getByRole("group", { name: "Time" }),
    ).toBeInTheDocument();
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Select" }),
    );
    await waitFor(() =>
      expect(body.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  },
};

/** We can provide a minimum Date */
export const DatepickerWithMinDate: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-full",
    time: true,
    minValue: now(getLocalTimeZone()),
  },
  play: async ({ canvasElement }) => {
    const dialog = await openCalendar(canvasElement);
    const previous = navButton(dialog, "previous");
    const next = navButton(dialog, "next");
    // cannot navigate to months before the minimum date
    await expect(previous).toBeDisabled();
    await expect(next).toBeEnabled();
    await userEvent.click(next);
    await expect(previous).toBeEnabled();
    await userEvent.keyboard("{Escape}");
  },
};

/** Uncontrolled picker with a fixed `defaultValue`. */
export const WithDefaultValue: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    label: "Deadline",
    defaultValue: FIXED_DATE,
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Deadline")).toBeVisible();
    await expect(segment(canvasElement, "month")).toBe("3");
    await expect(segment(canvasElement, "day")).toBe("15");
    await expect(segment(canvasElement, "year")).toBe("2024");

    const dialog = await openCalendar(canvasElement);
    const calendar = within(dialog);
    await expect(calendar.getByRole("heading")).toHaveTextContent("March 2024");

    await step("picking a day updates the value", async () => {
      await userEvent.click(
        calendar.getByRole("button", { name: /March 20, 2024/ }),
      );
      await expect(lastValue(args.onChange)).toMatch(/^2024-03-20/);
      await expect(segment(canvasElement, "day")).toBe("20");
      // the popover stays open (shouldCloseOnSelect is false by default)
      await expect(dialog).toBeInTheDocument();
    });

    await step("keyboard navigation in the grid", async () => {
      await userEvent.keyboard("{ArrowRight}{Enter}");
      await expect(lastValue(args.onChange)).toMatch(/^2024-03-21/);
    });

    await step("month navigation", async () => {
      await userEvent.click(navButton(dialog, "next"));
      await expect(calendar.getByRole("heading")).toHaveTextContent(
        "April 2024",
      );
    });

    await step("Clear resets to the default value", async () => {
      await userEvent.click(calendar.getByRole("button", { name: "Clear" }));
      await expect(segment(canvasElement, "day")).toBe("15");
      await expect(lastValue(args.onChange)).toMatch(/^2024-03-15/);
    });

    await step("Select closes the popover", async () => {
      await userEvent.click(calendar.getByRole("button", { name: "Select" }));
      await waitFor(() =>
        expect(body.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    });
  },
};

/** Time controls increment / decrement hours and minutes. */
export const WithDefaultValueAndTime: Story = {
  args: {
    ...WithDefaultValue.args,
    time: true,
  },
  play: async ({ canvasElement, args }) => {
    await expect(segment(canvasElement, "hour")).toBe("10");
    await expect(segment(canvasElement, "minute")).toBe("30");
    const dialog = within(await openCalendar(canvasElement));

    await userEvent.click(
      dialog.getByRole("button", { name: "hour-increment" }),
    );
    await expect(lastValue(args.onChange)).toMatch(/^2024-03-15T11:30/);
    await userEvent.click(
      dialog.getByRole("button", { name: "minute-decrement" }),
    );
    await expect(lastValue(args.onChange)).toMatch(/^2024-03-15T11:29/);
    await userEvent.click(
      dialog.getByRole("button", { name: "hour-decrement" }),
    );
    await userEvent.click(
      dialog.getByRole("button", { name: "minute-increment" }),
    );
    await expect(lastValue(args.onChange)).toMatch(/^2024-03-15T10:30/);
    await expect(segment(canvasElement, "hour")).toBe("10");
    await userEvent.keyboard("{Escape}");
  },
};

export const Disabled: Story = {
  args: {
    ...WithDefaultValue.args,
    isDisabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole("button");
    await expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    await expect(body.queryByRole("dialog")).not.toBeInTheDocument();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const Invalid: Story = {
  args: {
    ...WithDefaultValue.args,
    validate: (value) =>
      value && value.year < 2025 ? "The deadline has passed." : null,
    validationBehavior: "aria",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("The deadline has passed.")).toBeVisible();
    for (const spinbutton of canvas.getAllByRole("spinbutton"))
      await expect(spinbutton).toHaveAttribute("aria-invalid", "true");
    // fixing the value clears the error
    const year = canvasElement.querySelector(
      '[data-type="year"]',
    ) as HTMLElement;
    await userEvent.click(year);
    await userEvent.keyboard("2030");
    await expect(
      canvas.queryByText("The deadline has passed."),
    ).not.toBeInTheDocument();
    await expect(year).not.toHaveAttribute("aria-invalid", "true");
  },
};
