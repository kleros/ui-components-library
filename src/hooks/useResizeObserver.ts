import { useLayoutEffect } from "react";

export function useResizeObserver<T extends HTMLElement>(
  element: T | null,
  callback: (target: T, entry: ResizeObserverEntry) => void
) {
  useLayoutEffect(() => {
    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      callback(element, entries[0]);
    });

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [callback, element]);
}

export default useResizeObserver;
