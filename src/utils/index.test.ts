import { describe, expect, it } from "vitest";
import { cn, isUndefined } from "./index";

describe("cn", () => {
  it("returns an empty string when called without arguments", () => {
    expect(cn()).toBe("");
  });

  it("joins plain class names with single spaces", () => {
    expect(cn("flex", "items-center", "gap-2")).toBe("flex items-center gap-2");
  });

  it("drops falsy values", () => {
    expect(cn("a", undefined, null, false, 0, "", "b")).toBe("a b");
  });

  it("supports clsx object and array syntax", () => {
    expect(cn(["a", ["b"]], { c: true, d: false }, "e")).toBe("a b c e");
  });

  it("resolves conflicting tailwind classes so the last one wins", () => {
    expect(cn("p-2 text-red-500", "p-4")).toBe("text-red-500 p-4");
    expect(cn("px-2", { "px-6": true })).toBe("px-6");
  });

  it("keeps non-conflicting tailwind classes", () => {
    expect(cn("px-2", "py-4")).toBe("px-2 py-4");
  });
});

describe("isUndefined", () => {
  it.each([
    ["undefined", undefined],
    ["null", null],
  ])("returns true for %s", (_label, value) => {
    expect(isUndefined(value)).toBe(true);
  });

  it.each([
    ["0", 0],
    ["empty string", ""],
    ["false", false],
    ["NaN", NaN],
    ["empty object", {}],
    ["empty array", []],
    ["string 'undefined'", "undefined"],
  ])("returns false for %s", (_label, value) => {
    expect(isUndefined(value)).toBe(false);
  });
});
