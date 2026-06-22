import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ["test/**/*.test.ts"],
    setupFiles: "vitest-setup.ts",
  },
});
