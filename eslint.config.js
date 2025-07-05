const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

const tsParser = require("@typescript-eslint/parser");
const react = require("eslint-plugin-react");
const reactNative = require("eslint-plugin-react-native");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const globals = require("globals");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    languageOptions: {
        parser: tsParser,

        globals: {
            ...reactNative.environments["react-native"]["react-native"],
            ...globals.node,
        },
    },

    extends: compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-native/all",
        "plugin:prettier/recommended",
    ),

    plugins: {
        react,
        "react-native": reactNative,
        "@typescript-eslint": typescriptEslint,
    },

    rules: {
        "react/react-in-jsx-scope": "off",
        "react-native/no-inline-styles": "off",
        "react-native/sort-styles": "off",
        "prettier/prettier": "warn",
    },

    settings: {
        react: {
            version: "detect",
        },
    },
}, globalIgnores(["**/node_modules", "**/dist", "**/build", "**/.expo"])]);
