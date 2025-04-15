import React, { useState } from "react";
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  callback: Function;
  msg?: string;
  variant?: "success" | "warning" | "error" | "info";
  acceptedFileTypes?: FileTriggerProps["acceptedFileTypes"];
  fileTriggerProps?: Omit<FileTriggerProps, "acceptedFileTypes | onSelect">;
  /** Whether the drop target is disabled. If true, the drop target will not accept any drops.   */
  isDisabled?: boolean;
  className?: string;
}

/** Allows to upload a file by either dropping it on the dropzone or
 * accessing the file system. */
function FileUploader({
  callback,
  msg,
  variant,
  className,
  acceptedFileTypes,
  fileTriggerProps,
  isDisabled = false,
}: Readonly<FileUploaderProps>) {
  const [fileSelected, setFileSelected] = useState<File>();

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
            setFileSelected(file);
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
              setFileSelected(file);
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
        <div className="mt-4 flex items-start">
          {variant === "success" && (
            <SuccessIcon className="fill-klerosUIComponentsSuccess mr-2 max-w-4 min-w-4" />
          )}
          {variant === "warning" && (
            <WarningIcon className="fill-klerosUIComponentsWarning mr-2 max-w-4 min-w-4" />
          )}
          {variant === "error" && (
            <ErrorIcon className="fill-klerosUIComponentsError mr-2 max-w-4 min-w-4" />
          )}
          {variant === "info" && (
            <InfoIcon className="fill-klerosUIComponentsPrimaryBlue mr-2 max-w-4 min-w-4" />
          )}
          <small
            id="dropzone-label"
            className={cn(
              "text-klerosUIComponentsSecondaryText relative -top-0.25 text-justify text-base",
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
