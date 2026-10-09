import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

import { IPreviewArgs, waitForAnimations } from "./utils";

import DatepickerComponent from "../lib/form/datepicker";
import {
  parseZonedDateTime,
  type ZonedDateTime,
} from "@internationalized/date";
import { a11yExceptions, auditA11y } from "./a11y";
import {
  SECONDARY_TEXT_LIGHT,
  PRIMARY_BLUE_TEXT_LIGHT,
  WHITE_ON_BLUE_LIGHT,
  FOCUSED_DATE_SEGMENT_LIGHT,
} from "./a11y-defects";

/** Fixed date so stories and their tests are deterministic. */
const FIXED_DATE = parseZonedDateTime("2025-01-15T10:30[UTC]");

const meta = {
  component: DatepickerComponent,
  title: "Form/Datepicker",
  tags: ["autodocs"],
  args: {
    onChange: fn(),
    defaultValue: FIXED_DATE,
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

const waitForClose = () =>
  waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());

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

export const Datepicker: Story = {
  parameters: a11yExceptions(
    SECONDARY_TEXT_LIGHT,
    PRIMARY_BLUE_TEXT_LIGHT,
    WHITE_ON_BLUE_LIGHT,
  ),
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-full",
    defaultValue: FIXED_DATE,
  },
  play: async ({ canvasElement, ...context }) => {
    // day granularity: no time segments
    await expect(segment(canvasElement, "month")).toBe("1");
    await expect(segment(canvasElement, "day")).toBe("15");
    await expect(segment(canvasElement, "year")).toBe("2025");
    await expect(segment(canvasElement, "hour")).toBeUndefined();
    await auditA11y(context, "resting");

    const dialog = await openCalendar(canvasElement);
    const grid = within(dialog).getByRole("grid");
    await expect(
      grid.querySelector('[aria-selected="true"]'),
    ).toHaveTextContent("15");
    // no time controls without `time`
    await expect(
      within(dialog).queryByRole("button", { name: "hour-increment" }),
    ).not.toBeInTheDocument();
    await auditA11y(context, "open");

    // Escape dismisses the popover
    await userEvent.keyboard("{Escape}");
    await waitForClose();
  },
};

export const DatepickerWithTime: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-full",
    time: true,
    defaultValue: FIXED_DATE,
  },
  play: async ({ canvasElement }) => {
    await expect(segment(canvasElement, "hour")).toBe("10");
    await expect(segment(canvasElement, "minute")).toBe("30");
    const dialog = await openCalendar(canvasElement);
    await expect(within(dialog).getByText("Time")).toBeVisible();
    await expect(
      within(dialog).getByRole("group", { name: "Time" }),
    ).toBeInTheDocument();
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Select" }),
    );
    await waitForClose();
  },
};

/** We can provide a minimum Date */
export const DatepickerWithMinDate: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-full",
    time: true,
    defaultValue: FIXED_DATE,
    minValue: FIXED_DATE,
  },
  play: async ({ canvasElement }) => {
    const dialog = await openCalendar(canvasElement);
    const calendar = within(dialog);
    const previous = navButton(dialog, "previous");
    const next = navButton(dialog, "next");
    // cannot navigate to months before the minimum date
    await expect(previous).toBeDisabled();
    await expect(next).toBeEnabled();
    // days before the minimum are unavailable
    await expect(
      calendar.getByRole("button", { name: /January 14, 2025/ }),
    ).toHaveAttribute("aria-disabled", "true");
    await expect(
      calendar.getByRole("button", { name: /January 16, 2025/ }),
    ).not.toHaveAttribute("aria-disabled");
    await userEvent.click(next);
    await expect(previous).toBeEnabled();
    await userEvent.keyboard("{Escape}");
    await waitForClose();
  },
};

