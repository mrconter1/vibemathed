import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests for the pure modules under src/lib (and the pure functions that
// happen to live beside components, like texToHtml). Nothing here touches the
// database or renders React: those need a browser or a seeded database and
// are covered by staging, not by CI.
//
// The first test in this repo exists because of a bug a test would have
// caught: the TeX tokenizer treated an escaped dollar as a delimiter and
// shifted every later formula by one, on a live entry, for a day.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
