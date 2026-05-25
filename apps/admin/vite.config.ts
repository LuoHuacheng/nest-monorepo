import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { unpluginRouterGeneratorFactory, createRouterPluginContext } from "@tanstack/router-plugin";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    viteReact(),
    unpluginRouterGeneratorFactory(
      {
        routesDirectory: "./src/routes",
        generatedRouteTree: "./src/routeTree.gen.ts",
      },
      createRouterPluginContext(),
    ),
  ],
  build: {
    target: "es2022",
  },
});
