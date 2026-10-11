import { vi } from "vitest";

/**
 * Controllable ResizeObserver stand-in for jsdom (which has no ResizeObserver).
 * Every constructed instance is recorded so tests can assert on observe/unobserve/disconnect
 * and fire the observer callback on demand via `trigger`.
 */
export class MockResizeObserver {
  static instances: MockResizeObserver[] = [];

  readonly callback: ResizeObserverCallback;
  readonly observe =
    vi.fn<(target: Element, options?: ResizeObserverOptions) => void>();
  readonly unobserve = vi.fn<(target: Element) => void>();
  readonly disconnect = vi.fn<() => void>();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }

  trigger(entries: Partial<ResizeObserverEntry>[]) {
    this.callback(
      entries as ResizeObserverEntry[],
      this as unknown as ResizeObserver,
    );
  }

  static get latest(): MockResizeObserver {
    const instance =
      MockResizeObserver.instances[MockResizeObserver.instances.length - 1];
    if (!instance) throw new Error("No ResizeObserver has been constructed");
    return instance;
  }
}

export const installResizeObserverMock = () => {
  MockResizeObserver.instances = [];
  vi.stubGlobal("ResizeObserver", MockResizeObserver);
};
