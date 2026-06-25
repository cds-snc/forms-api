import { defineConfig } from "vitest/config";

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    silent: "passed-only",
    include: ["test/**/*.test.ts"],
    setupFiles: "vitest-setup.ts",
  },
});
