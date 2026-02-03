import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import minifyTemplateLiterals from "rollup-plugin-minify-template-literals";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: [
        resolve(__dirname, "src/index.ts"),
      ],
      name: "ColCal",
      formats: ['es'],
      fileName: "col-cal"
    },
    target: 'es2022',
    rollupOptions: {
      plugins: [
        minifyTemplateLiterals(),
      ],
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
});
