import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";
import { fileURLToPath } from "url";
// eslint-disable-next-line import/no-unresolved
import tailwindcss from "@tailwindcss/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    svgr({
      include: ["**/*.svg", "tsx:**/*.svg"],
      exclude: ["../node_modules/**/*"],
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/lib/index.ts"),
      name: "KlerosUIComponents",
      fileName: "index",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react-is", "styled-components"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react-is": "ReactIs",
          "styled-components": "styled",
        },
      },
    },
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src"),
    },
  },
});
