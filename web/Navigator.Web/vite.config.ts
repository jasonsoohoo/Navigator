import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

const defaultProxyTarget = "http://localhost:5080";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "NAVIGATOR_");
  const proxyTarget = env.NAVIGATOR_API_PROXY_TARGET || defaultProxyTarget;

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/health": {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: "jsdom",
      setupFiles: "./src/test/setup.ts",
      css: true,
    },
  };
});
