import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
// eslint-disable-next-line import/no-unresolved
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/lib/index.ts"),
      formats: ["es"],
      name: "Kleros-UI-Components",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["react", "react-dom"],
      output: {
        dir: "dist/esm",
        preserveModules: true,
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
  plugins: [
    svgr({
      include: "**/*.svg",
    }),
    tailwindcss(),
    react(),
    dts({
      insertTypesEntry: true,
      include: ["src/lib", "src/global.d.ts"],
    }),
  ],
});
