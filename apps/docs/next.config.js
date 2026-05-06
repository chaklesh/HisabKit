import path from "node:path";
import { fileURLToPath } from "node:url";
import nextra from "nextra";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withNextra = nextra({
  // options
});

export default withNextra({
  // Next.js config
  reactStrictMode: true,
  basePath: "/docs",
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  images: {
    unoptimized: true,
  },
  experimental: {
    // any needed experiments here
  },
});
