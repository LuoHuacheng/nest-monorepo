import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  client: "@hey-api/client-axios",
  input: "http://localhost:4001/docs-json",
  output: "src/api/generated",
  plugins: [
    {
      name: "@hey-api/sdk",
      operations: {
        strategy: "byTags",
      },
    },
  ],
} as any);
