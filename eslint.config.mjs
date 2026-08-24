import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Afrikaans uses a leading-apostrophe indefinite article ('n), which appears
      // in most JSX copy on this site. The rule would fire on nearly every string.
      "react/no-unescaped-entities": "off",
    },
  },
]);

export default eslintConfig;
