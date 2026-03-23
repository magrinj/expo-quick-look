const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettierPlugin = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "warn",
    },
  },
  {
    files: ["example/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["website/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "import/no-unresolved": [
        "error",
        { ignore: ["^@docusaurus/", "^@theme/", "^@site/"] },
      ],
      "import/no-named-as-default": "off",
    },
  },
  {
    ignores: [
      "build/**",
      "node_modules/**",
      ".expo/**",
      "ios/**",
      "android/**",
      "docs/**",
      "website/build/**",
      "website/.docusaurus/**",
      "website/docs/api/**",
      "example/*.js",
      "example/.expo/**",
      "example/ios/**",
      "example/android/**",
    ],
  },
]);
