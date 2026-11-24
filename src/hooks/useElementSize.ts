import { useCallback, useState } from "react";
import { useEventListener, useIsomorphicLayoutEffect } from "usehooks-ts";
import { useResizeObserver } from "./useResizeObserver";

interface Size {
  width: number;
  height: number;
}

export function useElementSize<T extends HTMLElement = HTMLDivElement>(): [
  (node: T | null) => void,
  Size,
] {
  // Mutable values like 'ref.current' aren't valid dependencies
  // because mutating them doesn't re-render the component.
  // Instead, we use a state as a ref to be reactive.
  const [ref, setRef] = useState<T | null>(null);
  const [size, setSize] = useState<Size>({
    width: 0,
    height: 0,
  });

  // Prevent too many rendering using useCallback
  const handleSize = useCallback(() => {
    const width = ref?.offsetWidth || 0;
    const height = ref?.offsetHeight || 0;
    // Keep the same state object when nothing changed, so a resize event that leaves the element as it was
    // does not re-render it
    setSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  }, [ref?.offsetHeight, ref?.offsetWidth]);

  useEventListener("resize", handleSize);

  useIsomorphicLayoutEffect(() => {
    handleSize();
  }, [ref?.offsetHeight, ref?.offsetWidth]);

  useResizeObserver<T>(ref, handleSize);

  return [setRef, size];
}

export default useElementSize;
