import React, { useRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// The unit project does not transform SVG imports.
vi.mock("../assets/svgs/kleros.svg", () => ({ default: () => null }));

import Button from "../lib/button";

// Button merges its own ref (for `title`) with the caller's, so both ref kinds must still reach the <button>.
describe("Button ref", () => {
  it("fills a createRef object ref and clears it on unmount", () => {
    const ref = React.createRef<HTMLButtonElement>();
    const { unmount } = render(<Button text="Go" ref={ref} />);
    expect(ref.current).toBe(screen.getByRole("button", { name: "Go" }));
    unmount();
    expect(ref.current).toBeNull();
  });

  it("fills a useRef object ref", () => {
    let seen: HTMLButtonElement | null = null;
    function App() {
      const ref = useRef<HTMLButtonElement>(null);
      React.useEffect(() => {
        seen = ref.current;
      }, []);
      return <Button text="Go" ref={ref} />;
    }
    render(<App />);
    expect(seen).toBe(screen.getByRole("button", { name: "Go" }));
  });

  it("calls a function ref with the element", () => {
    const ref = vi.fn();
    render(<Button text="Go" ref={ref} />);
    expect(ref).toHaveBeenCalledWith(
      screen.getByRole("button", { name: "Go" }),
    );
  });
});