/** Uncontrolled picker with a label and a fixed `defaultValue`. */
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
    await expect(segment(canvasElement, "day")).toBe("15");

    const dialog = await openCalendar(canvasElement);
    const calendar = within(dialog);
    await expect(calendar.getByRole("heading")).toHaveTextContent(
      "January 2025",
    );

    await step("picking a day updates the value", async () => {
      await userEvent.click(
        calendar.getByRole("button", { name: /January 20, 2025/ }),
      );
      await expect(lastValue(args.onChange)).toMatch(/^2025-01-20/);
      await expect(segment(canvasElement, "day")).toBe("20");
      // the popover stays open (shouldCloseOnSelect is false by default)
      await expect(dialog).toBeInTheDocument();
    });

    await step("keyboard navigation in the grid", async () => {
      await userEvent.keyboard("{ArrowRight}{Enter}");
      await expect(lastValue(args.onChange)).toMatch(/^2025-01-21/);
    });

    await step("month navigation", async () => {
      await userEvent.click(navButton(dialog, "next"));
      await expect(calendar.getByRole("heading")).toHaveTextContent(
        "February 2025",
      );
    });

    await step("Clear resets to the default value", async () => {
      await userEvent.click(calendar.getByRole("button", { name: "Clear" }));
      await expect(segment(canvasElement, "day")).toBe("15");
      await expect(lastValue(args.onChange)).toMatch(/^2025-01-15/);
    });

    await step("Select closes the popover", async () => {
      await userEvent.click(calendar.getByRole("button", { name: "Select" }));
      await waitForClose();
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
    await expect(lastValue(args.onChange)).toMatch(/^2025-01-15T11:30/);
    await userEvent.click(
      dialog.getByRole("button", { name: "minute-decrement" }),
    );
    await expect(lastValue(args.onChange)).toMatch(/^2025-01-15T11:29/);
    await userEvent.click(
      dialog.getByRole("button", { name: "hour-decrement" }),
    );
    await userEvent.click(
      dialog.getByRole("button", { name: "minute-increment" }),
    );
    await expect(lastValue(args.onChange)).toMatch(/^2025-01-15T10:30/);
    await expect(segment(canvasElement, "hour")).toBe("10");
    await userEvent.keyboard("{Escape}");
    await waitForClose();
  },
};

/** The calendar popover left open, so its content is covered by the a11y check. */
export const OpenCalendar: Story = {
  parameters: a11yExceptions(
    SECONDARY_TEXT_LIGHT,
    PRIMARY_BLUE_TEXT_LIGHT,
    WHITE_ON_BLUE_LIGHT,
  ),
  args: {
    ...WithDefaultValue.args,
    defaultOpen: true,
  },
  play: async () => {
    const dialog = await body.findByRole("dialog");
    await expect(within(dialog).getByRole("grid")).toBeInTheDocument();
    await expect(
      within(dialog)
        .getByRole("button", { name: /January 15, 2025/ })
        .closest('[role="gridcell"]'),
    ).toHaveAttribute("aria-selected", "true");
    await waitForAnimations(document.body);
  },
};

/** Open popover with the time controls, also covered by the a11y check. */
export const OpenCalendarWithTime: Story = {
  parameters: a11yExceptions(
    {
      rule: "landmark-no-duplicate-banner",
      selector: "header",
      reason:
        "Library defect: the calendar and the time control each render a <header> banner in the popover.",
      source:
        "src/lib/form/datepicker/calendar.tsx:21, src/lib/form/datepicker/time-control.tsx:16",
    },
    {
      rule: "landmark-unique",
      selector: "header",
      reason:
        "Library defect: the two unlabeled <header> banners are indistinguishable.",
      source:
        "src/lib/form/datepicker/calendar.tsx:21, src/lib/form/datepicker/time-control.tsx:16",
    },
    SECONDARY_TEXT_LIGHT,
    PRIMARY_BLUE_TEXT_LIGHT,
    WHITE_ON_BLUE_LIGHT,
  ),
  args: {
    ...WithDefaultValue.args,
    time: true,
    defaultOpen: true,
  },
  play: async () => {
    const dialog = await body.findByRole("dialog");
    await expect(within(dialog).getByRole("grid")).toBeInTheDocument();
    await expect(
      within(dialog)
        .getByRole("button", { name: /January 15, 2025/ })
        .closest('[role="gridcell"]'),
    ).toHaveAttribute("aria-selected", "true");
    await expect(
      within(dialog).getByRole("button", { name: "hour-increment" }),
    ).toBeVisible();
    await waitForAnimations(document.body);
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
  parameters: a11yExceptions(FOCUSED_DATE_SEGMENT_LIGHT),
  args: {
    ...WithDefaultValue.args,
    validate: (value) =>
      value && value.year < 2026 ? "The deadline has passed." : null,
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
