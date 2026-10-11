import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  MockResizeObserver,
  installResizeObserverMock,
} from "../test/resize-observer-mock";
import defaultExport, { useResizeObserver } from "./useResizeObserver";

type Props = {
  element: HTMLElement | null;
  callback: (target: HTMLElement, entry: ResizeObserverEntry) => void;
};

const render = (initialProps: Props) =>
  renderHook(
    ({ element, callback }: Props) => useResizeObserver(element, callback),
    {
      initialProps,
    },
  );

describe("useResizeObserver", () => {
  beforeEach(() => {
    installResizeObserverMock();
  });

  it("is also the default export", () => {
    expect(defaultExport).toBe(useResizeObserver);
  });

  it("does not create an observer when the element is null", () => {
    render({ element: null, callback: vi.fn() });
    expect(MockResizeObserver.instances).toHaveLength(0);
  });

  it("observes the element once on mount", () => {
    const element = document.createElement("div");
    render({ element, callback: vi.fn() });
    expect(MockResizeObserver.instances).toHaveLength(1);
    const observer = MockResizeObserver.latest;
    expect(observer.observe).toHaveBeenCalledTimes(1);
    expect(observer.observe).toHaveBeenCalledWith(element);
    expect(observer.unobserve).not.toHaveBeenCalled();
    expect(observer.disconnect).not.toHaveBeenCalled();
  });

  it("invokes the callback with the element and the first entry only", () => {
    const element = document.createElement("div");
    const callback = vi.fn();
    render({ element, callback });
    const first = {
      target: element,
      contentRect: { width: 10 } as DOMRectReadOnly,
    };
    const second = {
      target: element,
      contentRect: { width: 20 } as DOMRectReadOnly,
    };
    MockResizeObserver.latest.trigger([first, second]);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0]).toBe(element);
    expect(callback.mock.calls[0][1]).toBe(first);
  });

  it("disconnects on unmount", () => {
    const element = document.createElement("div");
    const { unmount } = render({ element, callback: vi.fn() });
    const observer = MockResizeObserver.latest;
    unmount();
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
    expect(MockResizeObserver.instances).toHaveLength(1);
  });

  it("does not re-subscribe when rerendered with the same element and callback", () => {
    const element = document.createElement("div");
    const callback = vi.fn();
    const { rerender } = render({ element, callback });
    rerender({ element, callback });
    expect(MockResizeObserver.instances).toHaveLength(1);
    expect(MockResizeObserver.latest.disconnect).not.toHaveBeenCalled();
  });

  it("re-subscribes to the new element when the element changes", () => {
    const a = document.createElement("div");
    const b = document.createElement("div");
    const callback = vi.fn();
    const { rerender } = render({ element: a, callback });
    const [first] = MockResizeObserver.instances;
    rerender({ element: b, callback });
    expect(first.disconnect).toHaveBeenCalledTimes(1);
    expect(MockResizeObserver.instances).toHaveLength(2);
    const second = MockResizeObserver.latest;
    expect(second.observe).toHaveBeenCalledWith(b);
    second.trigger([{ target: b }]);
    expect(callback).toHaveBeenCalledWith(b, { target: b });
  });

  it("re-subscribes with the new callback when the callback changes", () => {
    const element = document.createElement("div");
    const oldCallback = vi.fn();
    const newCallback = vi.fn();
    const { rerender } = render({ element, callback: oldCallback });
    const [first] = MockResizeObserver.instances;
    rerender({ element, callback: newCallback });
    expect(first.disconnect).toHaveBeenCalledTimes(1);
    expect(MockResizeObserver.instances).toHaveLength(2);
    MockResizeObserver.latest.trigger([{ target: element }]);
    expect(newCallback).toHaveBeenCalledTimes(1);
    expect(oldCallback).not.toHaveBeenCalled();
  });

  it("disconnects and stops observing when the element becomes null", () => {
    const element = document.createElement("div");
    const callback = vi.fn();
    const { rerender, unmount } = render({ element, callback });
    const [first] = MockResizeObserver.instances;
    rerender({ element: null, callback });
    expect(first.disconnect).toHaveBeenCalledTimes(1);
    expect(MockResizeObserver.instances).toHaveLength(1);
    unmount();
    expect(first.disconnect).toHaveBeenCalledTimes(1);
  });

  it("starts observing when the element goes from null to a node", () => {
    const element = document.createElement("div");
    const callback = vi.fn();
    const { rerender } = render({ element: null, callback });
    rerender({ element, callback });
    expect(MockResizeObserver.instances).toHaveLength(1);
    expect(MockResizeObserver.latest.observe).toHaveBeenCalledWith(element);
  });
});
