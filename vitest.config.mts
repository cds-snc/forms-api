import { defineConfig } from "vitest/config";

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ["test/**/*.test.ts"],
    setupFiles: "vitest-setup.ts",
  },
});
