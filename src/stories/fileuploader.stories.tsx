import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, spyOn, userEvent, waitFor, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import FileUploaderComponent from "../lib/form/file-uploader";
import Button from "../lib/button";
import { a11yExceptions, type A11yException } from "./a11y";
import {
  PRIMARY_BLUE_TEXT_LIGHT,
  SECONDARY_TEXT_LIGHT,
  WARNING_TEXT_LIGHT,
} from "./a11y-defects";

const meta = {
  component: FileUploaderComponent,
  title: "Form/File Uploader",
  tags: ["autodocs"],
  args: {
    callback: fn(),
  },
  argTypes: {
    variant: {
      options: ["success", "warning", "error", "info"],
      control: "radio",
    },
    isDisabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof FileUploaderComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

const ICON_ONLY_UPLOAD_BUTTON = {
  rule: "button-name",
  selector: "button.bg-transparent",
  reason:
    "Library defect: with no file selected the upload button only holds an icon and has no accessible name.",
  source: "src/lib/form/file-uploader.tsx:107",
} satisfies A11yException;

const png = () => new File(["png"], "picture.png", { type: "image/png" });
const txt = () => new File(["hello"], "notes.txt", { type: "text/plain" });

const getInput = (canvasElement: HTMLElement) =>
  canvasElement.querySelector('input[type="file"]') as HTMLInputElement;

/** The visible upload button (the file picker trigger inside the drop zone). */
const getUploadButton = (canvasElement: HTMLElement) =>
  canvasElement.querySelector("button[data-rac]") as HTMLButtonElement;

/** Drag events dispatched on the upload button bubble to the drop zone. */
const getDropZone = getUploadButton;

/** Simulates dragging `file` over the drop zone with native drag events and
 * then dropping it (or leaving again when `drop` is false). */
const dragFile = async (zone: HTMLElement, file: File, drop: boolean) => {
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  // react-aria derives the allowed drop operations from effectAllowed, which
  // is read-only ("none") on a constructed DataTransfer outside of dragstart
  Object.defineProperty(dataTransfer, "effectAllowed", { value: "all" });
  const rect = zone.getBoundingClientRect();
  const init = {
    bubbles: true,
    cancelable: true,
    dataTransfer,
    clientX: rect.x + rect.width / 2,
    clientY: rect.y + rect.height / 2,
  };
  // Chrome only exposes file-system entries for real OS drags; react-aria
  // skips file items without one, so report the synthetic item as a file.
  const getAsEntry = spyOn(
    DataTransferItem.prototype,
    "webkitGetAsEntry",
  ).mockReturnValue({ isFile: true, isDirectory: false } as FileSystemEntry);
  try {
    zone.dispatchEvent(new DragEvent("dragenter", init));
    zone.dispatchEvent(new DragEvent("dragover", init));
    if (drop) zone.dispatchEvent(new DragEvent("drop", init));
    else {
      // let React render the drop target state, which is only set for drags
      // the zone accepts
      await new Promise((resolve) => setTimeout(resolve, 50));
      const isDropTarget = !!zone.closest("[data-drop-target]");
      zone.dispatchEvent(new DragEvent("dragleave", init));
      return isDropTarget;
    }
  } finally {
    getAsEntry.mockRestore();
  }
  return true;
};

const dropFile = (zone: HTMLElement, file: File) => dragFile(zone, file, true);

export const FileUploader: Story = {
  parameters: a11yExceptions(PRIMARY_BLUE_TEXT_LIGHT),
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
  },
  play: async ({ canvasElement, args, step }) => {
    const button = getUploadButton(canvasElement);
    // the upload icon is shown until a file is chosen
    await expect(button.querySelector("svg")).toBeInTheDocument();

    await step("choosing a file through the file picker", async () => {
      await userEvent.upload(getInput(canvasElement), png());
      await expect(args.callback).toHaveBeenCalledTimes(1);
      await expect(args.callback).toHaveBeenLastCalledWith(
        expect.objectContaining({ name: "picture.png", type: "image/png" }),
      );
      await expect(button).toHaveTextContent("picture.png");
    });

    await step("dropping a file on the drop zone", async () => {
      await dropFile(getDropZone(canvasElement), txt());
      await waitFor(() => expect(args.callback).toHaveBeenCalledTimes(2));
      await expect(args.callback).toHaveBeenLastCalledWith(
        expect.objectContaining({ name: "notes.txt" }),
      );
      await expect(button).toHaveTextContent("notes.txt");
    });
  },
};

export const FileUploaderWithMessage: Story = {
  parameters: a11yExceptions(ICON_ONLY_UPLOAD_BUTTON, SECONDARY_TEXT_LIGHT),
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
    variant: "info",
    msg: "Please upload the file.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const message = canvas.getByText("Please upload the file.");
    // the message labels the drop zone
    await expect(message).toHaveAttribute("id", "dropzone-label");
    await expect(
      canvas.getByRole("button", { name: /Please upload the file\./ }),
    ).toBeInTheDocument();
    await expect(message.previousElementSibling).toHaveClass(
      "fill-klerosUIComponentsPrimaryBlue",
    );
  },
};
export const FileUploaderVariant: Story = {
  parameters: a11yExceptions(ICON_ONLY_UPLOAD_BUTTON, WARNING_TEXT_LIGHT),
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
    msg: "Please upload the file.",
    variant: "warning",
  },
  play: async ({ canvasElement }) => {
    const message = within(canvasElement).getByText("Please upload the file.");
    await expect(message).toHaveClass("text-klerosUIComponentsWarning");
    await expect(message.previousElementSibling).toHaveClass(
      "fill-klerosUIComponentsWarning",
    );
  },
};

