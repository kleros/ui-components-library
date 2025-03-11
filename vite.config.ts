import { resolve } from "path";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
// eslint-disable-next-line import/no-unresolved
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/lib/index.ts"),
      name: "Kleros-UI-Components",
    },
  },
  plugins: [
    svgr({
      include: "**/*.svg",
    }),
    tailwindcss(),
  ],
});
