import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "dist/theme",
    cssCodeSplit: true,
    cssMinify: false,
    lib: {
      entry: resolve(__dirname, "src/lib/theme.ts"),
      name: "theme",
      fileName: "theme",
      formats: ["es"],
    },
  },
});
