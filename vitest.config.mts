import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ["test/**"],
  },
});
