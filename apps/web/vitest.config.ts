import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@hisabkit/ui": path.resolve(__dirname, "../../packages/ui"),
      "@hisabkit/lib": path.resolve(__dirname, "../../packages/lib"),
      "@hisabkit/features": path.resolve(__dirname, "../../packages/features"),
      "@hisabkit/types": path.resolve(__dirname, "../../packages/types"),
      react: path.resolve(__dirname, "../../node_modules/react"),
      "react-dom": path.resolve(__dirname, "../../node_modules/react-dom"),
    },
  },
});
