import React, { useEffect, useState } from "react";
import UploadIcon from "../../assets/svgs/form/upload-icon.svg";
import SuccessIcon from "../../assets/svgs/status-icons/success.svg";
import ErrorIcon from "../../assets/svgs/status-icons/error.svg";
import WarningIcon from "../../assets/svgs/status-icons/warning.svg";
import InfoIcon from "../../assets/svgs/status-icons/info.svg";

import { cn } from "../../utils";
import {
  FileTrigger,
  DropZone,
  type FileTriggerProps,
  type FileDropItem,
  Button,
} from "react-aria-components";
import clsx from "clsx";

interface FileUploaderProps {
  /** Callback function that passes the selected file as argument. */
  callback: (file: File) => void;
  msg?: string;
  variant?: "success" | "warning" | "error" | "info";
  acceptedFileTypes?: FileTriggerProps["acceptedFileTypes"];
  fileTriggerProps?: Omit<FileTriggerProps, "acceptedFileTypes | onSelect">;
  /** Whether the drop target is disabled. If true, the drop target will not accept any drops.   */
  isDisabled?: boolean;
  className?: string;
  /** Provide a custom validation function, returning false invalidates the file */
  validationFunction?: (file?: File) => boolean;
  /** Provide File for controlled behaviour */
  selectedFile?: File;
}

/** Allows to upload a file by either dropping it on the dropzone or
 * accessing the file system. */
// The icon sits on the text baseline; shifting it by half its height minus half a cap height
// puts its centre on the capitals' centre whatever font the platform resolves.
const ICON_ON_BASELINE =
  "relative top-[calc(0.5rem-0.5cap)] mr-2 size-4 shrink-0 text-base";

function FileUploader({
  callback,
  msg,
  variant,
  className,
  acceptedFileTypes,
  fileTriggerProps,
  isDisabled = false,
  validationFunction,
  selectedFile,
}: Readonly<FileUploaderProps>) {
  const [fileSelected, setFileSelected] = useState<File | undefined>(
    selectedFile,
  );

  useEffect(() => {
    setFileSelected(selectedFile);
  }, [selectedFile]);

  return (
    <div className={cn("box-border h-fit w-50", className)}>
      <DropZone
        aria-labelledby="dropzone-label"
        {...{ isDisabled }}
        className={clsx(
          "hover-white-background hover-short-transition bg-klerosUIComponentsMediumBlue h-16",
          "rounded-base border-klerosUIComponentsPrimaryBlue size-full border border-dashed",
        )}
        // filter what files the drop accepts
        getDropOperation={(types) => {
          if (acceptedFileTypes) {
            for (const type of acceptedFileTypes) {
              if (types.has(type)) return "copy";
              else continue;
            }
            return "cancel";
          }
          return "copy";
        }}
        onDrop={async (e) => {
          // filter the files in case multiple files are dropped.
          // selects the first matching file in that case.
          const item = e.items.find((item) =>
            item.kind === "file" && acceptedFileTypes
              ? acceptedFileTypes.includes(item.type)
              : true,
          ) as FileDropItem;

          if (item) {
            const file = await item.getFile();
            const validated = validationFunction?.(file) ?? true;
            if (!validated) return;
            if (selectedFile === undefined) setFileSelected(file);

            callback(file);
          }
        }}
      >
        <FileTrigger
          acceptedFileTypes={acceptedFileTypes}
          {...fileTriggerProps}
          onSelect={(e) => {
            if (e) {
              const file = e[0];
              const validated = validationFunction?.(file) ?? true;
              if (!validated) return;
              if (selectedFile === undefined) setFileSelected(file);
              callback(file);
            }
          }}
        >
          <Button
            className={clsx(
              "box-border size-full cursor-pointer bg-transparent px-2",
              "flex items-center justify-center",
            )}
          >
            {fileSelected ? (
              <small
                className={clsx(
                  "w-full overflow-hidden",
                  "text-klerosUIComponentsPrimaryBlue text-center text-sm text-wrap",
                )}
              >
                {fileSelected.name}
              </small>
            ) : (
              <UploadIcon className="fill-klerosUIComponentsPrimaryBlue size-6" />
            )}
          </Button>
        </FileTrigger>
      </DropZone>
      {msg && (
        <div className="mt-4 flex items-baseline">
          {variant === "success" && (
            <SuccessIcon
              className={cn(ICON_ON_BASELINE, "fill-klerosUIComponentsSuccess")}
            />
          )}
          {variant === "warning" && (
            <WarningIcon
              className={cn(ICON_ON_BASELINE, "fill-klerosUIComponentsWarning")}
            />
          )}
          {variant === "error" && (
            <ErrorIcon
              className={cn(ICON_ON_BASELINE, "fill-klerosUIComponentsError")}
            />
          )}
          {variant === "info" && (
            <InfoIcon
              className={cn(
                ICON_ON_BASELINE,
                "fill-klerosUIComponentsSecondaryText",
              )}
            />
          )}
          <small
            id="dropzone-label"
            className={cn(
              "text-klerosUIComponentsSecondaryText text-justify text-base",
              {
                "text-klerosUIComponentsSuccess": variant === "success",
                "text-klerosUIComponentsError": variant === "error",
                "text-klerosUIComponentsWarning": variant === "warning",
              },
            )}
          >
            {msg}
          </small>
        </div>
      )}
    </div>
  );
}

export default FileUploader;
