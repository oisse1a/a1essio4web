import { defineConfig } from "vite-plus";

// 忽略格式化、lint相关的目录配置
const ignorePatterns = [
  "packages/shadcn/src/lib/**/*",
  "packages/shadcn/src/hooks/**/*",
  "packages/shadcn/src/components/**/*",
  "**/routeTree.gen.ts",
  "**/database.types.ts",
];
export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    // Generated files: keep them byte-identical to their generators.
    ignorePatterns,
  },
  lint: {
    ignorePatterns,
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  run: {
    cache: true,
  },
});
