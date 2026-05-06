import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    alias: {
      "react-native": "react-native-web",
    },
    transformMode: {
      web: [/\.[jt]sx?$/],
    },
    server: {
      deps: {
        inline: [
          /react-native/,
          /@react-native/,
          /expo/,
          /@expo/,
          /lucide-react-native/,
          /react-navigation/,
          /@react-navigation/,
          /react-native-paper/,
          /@hisabkit\/.*/,
        ],
      },
    },
  },
  resolve: {
    alias: {
      "react-native": "react-native-web",
    },
  },
});
