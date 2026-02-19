import nextPlugin from "@next/eslint-plugin-next";

/** @type {import("eslint").Linter.Config} */
export default [
  {
    ignores: ["**/node_modules/**", "**/.next/**"],
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    plugins: { "@next/next": nextPlugin },
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
];