export const FileUploaderWithAcceptedTypes: Story = {
  parameters: a11yExceptions(PRIMARY_BLUE_TEXT_LIGHT, SECONDARY_TEXT_LIGHT),
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
    acceptedFileTypes: ["image/png"],
    msg: "This will only accept png images.",
    variant: "info",
  },
  play: async ({ canvasElement, args }) => {
    const input = getInput(canvasElement);
    await expect(input).toHaveAttribute("accept", "image/png");
    // only accepted types turn the zone into a drop target
    await expect(await dragFile(getDropZone(canvasElement), txt(), false)).toBe(
      false,
    );
    await expect(await dragFile(getDropZone(canvasElement), png(), false)).toBe(
      true,
    );
    // dropping a non-accepted type is ignored
    await dropFile(getDropZone(canvasElement), txt());
    await expect(args.callback).not.toHaveBeenCalled();
    await dropFile(getDropZone(canvasElement), png());
    await waitFor(() =>
      expect(args.callback).toHaveBeenCalledWith(
        expect.objectContaining({ name: "picture.png" }),
      ),
    );
    await expect(args.callback).toHaveBeenCalledTimes(1);
  },
};

export const FileUploaderWithCustomValidation: Story = {
  parameters: a11yExceptions(ICON_ONLY_UPLOAD_BUTTON, SECONDARY_TEXT_LIGHT),
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
    acceptedFileTypes: ["image/png"],
    msg: "This will not accept any file and invalidate",
    variant: "info",
    validationFunction: () => {
      return false;
    },
  },
  play: async ({ canvasElement, args }) => {
    const button = getUploadButton(canvasElement);
    await userEvent.upload(getInput(canvasElement), png());
    await dropFile(getDropZone(canvasElement), png());
    // validationFunction returns false: the file is rejected
    await expect(args.callback).not.toHaveBeenCalled();
    await expect(button).not.toHaveTextContent("picture.png");
    await expect(button.querySelector("svg")).toBeInTheDocument();
  },
};

export const FileUploaderWithControlledBehaviour: Story = {
  parameters: a11yExceptions(PRIMARY_BLUE_TEXT_LIGHT, SECONDARY_TEXT_LIGHT),
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
    acceptedFileTypes: ["image/png"],
    msg: "This will show test.txt selected by default",
    variant: "info",
    selectedFile: new File(
      ["hello world"], // file contents
      "test.txt", // file name
      { type: "text/plain" }, // MIME type
    ),
  },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "test.txt",
    });
    await userEvent.upload(getInput(canvasElement), png());
    // the callback fires, but the displayed file is owned by the parent
    await expect(args.callback).toHaveBeenCalledWith(
      expect.objectContaining({ name: "picture.png" }),
    );
    await expect(button).toHaveTextContent("test.txt");
  },
};

export const FileUploaderWithParentDrivenSelection: Story = {
  parameters: a11yExceptions(PRIMARY_BLUE_TEXT_LIGHT),
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
  },
  render: function Render(args) {
    const [file, setFile] = useState<File>(
      () => new File(["first"], "first.txt", { type: "text/plain" }),
    );
    return (
      <div>
        <FileUploaderComponent {...args} selectedFile={file} />
        <Button
          small
          variant="secondary"
          text="Replace"
          onPress={() =>
            setFile(new File(["second"], "second.txt", { type: "text/plain" }))
          }
        />
      </div>
    );
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const uploadButton = getUploadButton(canvasElement);
    await expect(uploadButton).toHaveTextContent("first.txt");

    await step("parent replaces the selected file", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Replace" }));
      await waitFor(() => expect(uploadButton).toHaveTextContent("second.txt"));
      await expect(args.callback).not.toHaveBeenCalled();
    });

    await step("user selection still reports the file", async () => {
      await userEvent.upload(getInput(canvasElement), png());
      await expect(args.callback).toHaveBeenCalledTimes(1);
      await expect(args.callback).toHaveBeenLastCalledWith(
        expect.objectContaining({ name: "picture.png" }),
      );
      await expect(uploadButton).toHaveTextContent("second.txt");
    });
  },
};

export const DisabledFileUploader: Story = {
  parameters: a11yExceptions(ICON_ONLY_UPLOAD_BUTTON),
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
    isDisabled: true,
    msg: "Uploads are disabled.",
    variant: "error",
  },
  play: async ({ canvasElement, args }) => {
    const zone = getDropZone(canvasElement);
    await expect(zone.closest("[data-disabled]")).toBeInTheDocument();
    await dropFile(zone, png());
    await expect(args.callback).not.toHaveBeenCalled();
    await expect(
      within(canvasElement).getByText("Uploads are disabled."),
    ).toHaveClass("text-klerosUIComponentsError");
  },
};
