import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    "import.meta.env.VITE_BUILD_TIME": JSON.stringify(
        new Date().toISOString()
    ),
  },
  server: {
    allowedHosts: [
      ".trycloudflare.com",
    ],
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
