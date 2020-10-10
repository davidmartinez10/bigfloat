module.exports = {
  env: {
    es2020: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 11,
    sourceType: "module"
  },
  plugins: [
    "@typescript-eslint"
  ],
  rules: {
    indent: [
      "error",
      2
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    quotes: [
      "error",
      "double"
    ],
    semi: [
      "error",
      "always"
    ],
    // "no-restricted-syntax": [2, "ClassDeclaration"],
    "comma-dangle": [2, "never"],
    curly: [2, "all"],
    "func-style": ["error", "declaration", { allowArrowFunctions: false }],
    "quote-props": ["error", "as-needed"]
  }
};
