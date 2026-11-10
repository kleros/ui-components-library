import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// The library's compiled CSS before the app's Tailwind (index.css), so the app's sm:/lg:/@sm: classes win.
import "@kleros/ui-components-library/style.css";
import "./index.css";
import { applyInitialTheme } from "@kleros/ui-components-library/kit";
import App from "./App";

// ?theme=light|dark, else the system setting: sets the .dark class before the first render.
applyInitialTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
