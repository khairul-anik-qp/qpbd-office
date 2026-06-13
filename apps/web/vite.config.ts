import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// vite-plugin-pwa (manifest + service worker) is wired in issue #22 (deploy/PWA).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Single-origin in prod; proxy API + SSE during dev.
      "/api": { target: "http://localhost:3000", changeOrigin: true },
      "/sse": { target: "http://localhost:3000", changeOrigin: true },
    },
  },
});
