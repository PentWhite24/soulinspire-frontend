import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// `npm run build` makes a normal multi-file build in dist/.
// `npm run build:single` makes one self-contained HTML file (used for the hosted preview).
export default defineConfig(({ mode }) => ({
  base: "./",
  plugins: [react(), ...(mode === "single" ? [viteSingleFile()] : [])],
  build: mode === "single" ? { outDir: "dist-single" } : {},
}));
