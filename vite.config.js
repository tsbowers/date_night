import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "src",
  publicDir: "public",
  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        in: resolve(__dirname, "src/in/index.html"),
        out: resolve(__dirname, "src/out/index.html"),
      },
    },
  },
});