import { defineConfig } from "vite-plus";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";
import { lazyPlugins } from "vite-plus";
// @ts-ignore
import { paraglideVitePlugin } from "@inlang/paraglide-js";

const config = defineConfig({
  resolve: { tsconfigPaths: true },

  server: {
    // fix fontsource not found error
    fs: {
      allow: ["../.."],
    },
  },
  plugins: lazyPlugins(() => [
    devtools(),
    netlify({ dev: { edgeFunctions: { enabled: false } } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./app/paraglide",
      outputStructure: "message-modules",
      emitTsDeclarations: true,
      cookieName: "PARAGLIDE_LOCALE",
      strategy: ["url", "cookie", "preferredLanguage", "baseLocale"],
    }),
  ]),
});

export default config;
