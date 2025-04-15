import { twMerge } from "tailwind-merge";
import clsx, { ClassValue } from "clsx";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const isUndefined = (
  maybeObject: any,
): maybeObject is undefined | null =>
  typeof maybeObject === "undefined" || maybeObject === null;
