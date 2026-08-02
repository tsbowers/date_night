import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",

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
