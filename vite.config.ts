import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/lib/index.ts"),
      name: "Kleros-UI-Components",
    },
  },
  plugins: [svgr()],
});
