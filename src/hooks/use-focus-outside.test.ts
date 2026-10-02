import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useFocusOutside from "./use-focus-outside";

const focusIn = (target: EventTarget) =>
  target.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
const mouseDown = (target: EventTarget) =>
  target.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

describe("useFocusOutside", () => {
  let container: HTMLDivElement;
  let child: HTMLButtonElement;
  let grandChild: HTMLSpanElement;
  let outside: HTMLInputElement;
  let errors: ErrorEvent[];
  const onError = (event: ErrorEvent) => errors.push(event);

  beforeEach(() => {
    container = document.createElement("div");
    child = document.createElement("button");
    grandChild = document.createElement("span");
    child.appendChild(grandChild);
    container.appendChild(child);
    outside = document.createElement("input");
    document.body.append(container, outside);
    errors = [];
    window.addEventListener("error", onError);
  });

  afterEach(() => {
    window.removeEventListener("error", onError);
    document.body.innerHTML = "";
    expect(errors).toEqual([]);
  });

  it.each([
    ["mousedown", mouseDown],
    ["focusin", focusIn],
  ])("calls the callback on %s outside the element", (_name, fire) => {
    const callback = vi.fn();
    renderHook(() => useFocusOutside({ current: container }, callback));
    fire(outside);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith();
    fire(document.body);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["mousedown", mouseDown],
    ["focusin", focusIn],
  ])(
    "does not call the callback on %s on the element or its descendants",
    (_name, fire) => {
      const callback = vi.fn();
      renderHook(() => useFocusOutside({ current: container }, callback));
      fire(container);
      fire(child);
      fire(grandChild);
      expect(callback).not.toHaveBeenCalled();
    },
  );

  it("reacts to real focus moves", () => {
    const callback = vi.fn();
    renderHook(() => useFocusOutside({ current: container }, callback));
    child.focus();
    expect(callback).not.toHaveBeenCalled();
    outside.focus();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("ignores unrelated events", () => {
    const callback = vi.fn();
    renderHook(() => useFocusOutside({ current: container }, callback));
    outside.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    outside.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    outside.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
    expect(callback).not.toHaveBeenCalled();
  });

  it("does nothing (and does not throw) while ref.current is null", () => {
    const callback = vi.fn();
    const ref: { current: HTMLElement | null } = { current: null };
    renderHook(() => useFocusOutside(ref, callback));
    mouseDown(outside);
    focusIn(outside);
    expect(callback).not.toHaveBeenCalled();
  });

  it("reads ref.current lazily at event time", () => {
    const callback = vi.fn();
    const ref: { current: HTMLElement | null } = { current: null };
    renderHook(() => useFocusOutside(ref, callback));
    mouseDown(outside);
    expect(callback).not.toHaveBeenCalled();
    ref.current = container;
    mouseDown(child);
    expect(callback).not.toHaveBeenCalled();
    mouseDown(outside);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("removes both document listeners on unmount", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const callback = vi.fn();
    const { unmount } = renderHook(() =>
      useFocusOutside({ current: container }, callback),
    );
    const added = addSpy.mock.calls.filter(([type]) =>
      ["focusin", "mousedown"].includes(type),
    );
    expect(added.map(([type]) => type)).toEqual(["focusin", "mousedown"]);
    expect(removeSpy).not.toHaveBeenCalled();

    unmount();

    expect(removeSpy.mock.calls).toEqual([
      ["focusin", added[0][1]],
      ["mousedown", added[1][1]],
    ]);
    mouseDown(outside);
    focusIn(outside);
    expect(callback).not.toHaveBeenCalled();
  });

  it("swaps listeners when the callback changes", () => {
    const first = vi.fn();
    const second = vi.fn();
    const ref = { current: container };
    const { rerender } = renderHook(({ cb }) => useFocusOutside(ref, cb), {
      initialProps: { cb: first },
    });
    rerender({ cb: second });
    mouseDown(outside);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("swaps listeners when the ref object changes", () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ ref }) => useFocusOutside(ref, callback),
      {
        initialProps: { ref: { current: container as HTMLElement } },
      },
    );
    rerender({ ref: { current: outside } });
    mouseDown(outside);
    expect(callback).not.toHaveBeenCalled();
    mouseDown(container);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does not re-subscribe when rerendered with the same ref and callback", () => {
    const callback = vi.fn();
    const ref = { current: container };
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const { rerender } = renderHook(() => useFocusOutside(ref, callback));
    rerender();
    expect(removeSpy).not.toHaveBeenCalled();
    mouseDown(outside);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
