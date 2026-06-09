import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// On GitHub Project Pages the app is served from /<repo>/, so the build needs a
// matching base. The deploy workflow injects VITE_BASE; locally it defaults to "/".
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        // Match data JSON at runtime so the app keeps last-known scores offline,
        // but always tries the network first for fresh results.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith("/data/matches.json"),
            handler: "NetworkFirst",
            options: {
              cacheName: "wc-data",
              networkTimeoutSeconds: 6,
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: ({ url }) => url.hostname === "crests.football-data.org",
            handler: "CacheFirst",
            options: {
              cacheName: "wc-crests",
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      manifest: {
        name: "WC Duel 2026",
        short_name: "WC Duel",
        description: "A two-player World Cup 2026 watch game scoreboard",
        theme_color: "#0b1020",
        background_color: "#0b1020",
        display: "standalone",
        orientation: "portrait",
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
