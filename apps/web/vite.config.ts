import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@hisabkit/ui": path.resolve(__dirname, "../../packages/ui"),
      "@hisabkit/lib": path.resolve(__dirname, "../../packages/lib"),
      "@hisabkit/features": path.resolve(__dirname, "../../packages/features"),
      "@hisabkit/types": path.resolve(__dirname, "../../packages/types"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8010",
        changeOrigin: true,
      },
      "/actuator": {
        target: "http://127.0.0.1:8010",
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
  },
});
