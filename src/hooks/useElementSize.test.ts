import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  MockResizeObserver,
  installResizeObserverMock,
} from "../test/resize-observer-mock";
import defaultExport, { useElementSize } from "./useElementSize";

/** jsdom does no layout, so offsetWidth/offsetHeight are always 0; make them controllable. */
const createSizedElement = (width: number, height: number) => {
  const element = document.createElement("div");
  const size = { width, height };
  Object.defineProperty(element, "offsetWidth", {
    configurable: true,
    get: () => size.width,
  });
  Object.defineProperty(element, "offsetHeight", {
    configurable: true,
    get: () => size.height,
  });
  return {
    element,
    resize(w: number, h: number) {
      size.width = w;
      size.height = h;
    },
  };
};

describe("useElementSize", () => {
  beforeEach(() => {
    installResizeObserverMock();
  });

  it("is also the default export", () => {
    expect(defaultExport).toBe(useElementSize);
  });

  it("starts at 0x0 with no element attached", () => {
    const { result } = renderHook(() => useElementSize());
    const [setRef, size] = result.current;
    expect(typeof setRef).toBe("function");
    expect(size).toEqual({ width: 0, height: 0 });
    expect(MockResizeObserver.instances).toHaveLength(0);
  });

  it("reports 0x0 on the very first render, before any layout effect runs", () => {
    const renderedSizes: { width: number; height: number }[] = [];
    renderHook(() => {
      const value = useElementSize();
      renderedSizes.push(value[1]);
      return value;
    });
    expect(renderedSizes[0]).toEqual({ width: 0, height: 0 });
  });

  it("measures the element as soon as it is attached", () => {
    const { result } = renderHook(() => useElementSize());
    const { element } = createSizedElement(120, 45);
    act(() => result.current[0](element));
    expect(result.current[1]).toEqual({ width: 120, height: 45 });
    expect(MockResizeObserver.latest.observe).toHaveBeenCalledWith(element);
  });

  it("updates when the ResizeObserver fires", () => {
    const { result } = renderHook(() => useElementSize());
    const { element, resize } = createSizedElement(100, 50);
    act(() => result.current[0](element));
    resize(300, 200);
    act(() => MockResizeObserver.latest.trigger([{ target: element }]));
    expect(result.current[1]).toEqual({ width: 300, height: 200 });
  });

  it("updates on window resize", () => {
    const { result } = renderHook(() => useElementSize());
    const { element, resize } = createSizedElement(100, 50);
    act(() => result.current[0](element));
    resize(640, 480);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current[1]).toEqual({ width: 640, height: 480 });
  });

  it("keeps reporting the latest size across successive resizes", () => {
    const { result } = renderHook(() => useElementSize());
    const { element, resize } = createSizedElement(10, 10);
    act(() => result.current[0](element));
    resize(20, 30);
    act(() => MockResizeObserver.latest.trigger([{ target: element }]));
    expect(result.current[1]).toEqual({ width: 20, height: 30 });
    resize(5, 7);
    act(() => MockResizeObserver.latest.trigger([{ target: element }]));
    expect(result.current[1]).toEqual({ width: 5, height: 7 });
  });

  it("resets to 0x0 when the element is detached", () => {
    const { result } = renderHook(() => useElementSize());
    const { element } = createSizedElement(100, 50);
    act(() => result.current[0](element));
    const observer = MockResizeObserver.latest;
    act(() => result.current[0](null));
    expect(result.current[1]).toEqual({ width: 0, height: 0 });
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current[1]).toEqual({ width: 0, height: 0 });
  });

  it("switches to measuring a new element", () => {
    const { result } = renderHook(() => useElementSize());
    const a = createSizedElement(100, 50);
    const b = createSizedElement(70, 30);
    act(() => result.current[0](a.element));
    act(() => result.current[0](b.element));
    expect(result.current[1]).toEqual({ width: 70, height: 30 });
    expect(MockResizeObserver.latest.observe).toHaveBeenCalledWith(b.element);
  });

  it("disconnects the observer and removes the window listener on unmount", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { result, unmount } = renderHook(() => useElementSize());
    const { element } = createSizedElement(100, 50);
    act(() => result.current[0](element));
    const observer = MockResizeObserver.latest;
    const resizeListener = addSpy.mock.calls.find(
      ([type]) => type === "resize",
    )?.[1];
    expect(resizeListener).toBeInstanceOf(Function);

    unmount();

    expect(observer.disconnect).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledWith("resize", resizeListener, undefined);
  });
});
