module.exports = {
  globals: {
    moment: "readonly",
    SP: "readonly",
  },
  root: true,
  env: {
    node: true,
  },
  extends: [
    "plugin:vue/essential",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "@vue/prettier",
    "@vue/prettier/@typescript-eslint",
  ],
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: 2020,
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "@typescript-eslint/no-explicit-any": "off",
    "prefer-const": ["off", {
      "destructuring": "any",
      "ignoreReadBeforeAssign": false
    }],
    "no-var": ["off", {
      "destructuring": "any",
      "ignoreReadBeforeAssign": false
    }],
    "no-use-before-define": ["off", {
      "functions": true,
      "classes": true
    }],
    "prettier/prettier": [
      "error",
      {
        singleQuote: true,
        doubleQuote: false,
        semi: false,
        trailingComma: "none",
        code: 350,
        printWidth: 350,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],
  },
  overrides: [
    {
      files: [
        "**/__tests__/*.{j,t}s?(x)",
        "**/tests/unit/**/*.spec.{j,t}s?(x)",
      ],
      env: {
        jest: true,
      },
    },
  ],
};
