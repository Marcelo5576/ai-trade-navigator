// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const allowedHosts = Array.from(
  new Set(
    [
      "localhost",
      "127.0.0.1",
      process.env.APP_DOMAIN,
      process.env.PUBLIC_URL ? new URL(process.env.PUBLIC_URL).hostname : undefined,
    ].filter(Boolean),
  ),
);

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  vite: {
    server: {
      allowedHosts,
    },
    preview: {
      allowedHosts,
    },
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});
